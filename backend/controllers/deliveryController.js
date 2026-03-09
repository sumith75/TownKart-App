const Order = require("../models/Order");

// @route   GET /api/delivery/assigned
// @access  Private/Delivery
const getAssignedOrders = async (req, res) => {
    try {
        const orders = await Order.find({ deliveryPartnerId: req.user._id })
            .populate("customerId", "name phone address")
            .populate("supermarketId", "name location")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/delivery/:id/status
// @access  Private/Delivery
const updateDeliveryStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["Out for Delivery", "Delivered"];
        if (!allowed.includes(status))
            return res.status(400).json({ message: "Delivery partners can only set Out for Delivery or Delivered" });

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, deliveryPartnerId: req.user._id },
            { status },
            { new: true }
        );
        if (!order)
            return res.status(404).json({ message: "Order not found or not assigned to you" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/delivery/earnings
// @access  Private/Delivery
const getEarnings = async (req, res) => {
    try {
        const delivered = await Order.find({
            deliveryPartnerId: req.user._id,
            status: "Delivered",
        });
        // ₹30 per delivery
        const total = delivered.length * 30;
        const today = delivered.filter(
            (o) => new Date(o.updatedAt).toDateString() === new Date().toDateString()
        ).length * 30;

        res.json({
            totalEarnings: total,
            todayEarnings: today,
            totalDeliveries: delivered.length,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAssignedOrders, updateDeliveryStatus, getEarnings };
