import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Cloud, CloudOff, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConnectDrive = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_drive_tokens')
        .select('is_connected')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setIsConnected(data.is_connected);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login first');
        return;
      }

      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
      const redirectUri = `${window.location.origin}/drive-callback`;
      
      const scope = 'https://www.googleapis.com/auth/drive.file';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${googleClientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${user.id}`;

      // Open OAuth window
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting to Drive:', error);
      toast.error('Failed to connect to Google Drive');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_drive_tokens')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setIsConnected(false);
      toast.success('Google Drive disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Drive Integration</CardTitle>
          <CardDescription>Loading connection status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? <Cloud className="h-5 w-5 text-primary" /> : <CloudOff className="h-5 w-5 text-muted-foreground" />}
          Google Drive Integration
        </CardTitle>
        <CardDescription>
          Automatically backup your invoices to Google Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription>
                ✅ Your Google Drive is connected. All new invoices will be automatically uploaded to your Drive in organized folders.
              </AlertDescription>
            </Alert>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Drive
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Connect your Google Drive to automatically backup all invoices. Your data stays secure in your personal Drive account.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Benefits:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>Automatic invoice backup</li>
                <li>Organized by month in folders</li>
                <li>Access from anywhere</li>
                <li>Your data, your control</li>
              </ul>
            </div>
            <Button 
              onClick={handleConnect} 
              disabled={connecting}
              className="w-full sm:w-auto"
            >
              {connecting ? 'Connecting...' : 'Connect Google Drive'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectDrive;