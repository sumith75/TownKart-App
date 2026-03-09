import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile } from "../firebase/auth";

const AuthContext = createContext(null);

const PROFILE_CACHE_KEY = "tk_profile";

function getCachedProfile(uid) {
    try {
        const raw = localStorage.getItem(PROFILE_CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.uid === uid ? parsed : null;
    } catch {
        return null;
    }
}

function setCachedProfile(profile) {
    try {
        if (profile) localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
        else localStorage.removeItem(PROFILE_CACHE_KEY);
    } catch { /* ignore */ }
}

function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), ms)
    );
    return Promise.race([promise, timeout]);
}

export const AuthProvider = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState(undefined); // undefined = not yet resolved
    const [profile, setProfile] = useState(null);
    const [profileError, setProfileError] = useState(null); // null or error string

    // Ref flag: true when WE triggered signOut due to profile failure.
    // Prevents the onAuthStateChanged(null) handler from clearing our error.
    const signingOutDueToError = useRef(false);

    const loading = firebaseUser === undefined;

    useEffect(() => {
        let cancelled = false;

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (cancelled) return;

            if (!fbUser) {
                // If we initiated this signOut ourselves (profile load failed),
                // preserve the profileError and don't reset it.
                if (!signingOutDueToError.current) {
                    setProfileError(null);
                }
                signingOutDueToError.current = false;
                setFirebaseUser(null);
                setProfile(null);
                setCachedProfile(null);
                return;
            }

            // Auth resolved — unblock the app
            setFirebaseUser(fbUser);
            setProfileError(null);

            // Try cache immediately (instant, no network)
            const cached = getCachedProfile(fbUser.uid);
            if (cached && !cancelled) {
                setProfile(cached);
            }

            // Fetch fresh profile from Firestore with 7-second timeout
            try {
                const fresh = await withTimeout(getUserProfile(fbUser.uid), 7000);
                if (!cancelled && fresh) {
                    setProfile(fresh);
                    setCachedProfile(fresh);
                }
            } catch (err) {
                if (cancelled) return;
                console.warn("Firestore profile fetch failed:", err.message);

                if (!cached) {
                    // No cache AND Firestore failed — sign out and show error
                    signingOutDueToError.current = true;
                    setProfileError("Could not load your profile. Please check your internet connection and try again.");
                    setFirebaseUser(null);
                    setProfile(null);
                    await signOut(auth);
                }
                // If cache exists, we already set profile above — use it silently
            }
        });

        return () => {
            cancelled = true;
            unsubscribe();
        };
    }, []);

    const logout = async () => {
        signingOutDueToError.current = false;
        await signOut(auth);
        setFirebaseUser(null);
        setProfile(null);
        setProfileError(null);
        setCachedProfile(null);
        localStorage.removeItem("tk_cart");
    };

    const combinedUser = firebaseUser && profile
        ? {
            uid: firebaseUser.uid,
            _id: firebaseUser.uid,
            email: firebaseUser.email,
            name: profile.name,
            role: profile.role,
            phone: profile.phone,
            address: profile.address,
            supermarketId: profile.supermarketId,
        }
        : null;

    return (
        <AuthContext.Provider value={{ user: combinedUser, firebaseUser, profile, loading, profileError, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
