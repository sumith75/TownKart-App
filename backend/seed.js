require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Supermarket = require("./models/Supermarket");
const Product = require("./models/Product");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/townkart";

const categories = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Snacks",
    "Beverages",
    "Grains & Pulses",
];

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log("🌱 Connected to MongoDB...");

    // Clean existing data
    await User.deleteMany({});
    await Supermarket.deleteMany({});
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing data");

    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash("password123", salt);

    // Create supermarkets first (without ownerId)
    const [store1, store2] = await Supermarket.create([
        {
            name: "Gajwel Fresh Mart",
            location: "Main Road, Near Bus Stand, Gajwel",
            town: "Gajwel",
            image: "https://placehold.co/400x250/16A34A/white?text=Gajwel+Fresh+Mart",
            isOpen: true,
            deliveryTime: "15-25 mins",
            rating: 4.5,
        },
        {
            name: "Siddipet Daily Needs",
            location: "Station Road, Siddipet",
            town: "Siddipet",
            image: "https://placehold.co/400x250/15803d/white?text=Siddipet+Daily+Needs",
            isOpen: true,
            deliveryTime: "20-30 mins",
            rating: 4.2,
        },
    ]);
    console.log("🏪 Supermarkets created");

    // Create Users
    const [customer, admin, delivery] = await User.create([
        {
            name: "Ravi Kumar",
            email: "customer@townkart.com",
            password: hashedPwd,
            role: "customer",
            phone: "9876543210",
            address: "House No. 12, Gajwel",
        },
        {
            name: "Suresh Admin",
            email: "admin@townkart.com",
            password: hashedPwd,
            role: "admin",
            supermarketId: store1._id,
            phone: "9876543211",
        },
        {
            name: "Mahesh Delivery",
            email: "delivery@townkart.com",
            password: hashedPwd,
            role: "delivery",
            phone: "9876543212",
        },
    ]);

    // Link admin to store
    await Supermarket.findByIdAndUpdate(store1._id, { ownerId: admin._id });
    console.log("👤 Users created");

    // Products for Store 1 (Gajwel)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);

    await Product.create([
        // Normal products
        { name: "Basmati Rice (5kg)", price: 320, category: "Grains & Pulses", stock: 50, supermarketId: store1._id, unit: "bag", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Basmati+Rice" },
        { name: "Toor Dal (1kg)", price: 145, category: "Grains & Pulses", stock: 80, supermarketId: store1._id, unit: "kg", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Toor+Dal" },
        { name: "Fresh Tomatoes", price: 40, category: "Fruits & Vegetables", stock: 100, supermarketId: store1._id, unit: "kg", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Tomatoes" },
        { name: "Onions", price: 35, category: "Fruits & Vegetables", stock: 120, supermarketId: store1._id, unit: "kg", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Onions" },
        { name: "Amul Full Cream Milk (1L)", price: 68, category: "Dairy & Eggs", stock: 60, supermarketId: store1._id, unit: "litre", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Milk" },
        { name: "Farm Fresh Eggs (12pk)", price: 90, category: "Dairy & Eggs", stock: 40, supermarketId: store1._id, unit: "pack", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Eggs" },
        { name: "Lay's Classic Chips", price: 20, category: "Snacks", stock: 200, supermarketId: store1._id, unit: "piece", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Chips" },
        { name: "Coca-Cola (500ml)", price: 40, category: "Beverages", stock: 150, supermarketId: store1._id, unit: "bottle", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Coke" },
        // Save the Waste — near expiry
        { name: "Paneer (200g)", price: 80, category: "Dairy & Eggs", stock: 15, supermarketId: store1._id, unit: "piece", discount: 40, expiryDate: tomorrow, image: "https://placehold.co/300x200/fef9c3/ca8a04?text=Paneer+40%25+OFF", description: "Near expiry — grab it before it's gone!" },
        { name: "Greek Yogurt (400g)", price: 120, category: "Dairy & Eggs", stock: 8, supermarketId: store1._id, unit: "piece", discount: 50, expiryDate: tomorrow, image: "https://placehold.co/300x200/fef9c3/ca8a04?text=Yogurt+50%25+OFF", description: "Near expiry — 50% off today only!" },

        // Products for Store 2 (Siddipet)
        { name: "Sunflower Oil (1L)", price: 160, category: "Grains & Pulses", stock: 70, supermarketId: store2._id, unit: "litre", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Oil" },
        { name: "Banana (dozen)", price: 50, category: "Fruits & Vegetables", stock: 90, supermarketId: store2._id, unit: "dozen", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Banana" },
        { name: "Britannia Bread", price: 45, category: "Bakery", stock: 55, supermarketId: store2._id, unit: "piece", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Bread" },
        { name: "Parle-G Biscuits", price: 10, category: "Snacks", stock: 300, supermarketId: store2._id, unit: "piece", image: "https://placehold.co/300x200/f0fdf4/16A34A?text=Parle-G" },
        { name: "Sprite (1L)", price: 60, category: "Beverages", stock: 100, supermarketId: store2._id, unit: "bottle", discount: 30, expiryDate: tomorrow, image: "https://placehold.co/300x200/fef9c3/ca8a04?text=Sprite+30%25+OFF", description: "Near expiry — save food, save money!" },
    ]);
    console.log("📦 Products created (15 items)");

    console.log("\n✅ Seed complete! Demo credentials:");
    console.log("   Customer:  customer@townkart.com / password123");
    console.log("   Admin:     admin@townkart.com    / password123");
    console.log("   Delivery:  delivery@townkart.com / password123");

    await mongoose.disconnect();
    process.exit(0);
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
