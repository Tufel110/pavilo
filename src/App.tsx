import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/dashboard/Invoices";
import InvoiceCreate from "./pages/dashboard/InvoiceCreate";
import Customers from "./pages/dashboard/Customers";
import Products from "./pages/dashboard/Products";
import Payments from "./pages/dashboard/Payments";
import Reports from "./pages/dashboard/Reports";
import QuickSale from "./pages/dashboard/QuickSale";
import Settings from "./pages/dashboard/Settings";
import PaymentVerification from "./pages/admin/PaymentVerification";
import DriveCallback from "./pages/DriveCallback";
import NotFound from "./pages/NotFound";

// Business Router and Protected Route
import BusinessRouter from "./components/BusinessRouter";
import ProtectedRoute from "./components/ProtectedRoute";

// Business-specific routes
import ShoeShopRoutes from "./business/shoe-shop/routes";
import MiniDmartRoutes from "./business/mini-dmart/routes";
import AnajVyapariRoutes from "./business/anaj-vyapari/routes";

const queryClient = new QueryClient();

// ✅ Automatically use BrowserRouter in dev, HashRouter in production
const Router =
  import.meta.env.MODE === "development" ? BrowserRouter : HashRouter;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/subscription" element={<Subscription />} />

          {/* Main dashboard - redirects based on business type */}
          <Route path="/dashboard" element={<BusinessRouter />} />

          {/* Legacy/General dashboard routes (keep for backward compatibility) */}
          <Route path="/dashboard/invoices" element={<Invoices />} />
          <Route path="/dashboard/invoices/new" element={<InvoiceCreate />} />
          <Route path="/dashboard/customers" element={<Customers />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/quick-sale" element={<QuickSale />} />
          <Route path="/dashboard/settings" element={<Settings />} />

          {/* Business-Specific Routes */}

          {/* Shoe Shop - Protected for shoe_shop business type */}
          <Route
            path="/shoe-shop/*"
            element={
              <ProtectedRoute allowedBusinessTypes={['shoe_shop']}>
                <ShoeShopRoutes />
              </ProtectedRoute>
            }
          />

          {/* Mini Dmart - Protected for mini_dmart business type */}
          <Route
            path="/mini-dmart/*"
            element={
              <ProtectedRoute allowedBusinessTypes={['mini_dmart']}>
                <MiniDmartRoutes />
              </ProtectedRoute>
            }
          />

          {/* Anaj Vyapari - Protected for anaj_vyapari business type */}
          <Route
            path="/anaj-vyapari/*"
            element={
              <ProtectedRoute allowedBusinessTypes={['anaj_vyapari']}>
                <AnajVyapariRoutes />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route path="/admin/payments" element={<PaymentVerification />} />
          <Route path="/drive-callback" element={<DriveCallback />} />

          {/* Legacy shoe-shop route - redirect to new path */}
          <Route
            path="/dashboard/shoe-shop/*"
            element={
              <ProtectedRoute allowedBusinessTypes={['shoe_shop']}>
                <ShoeShopRoutes />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
