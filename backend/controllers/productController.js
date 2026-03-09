const Product = require("../models/Product");

// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const { supermarketId, category, search, saveTheWaste } = req.query;
        const filter = {};

        if (supermarketId) filter.supermarketId = supermarketId;
        if (category) filter.category = category;

        // "Save the Waste" — products with discount > 0 (near expiry)
        if (saveTheWaste === "true") {
            filter.discount = { $gt: 0 };
        }

        let query = Product.find(filter);

        // Text search
        if (search) {
            query = Product.find({ ...filter, $text: { $search: search } });
        }

        const products = await query.sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/products
// @access  Private/Admin
const addProduct = async (req, res) => {
    try {
        const admin = req.user;
        // Admin can only add to their own store
        const supermarketId = admin.supermarketId || req.body.supermarketId;

        const product = await Product.create({ ...req.body, supermarketId });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
};
