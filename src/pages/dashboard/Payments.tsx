import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";

type Invoice = {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  invoice_date: string;
  payment_mode: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
};

const Payments = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("invoice_date", { ascending: false });

    if (error) {
      toast.error("Error fetching invoices");
    } else {
      setInvoices(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (id: string) => {
    const { error } = await supabase
      .from("invoices")
      .update({ payment_status: "paid" })
      .eq("id", id);

    if (error) {
      toast.error("Error updating payment status");
    } else {
      toast.success("Invoice marked as paid");
      fetchInvoices();
    }
  };

  const generatePaymentReceipt = async (invoice: Invoice) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("PAYMENT RECEIPT", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoice_number}`, 20, 40);
    doc.text(`Payment Date: ${new Date(invoice.invoice_date).toLocaleDateString()}`, 20, 46);
    
    doc.text("Received From:", 20, 60);
    doc.text(invoice.customer_name, 20, 66);
    if (invoice.customer_address) doc.text(invoice.customer_address, 20, 72);
    if (invoice.customer_phone) doc.text(`Phone: ${invoice.customer_phone}`, 20, 78);
    
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Amount Paid:", 20, 100);
    doc.text(`₹${invoice.total_amount.toFixed(2)}`, 20, 110);
    
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Payment Mode: ${invoice.payment_mode.toUpperCase()}`, 20, 120);
    doc.text("Status: PAID", 20, 126);
    
    doc.setFontSize(8);
    doc.text("Thank you for your payment!", 105, 280, { align: "center" });
    
    doc.save(`receipt-${invoice.invoice_number}.pdf`);
    toast.success("Receipt downloaded successfully");
  };

  const paidInvoices = invoices.filter((inv) => 
    inv.payment_status === "paid" &&
    (inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const unpaidInvoices = invoices.filter((inv) => 
    inv.payment_status === "pending" &&
    (inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderInvoiceTable = (invoiceList: Invoice[], isPaid: boolean) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment Mode</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : invoiceList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No {isPaid ? "paid" : "unpaid"} invoices found
              </TableCell>
            </TableRow>
          ) : (
            invoiceList.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                <TableCell>
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{invoice.customer_name}</TableCell>
                <TableCell className="capitalize">{invoice.payment_mode}</TableCell>
                <TableCell className="text-right">
                  ₹{invoice.total_amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {isPaid ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generatePaymentReceipt(invoice)}
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        title="Mark as Paid"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPending = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <h3 className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1">{paidInvoices.length} invoices</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                <h3 className="text-2xl font-bold text-orange-600">₹{totalPending.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1">{unpaidInvoices.length} invoices</p>
              </div>
              <Badge variant="secondary">{unpaidInvoices.length}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="unpaid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="unpaid">
              Unpaid ({unpaidInvoices.length})
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid ({paidInvoices.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unpaid" className="space-y-4">
            {renderInvoiceTable(unpaidInvoices, false)}
          </TabsContent>
          
          <TabsContent value="paid" className="space-y-4">
            {renderInvoiceTable(paidInvoices, true)}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Payments;
