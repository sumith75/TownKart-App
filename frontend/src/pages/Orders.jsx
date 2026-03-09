import React, { useEffect, useState } from "react";
import { subscribeToMyOrders } from "../firebase/services/ordersService";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const STATUS_STEPS = ["Pending", "Packed", "Out for Delivery", "Delivered"];

const STATUS_STYLE = {
    Pending: "bg-yellow-100 text-yellow-700",
    Packed: "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-600",
};

const STATUS_ICON = {
    Pending: "⏳",
    Packed: "📦",
    "Out for Delivery": "🛵",
    Delivered: "✅",
    Rejected: "❌",
};

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;
        const unsub = subscribeToMyOrders(user.uid, (data) => {
            setOrders(data);
            setLoading(false);
        });
        return () => unsub();
    }, [user?.uid]);

    const stepIndex = (status) => STATUS_STEPS.indexOf(status);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        🔴 Live
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-2/3 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-24 text-gray-400">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-lg font-semibold text-gray-600 mb-1">No orders yet</h2>
                        <p className="text-sm">Your orders will appear here in real time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
                                {/* Header */}
                                <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
                                    <div>
                                        <p className="text-xs text-gray-400">Order ID</p>
                                        <p className="font-mono text-xs text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLE[order.status] || "bg-gray-100 text-gray-600"}`}>
                                            {STATUS_ICON[order.status]} {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress tracker */}
                                {order.status !== "Rejected" && (
                                    <div className="px-5 py-4 border-b border-gray-50">
                                        <div className="flex items-center justify-between relative">
                                            <div className="absolute left-0 right-0 top-3 h-0.5 bg-gray-200 z-0" />
                                            <div
                                                className="absolute left-0 top-3 h-0.5 bg-green-500 z-0 transition-all duration-700"
                                                style={{
                                                    width: `${(stepIndex(order.status) / (STATUS_STEPS.length - 1)) * 100}%`,
                                                }}
                                            />
                                            {STATUS_STEPS.map((step, idx) => (
                                                <div key={step} className="relative z-10 flex flex-col items-center gap-1">
                                                    <div
                                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${idx <= stepIndex(order.status)
                                                                ? "bg-green-500 text-white"
                                                                : "bg-gray-200 text-gray-400"
                                                            }`}
                                                    >
                                                        {idx < stepIndex(order.status) ? "✓" : idx + 1}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 text-center leading-tight max-w-[50px]">
                                                        {step}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Items */}
                                <div className="px-5 py-3">
                                    <div className="space-y-1.5">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm text-gray-600">
                                                <span>{item.name} × {item.quantity}</span>
                                                <span className="font-medium">₹{(item.price * item.quantity).toFixed(0)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-5 py-3 bg-gray-50 flex items-center justify-between">
                                    <div className="text-xs text-gray-400">
                                        <span>{order.deliveryType === "pickup" ? "🏪 Pickup" : "🛵 Delivery"}</span>
                                        {order.deliveryAddress && (
                                            <span className="ml-2">· {order.deliveryAddress.slice(0, 30)}...</span>
                                        )}
                                    </div>
                                    <p className="font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}