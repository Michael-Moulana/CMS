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

// Update product (allow new image)
router.put("/:id", protect, upload, productController.updateProduct);

// Delete product
router.delete("/:id", protect, productController.deleteProduct);

// ------------------- Media (nested under product) -------------------

// Add media to product
router.post("/:id/media", protect, upload, productController.addMediaToProduct);

// Delete media from product
router.delete(
  "/:id/media/:mediaId",
  protect,
  productController.deleteMediaFromProduct
);

// Update media details (title/order)
router.put(
  "/:id/media/:mediaId",
  protect,
  productController.updateMediaDetails
);

// ------------------- Helpers - Media -------------------
router.delete("/media/:mediaId", productController.deleteMediaById);

// ------------------- Product search -------------------
router.get("/search/query", productController.searchProducts);

module.exports = router;
