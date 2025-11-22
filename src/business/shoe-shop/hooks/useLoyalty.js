import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * useLoyalty - Hook to manage customer loyalty program using Supabase customers table
 */
export const useLoyalty = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch customers for the current user
    useEffect(() => {
        if (!user) {
            setCustomers([]);
            return;
        }

        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('customers')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('name', { ascending: true });

                if (error) {
                    throw error;
                }

                setCustomers(data || []);
            } catch (err) {
                console.error('Error fetching customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [user]);

    // Search for a customer by phone or name
    const searchCustomer = async (query) => {
        if (!user || !query) return null;

        try {
            const { data, error } = await supabase
                .from('customers')
                .select('*')
                .eq('user_id', user.id)
                .or(`phone.eq.${query},name.ilike.%${query}%`)
                .limit(1)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                throw error;
            }

            return data;
        } catch (err) {
            console.error('Error searching customer:', err);
            return null;
        }
    };

    // Add loyalty points to a customer based on purchase amount
    const addPoints = async (customerId, purchaseAmount) => {
        if (!user) return 0;

        const pointsEarned = Math.floor(purchaseAmount / 100); // 1 point per ₹100

        try {
            const { error } = await supabase
                .from('customers')
                .update({
                    loyalty_points: supabase.raw(`COALESCE(loyalty_points, 0) + ${pointsEarned}`),
                    total_purchases: supabase.raw(`COALESCE(total_purchases, 0) + ${purchaseAmount}`)
                })
                .eq('id', customerId)
                .eq('user_id', user.id);

            if (error) {
                throw error;
            }

            // Update local state
            setCustomers(prev => prev.map(c =>
                c.id === customerId
                    ? {
                        ...c,
                        loyalty_points: (c.loyalty_points || 0) + pointsEarned,
                        total_purchases: (c.total_purchases || 0) + purchaseAmount
                    }
                    : c
            ));

            return pointsEarned;
        } catch (err) {
            console.error('Error adding loyalty points:', err);
            return 0;
        }
    };

    // Redeem loyalty points (convert points to discount)
    const redeemPoints = async (customerId, pointsToRedeem) => {
        if (!user) return false;

        try {
            // First, check if customer has enough points
            const { data: customer, error: fetchError } = await supabase
                .from('customers')
                .select('loyalty_points')
                .eq('id', customerId)
                .eq('user_id', user.id)
                .single();

            if (fetchError || !customer) {
                throw new Error('Customer not found');
            }

            const currentPoints = customer.loyalty_points || 0;
            if (currentPoints < pointsToRedeem) {
                return false; // Insufficient points
            }

            // Deduct points
            const { error: updateError } = await supabase
                .from('customers')
                .update({
                    loyalty_points: supabase.raw(`loyalty_points - ${pointsToRedeem}`)
                })
                .eq('id', customerId)
                .eq('user_id', user.id);

            if (updateError) {
                throw updateError;
            }

            // Update local state
            setCustomers(prev => prev.map(c =>
                c.id === customerId
                    ? { ...c, loyalty_points: (c.loyalty_points || 0) - pointsToRedeem }
                    : c
            ));

            return true;
        } catch (err) {
            console.error('Error redeeming points:', err);
            return false;
        }
    };

    return {
        customers,
        loading,
        searchCustomer,
        addPoints,
        redeemPoints
    };
};
