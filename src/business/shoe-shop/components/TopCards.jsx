import React from 'react';
import { TrendingUp, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { formatCurrency, formatCompactNumber } from '@/utils/currency';

const Card = ({ title, value, subtext, icon: Icon, trend, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-gray-500 ml-2">{subtext}</span>
        </div>
    </div>
);

const TopCards = () => {
    // Mock data - in real app this would come from props or context
    const metrics = [
        {
            title: 'Total Sales',
            value: formatCurrency(125000),
            subtext: 'vs last month',
            icon: DollarSign,
            trend: 12.5,
            color: 'bg-blue-500'
        },
        {
            title: 'Active Orders',
            value: '24',
            subtext: 'Processing now',
            icon: Package,
            trend: 5.2,
            color: 'bg-purple-500'
        },
        {
            title: 'Low Stock Items',
            value: '12',
            subtext: 'Requires attention',
            icon: AlertTriangle,
            trend: -2.4,
            color: 'bg-orange-500'
        },
        {
            title: 'Total Revenue',
            value: formatCompactNumber(4500000),
            subtext: 'Year to date',
            icon: TrendingUp,
            trend: 8.1,
            color: 'bg-green-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
                <Card key={index} {...metric} />
            ))}
        </div>
    );
};

export default TopCards;
