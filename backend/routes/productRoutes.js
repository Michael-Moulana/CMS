const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const productController = require("../controllers/productController");

// ------------------- Media (nested under product) -------------------
// Get all media files
router.get("/media", protect, productController.getAllMedia);

// Get single media file (by media ID)
router.get("/media/:id", protect, productController.getMediaById);

// delete media file (by media ID)
router.delete("/media/:id", protect, productController.deleteMediaById);

// ------------------- Product CRUD -------------------

// Create product (multipart: product fields + optional image)
router.post("/", protect, upload, productController.createProduct);

// Get all products
router.get("/", protect, productController.getAllProducts);

// ------------------- Product search -------------------
router.get("/search/query", productController.searchProducts);

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

module.exports = router;
