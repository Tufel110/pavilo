import React, { useState } from 'react';
import { Search, User, Star, Gift } from 'lucide-react';
import { useLoyalty } from '../hooks/useLoyalty';

const CustomerLoyalty = () => {
    const { searchCustomer } = useLoyalty();
    const [searchQuery, setSearchQuery] = useState('');
    const [customer, setCustomer] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        const result = searchCustomer(searchQuery);
        setCustomer(result || null);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Loyalty Lookup</h2>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Phone Number or Name..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        Search
                    </button>
                </form>
            </div>

            {customer ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                                    <p className="text-gray-500">{customer.phone}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${customer.tier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {customer.tier} Member
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm text-blue-600 mb-1">Available Points</p>
                                <p className="text-2xl font-bold text-blue-900">{customer.points}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                <p className="text-sm text-green-600 mb-1">Total Spent</p>
                                <p className="text-2xl font-bold text-green-900">₹45,000</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <Gift className="w-5 h-5 mr-2 text-primary" />
                            Redeem Rewards
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
                                <p className="font-medium text-gray-900 group-hover:text-primary">₹500 Off Voucher</p>
                                <p className="text-xs text-gray-500">Cost: 500 Points</p>
                            </button>
                            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group">
                                <p className="font-medium text-gray-900 group-hover:text-primary">Free Socks</p>
                                <p className="text-xs text-gray-500">Cost: 200 Points</p>
                            </button>
                        </div>
                    </div>
                </div>
            ) : searchQuery && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <p className="text-gray-500">No customer found with that detail.</p>
                    <button className="mt-4 text-primary font-medium hover:underline">Register New Customer</button>
                </div>
            )}
        </div>
    );
};

export default CustomerLoyalty;
