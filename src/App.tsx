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
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/invoices" element={<Invoices />} />
          <Route path="/dashboard/invoices/new" element={<InvoiceCreate />} />
          <Route path="/dashboard/customers" element={<Customers />} />
          <Route path="/dashboard/products" element={<Products />} />
          <Route path="/dashboard/payments" element={<Payments />} />
          <Route path="/dashboard/reports" element={<Reports />} />
          <Route path="/dashboard/quick-sale" element={<QuickSale />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/admin/payments" element={<PaymentVerification />} />
          <Route path="/drive-callback" element={<DriveCallback />} />
          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
