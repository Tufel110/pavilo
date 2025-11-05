import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, ShoppingCart, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
};

type CartItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

const QuickSale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMode, setPaymentMode] = useState("cash");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .gt("stock_quantity", 0)
      .order("name");

    if (data) setProducts(data);
  };

  const addToCart = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.product_id === productId);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock_quantity) {
        toast.error("Not enough stock available");
        return;
      }
      setCart(
        cart.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unit_price }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          quantity: 1,
          unit_price: product.price,
          total: product.price,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stock_quantity) {
      toast.error("Not enough stock available");
      return;
    }

    setCart(
      cart.map((item) =>
        item.product_id === productId
          ? { ...item, quantity, total: quantity * item.unit_price }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handleQuickSale = async () => {
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (cart.length === 0) {
      toast.error("Please add items to cart");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const invoiceNumber = `QS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
    const total = calculateTotal();

    const invoicePayload = {
      user_id: user.id,
      customer_name: customerName,
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString(),
      payment_mode: paymentMode,
      subtotal: total,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: total,
      payment_status: "paid",
    };

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert([invoicePayload])
      .select()
      .single();

    if (invoiceError) {
      toast.error("Error creating sale");
      return;
    }

    const itemsPayload = cart.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: 0,
      discount_percent: 0,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from("invoice_items")
      .insert(itemsPayload);

    if (itemsError) {
      toast.error("Error creating sale items");
      return;
    }

    // Update stock
    for (const item of cart) {
      const product = products.find((p) => p.id === item.product_id);
      if (product) {
        await supabase
          .from("products")
          .update({ stock_quantity: product.stock_quantity - item.quantity })
          .eq("id", item.product_id);
      }
    }

    toast.success(`Sale completed! Invoice: ${invoiceNumber}`);
    setCart([]);
    setCustomerName("");
    fetchProducts();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Quick Sale / POS</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-auto flex flex-col items-start p-4"
                    onClick={() => addToCart(product.id)}
                  >
                    <span className="font-medium">{product.name}</span>
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>
                    <span className="text-xs text-muted-foreground">Stock: {product.stock_quantity}</span>
                  </Button>
                ))}
                {products.length === 0 && (
                  <p className="col-span-2 text-center text-muted-foreground py-8">
                    No products available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <Label htmlFor="payment_mode">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4 space-y-3 max-h-[250px] overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-2 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">₹{item.unit_price} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product_id, parseInt(e.target.value) || 0)
                        }
                        className="w-16 h-8"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFromCart(item.product_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-bold w-20 text-right">₹{item.total.toFixed(2)}</p>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Cart is empty</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{calculateTotal().toFixed(2)}
                  </span>
                </div>
                <Button
                  onClick={handleQuickSale}
                  className="w-full"
                  size="lg"
                  disabled={cart.length === 0 || !customerName.trim()}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Complete Sale
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QuickSale;
