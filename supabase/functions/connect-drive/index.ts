import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// ✅ Enable CORS for Supabase Edge Functions
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ✅ Start the Edge Function
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { code, userId, env } = await req.json();

    if (!code || !userId) {
      throw new Error("Missing code or userId");
    }

    // ✅ OAuth credentials
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID")!;
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET")!;

    // ✅ Choose redirect URI dynamically (web or desktop)
    const redirectUri =
      env === "desktop"
        ? "http://127.0.0.1:51789/callback"
        : "http://localhost:8080/drive-callback";

    console.log(`🔁 Exchanging code for tokens via redirectUri = ${redirectUri}`);

    // ✅ Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", tokens);
      throw new Error(tokens.error_description || "Failed to exchange code");
    }

    console.log("✅ Tokens received successfully for user:", userId);

    // ✅ Calculate expiry time
    const expiryTime = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    // ✅ Store tokens in Supabase
   // ✅ Store tokens in Supabase
const { error: dbError } = await supabase
  .from("user_drive_tokens")
  .upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expiry: expiryTime, // ✅ correct column
      scope: tokens.scope,
      is_connected: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" } // ✅ THIS IS THE FIX — update instead of insert
  );



    if (dbError) {
      console.error("❌ Database error:", dbError);
      throw dbError;
    }

    console.log("✅ Tokens stored successfully for user:", userId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Google Drive connected successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in connect-drive:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
