import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gst_number: string;
};

type Product = {
  id: string;
  name: string;
  product_code: string;
  product_number: string;
  unit: string;
  price: number;
};

type InvoiceItem = {
  product_id: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_percent: number;
  discount_percent: number;
  total: number;
};

const InvoiceCreate = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState<string[]>([]);
  const [invoiceData, setInvoiceData] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: "",
    payment_mode: "cash",
    notes: "",
  });

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    generateInvoiceNumber();
  }, []);

  const generateInvoiceNumber = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    
    // Get count of invoices for today
    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("invoice_date", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T00:00:00`)
      .lt("invoice_date", `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate() + 1).padStart(2, "0")}T00:00:00`);
    
    const sequenceNumber = String((count || 0) + 1).padStart(4, "0");
    const invoiceNumber = `INV-${datePrefix}-${sequenceNumber}`;
    setInvoiceData((prev) => ({ ...prev, invoice_number: invoiceNumber }));
  };

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) setCustomers(data);
  };

  const fetchProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (data) setProducts(data);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: "",
        product_name: "",
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_percent: 0,
        discount_percent: 0,
        total: 0,
      },
    ]);
    setProductSearch([...productSearch, ""]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    setProductSearch(productSearch.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "product_id") {
      const product = products.find((p) => p.id === value);
      if (product) {
        newItems[index].product_name = product.name;
        newItems[index].unit_price = product.price;
      }
    }

    const item = newItems[index];
    const subtotal = item.quantity * item.unit_price;
    const discountAmount = (subtotal * item.discount_percent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = (taxableAmount * item.tax_percent) / 100;
    newItems[index].total = taxableAmount + taxAmount;

    setItems(newItems);
  };

  const updateProductSearch = (index: number, search: string) => {
    const newSearch = [...productSearch];
    newSearch[index] = search;
    setProductSearch(newSearch);
  };

  const selectProduct = (index: number, product: Product) => {
    updateItem(index, "product_id", product.id);
    updateProductSearch(index, "");
  };

  const getFilteredProducts = (index: number) => {
    const search = productSearch[index]?.toLowerCase() || "";
    if (!search) return [];
    
    return products.filter((p) =>
      p.name.toLowerCase().includes(search) ||
      p.product_code.toLowerCase().includes(search) ||
      p.product_number?.toLowerCase().includes(search)
    ).slice(0, 5);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_price;
    }, 0);

    const discountAmount = items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price * item.discount_percent) / 100;
    }, 0);

    const taxableAmount = subtotal - discountAmount;

    const taxAmount = items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_price;
      const itemDiscount = (itemSubtotal * item.discount_percent) / 100;
      const itemTaxable = itemSubtotal - itemDiscount;
      return sum + (itemTaxable * item.tax_percent) / 100;
    }, 0);

    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (items.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if customer exists, if not create one
    let customerId = null;
    const existingCustomer = customers.find(
      (c) => c.name.toLowerCase() === customerName.trim().toLowerCase()
    );

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert([
          {
            user_id: user.id,
            name: customerName.trim(),
            email: "",
            phone: "",
            address: "",
          },
        ])
        .select()
        .single();

      if (customerError) {
        toast.error("Error creating customer");
        return;
      }
      customerId = newCustomer.id;
    }

    const totals = calculateTotals();

    const invoicePayload = {
      user_id: user.id,
      customer_id: customerId,
      customer_name: customerName.trim(),
      customer_email: "",
      customer_phone: "",
      customer_address: "",
      invoice_number: invoiceData.invoice_number,
      invoice_date: invoiceData.invoice_date,
      due_date: invoiceData.due_date || null,
      payment_mode: invoiceData.payment_mode,
      notes: invoiceData.notes,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      tax_amount: totals.taxAmount,
      total_amount: totals.total,
      payment_status: "pending",
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([invoicePayload])
      .select()
      .single();

    if (invoiceError) {
      toast.error("Error creating invoice");
      return;
    }

    const itemsPayload = items.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: item.tax_percent,
      discount_percent: item.discount_percent,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsPayload);

    if (itemsError) {
      toast.error("Error creating invoice items");
      return;
    }

    toast.success("Invoice created successfully");
    navigate("/dashboard/invoices");
  };

  const totals = calculateTotals();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/invoices")}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              Save Invoice
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  value={invoiceData.invoice_number}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, invoice_number: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer">Customer Name *</Label>
                <Input
                  id="customer"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="invoice_date">Invoice Date</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={invoiceData.invoice_date}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, invoice_date: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={invoiceData.due_date}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, due_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select
                  value={invoiceData.payment_mode}
                  onValueChange={(value) =>
                    setInvoiceData({ ...invoiceData, payment_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              <Button onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Item {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <Label>Product (Name/Number)</Label>
                      <Input
                        value={item.product_name || productSearch[index] || ""}
                        onChange={(e) => {
                          updateItem(index, "product_name", e.target.value);
                          updateProductSearch(index, e.target.value);
                        }}
                        placeholder="Type to search products..."
                      />
                      {productSearch[index] && getFilteredProducts(index).length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                          {getFilteredProducts(index).map((product) => (
                            <button
                              key={product.id}
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent transition-colors text-sm"
                              onClick={() => selectProduct(index, product)}
                            >
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.product_code} {product.product_number && `• ${product.product_number}`} • ₹{product.price}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(index, "unit_price", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label>Tax %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.tax_percent}
                        onChange={(e) =>
                          updateItem(index, "tax_percent", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.discount_percent}
                        onChange={(e) =>
                          updateItem(index, "discount_percent", parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div>
                      <Label>Total</Label>
                      <Input value={`₹${item.total.toFixed(2)}`} disabled />
                    </div>
                  </div>
                </div>
              ))}

              {items.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No items added. Click "Add Item" to start.
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Discount:</span>
                    <span>-₹{totals.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>₹{totals.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceCreate;
