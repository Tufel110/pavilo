// src/lib/googleAuth.web.ts
import { supabase } from "@/integrations/supabase/client";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;
const REDIRECT_URI = "http://localhost:8080/drive-callback"; // for browser use only

export async function startGoogleAuth(userId: string) {
  // Open Google OAuth page
  const authUrl =
    "https://accounts.google.com/o/oauth2/v2/auth" +
    `?client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    "&response_type=code" +
    `&scope=${encodeURIComponent("https://www.googleapis.com/auth/drive.file")}` +
    "&access_type=offline" +
    "&prompt=consent" +
    `&state=${userId}`;

  window.location.href = authUrl; // redirect user
}

// The actual redirect handling happens in src/pages/DriveCallback.tsx
// which calls supabase.functions.invoke("connect-drive", { body: { code, userId, env: "web" } })
