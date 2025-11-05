import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { verify } from 'https://deno.land/x/djwt@v3.0.1/mod.ts'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Input validation schema
const validateLicenseSchema = z.object({
  license_key: z.string().min(10).max(2048),
  device_id: z.string().max(100).regex(/^[a-zA-Z0-9-_]+$/).optional().nullable(),
  app_version: z.string().max(20).regex(/^[0-9.]+$/).optional().nullable()
})

async function verifyJWT(token: string): Promise<any> {
  const secret = Deno.env.get('LICENSE_JWT_SECRET')
  if (!secret) {
    console.error('LICENSE_JWT_SECRET not configured in environment')
    throw new Error('SERVER_CONFIG_ERROR')
  }

  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  try {
    const payload = await verify(token, key)
    return payload
  } catch (error) {
    console.error('JWT verification failed:', error instanceof Error ? error.message : 'Unknown')
    throw new Error('INVALID_LICENSE')
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const requestBody = await req.json()
    
    // Validate input
    const validationResult = validateLicenseSchema.safeParse(requestBody)
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors)
      throw new Error('VALIDATION_ERROR')
    }

    const { license_key, device_id, app_version } = validationResult.data

    // Verify JWT signature and decode
    const payload = await verifyJWT(license_key)

    // Check if expired (JWT exp is in seconds)
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'expired',
          message: 'Your Pavilo license expired. Please renew to continue using the app.',
          expires_at: new Date(payload.exp * 1000).toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Verify license exists in database and is active
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*, profiles(full_name, email, plan)')
      .eq('license_key', license_key)
      .single()

    if (licenseError || !license) {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'not_found',
          message: 'License not found in our system.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (license.status === 'revoked') {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'revoked',
          message: 'This license has been revoked. Please contact support.',
          revoked_reason: license.revoked_reason
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (license.status === 'expired') {
      return new Response(
        JSON.stringify({
          valid: false,
          reason: 'expired',
          message: 'Your Pavilo license expired. Please renew to continue.',
          expires_at: license.expires_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Log validation attempt
    console.log('License validated:', {
      user_id: payload.sub,
      device_id,
      app_version,
      expires_at: license.expires_at
    })

    // License is valid
    return new Response(
      JSON.stringify({
        valid: true,
        expires_at: license.expires_at,
        plan: license.profiles?.plan || 'basic',
        user_name: license.profiles?.full_name,
        status: 'active',
        message: '🎉 Your Pavilo license is active!'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in validate-license:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
    
    // Return generic error messages to client
    let clientMessage = 'License validation failed. Please try again or contact support.'
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'VALIDATION_ERROR':
          clientMessage = 'Invalid license information provided.'
          break
        case 'INVALID_LICENSE':
          clientMessage = 'Invalid license key.'
          break
        case 'SERVER_CONFIG_ERROR':
          clientMessage = 'Service temporarily unavailable. Please contact support.'
          break
      }
    }
    
    return new Response(
      JSON.stringify({
        valid: false,
        reason: 'error',
        message: clientMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
