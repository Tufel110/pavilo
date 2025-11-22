import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateBarcode } from '@/utils/barcode';

/**
 * useInventory - Hook to manage shoe shop inventory from Supabase products table
 * Filters products by user_id to show only the current user's inventory
 */
export const useInventory = () => {
    const { user } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch inventory from Supabase
    useEffect(() => {
        if (!user) {
            setInventory([]);
            setLoading(false);
            return;
        }

        const fetchInventory = async () => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name', { ascending: true });

                if (fetchError) {
                    throw fetchError;
                }

                // Map database fields to expected component structure
                const mappedInventory = (data || []).map(item => ({
                    id: item.id,
                    name: item.name,
                    category: item.category || 'GENERAL',
                    brand: item.brand || '',
                    size: item.size || '',
                    color: item.color || '',
                    price: item.price || 0,
                    stock: item.stock_quantity || 0,
                    quantity: item.stock_quantity || 0, // Alias for compatibility
                    barcode: item.barcode || item.sku,
                    minStock: item.reorder_level || 5,
                    reorderLevel: item.reorder_level || 5,
                    ...item // Include all other fields
                }));

                setInventory(mappedInventory);
                setError(null);
            } catch (err) {
                console.error('Error fetching inventory:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();

        // Set up real-time subscription for inventory changes
        const subscription = supabase
            .channel('inventory_changes')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'products',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Inventory change detected:', payload);
                    fetchInventory(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [user]);

    // Add new inventory item
    const addItem = async (item) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const newItem = {
                user_id: user.id,
                name: item.name,
                category: item.category,
                brand: item.brand || null,
                size: item.size || null,
                color: item.color || null,
                price: item.price,
                stock_quantity: item.stock || item.quantity || 0,
                reorder_level: item.minStock || item.reorderLevel || 5,
                barcode: item.barcode || generateBarcode(item.category, item.name),
                sku: item.sku || item.barcode || generateBarcode(item.category, item.name),
                unit: item.unit || 'pcs',
            };

            const { data, error: insertError } = await supabase
                .from('products')
                .insert(newItem)
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            return data;
        } catch (err) {
            console.error('Error adding item:', err);
            throw err;
        }
    };

    // Update inventory item
    const updateItem = async (id, updates) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const updateData = {
                name: updates.name,
                category: updates.category,
                brand: updates.brand,
                size: updates.size,
                color: updates.color,
                price: updates.price,
                stock_quantity: updates.stock !== undefined ? updates.stock : updates.stock_quantity,
                reorder_level: updates.minStock !== undefined ? updates.minStock : updates.reorder_level,
                barcode: updates.barcode,
                updated_at: new Date().toISOString(),
            };

            // Remove undefined values
            Object.keys(updateData).forEach(key =>
                updateData[key] === undefined && delete updateData[key]
            );

            const { error: updateError } = await supabase
                .from('products')
                .update(updateData)
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user can only update their own products

            if (updateError) {
                throw updateError;
            }
        } catch (err) {
            console.error('Error updating item:', err);
            throw err;
        }
    };

    // Delete inventory item
    const deleteItem = async (id) => {
        if (!user) {
            throw new Error('User not authenticated');
        }

        try {
            const { error: deleteError } = await supabase
                .from('products')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id); // Ensure user can only delete their own products

            if (deleteError) {
                throw deleteError;
            }
        } catch (err) {
            console.error('Error deleting item:', err);
            throw err;
        }
    };

    // Get items with low stock
    const getLowStockItems = () => {
        return inventory.filter(item =>
            item.stock <= (item.minStock || item.reorderLevel || 5)
        );
    };

    return {
        inventory,
        loading,
        error,
        addItem,
        updateItem,
        deleteItem,
        getLowStockItems
    };
};
