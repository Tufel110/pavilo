import jsPDF from "jspdf";

type Invoice = {
  invoice_number: string;
  invoice_date: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
};

type InvoiceItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type Template = {
  header_text?: string;
  footer_text?: string;
  show_customer_address?: boolean;
  show_customer_phone?: boolean;
  show_customer_email?: boolean;
  show_invoice_notes?: boolean;
  invoice_language?: string;
};

const translations: Record<string, Record<string, string>> = {
  english: {
    invoice: "INVOICE",
    invoiceNo: "Invoice #:",
    date: "Date:",
    billTo: "Bill To:",
    phone: "Phone:",
    email: "Email:",
    item: "Item",
    qty: "Qty",
    price: "Price",
    total: "Total",
    subtotal: "Subtotal:",
    discount: "Discount:",
    tax: "Tax:",
    notes: "Notes:",
  },
  hindi: {
    invoice: "चालान",
    invoiceNo: "चालान नं:",
    date: "दिनांक:",
    billTo: "बिल प्राप्तकर्ता:",
    phone: "फोन:",
    email: "ईमेल:",
    item: "वस्तु",
    qty: "मात्रा",
    price: "मूल्य",
    total: "कुल",
    subtotal: "उप-योग:",
    discount: "छूट:",
    tax: "कर:",
    notes: "नोट्स:",
  },
  gujarati: {
    invoice: "ઇન્વૉઇસ",
    invoiceNo: "ઇન્વૉઇસ નં:",
    date: "તારીખ:",
    billTo: "બિલ પ્રાપ્ત:",
    phone: "ફોન:",
    email: "ઇમેઇલ:",
    item: "વસ્તુ",
    qty: "જથ્થો",
    price: "કિંમત",
    total: "કુલ",
    subtotal: "પેટા-કુલ:",
    discount: "છૂટ:",
    tax: "કર:",
    notes: "નોંધ:",
  },
  marathi: {
    invoice: "बीजक",
    invoiceNo: "बीजक क्र:",
    date: "तारीख:",
    billTo: "बिल प्राप्तकर्ता:",
    phone: "फोन:",
    email: "ईमेल:",
    item: "वस्तू",
    qty: "प्रमाण",
    price: "किंमत",
    total: "एकूण",
    subtotal: "उप-एकूण:",
    discount: "सवलत:",
    tax: "कर:",
    notes: "टिप्पण्या:",
  },
};

