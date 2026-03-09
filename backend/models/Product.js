const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: 0,
        },
        image: {
            type: String,
            default: "https://placehold.co/300x200/f0fdf4/16A34A?text=Product",
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: [
                "Fruits & Vegetables",
                "Dairy & Eggs",
                "Snacks",
                "Beverages",
                "Grains & Pulses",
                "Meat & Fish",
                "Personal Care",
                "Household",
                "Bakery",
                "Frozen Foods",
            ],
        },
        stock: {
            type: Number,
            default: 0,
            min: 0,
        },
        supermarketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supermarket",
            required: [true, "Supermarket is required"],
        },
        expiryDate: {
            type: Date,
            default: null,
        },
        // Discount percentage (0–100). >0 marks it as a "Save the Waste" item.
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        unit: {
            type: String,
            default: "piece", // e.g. kg, litre, piece
        },
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Full-text search index
productSchema.index({ name: "text", category: "text" });

module.exports = mongoose.model("Product", productSchema);