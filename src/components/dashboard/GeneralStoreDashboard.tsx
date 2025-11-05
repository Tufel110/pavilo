import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Package, ShoppingCart, IndianRupee } from "lucide-react";
import { Link } from "react-router-dom";
import ConnectDrive from "@/components/drive/ConnectDrive";

const GeneralStoreDashboard = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayTransactions: 0,
    totalCustomers: 0,
    totalProducts: 0,
    topSellingProducts: [] as any[],
  });

  useEffect(() => {
    const fetchStats = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      // Today's sales and transactions
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount, payment_status')
        .eq('user_id', user.id)
        .gte('invoice_date', today);

      const todaySales = invoices
        ?.filter(inv => inv.payment_status === 'paid')
        ?.reduce((sum, inv) => sum + parseFloat(inv.total_amount.toString()), 0) || 0;

      // Customer count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Top selling products (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: topProducts } = await supabase
        .from('invoice_items')
        .select('product_name, quantity, invoices!inner(user_id, invoice_date)')
        .eq('invoices.user_id', user.id)
        .gte('invoices.invoice_date', sevenDaysAgo.toISOString())
        .limit(5);

      // Aggregate top products
      const productMap = new Map();
      topProducts?.forEach(item => {
        const current = productMap.get(item.product_name) || 0;
        productMap.set(item.product_name, current + parseFloat(item.quantity.toString()));
      });

      const topSellingProducts = Array.from(productMap.entries())
        .map(([name, qty]) => ({ name, quantity: qty }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        todaySales,
        todayTransactions: invoices?.length || 0,
        totalCustomers: customerCount || 0,
        totalProducts: productCount || 0,
        topSellingProducts,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">General Store Dashboard</h2>
          <p className="text-muted-foreground">Manage your mini D-mart operations</p>
        </div>
        <Link to="/dashboard/quick-sale">
          <Button size="lg">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Quick Sale
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayTransactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Stock</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/quick-sale">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Quick Sale (POS)
              </Button>
            </Link>
            <Link to="/dashboard/products">
              <Button variant="outline" className="w-full justify-start">
                <Package className="mr-2 h-4 w-4" />
                Manage Inventory
              </Button>
            </Link>
            <Link to="/dashboard/customers">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Customer Database
              </Button>
            </Link>
            <Link to="/dashboard/invoices">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                View All Sales
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSellingProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topSellingProducts.map((product, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{product.name}</span>
                    <span className="text-sm text-muted-foreground">{product.quantity} units</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sales data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <ConnectDrive />
    </div>
  );
};

export default GeneralStoreDashboard;
