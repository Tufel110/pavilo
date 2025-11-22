import React, { useState } from 'react';
import { Search, RotateCcw, ArrowRight } from 'lucide-react';

const ExchangeReturn = () => {
    const [invoiceId, setInvoiceId] = useState('');
    const [invoice, setInvoice] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        // Mock search
        if (invoiceId) {
            setInvoice({
                id: invoiceId,
                date: '2023-10-25',
                items: [
                    { id: 1, name: 'Nike Air Max', size: '9', price: 12000, quantity: 1 },
                    { id: 3, name: 'Puma T-Shirt', size: 'L', price: 2500, quantity: 2 }
                ]
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Return / Exchange</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter Invoice Number..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={invoiceId}
                            onChange={(e) => setInvoiceId(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
                        Find Invoice
                    </button>
                </form>
            </div>

            {invoice && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Invoice #{invoice.id}</p>
                            <p className="text-xs text-gray-400">{invoice.date}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>
                    </div>

                    <div className="p-6">
                        <h3 className="text-sm font-medium text-gray-900 mb-4">Select items to return:</h3>
                        <div className="space-y-4">
                            {invoice.items.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                        <div>
                                            <p className="font-medium text-gray-900">{item.name}</p>
                                            <p className="text-sm text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900">₹{item.price}</p>
                                        <button className="text-xs text-primary hover:underline mt-1">Exchange Item</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                        <button className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Process Return
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExchangeReturn;
