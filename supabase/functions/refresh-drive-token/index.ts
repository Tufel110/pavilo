import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    console.log('Fetching tokens for user:', userId);

    // Get current tokens
    const { data: tokenData, error: fetchError } = await supabase
      .from('user_drive_tokens')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !tokenData) {
      throw new Error('No tokens found for user');
    }

    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID')!;
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')!;

    console.log('Refreshing access token...');

    // Refresh the access token
    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: googleClientId,
        client_secret: googleClientSecret,
        refresh_token: tokenData.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!refreshResponse.ok) {
      const error = await refreshResponse.text();
      console.error('Token refresh failed:', error);
      
      // Mark as disconnected if refresh fails
      await supabase
        .from('user_drive_tokens')
        .update({ is_connected: false })
        .eq('user_id', userId);
      
      throw new Error(`Failed to refresh token: ${error}`);
    }

    const newTokens = await refreshResponse.json();
    console.log('New tokens received');

    // Calculate new expiry time
    const expiryTime = new Date();
    expiryTime.setSeconds(expiryTime.getSeconds() + newTokens.expires_in);

    // Update tokens in database
    const { error: updateError } = await supabase
      .from('user_drive_tokens')
      .update({
        access_token: newTokens.access_token,
        token_expiry: expiryTime.toISOString(),
        is_connected: true,
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to update tokens:', updateError);
      throw updateError;
    }

    console.log('Tokens refreshed successfully for user:', userId);

    return new Response(
      JSON.stringify({ 
        success: true,
        access_token: newTokens.access_token,
        expiry: expiryTime.toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-drive-token:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});