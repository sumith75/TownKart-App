const express = require("express");
const router = express.Router();
const {
    getAssignedOrders,
    updateDeliveryStatus,
    getEarnings,
} = require("../controllers/deliveryController");
const { protect, authorize } = require("../middleware/auth");

router.get("/assigned", protect, authorize("delivery"), getAssignedOrders);
router.put("/:id/status", protect, authorize("delivery"), updateDeliveryStatus);
router.get("/earnings", protect, authorize("delivery"), getEarnings);

module.exports = router;
