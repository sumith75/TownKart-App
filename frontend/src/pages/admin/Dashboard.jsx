import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeToStoreOrders } from "../../firebase/services/ordersService";
import { subscribeToProducts } from "../../firebase/services/productsService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import { doc, setDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export default function AdminDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.supermarketId) return;
        const unsubOrders = subscribeToStoreOrders(user.supermarketId, (data) => {
            setOrders(data);
            setLoading(false);
        });
        const unsubProducts = subscribeToProducts(user.supermarketId, setProducts);
        return () => { unsubOrders(); unsubProducts(); };
    }, [user?.supermarketId]);

    const stats = {
        total: orders.length,
        pending: orders.filter((o) => o.status === "Pending").length,
        active: orders.filter((o) => ["Packed", "Out for Delivery"].includes(o.status)).length,
        delivered: orders.filter((o) => o.status === "Delivered").length,
        revenue: orders.filter((o) => o.status === "Delivered").reduce((s, o) => s + (o.totalAmount || 0), 0),
        lowStock: products.filter((p) => p.stock <= 5).length,
    };

    const STAT_CARDS = [
        { label: "Total Orders", value: stats.total, icon: "📋", color: "bg-indigo-50 text-indigo-600" },
        { label: "Pending", value: stats.pending, icon: "⏳", color: "bg-yellow-50 text-yellow-600" },
        { label: "Active", value: stats.active, icon: "🛵", color: "bg-orange-50 text-orange-600" },
        { label: "Delivered", value: stats.delivered, icon: "✅", color: "bg-green-50 text-green-600" },
        { label: "Revenue", value: `₹${stats.revenue.toFixed(0)}`, icon: "💰", color: "bg-emerald-50 text-emerald-600" },
        { label: "Low Stock", value: stats.lowStock, icon: "⚠️", color: "bg-red-50 text-red-600" },
    ];

    const handleSeedDb = async () => {
        if (!window.confirm("Seed database with a dummy supermarket and products?")) return;
        try {
            setLoading(true);
            const storeRef = await addDoc(collection(db, "supermarkets"), {
                name: "TownKart City Center",
                address: "123 Main Street, City Center",
                phone: "9876543210",
                rating: 4.8,
                isOpen: true,
                image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
            });
            const storeId = storeRef.id;

            await updateDoc(doc(db, "users", user.uid), {
                supermarketId: storeId
            });

            // Make sure the AuthContext cache updates eventually (a hard refresh does this but this is safer)
            const dProducts = [
                { name: "Fresh Tomatoes", price: 45, category: "Fruits & Vegetables", stock: 120, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80", discount: 5, unit: "1 kg", description: "Freshly picked organic tomatoes." },
                { name: "Whole Wheat Bread", price: 40, category: "Bakery", stock: 30, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80", discount: 0, unit: "1 loaf", description: "Soft and healthy whole wheat bread." },
                { name: "Amul Milk (Toned)", price: 32, category: "Dairy & Eggs", stock: 50, image: "https://minisite.amul.com/m/img/product/amultaza.png", discount: 0, unit: "500 ml", description: "Pasteurized toned milk." },
                { name: "Tata Salt", price: 28, category: "Household", stock: 200, image: "https://images.unsplash.com/photo-1621360091807-69c73df899f8?w=500&q=80", discount: 0, unit: "1 kg", description: "Vacuum evaporated iodised salt." },
                { name: "Lays Classic Salted", price: 20, category: "Snacks", stock: 85, image: "https://images.unsplash.com/photo-1566478989037-eade1764658e?w=500&q=80", discount: 0, unit: "50 g", description: "Classic potato chips." }
            ];

            for (const p of dProducts) {
                p.supermarketId = storeId;
                p.createdAt = new Date();
                await addDoc(collection(db, "products"), p);
            }

            alert("Supermarket and 5 products seeded successfully! Please perform a hard refresh (Ctrl+Shift+R).");
        } catch (err) {
            alert("Error seeding: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name} 👋</p>
                        {user?.supermarketId && (
                            <p className="text-xs text-gray-400 mt-1 font-mono">Store ID: {user.supermarketId}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {!user?.supermarketId && (
                            <button onClick={handleSeedDb} disabled={loading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                                {loading ? "Seeding..." : "+ Seed Demo Data"}
                            </button>
                        )}
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">🔴 Live</span>
                    </div>
                </div>

                {/* Stats Grid */}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {STAT_CARDS.map((s) => (
                        <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center`}>
                            <div className="text-2xl mb-1">{s.icon}</div>
                            <div className="text-2xl font-bold">{loading ? "—" : s.value}</div>
                            <div className="text-xs font-medium mt-0.5 opacity-70">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Link
                        to="/admin/orders"
                        className="group bg-white rounded-2xl shadow p-5 flex items-center gap-4 hover:shadow-md transition"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">📋</div>
                        <div>
                            <p className="font-bold text-gray-800">Manage Orders</p>
                            <p className="text-xs text-gray-400">{stats.pending} pending · {stats.active} active</p>
                        </div>
                        <span className="ml-auto text-gray-300 group-hover:text-green-500 transition text-xl">→</span>
                    </Link>
                    <Link
                        to="/admin/products"
                        className="group bg-white rounded-2xl shadow p-5 flex items-center gap-4 hover:shadow-md transition"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">📦</div>
                        <div>
                            <p className="font-bold text-gray-800">Manage Products</p>
                            <p className="text-xs text-gray-400">{products.length} products · {stats.lowStock} low</p>
                        </div>
                        <span className="ml-auto text-gray-300 group-hover:text-green-500 transition text-xl">→</span>
                    </Link>
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-2xl shadow p-5">
                    <h2 className="font-bold text-gray-800 mb-4">Recent Orders</h2>
                    {loading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">No orders yet</p>
                    ) : (
                        <div className="space-y-2">
                            {orders.slice(0, 5).map((o) => (
                                <div key={o.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition">
                                    <span className="font-mono text-xs text-gray-400">#{o.id.slice(0, 8).toUpperCase()}</span>
                                    <span className="text-sm text-gray-600 flex-1">{o.items?.length} items</span>
                                    <span className="text-sm font-bold text-green-700">₹{o.totalAmount?.toFixed(0)}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.status === "Delivered" ? "bg-green-100 text-green-700" :
                                        o.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                                            o.status === "Rejected" ? "bg-red-100 text-red-600" :
                                                "bg-blue-100 text-blue-700"
                                        }`}>{o.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
