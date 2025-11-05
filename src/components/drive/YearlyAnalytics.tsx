import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Package } from "lucide-react";

type MonthlyData = {
  month: string;
  year: number;
  total_sales: number;
  total_invoices: number;
};

const YearlyAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchYearlyAnalytics();
  }, []);

  const fetchYearlyAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('monthly_analytics')
        .select('month, year, total_sales, total_invoices')
        .eq('user_id', user.id)
        .eq('year', currentYear)
        .order('month', { ascending: true });

      if (error) throw error;

      setAnalyticsData(data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalYearlySales = analyticsData.reduce((sum, month) => sum + parseFloat(month.total_sales.toString()), 0);
  const totalInvoices = analyticsData.reduce((sum, month) => sum + month.total_invoices, 0);
  
  const chartData = analyticsData.map(item => ({
    month: item.month,
    sales: parseFloat(item.total_sales.toString()),
    invoices: item.total_invoices,
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yearly Analytics - {currentYear}</CardTitle>
          <CardDescription>Loading your year in review...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (analyticsData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Yearly Analytics - {currentYear}</CardTitle>
          <CardDescription>No data available yet. Analytics will appear after monthly cleanup.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Your Year in Review - {currentYear}</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalYearlySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Across {totalInvoices} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales Trend</CardTitle>
          <CardDescription>Sales performance throughout {currentYear}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Invoice Volume</CardTitle>
          <CardDescription>Number of invoices generated each month</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="invoices" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlyAnalytics;