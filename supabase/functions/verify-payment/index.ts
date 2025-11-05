import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { create } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const verifyPaymentSchema = z.object({
  payment_id: z.string().uuid(),
  verify: z.boolean(),
  rejection_reason: z.string().max(500).optional().nullable()
})

// Generate JWT license key
async function generateLicenseKey(userId: string, planId: string, expiresAt: Date): Promise<string> {
  const secret = Deno.env.get('LICENSE_JWT_SECRET')
  if (!secret) {
    throw new Error('LICENSE_JWT_SECRET not configured')
  }

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const payload = {
    sub: userId,
    plan: planId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
    jti: crypto.randomUUID(),
  }

  const jwt = await create({ alg: 'HS256', typ: 'JWT' }, payload, key)
  return jwt
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    // Verify admin user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRole) {
      console.error('Unauthorized admin access attempt:', { user_id: user.id })
      throw new Error('UNAUTHORIZED')
    }

    const requestBody = await req.json()
    
    // Validate input
    const validationResult = verifyPaymentSchema.safeParse(requestBody)
    if (!validationResult.success) {
      console.error('Validation error:', {
        errors: validationResult.error.errors,
        user_id: user.id
      })
      throw new Error('VALIDATION_ERROR')
    }

    const { payment_id, verify, rejection_reason } = validationResult.data

    // Get payment details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, plans(*)')
      .eq('id', payment_id)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found:', {
        payment_id,
        error: paymentError,
        user_id: user.id
      })
      throw new Error('PAYMENT_NOT_FOUND')
    }

    if (payment.status !== 'pending') {
      console.error('Payment already processed:', {
        payment_id,
        status: payment.status,
        user_id: user.id
      })
      throw new Error('PAYMENT_ALREADY_PROCESSED')
    }

    if (verify) {
      // Verify payment and generate license
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (payment.plans?.duration_days || 365))

      // Generate license key
      const licenseKey = await generateLicenseKey(
        payment.user_id,
        payment.plan_id,
        expiresAt
      )

      // Update payment status
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'verified',
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', payment_id)

      // Create license record
      const { data: license, error: licenseError } = await supabaseAdmin
        .from('licenses')
        .insert({
          user_id: payment.user_id,
          payment_id: payment_id,
          license_key: licenseKey,
          expires_at: expiresAt.toISOString(),
          status: 'active',
          created_by: user.id
        })
        .select()
        .single()

      if (licenseError) {
        console.error('License creation error:', {
          error: licenseError,
          payment_id,
          user_id: user.id
        })
        throw new Error('LICENSE_CREATION_FAILED')
      }

      // Log the action
      await supabaseAdmin
        .from('license_logs')
        .insert({
          license_id: license.id,
          action: 'created',
          performed_by: user.id,
          details: {
            payment_id: payment_id,
            amount: payment.amount,
            plan: payment.plans?.name
          }
        })

      console.log('License generated successfully:', license.id)

      return new Response(
        JSON.stringify({
          success: true,
          license_key: licenseKey,
          expires_at: expiresAt.toISOString(),
          message: 'Payment verified and license generated successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      // Reject payment
      await supabaseAdmin
        .from('payments')
        .update({
          status: 'rejected',
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          transaction_note: rejection_reason || 'Payment rejected by admin'
        })
        .eq('id', payment_id)

      console.log('Payment rejected:', payment_id)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment rejected successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
  } catch (error) {
    console.error('Error in verify-payment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    // Return generic error messages to client
    let clientMessage = 'Payment verification failed. Please try again or contact support.'
    let statusCode = 400
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'VALIDATION_ERROR':
          clientMessage = 'Invalid request data.'
          break
        case 'UNAUTHORIZED':
          clientMessage = 'Unauthorized access.'
          statusCode = 403
          break
        case 'PAYMENT_NOT_FOUND':
          clientMessage = 'Payment not found.'
          statusCode = 404
          break
        case 'PAYMENT_ALREADY_PROCESSED':
          clientMessage = 'Payment has already been processed.'
          break
        case 'LICENSE_CREATION_FAILED':
          clientMessage = 'Failed to generate license. Please contact support.'
          break
        case 'Unauthorized':
        case 'Missing authorization header':
          clientMessage = 'Authentication required.'
          statusCode = 401
          break
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: clientMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})
