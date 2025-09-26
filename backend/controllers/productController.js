const ModelFactory = require("../services/ModelFactory");
const AuthProxy = require("../services/AuthProxy");
const ResponseDecorator = require("../services/ResponseDecorator");

// Create a ProductManager instance via factory
const productManager = ModelFactory.createProductManager();

/**
 * Create a new product (with optional media file)
 */
const createProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    const data = req.body;
    const files = req.files || [];
    const mediaDocs = [];

    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mediaDoc = await productManager.mediaManager.upload({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId: req.user._id,
      });
      mediaDocs.push({ mediaId: mediaDoc._id, order: i });
    }

    // Include mediaDocs in product data
    const productData = {
      ...data,
      media: mediaDocs,
      createdBy: req.user._id,
    };

    const result = await proxy.createProduct({
      data: productData,
      userId: req.user._id,
    });

    const decorated = ResponseDecorator.decorate(
      result,
      "Product created successfully"
    );
    res.status(201).json(decorated);
  } catch (err) {
    next(err);
  }
};

/**
 * Get all products
 */
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

/**
 * Get a single product by ID
 */
const getProduct = async (req, res, next) => {
  try {
    const product = await productManager.getById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    const decorated = ResponseDecorator.decorate(product);
    res.json(decorated);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a product (fields + optional new image)
 */
const updateProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);

    const { thumbnailMediaId, ...data } = req.body; // frontend sends thumbnailMediaId
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

/**
 * Delete a product
 */
const deleteProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    await proxy.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Search products
 */
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

/**
 * Add media to product
 */
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
    // handle product not found
    if (err.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // handle the "max images reached" case
    if (err.message.includes("already has 3 images")) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // fallback to global error handler
    next(err);
  }
};

/**
 * Delete media from product
 */
const deleteMediaFromProduct = async (req, res, next) => {
  try {
    await productManager.deleteMediaFromProduct(
      req.params.id,
      req.params.mediaId
    );
    res.json({ success: true, message: "Media deleted successfully" });
  } catch (err) {
    // Product not found
    if (err.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Media not found
    if (err.message.includes("Media not found")) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    // fallback to global error handler
    next(err);
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
};
