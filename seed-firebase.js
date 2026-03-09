/**
 * TownKart Firebase Seed Script
 * 
 * Run this ONCE to create admin and delivery users in Firebase.
 * 
 * Usage:
 *   1. Put your Firebase Admin SDK service account key at ./serviceAccountKey.json
 *   2. npm install firebase-admin  (in the Townkart root)
 *   3. node seed-firebase.js
 * 
 * Download service account key:
 *   Firebase Console → Project Settings → Service Accounts → Generate new private key
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();

const SUPERMARKET_ID = "store001"; // Change to your actual supermarket doc ID

const users = [
    {
        email: "admin@townkart.com",
        password: "admin123",
        displayName: "Store Admin",
        profile: {
            name: "Store Admin",
            email: "admin@townkart.com",
            role: "admin",
            phone: "+91 9000000001",
            address: "Main Street, Townville",
            supermarketId: SUPERMARKET_ID,
        },
    },
    {
        email: "delivery1@townkart.com",
        password: "delivery123",
        displayName: "Ravi Kumar",
        profile: {
            name: "Ravi Kumar",
            email: "delivery1@townkart.com",
            role: "delivery",
            phone: "+91 9000000002",
            address: "North Colony, Townville",
            supermarketId: null,
        },
    },
    {
        email: "delivery2@townkart.com",
        password: "delivery123",
        displayName: "Suresh Reddy",
        profile: {
            name: "Suresh Reddy",
            email: "delivery2@townkart.com",
            role: "delivery",
            phone: "+91 9000000003",
            address: "South Colony, Townville",
            supermarketId: null,
        },
    },
];

const sampleSupermarket = {
    id: SUPERMARKET_ID,
    name: "FreshMart",
    location: "Gandhi Nagar, Main Road",
    town: "Nellore",
    image: "https://placehold.co/400x250/16A34A/white?text=FreshMart",
    isOpen: true,
    rating: 4.5,
    deliveryTime: "20–30 mins",
};

const sampleProducts = [
    { name: "Fresh Tomatoes", price: 30, category: "Fruits & Vegetables", stock: 50, discount: 0, unit: "kg", description: "Farm fresh tomatoes" },
    { name: "Full Cream Milk", price: 60, category: "Dairy & Eggs", stock: 30, discount: 0, unit: "litre" },
    { name: "Lays Chips", price: 20, category: "Snacks", stock: 100, discount: 0, unit: "packet" },
    { name: "Basmati Rice", price: 80, category: "Grains & Pulses", stock: 40, discount: 10, unit: "kg", description: "Near expiry - Save the Waste!" },
    { name: "Coca Cola 750ml", price: 45, category: "Beverages", stock: 60, discount: 0, unit: "bottle" },
];

async function seed() {
    console.log("🌱 Seeding TownKart Firebase...\n");

    // Create supermarket
    console.log("📦 Creating supermarket...");
    const { id: smId, ...smData } = sampleSupermarket;
    await db.collection("supermarkets").doc(smId).set({
        ...smData,
        ownerId: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ Supermarket created: ${sampleSupermarket.name}`);

    // Create products
    console.log("\n🥬 Creating products...");
    for (const product of sampleProducts) {
        await db.collection("products").add({
            ...product,
            supermarketId: SUPERMARKET_ID,
            image: `https://placehold.co/300x200/f0fdf4/16A34A?text=${encodeURIComponent(product.name)}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`  ✅ ${product.name}`);
    }

    // Create users (Auth + Firestore)
    console.log("\n👤 Creating users...");
    for (const u of users) {
        try {
            const created = await auth.createUser({
                email: u.email,
                password: u.password,
                displayName: u.displayName,
            });
            await db.collection("users").doc(created.uid).set({
                uid: created.uid,
                ...u.profile,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ ${u.profile.role}: ${u.email}`);
        } catch (err) {
            if (err.code === "auth/email-already-exists") {
                console.log(`  ⚠️  ${u.email} already exists, skipping.`);
            } else {
                console.error(`  ❌ Failed for ${u.email}:`, err.message);
            }
        }
    }

    console.log("\n🎉 Seeding complete! You can now login:\n");
    console.log("  Admin:    admin@townkart.com / admin123");
    console.log("  Delivery: delivery1@townkart.com / delivery123");
    console.log("  Customer: Register via the app at /register");

    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
