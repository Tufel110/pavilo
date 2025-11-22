import React from 'react';
import { FileText, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

const Accounting = () => {
    const transactions = [
        { id: 1, date: '2024-03-15', desc: 'Daily Sales Revenue', type: 'Credit', amount: 45000, category: 'Sales' },
        { id: 2, date: '2024-03-14', desc: 'Supplier Payment - Nike', type: 'Debit', amount: 120000, category: 'Purchase' },
        { id: 3, date: '2024-03-14', desc: 'Electricity Bill', type: 'Debit', amount: 4500, category: 'Expense' },
        { id: 4, date: '2024-03-13', desc: 'Daily Sales Revenue', type: 'Credit', amount: 38000, category: 'Sales' },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ArrowUpRight className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(850000)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <ArrowDownLeft className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(320000)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Net Profit</h3>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(530000)}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 text-gray-500">{tx.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">{tx.desc}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'Credit'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {tx.category}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-medium ${tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {tx.type === 'Credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Accounting;
