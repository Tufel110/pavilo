import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ConnectDrive from "@/components/drive/ConnectDrive";

type InvoiceTemplate = {
  id?: string;
  template_name: string;
  show_company_logo: boolean;
  show_customer_address: boolean;
  show_customer_email: boolean;
  show_customer_phone: boolean;
  show_gst_number: boolean;
  show_invoice_notes: boolean;
  show_item_description: boolean;
  show_tax_column: boolean;
  show_discount_column: boolean;
  header_text: string;
  footer_text: string;
  invoice_language: string;
};

const Settings = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<InvoiceTemplate>({
    template_name: "Default Template",
    show_company_logo: true,
    show_customer_address: true,
    show_customer_email: true,
    show_customer_phone: true,
    show_gst_number: false,
    show_invoice_notes: true,
    show_item_description: true,
    show_tax_column: true,
    show_discount_column: true,
    header_text: "INVOICE",
    footer_text: "Thank you for your business!",
    invoice_language: "english",
  });

  useEffect(() => {
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("invoice_templates")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (data) {
      setTemplate(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const templateData = {
      template_name: template.template_name,
      show_company_logo: template.show_company_logo,
      show_customer_address: template.show_customer_address,
      show_customer_email: template.show_customer_email,
      show_customer_phone: template.show_customer_phone,
      show_gst_number: template.show_gst_number,
      show_invoice_notes: template.show_invoice_notes,
      show_item_description: template.show_item_description,
      show_tax_column: template.show_tax_column,
      show_discount_column: template.show_discount_column,
      header_text: template.header_text,
      footer_text: template.footer_text,
      invoice_language: template.invoice_language,
      is_active: true,
    };

    if (template.id) {
      // Update existing template
      const { error } = await supabase
        .from("invoice_templates")
        .update(templateData)
        .eq("id", template.id);

      if (error) {
        console.error("Update error:", error);
        toast.error("Error updating template");
      } else {
        toast.success("Template updated successfully");
      }
    } else {
      // Create new template
      const { error } = await supabase
        .from("invoice_templates")
        .insert([{ ...templateData, user_id: user.id }]);

      if (error) {
        console.error("Insert error:", error);
        toast.error("Error creating template");
      } else {
        toast.success("Template created successfully");
        fetchTemplate();
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">{t('invoiceSettings')}</h2>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {t('saveTemplate')}
          </Button>
        </div>

        <ConnectDrive />

        <Card>
          <CardHeader>
            <CardTitle>{t('templateCustomization')}</CardTitle>
            <CardDescription>
              Customize how your invoices look when printed or downloaded as PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="template_name">{t('templateName')}</Label>
                <Input
                  id="template_name"
                  value={template.template_name}
                  onChange={(e) =>
                    setTemplate({ ...template, template_name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="header_text">{t('headerText')}</Label>
                <Input
                  id="header_text"
                  value={template.header_text}
                  onChange={(e) =>
                    setTemplate({ ...template, header_text: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="footer_text">{t('footerText')}</Label>
                <Textarea
                  id="footer_text"
                  value={template.footer_text}
                  onChange={(e) =>
                    setTemplate({ ...template, footer_text: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="invoice_language">{t('invoiceLanguage')}</Label>
                <Select
                  value={template.invoice_language}
                  onValueChange={(value) =>
                    setTemplate({ ...template, invoice_language: value })
                  }
                >
                  <SelectTrigger id="invoice_language">
                    <SelectValue placeholder={t('selectLanguage')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="gujarati">ગુજરાતી (Gujarati)</SelectItem>
                    <SelectItem value="marathi">मराठी (Marathi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">{t('showHideFields')}</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_customer_address">{t('showCustomerAddress')}</Label>
                  <Switch
                    id="show_customer_address"
                    checked={template.show_customer_address}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_customer_address: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_customer_email">{t('showCustomerEmail')}</Label>
                  <Switch
                    id="show_customer_email"
                    checked={template.show_customer_email}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_customer_email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_customer_phone">{t('showCustomerPhone')}</Label>
                  <Switch
                    id="show_customer_phone"
                    checked={template.show_customer_phone}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_customer_phone: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_gst_number">{t('showGSTNumber')}</Label>
                  <Switch
                    id="show_gst_number"
                    checked={template.show_gst_number}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_gst_number: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_invoice_notes">{t('showInvoiceNotes')}</Label>
                  <Switch
                    id="show_invoice_notes"
                    checked={template.show_invoice_notes}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_invoice_notes: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_item_description">{t('showItemDescription')}</Label>
                  <Switch
                    id="show_item_description"
                    checked={template.show_item_description}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_item_description: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_tax_column">{t('showTaxColumn')}</Label>
                  <Switch
                    id="show_tax_column"
                    checked={template.show_tax_column}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_tax_column: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_discount_column">{t('showDiscountColumn')}</Label>
                  <Switch
                    id="show_discount_column"
                    checked={template.show_discount_column}
                    onCheckedChange={(checked) =>
                      setTemplate({ ...template, show_discount_column: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
