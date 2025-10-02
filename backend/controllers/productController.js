const ModelFactory = require("../services/ModelFactory");
const AuthProxy = require("../services/AuthProxy");
const ResponseDecorator = require("../services/ResponseDecorator");
const MediaManager = require("../services/MediaManager");
const mongoose = require("mongoose");

const productManager = ModelFactory.createProductManager();
const mediaManager = new MediaManager();

// Create Product
const createProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    const data = req.body;
    const files = req.files || [];
    const mediaDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const mediaDoc = await productManager.mediaManager.upload({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId: req.user._id,
        });
        mediaDocs.push({ mediaId: mediaDoc._id, order: i });
      } catch (mediaErr) {
        // Log error and continue with other files
        console.error(
          `Failed to upload media file ${file.originalname}:`,
          mediaErr.message
        );
        return res.status(400).json({
          success: false,
          message: `Failed to upload media file ${file.originalname}: ${mediaErr.message}`,
        });
      }
    }

    const productData = { ...data, media: mediaDocs, createdBy: req.user._id };

    // Create product
    let result;
    try {
      result = await proxy.createProduct({
        data: productData,
        userId: req.user._id,
      });
    } catch (productErr) {
      console.error("Product creation failed:", productErr.message);
      return res.status(500).json({
        success: false,
        message: "Failed to create product",
        error: productErr.message,
      });
    }

    const decorated = ResponseDecorator.decorate(
      result,
      "Product created successfully"
    );
    res.status(201).json(decorated);
  } catch (err) {
    console.error("Unexpected error in createProduct:", err);
    next(err);
  }
};

// Get all products
const getAllProducts = async (req, res, next) => {
  try {
    const products = await productManager.getAll();
    const decorated = ResponseDecorator.decorate(
      products,
      "Fetched all products successfully"
    );
    res.json(decorated);
  } catch (err) {
    next(err);
  }
};

// Get single product
const getProduct = async (req, res, next) => {
  try {
    let product = await productManager.getById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (typeof product.populate === "function") {
      product = await product.populate("media.mediaId");
    }

    const decorated = ResponseDecorator.decorate(product);
    res.json(decorated);
  } catch (err) {
    next(err);
  }
};

// Update Product
const updateProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    const { thumbnailMediaId, ...data } = req.body;
    const files = req.files || [];

    const result = await proxy.updateProduct(req.params.id, {
      data,
      files,
      thumbnailMediaId,
      userId: req.user ? req.user._id : null,
    });

    const decorated = ResponseDecorator.decorate(
      result,
      "Product updated successfully"
    );
    res.json(decorated);
  } catch (err) {
    next(err);
  }
};

// Delete Product
const deleteProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    const result = await proxy.deleteProduct(req.params.id);

    // Handle invalid ID
    if (result?.error === "invalid_id") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Handle not found
    if (!result?.deleted) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Success
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Search Products
const searchProducts = async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const results = await productManager.search(q, { limit: 50 });
    const decorated = ResponseDecorator.decorate(results, "Search results");
    res.json(decorated);
  } catch (err) {
    next(err);
  }
};

// Media Management for Products
// Create media - adding media to product
const addMediaToProduct = async (req, res, next) => {
  try {
    const files = req.files || [];
    if (files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image files provided" });
    }

    const result = await productManager.addMediaToProduct(
      req.params.id,
      files,
      req.user._id
    );
    const decorated = ResponseDecorator.decorate(
      result,
      `${files.length} media file(s) added to product`
    );
    res.status(201).json(decorated);
  } catch (err) {
    if (err.message.includes("Product not found")) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (err.message.includes("already has 3 images")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// Delete media from product
const deleteMediaFromProduct = async (req, res, next) => {
  try {
    await productManager.deleteMediaFromProduct(
      req.params.id,
      req.params.mediaId
    );
    res.json({ success: true, message: "Media deleted successfully" });
  } catch (err) {
    if (err.message.includes("Product not found")) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (err.message.includes("Media not found")) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }
    next(err);
  }
};

// Update media details (title, order) for a product
const updateMediaDetails = async (req, res, next) => {
  try {
    const { title, order } = req.body;
    const productId = req.params.id;
    const mediaId = req.params.mediaId;

    // Call service to update media; ID validation is done in ProductManager
    const result = await productManager.updateMediaDetails(productId, mediaId, {
      title,
      order,
    });

    const decorated = ResponseDecorator.decorate(
      result,
      "Media updated successfully"
    );
    res.status(200).json(decorated);
  } catch (err) {
    // Handle known errors
    if (
      err.message === "Invalid product ID" ||
      err.message === "Invalid media ID"
    ) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (
      err.message === "Product not found" ||
      err.message === "Media not found"
    ) {
      return res.status(404).json({ success: false, message: err.message });
    }

    // Unexpected errors
    next(err);
  }
};

// ---- helpers for media management through postman ----
// Get all media
const getAllMedia = async (req, res, next) => {
  try {
    const media = await mediaManager.listAll();
    const decorated = ResponseDecorator.decorate(
      media,
      "All media fetched successfully"
    );
    res.status(200).json(decorated);
  } catch (err) {
    next(err);
  }
};

// Get media by ID
const getMediaById = async (req, res, next) => {
  try {
    const mediaId = req.params.id;

    // Use mediaManager.getById (validation inside manager)
    const media = await mediaManager.getById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    const decorated = ResponseDecorator.decorate(
      media,
      "Media fetched successfully"
    );
    return res.status(200).json(decorated);
  } catch (err) {
    if (err.message === "Invalid media ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }
    next(err);
  }
};

const deleteMediaById = async (req, res, next) => {
  try {
    const mediaId = req.params.id;
    const deletedMedia = await mediaManager.delete(mediaId);

    if (!deletedMedia) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
      data: deletedMedia,
    });
  } catch (err) {
    if (err.message === "Invalid media ID") {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  addMediaToProduct,
  deleteMediaFromProduct,
  updateMediaDetails,
  getAllMedia,
  getMediaById,
  deleteMediaById,
};
