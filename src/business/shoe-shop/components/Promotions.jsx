import React from 'react';
import { Tag, Plus, Trash2 } from 'lucide-react';

const Promotions = () => {
    const promotions = [
        { id: 1, code: 'SUMMER25', type: 'Percentage', value: '25%', status: 'Active', expiry: '2024-06-30' },
        { id: 2, code: 'WELCOME10', type: 'Percentage', value: '10%', status: 'Active', expiry: 'No Expiry' },
        { id: 3, code: 'FLAT500', type: 'Fixed Amount', value: '₹500', status: 'Expired', expiry: '2023-12-31' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Promotions & Coupons</h2>
                <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New
                </button>
            </div>

            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                    <tr>
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Value</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Expiry</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {promotions.map((promo) => (
                        <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono font-medium text-primary">{promo.code}</td>
                            <td className="px-6 py-4 text-gray-600">{promo.type}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{promo.value}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${promo.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {promo.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{promo.expiry}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Promotions;
