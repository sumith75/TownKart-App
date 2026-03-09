import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ allowedRoles = [] }) {
    const { user, loading, firebaseUser, profileError } = useAuth();
    const [profileTimeout, setProfileTimeout] = useState(false);

    // If logged in but profile not resolved yet, wait max 7s then give up
    useEffect(() => {
        if (!loading && firebaseUser && !user) {
            const t = setTimeout(() => setProfileTimeout(true), 7000);
            return () => clearTimeout(t);
        }
        setProfileTimeout(false);
    }, [loading, firebaseUser, user]);

    // Firebase Auth check in progress (~100–300ms)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Loading TownKart...</p>
                </div>
            </div>
        );
    }

    // Firestore failed and no cache — user was signed out, redirect to login
    if (profileError || profileTimeout) {
        return <Navigate to="/login" replace />;
    }

    // Logged in but profile still loading — show brief spinner (resolves from cache quickly)
    if (firebaseUser && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!user) return <Navigate to="/login" replace />;

    // Role-based access control
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        const dest = user.role === "admin" ? "/admin" : user.role === "delivery" ? "/delivery" : "/";
        return <Navigate to={dest} replace />;
    }

    return <Outlet />;
}
