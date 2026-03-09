import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getSupermarkets } from "../firebase/services/supermarketsService";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function Home() {
  const [supermarkets, setSupermarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [town, setTown] = useState("");
  const { cartCount } = useCart();

  const fetchStores = async () => {
    setLoading(true);
    try {
      const stores = await getSupermarkets(town.trim());
      setSupermarkets(stores);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStores(); }, [town]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold mb-2">🛒 TownKart</h1>
          <p className="text-green-100 text-lg mb-6">Groceries delivered from local stores near you</p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="text"
              placeholder="Search by town..."
              value={town}
              onChange={(e) => setTown(e.target.value)}
              className="flex-1 bg-white text-gray-800 placeholder-gray-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              onClick={() => setTown("")}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {town ? `Stores in "${town}"` : "All Supermarkets"}
          </h2>
          <span className="text-sm text-gray-400">{supermarkets.length} stores</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : supermarkets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-3">🏪</div>
            <p className="text-lg font-medium">No stores found</p>
            <p className="text-sm">Try a different town name</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {supermarkets.map((store) => (
              <Link
                key={store.id}
                to={`/store/${store.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-200"
              >
                <div className="relative h-40 bg-green-50 overflow-hidden">
                  <img
                    src={store.image || `https://placehold.co/400x250/16A34A/white?text=${encodeURIComponent(store.name)}`}
                    alt={store.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = "https://placehold.co/400x250/16A34A/white?text=Store"; }}
                  />
                  <span className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-medium ${store.isOpen !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {store.isOpen !== false ? "● Open" : "● Closed"}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition">{store.name}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">📍 {store.town} · {store.location}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>⭐ {store.rating || "4.2"}</span>
                    <span>🕐 {store.deliveryTime || "20–30 mins"}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}