import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const submitPaymentSchema = z.object({
  plan_id: z.string().uuid(),
  amount: z.number().positive().max(1000000),
  screenshot_url: z.string().url().max(2048).optional().nullable(),
  transaction_note: z.string().max(500).optional().nullable()
})

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create client for user authentication
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const { data: { user }, error: userError } = await authClient.auth.getUser()

    if (userError || !user) {
      console.error('Auth error:', { userError, hasHeader: !!authHeader })
      throw new Error('Unauthorized')
    }

    console.log('User authenticated:', user.id)

    // Create admin client for DB operations (bypasses RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const requestBody = await req.json()
    
    // Validate input
    const validationResult = submitPaymentSchema.safeParse(requestBody)
    if (!validationResult.success) {
      console.error('Validation error:', {
        errors: validationResult.error.errors,
        user_id: user.id
      })
      throw new Error('VALIDATION_ERROR')
    }

    const { plan_id, amount, screenshot_url, transaction_note } = validationResult.data

    // Validate plan exists
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      console.error('Plan validation failed:', {
        plan_id,
        user_id: user.id,
        error: planError
      })
      throw new Error('INVALID_PLAN')
    }

    console.log('Creating payment record for user:', user.id)
    
    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        plan_id: plan_id,
        payment_mode: 'upi',
        amount: amount,
        screenshot_url: screenshot_url,
        transaction_note: transaction_note,
        status: 'pending',
        invoice_id: null
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error FULL DETAILS:', {
        error: paymentError,
        errorCode: paymentError.code,
        errorMessage: paymentError.message,
        errorDetails: paymentError.details,
        errorHint: paymentError.hint,
        user_id: user.id,
        plan_id,
        payment_data: {
          user_id: user.id,
          plan_id: plan_id,
          payment_mode: 'upi',
          amount: amount,
          status: 'pending'
        }
      })
      throw new Error('PAYMENT_CREATION_FAILED')
    }

    console.log('Payment submitted successfully:', payment.id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        status: 'pending',
        message: 'Payment submitted successfully. Admin will verify within 24 hours.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in submit-payment:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    // Return generic error messages to client
    let clientMessage = 'Payment submission failed. Please try again or contact support.'
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'VALIDATION_ERROR':
          clientMessage = 'Invalid payment information provided.'
          break
        case 'INVALID_PLAN':
          clientMessage = 'Selected plan is not available.'
          break
        case 'Unauthorized':
        case 'Missing authorization header':
          clientMessage = 'Authentication required. Please log in.'
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
        status: 400,
      }
    )
  }
})
