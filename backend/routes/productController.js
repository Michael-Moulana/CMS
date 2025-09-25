const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const productController = require("../controllers/productController");

// ------------------- Product CRUD -------------------

// Create product (multipart: product fields + optional image)
router.post("/", protect, upload, productController.createProduct);

// Get all products
router.get("/", productController.getAllProducts);

// Get single product
router.get("/:id", productController.getProduct);

module.exports = router;