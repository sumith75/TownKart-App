import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../config";

// Get products with optional filtering (one-time fetch)
export const getProducts = async ({ supermarketId, category, saveTheWaste } = {}) => {
    let q = collection(db, "products");
    const constraints = [];

    if (supermarketId) constraints.unshift(where("supermarketId", "==", supermarketId));
    if (category) constraints.unshift(where("category", "==", category));

    q = query(collection(db, "products"), ...constraints);
    const snap = await getDocs(q);
    let products = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Sort client-side
    products.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));

    // Filter near-expiry / discounted (Save the Waste)
    if (saveTheWaste) products = products.filter((p) => p.discount > 0);

    return products;
};

// Real-time products for a supermarket
export const subscribeToProducts = (supermarketId, callback) => {
    const q = query(
        collection(db, "products"),
        where("supermarketId", "==", supermarketId)
    );
    return onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        callback(docs);
    });
};

// Get single product
export const getProductById = async (productId) => {
    const snap = await getDoc(doc(db, "products", productId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Add product (admin)
export const addProduct = async (productData) => {
    const ref = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp(),
    });
    return ref.id;
};

// Update product (admin)
export const updateProduct = async (productId, updates) => {
    await updateDoc(doc(db, "products", productId), updates);
};

// Delete product (admin)
export const deleteProduct = async (productId) => {
    await deleteDoc(doc(db, "products", productId));
};
