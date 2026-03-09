const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// The store ID that the admin is linked to (from the browser inspection)
const STORE_TO_KEEP = "uqtSZUh3ncV9fUSb9uwy";

async function cleanupStores() {
    console.log("Fetching supermarkets...");
    const storesSnap = await db.collection("supermarkets").get();
    const stores = storesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log(`Found ${stores.length} total stores.`);

    for (const store of stores) {
        if (store.id === STORE_TO_KEEP) {
            console.log(`Keeping matched store ${store.id} (${store.name})`);
            continue;
        }

        if (store.name === "TownKart City Center" || store.name === "Dummy Store") {
            console.log(`Deleting duplicate/orphaned store ${store.id} (${store.name})...`);

            // Delete products for this store first
            const productsSnap = await db.collection("products").where("supermarketId", "==", store.id).get();
            console.log(`  Deleting ${productsSnap.docs.length} products for this store...`);

            for (const pSnap of productsSnap.docs) {
                await db.collection("products").doc(pSnap.id).delete();
            }

            // Delete the store
            await db.collection("supermarkets").doc(store.id).delete();
            console.log(`  Deleted store ${store.id}`);
        }
    }

    console.log("Cleanup complete!");
    process.exit(0);
}

cleanupStores().catch(console.error);
