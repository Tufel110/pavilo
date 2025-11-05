import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const DriveCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state'); // userId
        const error = params.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or user ID');
        }

        setStatus("Connecting to Google Drive...");

        // Call edge function to exchange code for tokens
        const { data, error: functionError } = await supabase.functions.invoke('connect-drive', {
          body: { code, userId: state }
        });

        if (functionError) throw functionError;

        if (data?.success) {
          toast.success('Google Drive connected successfully!');
          navigate('/dashboard/settings');
        } else {
          throw new Error('Failed to connect Drive');
        }
      } catch (error) {
        console.error('Drive callback error:', error);
        toast.error('Failed to connect Google Drive. Please try again.');
        navigate('/dashboard/settings');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">{status}</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
};

export default DriveCallback;