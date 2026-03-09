import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, getDocs, updateDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDleJec8YsYHLNdfXKGnuVb0UytnWVadLw",
    authDomain: "townkart-99208.firebaseapp.com",
    projectId: "townkart-99208",
    storageBucket: "townkart-99208.firebasestorage.app",
    messagingSenderId: "1027137017264",
    appId: "1:1027137017264:web:2f7ce3fef5fe2755bc7275"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DUMMY_PRODUCTS = [
    {
        name: "Fresh Tomatoes",
        price: 45,
        category: "Fruits & Vegetables",
        stock: 120,
        image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80",
        discount: 5,
        unit: "1 kg",
        description: "Freshly picked organic tomatoes."
    },
    {
        name: "Whole Wheat Bread",
        price: 40,
        category: "Bakery",
        stock: 30,
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80",
        discount: 0,
        unit: "1 loaf",
        description: "Soft and healthy whole wheat bread."
    },
    {
        name: "Amul Milk (Toned)",
        price: 32,
        category: "Dairy & Eggs",
        stock: 50,
        image: "https://minisite.amul.com/m/img/product/amultaza.png",
        discount: 0,
        unit: "500 ml",
        description: "Pasteurized toned milk."
    },
    {
        name: "Tata Salt",
        price: 28,
        category: "Household",
        stock: 200,
        image: "https://images.unsplash.com/photo-1621360091807-69c73df899f8?w=500&q=80",
        discount: 0,
        unit: "1 kg",
        description: "Vacuum evaporated iodised salt."
    },
    {
        name: "Lays Classic Salted",
        price: 20,
        category: "Snacks",
        stock: 85,
        image: "https://images.unsplash.com/photo-1566478989037-eade1764658e?w=500&q=80",
        discount: 0,
        unit: "50 g",
        description: "Classic potato chips."
    }
];

async function seed() {
    console.log("Starting seed process...");

    // 1. Find the admin user
    const usersSnap = await getDocs(collection(db, "users"));
    const adminUser = usersSnap.docs.find(d => d.data().role === "admin");

    if (!adminUser) {
        console.error("No admin user found! Please register a user and set their role to 'admin' first.");
        process.exit(1);
    }

    const adminUid = adminUser.id;
    console.log(`Found admin user: ${adminUser.data().email}`);

    // 2. Create a Supermarket
    const storeRef = await addDoc(collection(db, "supermarkets"), {
        name: "TownKart City Center",
        address: "123 Main Street, City Center",
        phone: "9876543210",
        rating: 4.8,
        isOpen: true,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80"
    });
    const storeId = storeRef.id;
    console.log(`Created supermarket: ${storeId}`);

    // 3. Link supermarket to admin
    await updateDoc(doc(db, "users", adminUid), {
        supermarketId: storeId
    });
    console.log(`Linked supermarket to admin user.`);

    // 4. Add stock (products)
    let count = 0;
    for (const prod of DUMMY_PRODUCTS) {
        prod.supermarketId = storeId;
        prod.createdAt = new Date();
        await addDoc(collection(db, "products"), prod);
        count++;
    }
    console.log(`Successfully added ${count} products to the supermarket!`);
    console.log("DONE. You can now refresh your dashboard.");
    process.exit(0);
}

seed().catch(console.error);
