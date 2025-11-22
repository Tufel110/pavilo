import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Users, BarChart2, Calculator, Truck } from "lucide-react";
import { useEffect } from "react";

const AnajVyapariDashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extract the current tab from URL
    const currentPath = location.pathname.split('/').pop();
    const currentTab = currentPath === 'anaj-vyapari' ? 'overview' : currentPath;

    // Handle tab changes
    const handleTabChange = (value) => {
        const path = value === 'overview' ? '/anaj-vyapari' : `/anaj-vyapari/${value}`;
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Anaj Vyapari Dashboard</h1>
                    <p className="text-gray-600">Manage your grain & wholesale business</p>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-4">
                    <TabsList className="bg-white/80 backdrop-blur-sm shadow-sm p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart2 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="pos" className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Billing
                        </TabsTrigger>
                        <TabsTrigger value="inventory" className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Stock & Inventory
                        </TabsTrigger>
                        <TabsTrigger value="customers" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Customers
                        </TabsTrigger>
                        <TabsTrigger value="reports" className="flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Reports
                        </TabsTrigger>
                        <TabsTrigger value="suppliers" className="flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Suppliers
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Content - Uses React Router Outlet */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
                        <Outlet />
                    </div>
                </Tabs>
            </div>
        </div>
    );
};

export default AnajVyapariDashboard;
