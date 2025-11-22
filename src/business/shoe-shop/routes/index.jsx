import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ShoeShopDashboard from '../ShoeShopDashboard';
import TopCards from '../components/TopCards';
import InventoryTable from '../components/InventoryTable';
import StockAlerts from '../components/StockAlerts';
import SalesPOS from '../components/SalesPOS';
import ExchangeReturn from '../components/ExchangeReturn';
import Promotions from '../components/Promotions';
import CustomerLoyalty from '../components/CustomerLoyalty';
import Reports from '../components/Reports';
import Accounting from '../components/Accounting';
import SupplierManagement from '../components/SupplierManagement';
import AddItem from '../components/AddItem';
import EditItem from '../components/EditItem';

// Dashboard Overview Component
const DashboardOverview = () => (
    <div className="space-y-6">
        <TopCards />
        <StockAlerts />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                        New Sale
                    </button>
                    <button className="p-4 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors">
                        Add Inventory
                    </button>
                    <button className="p-4 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors">
                        Customer Lookup
                    </button>
                    <button className="p-4 bg-orange-50 text-orange-700 rounded-lg font-medium hover:bg-orange-100 transition-colors">
                        View Reports
                    </button>
                </div>
            </div>
            {/* Placeholder for another widget */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400">
                Recent Activity Widget
            </div>
        </div>
    </div>
);

const ShoeShopRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ShoeShopDashboard />}>
                <Route index element={<DashboardOverview />} />
                <Route path="pos" element={<SalesPOS />} />
                <Route path="inventory" element={
                    <div className="space-y-6">
                        <StockAlerts />
                        <InventoryTable />
                    </div>
                } />
                <Route path="customers" element={<CustomerLoyalty />} />
                <Route path="reports" element={<Reports />} />
                <Route path="accounting" element={<Accounting />} />
                <Route path="suppliers" element={<SupplierManagement />} />
                <Route path="promotions" element={<Promotions />} />
                <Route path="returns" element={<ExchangeReturn />} />
                <Route path="*" element={<Navigate to="/dashboard/shoe-shop" replace />} />
            </Route>
        </Routes>
    );
};

export default ShoeShopRoutes;
