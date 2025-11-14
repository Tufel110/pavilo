import http from "http";
import open from "open";
import { supabase } from "@/integrations/supabase/client";

const PORT = 51789;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

export async function startGoogleAuth(userId: string) {
  return new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith("/callback")) {
        const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.end(`<h3>❌ Google Auth failed: ${error}</h3>`);
          server.close();
          return reject(error);
        }

        if (!code) {
          res.end("<h3>❌ Missing code</h3>");
          server.close();
          return reject("Missing code");
        }

        res.end("<h3>✅ Connected — you can close this tab now.</h3>");
        server.close();

        try {
          const { data, error: fnError } = await supabase.functions.invoke("connect-drive", {
            body: { code, userId, env: "desktop" },
          });

          if (fnError) throw fnError;

          if (data?.success) resolve();
          else throw new Error("Failed to exchange code for tokens");
        } catch (err) {
          console.error("Google Auth Exchange Error:", err);
          reject(err);
        }
      }
    });

    server.listen(PORT, () => {
      const authUrl =
        "https://accounts.google.com/o/oauth2/v2/auth" +
        `?client_id=${CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        "&response_type=code" +
        `&scope=${encodeURIComponent("https://www.googleapis.com/auth/drive.file")}` +
        "&access_type=offline" +
        "&prompt=consent" +
        `&state=${userId}`;
      open(authUrl);
    });
  });
}
