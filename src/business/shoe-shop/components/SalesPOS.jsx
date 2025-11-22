import React, { useState } from 'react';
import { Search, ShoppingCart, User, CreditCard, Banknote, Smartphone, Trash2, Plus, Minus, Printer, Save } from 'lucide-react';
import { useSales } from '../hooks/useSales';
import { useInventory } from '../hooks/useInventory';
import { useUser } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { generateEnhancedPDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

const SalesPOS = () => {
    const { cart, addToCart, removeFromCart, updateQuantity, calculateTotals, clearCart } = useSales();
    const { inventory } = useInventory();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isLoading, setIsLoading] = useState(false);

    const totals = calculateTotals();

    const filteredProducts = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generateInvoiceNumber = async () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD

        // Get count for today
        const { count } = await supabase
            .from('invoices')
            .select('*', { count: 'exact', head: true })
            .ilike('invoice_number', `${dateStr}-%`);

        const nextNum = (count || 0) + 1;
        return `${dateStr}-${String(nextNum).padStart(4, '0')}`;
    };

    const uploadToSupabase = async (file, path) => {
        const { data, error } = await supabase.storage
            .from('invoices')
            .upload(path, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('invoices')
            .getPublicUrl(path);

        return publicUrl;
    };

    const handleSaveSale = async () => {
        if (cart.length === 0) return;
        setIsLoading(true);

        try {
            const invoiceNumber = await generateInvoiceNumber();

            // Generate PDF
            const invoiceData = {
                invoice_number: invoiceNumber,
                invoice_date: new Date().toISOString(),
                customer_name: "Walk-in Customer", // TODO: Add customer selection
                subtotal: totals.subtotal,
                discount_amount: 0, // TODO: Add discount logic
                tax_amount: totals.gstAmount,
                total_amount: totals.total,
            };

            const itemsData = cart.map(item => ({
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total: item.price * item.quantity
            }));

            const pdfDoc = generateEnhancedPDF(invoiceData, itemsData);
            const pdfBlob = pdfDoc.output('blob');

            // Upload PDF
            const datePath = new Date().toISOString().slice(0, 10).split('-').join('/');
            const filePath = `${datePath}/${invoiceNumber}.pdf`;
            const pdfUrl = await uploadToSupabase(pdfBlob, filePath);

            // Save to DB
            const { error } = await supabase.from('invoices').insert({
                invoice_number: invoiceNumber,
                customer_id: null, // TODO: Link customer
                total_amount: totals.total,
                items: cart,
                payment_method: paymentMethod,
                invoice_url: pdfUrl,
                created_by_user: user?.id
            });

            if (error) throw error;

            toast.success(`Sale saved! Invoice: ${invoiceNumber}`);
            clearCart();

        } catch (error) {
            console.error('Sale error:', error);
            toast.error("Failed to save sale: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6">
            {/* Product Selection Area */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="p-4 border-b">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search products by name or barcode..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="flex flex-col items-start p-4 border rounded-lg hover:border-primary hover:shadow-md transition-all text-left group bg-card"
                            >
                                <div className="w-full aspect-square bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground">
                                    <span className="text-xs">No Image</span>
                                </div>
                                <h3 className="font-medium line-clamp-2 group-hover:text-primary">{product.name}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{product.size} / {product.color}</p>
                                <p className="font-bold mt-2">{formatCurrency(product.price)}</p>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Cart & Checkout Area */}
            <Card className="w-96 flex flex-col">
                <CardHeader className="p-4 border-b bg-muted/50 flex flex-row justify-between items-center space-y-0">
                    <CardTitle className="flex items-center text-base">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Current Sale
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <User className="w-5 h-5" />
                    </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 mb-3 opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-3">
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                    <p className="text-xs text-muted-foreground">{item.size} / {item.color}</p>
                                    <div className="flex items-center mt-2 gap-3">
                                        <div className="flex items-center border rounded-md">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-none"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="px-2 text-sm font-medium">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 rounded-none"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <span className="text-sm font-medium">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>

                <div className="p-4 bg-muted/50 border-t">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatCurrency(totals.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>GST (18%)</span>
                            <span>{formatCurrency(totals.gstAmount)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t">
                            <span>Total</span>
                            <span>{formatCurrency(totals.total)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <Button
                            variant={paymentMethod === 'CASH' ? 'default' : 'outline'}
                            className="flex flex-col h-auto py-2 text-xs"
                            onClick={() => setPaymentMethod('CASH')}
                        >
                            <Banknote className="w-5 h-5 mb-1" />
                            Cash
                        </Button>
                        <Button
                            variant={paymentMethod === 'CARD' ? 'default' : 'outline'}
                            className="flex flex-col h-auto py-2 text-xs"
                            onClick={() => setPaymentMethod('CARD')}
                        >
                            <CreditCard className="w-5 h-5 mb-1" />
                            Card
                        </Button>
                        <Button
                            variant={paymentMethod === 'UPI' ? 'default' : 'outline'}
                            className="flex flex-col h-auto py-2 text-xs"
                            onClick={() => setPaymentMethod('UPI')}
                        >
                            <Smartphone className="w-5 h-5 mb-1" />
                            UPI
                        </Button>
                    </div>

                    <Button
                        onClick={handleSaveSale}
                        disabled={cart.length === 0 || isLoading}
                        className="w-full py-6 text-lg font-bold"
                    >
                        {isLoading ? "Saving..." : "Complete Sale"}
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SalesPOS;
