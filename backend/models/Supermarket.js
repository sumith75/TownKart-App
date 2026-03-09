const mongoose = require("mongoose");

const supermarketSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Supermarket name is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
        },
        town: {
            type: String,
            required: [true, "Town is required"],
            trim: true,
        },
        image: {
            type: String,
            default: "https://placehold.co/400x250/16A34A/white?text=Store",
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isOpen: {
            type: Boolean,
            default: true,
        },
        deliveryTime: {
            type: String,
            default: "20-30 mins",
        },
        rating: {
            type: Number,
            default: 4.2,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Supermarket", supermarketSchema);
