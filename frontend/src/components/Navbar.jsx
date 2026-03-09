import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const navLinks = () => {
        if (!user) return [];
        if (user.role === "admin") return [
            { to: "/admin", label: "Dashboard" },
            { to: "/admin/orders", label: "Orders" },
            { to: "/admin/products", label: "Products" },
        ];
        if (user.role === "delivery") return [
            { to: "/delivery", label: "My Deliveries" },
        ];
        return [
            { to: "/", label: "Home" },
            { to: "/orders", label: "My Orders" },
        ];
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to={user?.role === "admin" ? "/admin" : user?.role === "delivery" ? "/delivery" : "/"} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🛒</span>
                    </div>
                    <span className="text-lg font-extrabold text-green-700">TownKart</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks().map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-700 hover:bg-green-50 transition"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-3">
                    {/* Cart (customers only) */}
                    {user?.role === "customer" && (
                        <Link to="/cart" className="relative p-2 rounded-lg hover:bg-green-50 transition">
                            <span className="text-xl">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount > 9 ? "9+" : cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition border border-gray-100"
                            >
                                <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[100px] truncate">{user.name}</span>
                                <span className="text-gray-400 text-xs">▾</span>
                            </button>

                            {menuOpen && (
                                <div className="absolute right-0 top-11 bg-white rounded-xl shadow-xl border border-gray-100 p-1 min-w-[160px] z-50">
                                    <div className="px-3 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs text-gray-400">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">{user.role}</span>
                                    </div>
                                    {/* Mobile nav links */}
                                    <div className="md:hidden">
                                        {navLinks().map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setMenuOpen(false)}
                                                className="block px-3 py-2 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                        <div className="border-t border-gray-50 mt-1 pt-1" />
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition">
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
