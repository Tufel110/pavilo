import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Reports = () => {
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [paymentModeData, setPaymentModeData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const COLORS = ["#4E73DF", "#1CC88A", "#36B9CC", "#F6C23E", "#E74A3B"];

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: invoices } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .gte("invoice_date", dateRange.from)
      .lte("invoice_date", dateRange.to);

    if (invoices) {
      const salesByDate = invoices.reduce((acc: any, inv) => {
        const date = new Date(inv.invoice_date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + parseFloat(inv.total_amount.toString());
        return acc;
      }, {});

      setSalesData(
        Object.entries(salesByDate).map(([date, amount]) => ({
          date,
          amount,
        }))
      );

      const paymentModes = invoices.reduce((acc: any, inv) => {
        acc[inv.payment_mode] = (acc[inv.payment_mode] || 0) + parseFloat(inv.total_amount.toString());
        return acc;
      }, {});

      setPaymentModeData(
        Object.entries(paymentModes).map(([mode, value]) => ({
          name: mode,
          value,
        }))
      );

      const customerSales = invoices.reduce((acc: any, inv) => {
        acc[inv.customer_name] = (acc[inv.customer_name] || 0) + parseFloat(inv.total_amount.toString());
        return acc;
      }, {});

      setTopCustomers(
        Object.entries(customerSales)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5)
      );
    }

    const { data: items } = await supabase
      .from("invoice_items")
      .select("*, invoices!inner(invoice_date, user_id)")
      .eq("invoices.user_id", user.id)
      .gte("invoices.invoice_date", dateRange.from)
      .lte("invoices.invoice_date", dateRange.to);

    if (items) {
      const productSales = items.reduce((acc: any, item) => {
        acc[item.product_name] = (acc[item.product_name] || 0) + parseFloat(item.total.toString());
        return acc;
      }, {});

      setTopProducts(
        Object.entries(productSales)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a: any, b: any) => b.amount - a.amount)
          .slice(0, 5)
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>

        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="from">From</Label>
                <Input
                  id="from"
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </div>
              <Button onClick={fetchReports}>Generate Report</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#4E73DF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Modes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentModeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{customer.name}</span>
                    <span className="text-muted-foreground">
                      ₹{customer.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {topCustomers.length === 0 && (
                  <p className="text-center text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 5 Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-muted-foreground">
                      ₹{product.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <p className="text-center text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
