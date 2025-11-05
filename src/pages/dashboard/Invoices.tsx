import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, CheckCircle, XCircle, Trash2, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { generateEnhancedPDF } from "@/lib/pdfGenerator";

type Invoice = {
  id: string;
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  payment_status: string;
  payment_mode: string;
};

const Invoices = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [whatsappDialog, setWhatsappDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const fetchInvoices = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, invoice_date, customer_name, customer_phone, total_amount, payment_status, payment_mode")
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

  const handlePaymentStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "paid" ? "pending" : "paid";
    
    const { error } = await supabase
      .from("invoices")
      .update({ payment_status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Error updating payment status");
    } else {
      toast.success(`Invoice marked as ${newStatus}`);
      fetchInvoices();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    const { error } = await supabase.from("invoices").delete().eq("id", id);

    if (error) {
      toast.error("Error deleting invoice");
    } else {
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    }
  };

  const handleWhatsAppShare = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setWhatsappNumber(invoice.customer_phone || "");
    setWhatsappDialog(true);
  };

  const sendWhatsAppMessage = async () => {
    if (!selectedInvoice || !whatsappNumber) {
      toast.error("Please enter a valid WhatsApp number");
      return;
    }

    // Generate PDF first
    toast.info("Generating PDF...");
    await generatePDF(selectedInvoice.id);

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    // Create the message with PDF info
    const message = `Hello ${selectedInvoice.customer_name},

Your invoice from PAVILO has been generated:
Invoice #: ${selectedInvoice.invoice_number}
Date: ${new Date(selectedInvoice.invoice_date).toLocaleDateString()}
Amount: ₹${selectedInvoice.total_amount.toFixed(2)}
Payment Status: ${selectedInvoice.payment_status.toUpperCase()}

Please check the downloaded PDF file for complete details.

Thank you for your business!`;

    // Encode the message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Close dialog
    setWhatsappDialog(false);
    setWhatsappNumber("");
    toast.success("PDF downloaded! Opening WhatsApp...");
  };

  const generatePDF = async (invoiceId: string) => {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();

    if (invoiceError || !invoice) {
      toast.error("Error fetching invoice");
      return;
    }

    const { data: items, error: itemsError } = await supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (itemsError) {
      toast.error("Error fetching invoice items");
      return;
    }
    
    // Fetch active template
    const { data: { user } } = await supabase.auth.getUser();
    const { data: template } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_active", true)
      .single();

    // Use enhanced PDF generator
    const doc = generateEnhancedPDF(invoice, items || [], template || undefined);
    
    doc.save(`invoice-${invoice.invoice_number}.pdf`);
    toast.success("Invoice downloaded successfully");
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t('invoices')}</h2>
          <Link to="/dashboard/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createInvoice')}
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`${t('search')} ${t('invoices').toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoiceNumber')}</TableHead>
                <TableHead>{t('invoiceDate')}</TableHead>
                <TableHead>{t('customerName')}</TableHead>
                <TableHead>{t('paymentMode')}</TableHead>
                <TableHead className="text-right">{t('amount')}</TableHead>
                <TableHead>{t('paymentStatus')}</TableHead>
                <TableHead className="text-right">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    {t('loading')}
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    {t('noDataFound')}
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
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
                    <TableCell>
                      <Badge
                        variant={
                          invoice.payment_status === "paid"
                            ? "default"
                            : invoice.payment_status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {invoice.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePaymentStatusToggle(invoice.id, invoice.payment_status)}
                          title={invoice.payment_status === "paid" ? "Mark as Unpaid" : "Mark as Paid"}
                        >
                          {invoice.payment_status === "paid" ? (
                            <XCircle className="h-4 w-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleWhatsAppShare(invoice)}
                          title="Share on WhatsApp"
                        >
                          <Share2 className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => generatePDF(invoice.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={whatsappDialog} onOpenChange={setWhatsappDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('shareOnWhatsApp')}</DialogTitle>
            <DialogDescription>
              {t('enterWhatsAppNumber')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp-number">{t('whatsAppNumberLabel')}</Label>
              <Input
                id="whatsapp-number"
                type="tel"
                placeholder="e.g., 919876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {t('includeCountryCode')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappDialog(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={sendWhatsAppMessage}>
              {t('openWhatsApp')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Invoices;
