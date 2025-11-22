import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users } from "lucide-react";

const Overview = () => {
    // Mock stats for demo
    const stats = [
        { title: "Today's Sales", value: "₹45,230", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
        { title: "Total Products", value: "89", icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Low Stock Items", value: "5", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Total Customers", value: "156", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-600">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${stat.bg}`}>
                                    <Icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="p-4 bg-amber-100 hover:bg-amber-200 rounded-lg text-center transition-colors">
                        <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                        <span className="text-sm font-medium">New Invoice</span>
                    </button>
                    <button className="p-4 bg-blue-100 hover:bg-blue-200 rounded-lg text-center transition-colors">
                        <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                        <span className="text-sm font-medium">Add Product</span>
                    </button>
                    <button className="p-4 bg-purple-100 hover:bg-purple-200 rounded-lg text-center transition-colors">
                        <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <span className="text-sm font-medium">Add Customer</span>
                    </button>
                    <button className="p-4 bg-orange-100 hover:bg-orange-200 rounded-lg text-center transition-colors">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                        <span className="text-sm font-medium">View Reports</span>
                    </button>
                </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="border-orange-200">
                <CardHeader>
                    <CardTitle className="text-orange-600">⚠️ Low Stock Alert</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">You have 5 products that need restocking soon.</p>
                    <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        View Low Stock Items
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Overview;
