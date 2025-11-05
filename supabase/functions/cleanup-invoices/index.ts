import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting monthly cleanup...');

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all invoices older than 30 days that are uploaded to Drive
    const { data: oldInvoices, error: fetchError } = await supabase
      .from('invoices')
      .select('id, user_id, invoice_number, total_amount, invoice_date, drive_uploaded')
      .lt('invoice_date', thirtyDaysAgo.toISOString())
      .eq('drive_uploaded', true);

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${oldInvoices?.length || 0} invoices to clean up`);

    if (!oldInvoices || oldInvoices.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No invoices to clean up',
          deleted: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate monthly analytics before deletion
    await generateMonthlyAnalytics(supabase, oldInvoices);

    // Delete old invoice records (keep only metadata)
    const invoiceIds = oldInvoices.map(inv => inv.id);
    
    // Delete invoice items first (foreign key constraint)
    const { error: itemsDeleteError } = await supabase
      .from('invoice_items')
      .delete()
      .in('invoice_id', invoiceIds);

    if (itemsDeleteError) {
      console.error('Error deleting invoice items:', itemsDeleteError);
    }

    // Delete invoices
    const { error: deleteError } = await supabase
      .from('invoices')
      .delete()
      .in('id', invoiceIds);

    if (deleteError) {
      throw deleteError;
    }

    console.log(`Successfully deleted ${invoiceIds.length} old invoices`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Cleaned up ${invoiceIds.length} invoices`,
        deleted: invoiceIds.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-invoices:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateMonthlyAnalytics(supabase: any, invoices: any[]) {
  console.log('Generating monthly analytics...');

  // Group invoices by user and month
  const groupedData: Record<string, any[]> = {};
  
  invoices.forEach(invoice => {
    const date = new Date(invoice.invoice_date);
    const key = `${invoice.user_id}_${date.getFullYear()}_${date.getMonth() + 1}`;
    
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(invoice);
  });

  // Generate analytics for each group
  for (const [key, userInvoices] of Object.entries(groupedData)) {
    const [userId, year, month] = key.split('_');
    
    const totalSales = userInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);
    
    // Get detailed analytics for this period
    const { data: items } = await supabase
      .from('invoice_items')
      .select('product_name, quantity, total')
      .in('invoice_id', userInvoices.map(inv => inv.id));

    // Calculate top and worst products
    const productStats: Record<string, { quantity: number; revenue: number }> = {};
    
    items?.forEach((item: any) => {
      if (!productStats[item.product_name]) {
        productStats[item.product_name] = { quantity: 0, revenue: 0 };
      }
      productStats[item.product_name].quantity += parseFloat(item.quantity);
      productStats[item.product_name].revenue += parseFloat(item.total);
    });

    const sortedProducts = Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue);

    const topProducts = sortedProducts.slice(0, 5);
    const worstProducts = sortedProducts.slice(-5).reverse();

    // Save analytics
    await supabase
      .from('monthly_analytics')
      .upsert({
        user_id: userId,
        month: String(month).padStart(2, '0'),
        year: parseInt(year),
        total_sales: totalSales,
        total_invoices: userInvoices.length,
        top_products: topProducts,
        worst_products: worstProducts,
      });
  }

  console.log('Monthly analytics generated successfully');
}
