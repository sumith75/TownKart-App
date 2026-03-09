import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../firebase/auth";

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", phone: "", address: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");
        if (form.password !== form.confirm) return setError("Passwords do not match.");
        if (form.password.length < 6) return setError("Password must be at least 6 characters.");
        setLoading(true);
        try {
            await registerUser({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
                address: form.address,
            });
            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err.code === "auth/email-already-in-use"
                    ? "Email is already registered."
                    : err.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                            <span className="text-white text-xl">🛒</span>
                        </div>
                        <span className="text-2xl font-bold text-green-700">TownKart</span>
                    </div>
                    <p className="text-gray-500 text-sm">Create your account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">Get started 🚀</h2>
                    <p className="text-gray-400 text-sm mb-6">Join TownKart today</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {[
                            { label: "Full Name", name: "name", type: "text", placeholder: "Ravi Kumar" },
                            { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
                            { label: "Phone", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                            { label: "Address", name: "address", type: "text", placeholder: "Your delivery address" },
                        ].map(({ label, name, type, placeholder }) => (
                            <div key={name}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                <input
                                    type={type}
                                    name={name}
                                    value={form[name]}
                                    onChange={handleChange}
                                    placeholder={placeholder}
                                    required={["name", "email"].includes(name)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                                />
                            </div>
                        ))}

                        {/* Password with eye toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Min 6 characters"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 015.657 1.757M15 12a3 3 0 11-4.243-4.243M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password with eye toggle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="confirm"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    placeholder="Repeat password"
                                    required
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 015.657 1.757M15 12a3 3 0 11-4.243-4.243M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold rounded-xl py-3 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{" "}
                        <Link to="/login" className="text-green-600 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}