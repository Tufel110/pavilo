import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useInventory } from '../hooks/useInventory';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const StockAlerts = () => {
    const { getLowStockItems } = useInventory();
    const lowStockItems = getLowStockItems();

    if (lowStockItems.length === 0) return null;

    return (
        <div className="space-y-4 mb-6">
            {lowStockItems.map(item => (
                <Alert key={item.id} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Low Stock Alert</AlertTitle>
                    <AlertDescription>
                        <strong>{item.name}</strong> (Size: {item.size}) is running low. Only {item.stock} remaining.
                    </AlertDescription>
                </Alert>
            ))}
        </div>
    );
};

export default StockAlerts;
