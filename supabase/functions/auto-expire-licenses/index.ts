import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify secret-based authentication
    const authHeader = req.headers.get('Authorization')
    const expectedSecret = Deno.env.get('AUTO_EXPIRE_SECRET')
    
    if (!expectedSecret) {
      console.error('AUTO_EXPIRE_SECRET not configured')
      return new Response(
        JSON.stringify({ error: 'Service misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      console.error('Unauthorized auto-expire attempt:', {
        timestamp: new Date().toISOString(),
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      })
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    )

    console.log('Starting auto-expire-licenses job...')

    // Call the database function to expire licenses
    const { error: expireError } = await supabaseAdmin.rpc('expire_old_licenses')

    if (expireError) {
      console.error('Error calling expire_old_licenses:', expireError)
      throw expireError
    }

    // Get count of expired licenses
    const { data: expiredLicenses, error: countError } = await supabaseAdmin
      .from('licenses')
      .select('id, user_id, expires_at', { count: 'exact' })
      .eq('status', 'expired')
      .gte('expires_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours

    if (countError) {
      console.error('Error counting expired licenses:', countError)
    } else {
      console.log(`Expired ${expiredLicenses?.length || 0} licenses in the last 24 hours`)
    }

    // Send expiry notifications (optional - can be expanded)
    if (expiredLicenses && expiredLicenses.length > 0) {
      for (const license of expiredLicenses) {
        await supabaseAdmin
          .from('license_logs')
          .insert({
            license_id: license.id,
            action: 'auto_expired',
            performed_by: null,
            details: {
              expired_at: license.expires_at,
              auto_process: true
            }
          })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: expiredLicenses?.length || 0,
        message: 'Auto-expire job completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in auto-expire-licenses:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