export const generateEnhancedPDF = (
  invoice: Invoice,
  items: InvoiceItem[],
  template?: Template
): jsPDF => {
  const doc = new jsPDF();
  const lang = template?.invoice_language || "english";
  const t = translations[lang] || translations.english;

  // Color scheme
  const primaryColor: [number, number, number] = [67, 97, 238]; // HSL(223 83% 60%) converted to RGB
  const accentColor: [number, number, number] = [250, 139, 52]; // HSL(27 96% 61%) converted to RGB
  const textDark: [number, number, number] = [28, 36, 61];
  const textLight: [number, number, number] = [107, 114, 128];

  // Header background with gradient effect
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 45, "F");

  // Header text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont(undefined, "bold");
  doc.text(template?.header_text || t.invoice, 105, 25, { align: "center" });

  // Decorative line under header
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(2);
  doc.line(20, 48, 190, 48);

  // Invoice details box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(20, 55, 85, 25, 3, 3, "F");

  doc.setTextColor(...textDark);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(t.invoiceNo, 25, 63);
  doc.setFont(undefined, "normal");
  doc.text(invoice.invoice_number, 25, 69);

  doc.setFont(undefined, "bold");
  doc.text(t.date, 25, 75);
  doc.setFont(undefined, "normal");
  doc.text(new Date(invoice.invoice_date).toLocaleDateString(), 25, 81);

  // Customer details box
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(110, 55, 80, 25, 3, 3, "F");

  doc.setFont(undefined, "bold");
  doc.text(t.billTo, 115, 63);
  doc.setFont(undefined, "normal");
  doc.setFontSize(9);
  
  let yOffset = 69;
  doc.text(invoice.customer_name, 115, yOffset);
  yOffset += 5;

  if (template?.show_customer_address !== false && invoice.customer_address) {
    const addressLines = doc.splitTextToSize(invoice.customer_address, 70);
    doc.text(addressLines, 115, yOffset);
    yOffset += addressLines.length * 4;
  }

  if (template?.show_customer_phone !== false && invoice.customer_phone) {
    doc.text(`${t.phone} ${invoice.customer_phone}`, 115, yOffset);
    yOffset += 4;
  }

  if (template?.show_customer_email !== false && invoice.customer_email) {
    doc.text(`${t.email} ${invoice.customer_email}`, 115, yOffset);
  }

  // Items table
  let tableY = 95;
  
  // Table header
  doc.setFillColor(...primaryColor);
  doc.rect(20, tableY, 170, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont(undefined, "bold");
  doc.text(t.item, 25, tableY + 5.5);
  doc.text(t.qty, 120, tableY + 5.5, { align: "center" });
  doc.text(t.price, 145, tableY + 5.5, { align: "right" });
  doc.text(t.total, 185, tableY + 5.5, { align: "right" });

  tableY += 8;

  // Table rows with alternating colors
  doc.setFont(undefined, "normal");
  doc.setTextColor(...textDark);
  
  items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 252);
      doc.rect(20, tableY, 170, 7, "F");
    }

    doc.setFontSize(9);
    const productNameLines = doc.splitTextToSize(item.product_name, 85);
    doc.text(productNameLines[0], 25, tableY + 5);
    doc.text(item.quantity.toString(), 120, tableY + 5, { align: "center" });
    doc.text(`₹${item.unit_price.toFixed(2)}`, 145, tableY + 5, { align: "right" });
    doc.text(`₹${item.total.toFixed(2)}`, 185, tableY + 5, { align: "right" });
    
    tableY += 7;
  });

  // Totals section
  tableY += 5;
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.line(120, tableY, 190, tableY);
  tableY += 7;

  doc.setFontSize(10);
  doc.setTextColor(...textLight);
  doc.text(t.subtotal, 125, tableY);
  doc.setTextColor(...textDark);
  doc.text(`₹${invoice.subtotal.toFixed(2)}`, 185, tableY, { align: "right" });
  tableY += 6;

  if (invoice.discount_amount > 0) {
    doc.setTextColor(...textLight);
    doc.text(t.discount, 125, tableY);
    doc.setTextColor(...accentColor);
    doc.text(`-₹${invoice.discount_amount.toFixed(2)}`, 185, tableY, { align: "right" });
    tableY += 6;
  }

  if (invoice.tax_amount > 0) {
    doc.setTextColor(...textLight);
    doc.text(t.tax, 125, tableY);
    doc.setTextColor(...textDark);
    doc.text(`₹${invoice.tax_amount.toFixed(2)}`, 185, tableY, { align: "right" });
    tableY += 6;
  }

  // Total with highlight
  doc.setFillColor(...accentColor);
  doc.roundedRect(120, tableY - 2, 70, 10, 2, 2, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(t.total, 125, tableY + 5);
  doc.text(`₹${invoice.total_amount.toFixed(2)}`, 185, tableY + 5, { align: "right" });

  // Notes section
  if (template?.show_invoice_notes !== false && invoice.notes) {
    tableY += 18;
    doc.setFillColor(255, 250, 240);
    doc.roundedRect(20, tableY, 170, 20, 2, 2, "F");
    
    doc.setTextColor(...textDark);
    doc.setFontSize(9);
    doc.setFont(undefined, "bold");
    doc.text(t.notes, 25, tableY + 5);
    doc.setFont(undefined, "normal");
    const notesLines = doc.splitTextToSize(invoice.notes, 160);
    doc.text(notesLines, 25, tableY + 10);
  }

  // Footer
  if (template?.footer_text) {
    doc.setTextColor(...textLight);
    doc.setFontSize(8);
    doc.setFont(undefined, "italic");
    doc.text(template.footer_text, 105, 280, { align: "center" });
  }

  // Decorative footer line
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(20, 285, 190, 285);

  return doc;
};
