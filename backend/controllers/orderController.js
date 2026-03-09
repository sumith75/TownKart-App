const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @route   POST /api/orders
// @access  Private/Customer
const placeOrder = async (req, res) => {
    try {
        const { supermarketId, items, deliveryType, deliveryAddress, paymentMethod } = req.body;

        if (!items || items.length === 0)
            return res.status(400).json({ message: "No items in order" });

        // Enforce payment method rules based on delivery type
        if (deliveryType === "pickup" && paymentMethod !== "PayAtCounter")
            return res.status(400).json({ message: "Pickup orders must use 'Pay at Counter' as the payment method." });
        if (deliveryType !== "pickup" && paymentMethod === "PayAtCounter")
            return res.status(400).json({ message: "'Pay at Counter' is only available for pickup orders." });

        // Calculate total & reduce stock
        let totalAmount = 0;
        const enrichedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product)
                return res.status(404).json({ message: `Product ${item.productId} not found` });
            if (product.stock < item.quantity)
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });

            // Apply discount if any
            const effectivePrice = product.price * (1 - product.discount / 100);
            totalAmount += effectivePrice * item.quantity;

            enrichedItems.push({
                productId: product._id,
                name: product.name,
                price: effectivePrice,
                quantity: item.quantity,
                image: product.image,
            });

            // Deduct stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            customerId: req.user._id,
            supermarketId,
            items: enrichedItems,
            totalAmount: Math.round(totalAmount * 100) / 100,
            deliveryType: deliveryType || "delivery",
            deliveryAddress: deliveryAddress || "",
            paymentMethod: paymentMethod || "COD",
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/orders/my
// @access  Private/Customer
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ customerId: req.user._id })
            .populate("supermarketId", "name town")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/orders/store
// @access  Private/Admin
const getStoreOrders = async (req, res) => {
    try {
        const orders = await Order.find({ supermarketId: req.user.supermarketId })
            .populate("customerId", "name email phone")
            .populate("deliveryPartnerId", "name phone")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Pending", "Packed", "Out for Delivery", "Delivered", "Rejected"];
        if (!validStatuses.includes(status))
            return res.status(400).json({ message: "Invalid status" });

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/orders/:id/assign
// @access  Private/Admin
const assignDelivery = async (req, res) => {
    try {
        const { deliveryPartnerId } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { deliveryPartnerId, status: "Packed" },
            { new: true }
        ).populate("deliveryPartnerId", "name phone");
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/orders/delivery-partners
// @access  Private/Admin
const getDeliveryPartners = async (req, res) => {
    try {
        const partners = await User.find({ role: "delivery" }).select("name phone");
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { placeOrder, getMyOrders, getStoreOrders, updateOrderStatus, assignDelivery, getDeliveryPartners };
