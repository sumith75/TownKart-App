import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

// Get all supermarkets (optionally filter by town)
export const getSupermarkets = async (town = "") => {
    let q;
    if (town) {
        q = query(collection(db, "supermarkets"), where("town", "==", town));
    } else {
        q = query(collection(db, "supermarkets"));
    }
    const snap = await getDocs(q);
    const stores = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    stores.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
    return stores;
};

// Get supermarket by ID
export const getSupermarketById = async (id) => {
    const snap = await getDoc(doc(db, "supermarkets", id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Create supermarket (admin)
export const createSupermarket = async (data, ownerId) => {
    const ref = await addDoc(collection(db, "supermarkets"), {
        ...data,
        ownerId,
        isOpen: true,
        rating: 4.2,
        createdAt: serverTimestamp(),
    });
    return ref.id;
};

// Update supermarket (admin)
export const updateSupermarket = async (id, updates) => {
    await updateDoc(doc(db, "supermarkets", id), updates);
};
