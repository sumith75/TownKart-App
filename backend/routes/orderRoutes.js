const express = require("express");
const router = express.Router();
const {
    placeOrder,
    getMyOrders,
    getStoreOrders,
    updateOrderStatus,
    assignDelivery,
    getDeliveryPartners,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

// Customer routes
router.post("/", protect, authorize("customer"), placeOrder);
router.get("/my", protect, authorize("customer"), getMyOrders);

// Admin routes
router.get("/store", protect, authorize("admin"), getStoreOrders);
router.get("/delivery-partners", protect, authorize("admin"), getDeliveryPartners);
router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/assign", protect, authorize("admin"), assignDelivery);

module.exports = router;
