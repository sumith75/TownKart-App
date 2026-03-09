const Supermarket = require("../models/Supermarket");
const User = require("../models/User");

// @route   GET /api/supermarkets
// @access  Public
const getSupermarkets = async (req, res) => {
    try {
        const { town } = req.query;
        const filter = town ? { town: new RegExp(town, "i") } : {};
        const stores = await Supermarket.find(filter).sort({ createdAt: -1 });
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/supermarkets/:id
// @access  Public
const getSupermarketById = async (req, res) => {
    try {
        const store = await Supermarket.findById(req.params.id);
        if (!store) return res.status(404).json({ message: "Store not found" });
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/supermarkets
// @access  Private/Admin
const createSupermarket = async (req, res) => {
    try {
        const { name, location, town, image, deliveryTime } = req.body;
        const store = await Supermarket.create({
            name,
            location,
            town,
            image,
            deliveryTime,
            ownerId: req.user._id,
        });

        // Link this store to the admin user
        await User.findByIdAndUpdate(req.user._id, { supermarketId: store._id });

        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/supermarkets/:id
// @access  Private/Admin
const updateSupermarket = async (req, res) => {
    try {
        const store = await Supermarket.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!store) return res.status(404).json({ message: "Store not found" });
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSupermarkets,
    getSupermarketById,
    createSupermarket,
    updateSupermarket,
};
