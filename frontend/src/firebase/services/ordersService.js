import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    writeBatch,
    getDoc,
} from "firebase/firestore";
import { db } from "../config";

// Place a new order + decrement product stock atomically
export const placeOrder = async ({
    customerId,
    supermarketId,
    items,
    deliveryType,
    deliveryAddress,
    paymentMethod,
}) => {
    // Validate payment method vs delivery type
    if (deliveryType === "pickup" && paymentMethod !== "PayAtCounter")
        throw new Error("Pickup orders must use 'Pay at Counter'.");
    if (deliveryType !== "pickup" && paymentMethod === "PayAtCounter")
        throw new Error("'Pay at Counter' is only available for pickup orders.");

    const batch = writeBatch(db);

    // Calculate total and enrich items
    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
        const productSnap = await getDoc(doc(db, "products", item.productId));
        if (!productSnap.exists()) throw new Error(`Product not found: ${item.productId}`);

        const product = productSnap.data();
        if (product.stock < item.quantity)
            throw new Error(`Insufficient stock for ${product.name}`);

        const effectivePrice = product.price * (1 - (product.discount || 0) / 100);
        totalAmount += effectivePrice * item.quantity;

        enrichedItems.push({
            productId: item.productId,
            name: product.name,
            price: parseFloat(effectivePrice.toFixed(2)),
            quantity: item.quantity,
            image: product.image || "",
        });

        // Decrement stock
        batch.update(doc(db, "products", item.productId), {
            stock: product.stock - item.quantity,
        });
    }

    // Create order document
    const orderRef = doc(collection(db, "orders"));
    batch.set(orderRef, {
        customerId,
        supermarketId,
        deliveryPartnerId: null,
        items: enrichedItems,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        deliveryType: deliveryType || "delivery",
        deliveryAddress: deliveryAddress || "",
        paymentMethod: paymentMethod || "COD",
        status: "Pending",
        isPaid: false,
        createdAt: serverTimestamp(),
    });

    await batch.commit();
    return orderRef.id;
};

// Real-time listener: customer's own orders
export const subscribeToMyOrders = (customerId, callback) => {
    const q = query(
        collection(db, "orders"),
        where("customerId", "==", customerId)
    );
    return onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        callback(docs);
    });
};

// Real-time listener: all orders for a supermarket (admin view)
export const subscribeToStoreOrders = (supermarketId, callback) => {
    const q = query(
        collection(db, "orders"),
        where("supermarketId", "==", supermarketId)
    );
    return onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        callback(docs);
    });
};

// Update order status (admin)
export const updateOrderStatus = async (orderId, status) => {
    const valid = ["Pending", "Packed", "Out for Delivery", "Delivered", "Rejected"];
    if (!valid.includes(status)) throw new Error("Invalid status");
    await updateDoc(doc(db, "orders", orderId), { status });
};

// Assign delivery partner (admin)
export const assignDelivery = async (orderId, deliveryPartnerId) => {
    await updateDoc(doc(db, "orders", orderId), {
        deliveryPartnerId,
        status: "Packed",
    });
};

// Get delivery partners list
export const getDeliveryPartners = async () => {
    const q = query(collection(db, "users"), where("role", "==", "delivery"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Real-time listener: orders assigned to delivery partner
export const subscribeToAssignedOrders = (deliveryPartnerId, callback) => {
    const q = query(
        collection(db, "orders"),
        where("deliveryPartnerId", "==", deliveryPartnerId)
    );
    return onSnapshot(q, (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
        callback(docs);
    });
};

// Delivery partner updates status
export const updateDeliveryStatus = async (orderId, deliveryPartnerId, status) => {
    const allowed = ["Out for Delivery", "Delivered"];
    if (!allowed.includes(status))
        throw new Error("Delivery partners can only set Out for Delivery or Delivered");

    const orderSnap = await getDoc(doc(db, "orders", orderId));
    if (!orderSnap.exists() || orderSnap.data().deliveryPartnerId !== deliveryPartnerId)
        throw new Error("Order not found or not assigned to you");

    await updateDoc(doc(db, "orders", orderId), { status });
};

// Get earnings for delivery partner
export const getDeliveryEarnings = async (deliveryPartnerId) => {
    const q = query(
        collection(db, "orders"),
        where("deliveryPartnerId", "==", deliveryPartnerId),
        where("status", "==", "Delivered")
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const today = new Date().toDateString();
    const todayDeliveries = orders.filter((o) => {
        const date = o.createdAt?.toDate?.()?.toDateString?.();
        return date === today;
    });

    return {
        totalEarnings: orders.length * 30,
        todayEarnings: todayDeliveries.length * 30,
        totalDeliveries: orders.length,
    };
};
