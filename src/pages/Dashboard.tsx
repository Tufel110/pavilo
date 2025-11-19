import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GeneralStoreDashboard from "@/components/dashboard/GeneralStoreDashboard";
import APMCDashboard from "@/components/dashboard/APMCDashboard";
import ShoeClothesRetailDashboard from "@/components/dashboard/ShoeClothesRetailDashboard";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // ✅ Shadcn button component

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [driveConnected, setDriveConnected] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 🔹 Watch for login/logout events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
    });

    // 🔹 Initial load: check license + Drive + profile
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
        return;
      }

      // ✅ 1. Check license validity
      const { data: license } = await supabase
        .from("licenses")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single();

      if (!license) {
        navigate("/subscription");
        return;
      }

      // ✅ 2. Check if Google Drive is connected
const { data: drive } = await supabase
  .from("user_drive_tokens")
  .select("is_connected")
  .eq("user_id", session.user.id)
  .maybeSingle();

setDriveConnected(!!drive);


      // ✅ 3. Fetch user's business type
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_type")
        .eq("id", session.user.id)
        .single();

      setBusinessType(profile?.business_type || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // 🔹 Connect Google Drive handler
  const handleConnectDrive = async () => {
    if (!user) {
      toast.error("Please log in first.");
      return;
    }

    try {
      console.log("⚡ Connect Drive clicked");

      const isElectron =
        typeof window === "undefined" ||
        !!(window as any).process?.versions?.electron;

      console.log("🔹 Using Electron?", isElectron);

      let startGoogleAuth: (userId: string) => Promise<void>;

      if (isElectron) {
        ({ startGoogleAuth } = await import("@/lib/googleAuth.node"));
      } else {
        ({ startGoogleAuth } = await import("@/lib/googleAuth.web"));
      }

      console.log("✅ googleAuth module imported:", typeof startGoogleAuth);

      await startGoogleAuth(user.id);

      toast.success("✅ Google Drive connected successfully!");
      setDriveConnected(true);
    } catch (err) {
      console.error("Google Drive connect error:", err);
      toast.error("Failed to connect Google Drive.");
    }
  };

  // 🔹 Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  // 🔹 Dynamic dashboard rendering
  const renderDashboard = () => {
    switch (businessType) {
      case "general_store":
        return <GeneralStoreDashboard />;
      case "apmc_vendor":
        return <APMCDashboard />;
      case "shoe_clothes_retail":
        return <ShoeClothesRetailDashboard />;
      default:
        return <GeneralStoreDashboard />; // Default fallback
    }
  };

  // 🔹 Final return layout
  return (
    <DashboardLayout>
      {/* ⚠️ Drive Connection Banner */}
      {!driveConnected && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 p-4 rounded-xl mb-6 flex items-center justify-between">
          <div>
            <strong>⚠️ Google Drive not connected:</strong> Connect to automatically upload invoices.
          </div>
          <Button
            onClick={handleConnectDrive}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Connect Drive
          </Button>
        </div>
      )}

      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
