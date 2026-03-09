import React, { useEffect, useState } from "react";
import {
    subscribeToStoreOrders,
    updateOrderStatus,
    assignDelivery,
    getDeliveryPartners,
} from "../../firebase/services/ordersService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const STATUS_OPTIONS = ["Pending", "Packed", "Out for Delivery", "Delivered", "Rejected"];

const STATUS_BADGE = {
    Pending: "bg-yellow-100 text-yellow-700",
    Packed: "bg-blue-100 text-blue-700",
    "Out for Delivery": "bg-orange-100 text-orange-700",
    Delivered: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-600",
};

export default function AdminOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("All");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        if (!user?.supermarketId) return;
        const unsub = subscribeToStoreOrders(user.supermarketId, (data) => {
            setOrders(data);
            setLoading(false);
        });
        getDeliveryPartners().then(setPartners);
        return () => unsub();
    }, [user?.supermarketId]);

    const filtered = filterStatus === "All" ? orders : orders.filter((o) => o.status === filterStatus);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await updateOrderStatus(orderId, newStatus);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleAssign = async (orderId, partnerId) => {
        if (!partnerId) return;
        setUpdatingId(orderId);
        try {
            await assignDelivery(orderId, partnerId);
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Orders Management</h1>
                    <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">🔴 Live</span>
                </div>

                {/* Status filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {["All", ...STATUS_OPTIONS].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilterStatus(s)}
                            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition ${filterStatus === s
                                    ? "bg-green-600 text-white"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
                                }`}
                        >
                            {s} {s !== "All" && `(${orders.filter(o => o.status === s).length})`}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 shadow animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <div className="text-5xl mb-3">📋</div>
                        <p>No orders for this status</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow overflow-hidden">
                                {/* Order Header */}
                                <div className="px-5 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
                                    <div>
                                        <p className="text-xs text-gray-400">Order</p>
                                        <p className="font-mono text-sm font-bold text-gray-700">#{order.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-400">Customer</p>
                                        <p className="text-sm font-medium text-gray-700 truncate">{order.customerId?.slice(0, 12)}...</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400">Total</p>
                                        <p className="font-bold text-green-700">₹{order.totalAmount?.toFixed(2)}</p>
                                    </div>
                                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_BADGE[order.status] || "bg-gray-100"}`}>
                                        {order.status}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="px-5 py-3 border-b border-gray-50">
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {order.items?.map((item, idx) => (
                                            <span key={idx} className="text-sm text-gray-600">
                                                {item.name} × {item.quantity}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="mt-1 flex gap-3 text-xs text-gray-400">
                                        <span>{order.deliveryType === "pickup" ? "🏪 Pickup" : "🛵 Delivery"}</span>
                                        {order.deliveryAddress && <span>📍 {order.deliveryAddress}</span>}
                                        <span>💳 {order.paymentMethod}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="px-5 py-3 flex flex-wrap items-center gap-3">
                                    {/* Status update */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-500 font-medium">Status:</label>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updatingId === order.id}
                                            className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                                        >
                                            {STATUS_OPTIONS.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Assign delivery partner */}
                                    {order.deliveryType !== "pickup" && (
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs text-gray-500 font-medium">Assign:</label>
                                            <select
                                                defaultValue={order.deliveryPartnerId || ""}
                                                onChange={(e) => handleAssign(order.id, e.target.value)}
                                                disabled={updatingId === order.id}
                                                className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400 bg-white"
                                            >
                                                <option value="">— Unassigned —</option>
                                                {partners.map((p) => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {updatingId === order.id && (
                                        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
