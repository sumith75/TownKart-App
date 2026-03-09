const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, address } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Name, email and password are required" });

        const exists = await User.findOne({ email });
        if (exists)
            return res.status(400).json({ message: "Email already registered" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Only allow customer self-registration; admin/delivery created via seed or admin panel
        const allowedRole = ["customer"].includes(role) ? role : "customer";

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: allowedRole,
            phone: phone || "",
            address: address || "",
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid email or password" });

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            supermarketId: user.supermarketId,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
};

module.exports = { register, login, getMe };
