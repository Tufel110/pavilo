import { ReactNode, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  DollarSign, 
  BarChart3, 
  LogOut,
  Menu,
  Zap,
  Settings,
  ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

const getNavigation = (t: (key: any) => string) => [
  { name: t('dashboard'), href: "/dashboard", icon: LayoutDashboard },
  { name: t('invoices'), href: "/dashboard/invoices", icon: FileText },
  { name: t('customers'), href: "/dashboard/customers", icon: Users },
  { name: t('products'), href: "/dashboard/products", icon: Package },
  { name: t('payments'), href: "/dashboard/payments", icon: DollarSign },
  { name: t('reports'), href: "/dashboard/reports", icon: BarChart3 },
  { name: t('quickSale'), href: "/dashboard/quick-sale", icon: Zap },
  { name: t('settings'), href: "/dashboard/settings", icon: Settings },
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const navigation = getNavigation(t);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to logout");
    } else {
      navigate("/auth");
    }
  };

  const NavItems = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
      
      {isAdmin && (
        <>
          <Separator className="my-2" />
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
            Admin
          </div>
          <Link
            to="/admin/payments"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              location.pathname === "/admin/payments"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>Payment Verification</span>
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card">
        <div className="flex h-16 items-center gap-4 px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center border-b px-6">
                <h1 className="text-xl font-bold text-primary">PAVILO</h1>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
          
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-primary">PAVILO</h1>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <LanguageSelector />
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t('logout')}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex md:w-64 flex-col border-r bg-card min-h-[calc(100vh-4rem)]">
          <nav className="flex flex-col gap-1 p-4">
            <NavItems />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card py-4 px-4 md:px-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>PAVILO – Simplifying Business Billing.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
