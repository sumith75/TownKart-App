import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDleJec8YsYHLNdfXKGnuVb0UytnWVadLw",
    authDomain: "townkart-99208.firebaseapp.com",
    projectId: "townkart-99208",
    storageBucket: "townkart-99208.firebasestorage.app",
    messagingSenderId: "1027137017264",
    appId: "1:1027137017264:web:2f7ce3fef5fe2755bc7275",
    measurementId: "G-B8Z36X13N6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// The store ID that the admin is linked to (from the browser inspection)
const STORE_TO_KEEP = "uqtSZUh3ncV9fUSb9uwy";

async function cleanupStores() {
    console.log("Authenticating as admin...");
    try {
        await signInWithEmailAndPassword(auth, "chitturimanikanta048@gmail.com", "Mani@561");
        console.log("Authenticated successfully.");
    } catch (err) {
        console.log("Wait, let's try the default admin...");
        try {
            await signInWithEmailAndPassword(auth, "admin@townkart.com", "admin123");
            console.log("Authenticated with default admin.");
        } catch (err2) {
            console.error("Authentication failed. Cannot bypass rules.", err2.message);
        }
    }

    console.log("Fetching supermarkets...");
    const storesSnap = await getDocs(collection(db, "supermarkets"));
    const stores = storesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    console.log(`Found ${stores.length} total stores.`);

    for (const store of stores) {
        if (store.id === STORE_TO_KEEP) {
            console.log(`Keeping matched store ${store.id} (${store.name})`);
            continue;
        }

        if (store.name === "TownKart City Center" || store.name === "Dummy Store" || store.name === "FreshMart") {
            console.log(`Deleting duplicate/orphaned store ${store.id} (${store.name})...`);

            try {
                // Delete products for this store first
                console.log(`  Deleting products for this store...`);
                // Wait for the query to return
                const productsSnap = await getDocs(query(collection(db, "products"), where("supermarketId", "==", store.id)));
                console.log(`  Deleting ${productsSnap.docs.length} products...`);

                for (const pSnap of productsSnap.docs) {
                    await deleteDoc(doc(db, "products", pSnap.id));
                }

                // Delete the store
                await deleteDoc(doc(db, "supermarkets", store.id));
                console.log(`  Deleted store ${store.id}`);
            } catch (err) {
                console.error(`  Error deleting store ${store.id}: ${err.message}`);
            }
        }
    }

    console.log("Cleanup complete!");
    process.exit(0);
}

cleanupStores().catch(console.error);
