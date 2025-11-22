import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ShoeShopDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract the active tab from the current URL path
    const pathParts = location.pathname.split('/');
    const activeRoute = pathParts[pathParts.length - 1] === 'shoe-shop' ? '' : pathParts[pathParts.length - 1];

    const handleTabChange = (value) => {
        if (value === 'overview') {
            navigate('/dashboard/shoe-shop');
        } else {
            navigate(`/dashboard/shoe-shop/${value}`);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Shoe & Clothing Dashboard</h2>
                </div>

                <Tabs value={activeRoute || 'overview'} onValueChange={handleTabChange} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="pos">POS & Billing</TabsTrigger>
                        <TabsTrigger value="inventory">Inventory</TabsTrigger>
                        <TabsTrigger value="customers">Customers</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger value="accounting">Accounting</TabsTrigger>
                        <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
                    </TabsList>

                    {/* Render nested route content */}
                    <Outlet />
                </Tabs>
            </div>
        </DashboardLayout>
    );
};

export default ShoeShopDashboard;
