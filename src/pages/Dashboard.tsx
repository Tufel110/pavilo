import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import GeneralStoreDashboard from "@/components/dashboard/GeneralStoreDashboard";
import APMCDashboard from "@/components/dashboard/APMCDashboard";
import ShoeClothesRetailDashboard from "@/components/dashboard/ShoeClothesRetailDashboard";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
        return;
      }
      
      // Check if user has active license
      supabase
        .from("licenses")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .single()
        .then(({ data: license }) => {
          if (!license) {
            navigate("/subscription");
          } else {
            // Fetch business type from profile
            supabase
              .from("profiles")
              .select("business_type")
              .eq("id", session.user.id)
              .single()
              .then(({ data: profile }) => {
                setBusinessType(profile?.business_type || null);
                setLoading(false);
              });
          }
        });
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const renderDashboard = () => {
    switch (businessType) {
      case 'general_store':
        return <GeneralStoreDashboard />;
      case 'apmc_vendor':
        return <APMCDashboard />;
      case 'shoe_clothes_retail':
        return <ShoeClothesRetailDashboard />;
      default:
        return <GeneralStoreDashboard />; // Default fallback
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
