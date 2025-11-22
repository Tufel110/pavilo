import React from 'react';
import { Truck, Phone, Mail, Plus } from 'lucide-react';

const SupplierManagement = () => {
    const suppliers = [
        { id: 1, name: 'Nike India Pvt Ltd', contact: 'Rahul Verma', phone: '9876543210', email: 'orders@nike.com', status: 'Active' },
        { id: 2, name: 'Adidas Distributors', contact: 'Amit Singh', phone: '9988776655', email: 'supply@adidas.com', status: 'Active' },
        { id: 3, name: 'Local Leather Works', contact: 'Suresh Kumar', phone: '8877665544', email: 'suresh@leather.com', status: 'Inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Supplier Management</h2>
                <button className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Supplier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                    <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {supplier.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{supplier.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Contact: {supplier.contact}</p>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                {supplier.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                {supplier.email}
                            </div>
                        </div>

                        <div className="mt-6 flex gap-2">
                            <button className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                View History
                            </button>
                            <button className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
                                New Order
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupplierManagement;
