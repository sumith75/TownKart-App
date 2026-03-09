import React, { useEffect, useState } from "react";
import {
    subscribeToAssignedOrders,
    updateDeliveryStatus,
    getDeliveryEarnings,
} from "../../firebase/services/ordersService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const STATUS_BADGE = {
    Packed: "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
};

export default function DeliveryDashboard() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [tab, setTab] = useState("active"); // active | delivered

    useEffect(() => {
        if (!user?.uid) return;
        const unsub = subscribeToAssignedOrders(user.uid, (data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsub();
    }, [user?.uid]);

    const handleStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateDeliveryStatus(orderId, user.uid, newStatus);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const activeOrders = orders.filter((o) => o.status !== "Delivered");
    const deliveredOrders = orders.filter((o) => o.status === "Delivered");
    const displayed = tab === "active" ? activeOrders : deliveredOrders;

    // Derived Earnings Calculation (Updates in real-time!)
    const todayStr = new Date().toDateString();
    const todayDeliveries = deliveredOrders.filter(o => o.createdAt?.toDate?.()?.toDateString?.() === todayStr);
    const earnings = {
        todayEarnings: todayDeliveries.length * 30,
        totalEarnings: deliveredOrders.length * 30,
        totalDeliveries: deliveredOrders.length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Delivery Dashboard</h1>
                        <p className="text-gray-400 text-sm mt-0.5">Welcome, {user?.name} 🛵</p>
                    </div>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">🔴 Live</span>
                </div>

                {/* Earnings Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl shadow p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">₹{earnings.todayEarnings}</div>
                        <div className="text-xs text-gray-400 mt-1">Today's Earnings</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-4 text-center">
                        <div className="text-2xl font-bold text-indigo-600">₹{earnings.totalEarnings}</div>
                        <div className="text-xs text-gray-400 mt-1">Total Earnings</div>
                    </div>
                    <div className="bg-white rounded-2xl shadow p-4 text-center">
                        <div className="text-2xl font-bold text-orange-500">{earnings.totalDeliveries}</div>
                        <div className="text-xs text-gray-400 mt-1">Deliveries</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                    {["active", "delivered"].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition capitalize ${tab === t ? "bg-white shadow text-gray-800" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {t === "active" ? `🛵 Active (${activeOrders.length})` : `✅ Delivered (${deliveredOrders.length})`}
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow animate-pulse h-28" />
                        ))}
                    </div>
                ) : displayed.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">{tab === "active" ? "🛵" : "✅"}</div>
                        <p className="text-base font-medium">
                            {tab === "active" ? "No active assignments" : "No deliveries yet"}
                        </p>
                        {tab === "active" && <p className="text-sm">New orders will appear here in real time</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayed.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400">Order</p>
                                        <p className="font-mono text-sm font-bold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_BADGE[order.status] || "bg-gray-100 text-gray-500"}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="px-5 py-4">
                                    <div className="space-y-1 mb-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                                <span>{item.name} × {item.quantity}</span>
                                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-400 space-y-0.5">
                                        {order.deliveryAddress && <p>📍 {order.deliveryAddress}</p>}
                                        <p>💳 {order.paymentMethod}</p>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</p>
                                        <span className="text-xs text-gray-400">+₹30 commission</span>
                                    </div>
                                </div>

                                {/* Action buttons */}
                                {order.status !== "Delivered" && (
                                    <div className="px-5 py-3 border-t border-gray-50 flex gap-3">
                                        {order.status === "Packed" && (
                                            <button
                                                onClick={() => handleStatus(order.id, "Out for Delivery")}
                                                disabled={updatingId === order.id}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                                            >
                                                {updatingId === order.id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : "🛵 Out for Delivery"}
                                            </button>
                                        )}
                                        {order.status === "Out for Delivery" && (
                                            <button
                                                onClick={() => handleStatus(order.id, "Delivered")}
                                                disabled={updatingId === order.id}
                                                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2"
                                            >
                                                {updatingId === order.id ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : "✅ Mark Delivered"}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
