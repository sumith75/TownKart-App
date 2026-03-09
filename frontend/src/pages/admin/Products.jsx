import React, { useEffect, useState } from "react";
import {
    subscribeToProducts,
    addProduct,
    updateProduct,
    deleteProduct,
} from "../../firebase/services/productsService";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";

const CATEGORIES = [
    "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages",
    "Grains & Pulses", "Meat & Fish", "Personal Care", "Household", "Bakery", "Frozen Foods"
];

const EMPTY_FORM = {
    name: "", price: "", category: CATEGORIES[0], stock: "", image: "",
    discount: "0", unit: "piece", description: "", expiryDate: "",
};

export default function AdminProducts() {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null); // product id
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!user?.supermarketId) {
            setLoading(false);
            return;
        }
        const unsub = subscribeToProducts(user.supermarketId, (data) => {
            setProducts(data);
            setLoading(false);
        });
        return () => unsub();
    }, [user?.supermarketId]);

    const openAdd = () => {
        if (!user?.supermarketId) {
            alert("Please create a supermarket first from the Dashboard before adding products.");
            return;
        }
        setEditing(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (product) => {
        setEditing(product.id);
        setForm({
            name: product.name || "",
            price: product.price || "",
            category: product.category || CATEGORIES[0],
            stock: product.stock || "0",
            image: product.image || "",
            discount: product.discount || "0",
            unit: product.unit || "piece",
            description: product.description || "",
            expiryDate: product.expiryDate || "",
        });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!user?.supermarketId) return;
        setSaving(true);
        try {
            const data = {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock, 10),
                discount: parseFloat(form.discount),
                supermarketId: user.supermarketId,
            };
            if (editing) {
                await updateProduct(editing, data);
            } else {
                await addProduct(data);
            }
            setShowModal(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (productId) => {
        if (!window.confirm("Delete this product?")) return;
        setDeletingId(productId);
        try {
            await deleteProduct(productId);
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = search
        ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        : products;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                    <button
                        onClick={openAdd}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center gap-2"
                    >
                        + Add Product
                    </button>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-sm border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 mb-6"
                />

                {/* Products Table */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow animate-pulse h-14" />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {["Product", "Category", "Price", "Stock", "Discount", "Actions"].map((h) => (
                                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-400">No products found</td>
                                    </tr>
                                ) : (
                                    filtered.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={p.image || "https://placehold.co/40x40/f0fdf4/16A34A?text=P"}
                                                        alt={p.name}
                                                        className="w-9 h-9 rounded-lg object-cover"
                                                        onError={(e) => { e.target.src = "https://placehold.co/40x40/f0fdf4/16A34A?text=P"; }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-800">{p.name}</p>
                                                        <p className="text-xs text-gray-400">{p.unit}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{p.category}</td>
                                            <td className="px-4 py-3 font-semibold text-green-700">₹{p.price}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.stock <= 5 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.discount > 0 ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">{p.discount}%</span>
                                                ) : (
                                                    <span className="text-gray-300 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        className="text-xs px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        disabled={deletingId === p.id}
                                                        className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition font-medium disabled:opacity-50"
                                                    >
                                                        {deletingId === p.id ? "..." : "Delete"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between rounded-t-2xl">
                            <h2 className="text-lg font-bold text-gray-800">{editing ? "Edit Product" : "Add Product"}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
                        </div>
                        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
                            {[
                                { label: "Product Name", key: "name", type: "text", required: true },
                                { label: "Image URL", key: "image", type: "url" },
                                { label: "Price (₹)", key: "price", type: "number", min: 0, required: true },
                                { label: "Stock", key: "stock", type: "number", min: 0, required: true },
                                { label: "Discount (%)", key: "discount", type: "number", min: 0, max: 100 },
                                { label: "Unit (kg/litre/piece)", key: "unit", type: "text" },
                                { label: "Expiry Date", key: "expiryDate", type: "date" },
                            ].map(({ label, key, ...rest }) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                    <input
                                        {...rest}
                                        value={form[key]}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                                    />
                                </div>
                            ))}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                                >
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2">
                                    {saving ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                                    ) : (editing ? "Save Changes" : "Add Product")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
