import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { calculateGST } from '@/utils/gst';

/**
 * useSales - Hook to manage sales/POS operations using Supabase invoices tables
 * Creates invoices, invoice_items, and invoice_payments in the database
 */
export const useSales = () => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Add product to cart
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    // Remove product from cart
    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    // Update product quantity in cart
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    // Clear cart and customer
    const clearCart = () => {
        setCart([]);
        setCustomer(null);
    };

    // Calculate cart totals
    const calculateTotals = () => {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const { gstAmount, totalPrice } = calculateGST(subtotal, 18); // 18% GST
        return { subtotal, gstAmount, total: totalPrice };
    };

    // Process sale and create invoice in Supabase
    const processSale = async (paymentMethod, paymentDetails = {}) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        if (cart.length === 0) {
            throw new Error('Cart is empty');
        }

        setProcessing(true);

        try {
            const totals = calculateTotals();
            const invoiceNumber = `INV-${Date.now()}`;

            // 1. Create invoice
            const invoiceData = {
                user_id: user.id,
                customer_id: customer?.id || null,
                customer_name: customer?.name || 'Walk-in Customer',
                customer_phone: customer?.phone || null,
                invoice_number: invoiceNumber,
                invoice_date: new Date().toISOString(),
                due_date: new Date().toISOString(), // Immediate payment
                subtotal: totals.subtotal,
                tax_amount: totals.gstAmount,
                total_amount: totals.total,
                amount_paid: totals.total, // Assuming full payment
                balance: 0,
                status: 'paid',
                payment_method: paymentMethod,
                notes: paymentDetails.notes || null,
            };

            const { data: invoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert(invoiceData)
                .select()
                .single();

            if (invoiceError) {
                throw invoiceError;
            }

            // 2. Create invoice items
            const invoiceItems = cart.map(item => ({
                invoice_id: invoice.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                tax_rate: 18, // 18% GST
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(invoiceItems);

            if (itemsError) {
                throw itemsError;
            }

            // 3. Create payment record
            const paymentData = {
                invoice_id: invoice.id,
                user_id: user.id,
                amount: totals.total,
                payment_method: paymentMethod,
                payment_date: new Date().toISOString(),
                status: 'completed',
                transaction_id: paymentDetails.transactionId || null,
                notes: paymentDetails.notes || null,
            };

            const { error: paymentError } = await supabase
                .from('invoice_payments')
                .insert(paymentData);

            if (paymentError) {
                throw paymentError;
            }

            // 4. Update product stock quantities
            for (const item of cart) {
                const { error: stockError } = await supabase
                    .from('products')
                    .update({
                        stock_quantity: supabase.raw(`stock_quantity - ${item.quantity}`)
                    })
                    .eq('id', item.id)
                    .eq('user_id', user.id);

                if (stockError) {
                    console.error('Error updating stock for product:', item.id, stockError);
                    // Continue even if stock update fails - we can manually adjust later
                }
            }

            // Clear cart after successful sale
            clearCart();

            return {
                success: true,
                invoiceId: invoice.id,
                invoiceNumber: invoiceNumber,
                invoice
            };

        } catch (err) {
            console.error('Error processing sale:', err);
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    return {
        cart,
        customer,
        processing,
        setCustomer,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        calculateTotals,
        processSale
    };
};
