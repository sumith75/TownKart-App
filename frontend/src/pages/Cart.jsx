import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeOrder } from "../firebase/services/ordersService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const PAYMENT_METHODS = ["COD", "UPI", "Wallet", "BNPL"];

export default function Cart() {
  const { cart, supermarketId, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const effectivePMethods = deliveryType === "pickup" ? ["PayAtCounter"] : PAYMENT_METHODS;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (deliveryType === "delivery" && !deliveryAddress.trim())
      return setError("Please enter a delivery address.");

    setError("");
    setLoading(true);
    try {
      const pm = deliveryType === "pickup" ? "PayAtCounter" : paymentMethod;
      await placeOrder({
        customerId: user.uid,
        supermarketId,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryType,
        deliveryAddress,
        paymentMethod: pm,
      });
      clearCart();
      navigate("/orders");
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-gray-400">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-sm mb-6">Browse stores and add some items!</p>
          <button onClick={() => navigate("/")} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition">
            Browse Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart 🛍️</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="bg-white rounded-2xl p-4 shadow flex items-center gap-4">
                <img
                  src={item.image || "https://placehold.co/60x60/f0fdf4/16A34A?text=P"}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => { e.target.src = "https://placehold.co/60x60/f0fdf4/16A34A?text=P"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-green-600 text-sm font-bold">₹{item.price.toFixed(0)} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-100 text-gray-700 flex items-center justify-center font-bold transition"
                  >−</button>
                  <span className="w-6 text-center font-semibold text-gray-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-green-100 text-gray-700 flex items-center justify-center font-bold transition"
                  >+</button>
                </div>
                <p className="text-gray-800 font-bold text-sm w-16 text-right">₹{(item.price * item.quantity).toFixed(0)}</p>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-400 hover:text-red-600 transition ml-1"
                >✕</button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow p-5 h-fit space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Order Summary</h2>

            {/* Delivery type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Delivery Type</label>
              <div className="grid grid-cols-2 gap-2">
                {["delivery", "pickup"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDeliveryType(type)}
                    className={`py-2 rounded-xl text-sm font-medium border transition capitalize ${deliveryType === type
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-green-400"
                      }`}
                  >
                    {type === "delivery" ? "🛵 Delivery" : "🏪 Pickup"}
                  </button>
                ))}
              </div>
            </div>

            {/* Address */}
            {deliveryType === "delivery" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Delivery Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  rows={2}
                  placeholder="Enter your full address..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
                />
              </div>
            )}

            {/* Payment */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Payment Method</label>
              <select
                value={deliveryType === "pickup" ? "PayAtCounter" : paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={deliveryType === "pickup"}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
              >
                {effectivePMethods.map((pm) => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>

            {/* Total */}
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-3">
                <span>Delivery fee</span>
                <span className="text-green-600">{deliveryType === "pickup" ? "Free" : "Free"}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-lg">
                <span>Total</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs border border-red-200 bg-red-50 rounded-lg p-2">{error}</p>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-xl py-3 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Placing Order...
                </>
              ) : (
                `Place Order · ₹${cartTotal.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}