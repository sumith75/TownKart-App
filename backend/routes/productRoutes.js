const express = require("express");
const router = express.Router();
const {
    getProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorize("admin"), addProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;