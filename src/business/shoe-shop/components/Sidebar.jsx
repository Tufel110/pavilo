import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    BarChart3,
    FileText,
    Truck,
    Settings,
    LogOut
} from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard/shoe-shop' },
        { icon: ShoppingBag, label: 'POS', path: '/dashboard/shoe-shop/pos' },
        { icon: Package, label: 'Inventory', path: '/dashboard/shoe-shop/inventory' },
        { icon: Users, label: 'Customers', path: '/dashboard/shoe-shop/customers' },
        { icon: BarChart3, label: 'Reports', path: '/dashboard/shoe-shop/reports' },
        { icon: FileText, label: 'Accounting', path: '/dashboard/shoe-shop/accounting' },
        { icon: Truck, label: 'Suppliers', path: '/dashboard/shoe-shop/suppliers' },
    ];

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary">Pavilo</h1>
                <p className="text-sm text-gray-500">Shoe & Clothing</p>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 mr-3 ${isActive(item.path) ? 'text-primary' : 'text-gray-400'}`} />
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
