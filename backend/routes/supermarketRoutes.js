const express = require("express");
const router = express.Router();
const {
    getSupermarkets,
    getSupermarketById,
    createSupermarket,
    updateSupermarket,
} = require("../controllers/supermarketController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getSupermarkets);
router.get("/:id", getSupermarketById);
router.post("/", protect, authorize("admin"), createSupermarket);
router.put("/:id", protect, authorize("admin"), updateSupermarket);

module.exports = router;
