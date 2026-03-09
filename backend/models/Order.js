const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: String,
    price: Number,
    quantity: { type: Number, min: 1 },
    image: String,
});

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        supermarketId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supermarket",
            required: true,
        },
        deliveryPartnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        items: [orderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        deliveryType: {
            type: String,
            enum: ["delivery", "pickup"],
            default: "delivery",
        },
        status: {
            type: String,
            enum: ["Pending", "Packed", "Out for Delivery", "Delivered", "Rejected"],
            default: "Pending",
        },
        deliveryAddress: {
            type: String,
            default: "",
        },
        paymentMethod: {
            type: String,
            enum: ["UPI", "Wallet", "BNPL", "COD", "PayAtCounter"],
            default: "COD",
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);