import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSupermarketById } from "../firebase/services/supermarketsService";
import { subscribeToProducts } from "../firebase/services/productsService";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";

const CATEGORIES = [
    "All", "Fruits & Vegetables", "Dairy & Eggs", "Snacks", "Beverages",
    "Grains & Pulses", "Meat & Fish", "Personal Care", "Household", "Bakery", "Frozen Foods"
];

export default function Store() {
    const { id } = useParams();
    const { addToCart, updateQuantity, cart } = useCart();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState("All");
    const [search, setSearch] = useState("");
    const [saveWaste, setSaveWaste] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSupermarketById(id).then(setStore);
    }, [id]);

    useEffect(() => {
        const unsub = subscribeToProducts(id, (prods) => {
            setProducts(prods);
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    const filtered = products.filter((p) => {
        const matchCategory = category === "All" || p.category === category;
        const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
        const matchWaste = !saveWaste || p.discount > 0;
        return matchCategory && matchSearch && matchWaste;
    });

    const cartQty = (productId) =>
        cart.find((i) => i.productId === productId)?.quantity || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Store header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-5 flex items-center gap-4">
                    {store ? (
                        <>
                            <img
                                src={store.image || "https://placehold.co/80x80/16A34A/white?text=Store"}
                                alt={store.name}
                                className="w-16 h-16 rounded-xl object-cover"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{store.name}</h1>
                                <p className="text-sm text-gray-400">📍 {store.town} · {store.location}</p>
                                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                                    <span>⭐ {store.rating || "4.2"}</span>
                                    <span>🕐 {store.deliveryTime || "20–30 mins"}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-16 w-48 bg-gray-200 rounded-xl animate-pulse" />
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex-1 min-w-[180px]"
                    />
                    <button
                        onClick={() => setSaveWaste(!saveWaste)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${saveWaste ? "bg-yellow-400 text-yellow-900 border-yellow-400" : "bg-white text-gray-600 border-gray-200 hover:border-yellow-300"
                            }`}
                    >
                        🌿 Save the Waste
                    </button>
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap font-medium transition ${category === cat
                                ? "bg-green-600 text-white"
                                : "bg-white text-gray-600 border border-gray-200 hover:border-green-400"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow animate-pulse">
                                <div className="h-28 bg-gray-200 rounded-xl mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🥬</div>
                        <p>No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map((product) => {
                            const qty = cartQty(product.id);
                            const discounted = product.price * (1 - (product.discount || 0) / 100);
                            return (
                                <div key={product.id} className="bg-white rounded-2xl shadow hover:shadow-md transition-all overflow-hidden group">
                                    <div className="relative h-32 bg-green-50 overflow-hidden">
                                        <img
                                            src={product.image || "https://placehold.co/300x200/f0fdf4/16A34A?text=Product"}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = "https://placehold.co/300x200/f0fdf4/16A34A?text=Product"; }}
                                        />
                                        {product.discount > 0 && (
                                            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                                                -{product.discount}%
                                            </span>
                                        )}
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{product.unit || "piece"}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-green-600 font-bold text-sm">₹{discounted.toFixed(0)}</span>
                                            {product.discount > 0 && (
                                                <span className="text-gray-400 line-through text-xs">₹{product.price}</span>
                                            )}
                                        </div>
                                        {product.stock > 0 ? (
                                            qty === 0 ? (
                                                <button
                                                    onClick={() => addToCart(product, id)}
                                                    className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 rounded-lg transition"
                                                >
                                                    Add to Cart
                                                </button>
                                            ) : (
                                                <div className="mt-2 flex items-center justify-between bg-green-50 rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(product.id, qty - 1)} className="text-green-700 font-bold text-sm w-8 h-6 flex items-center justify-center hover:bg-green-100 rounded transition">−</button>
                                                    <span className="text-green-700 font-semibold text-sm">{qty}</span>
                                                    <button onClick={() => updateQuantity(product.id, qty + 1)} className="text-green-700 font-bold text-sm w-8 h-6 flex items-center justify-center hover:bg-green-100 rounded transition">+</button>
                                                </div>
                                            )
                                        ) : (
                                            <button disabled className="mt-2 w-full bg-gray-100 text-gray-400 text-xs py-1.5 rounded-lg cursor-not-allowed">
                                                Out of Stock
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
