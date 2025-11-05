import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Package, Truck, IndianRupee, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectDrive from "@/components/drive/ConnectDrive";

const APMCDashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    pendingPayments: 0,
    totalCustomers: 0,
    totalBags: 0,
    lowStockItems: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Today's sales
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, payment_status')
        .eq('user_id', user.id)
        .gte('invoice_date', today);

      const todaySales = invoices
        ?.filter(inv => inv.payment_status === 'paid')
        ?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 0;

      const pendingPayments = invoices
        ?.filter(inv => inv.payment_status === 'pending')
        ?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 0;

      // Customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Total bags sold today
      const { data: todayItems } = await supabase
        .from('invoice_items')
        .select('quantity, invoices!inner(user_id, invoice_date)')
        .eq('invoices.user_id', user.id)
        .gte('invoices.invoice_date', today);

      const totalBags = todayItems?.reduce((sum, item) => 
        sum + parseFloat(item.quantity.toString()), 0) || 0;

      // Low stock items
      const { data: products } = await supabase
        .from('products')
        .select('stock_quantity, reorder_level')
        .eq('user_id', user.id);

      const lowStockCount = products?.filter(
        p => p.stock_quantity <= p.reorder_level
      ).length || 0;

      setStats({
        todaySales,
        pendingPayments,
        totalCustomers: customerCount || 0,
        totalBags,
        lowStockItems: lowStockCount,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">APMC Wholesale Dashboard</h2>
          <p className="text-muted-foreground">Anaj Vyapari Operations</p>
        </div>
        <Link to="/dashboard/invoices/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            New Wholesale Order
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingPayments.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bags Sold Today</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBags}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/invoices/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Create Wholesale Invoice
              </Button>
            </Link>
            <Link to="/dashboard/customers">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Retailers/Clients
              </Button>
            </Link>
            <Link to="/dashboard/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Manage Stock (Bags/Quintals)
              </Button>
            </Link>
            <Link to="/dashboard/payments">
              <Button variant="outline" className="w-full justify-start">
                <IndianRupee className="mr-2 h-4 w-4" />
                Track Payments
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Deliveries Pending</span>
              </div>
              <span className="text-sm font-medium">Check Invoices</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm">Restock Required</span>
              </div>
              <span className="text-sm font-medium">{stats.lowStockItems} items</span>
            </div>
            <Link to="/dashboard/reports">
              <Button variant="link" className="w-full p-0">
                View Detailed Reports →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <ConnectDrive />
    </div>
  );
};

export default APMCDashboard;
