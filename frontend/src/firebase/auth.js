import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// Register new user (customers only via self-registration)
export const registerUser = async ({ name, email, password, phone = "", address = "" }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    // Write user profile to Firestore
    await setDoc(doc(db, "users", uid), {
        uid,
        name,
        email,
        role: "customer",
        phone,
        address,
        supermarketId: null,
        createdAt: serverTimestamp(),
    });

    return credential.user;
};

// Login existing user — only authenticates, profile is loaded by AuthContext
export const loginUser = async (email, password) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { firebaseUser: credential.user };
};

// Logout
export const logoutUser = () => signOut(auth);

// Get Firestore profile for a UID (with REST API fallback for blocked networks)
export const getUserProfile = async (uid) => {
    try {
        // 1. Try standard Firestore SDK
        const snap = await getDoc(doc(db, "users", uid));
        return snap.exists() ? snap.data() : null;
    } catch (err) {
        console.warn("Firestore SDK failed, trying REST API fallback...", err.message);

        // 2. Fallback to standard HTTPS REST request if SDK is blocked
        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                const projectId = auth.app.options.projectId; // Dynamically gets 'townkart-99208'
                const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;

                const response = await fetch(url, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.fields) {
                        // Transform Firestore REST format to simple JS object
                        const profile = {
                            uid: data.fields.uid?.stringValue || "",
                            name: data.fields.name?.stringValue || "",
                            email: data.fields.email?.stringValue || "",
                            role: data.fields.role?.stringValue || "customer",
                            phone: data.fields.phone?.stringValue || "",
                            address: data.fields.address?.stringValue || "",
                            supermarketId: data.fields.supermarketId?.stringValue || null,
                        };
                        console.log("REST API fallback successful!");
                        return profile;
                    } else {
                        console.error("REST API fallback succeeded but data format was unexpected:", data);
                    }
                } else if (response.status === 404) {
                    console.log("REST API fallback: Profile not found (404)");
                    return null; // Profile doesn't exist yet
                } else {
                    const errorText = await response.text();
                    console.error(`REST API fallback failed with status ${response.status}:`, errorText);
                }
            } catch (restErr) {
                console.error("REST API fallback failed with exception:", restErr.message, restErr);
            }
        }

        throw err; // Re-throw original error if fallback also fails
    }
};

// Subscribe to auth state changes
export const subscribeToAuthState = (callback) => onAuthStateChanged(auth, callback);
