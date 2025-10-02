const ModelFactory = require("../services/ModelFactory");
const AuthProxy = require("../services/AuthProxy");
const ResponseDecorator = require("../services/ResponseDecorator");
const MediaManager = require("../services/MediaManager");

const productManager = ModelFactory.createProductManager();
const mediaManager = new MediaManager();

const createProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    const data = req.body;
    const files = req.files || [];
    const mediaDocs = [];

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

    const productData = { ...data, media: mediaDocs, createdBy: req.user._id };

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

const deleteProduct = async (req, res, next) => {
  try {
    const proxy = new AuthProxy(req.user, productManager);
    await proxy.deleteProduct(req.params.id);
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
};

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

//Connect button to backend API (DELETE /media/:id).
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

// delegate to ProductManager; req.params.mediaId is the RELATION id; we map to the real mediaId inside the manager
const updateMediaDetails = async (req, res, next) => {
  try {
    const { title, order } = req.body;
    const productId = req.params.id;
    const mediaId = req.params.mediaId;

    const numericOrder = order === undefined ? undefined : Number(order);
    if (
      numericOrder !== undefined &&
      (!Number.isInteger(numericOrder) || numericOrder < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Order must be a non-negative integer",
      });
    }

    const result = await productManager.updateMediaDetails(productId, mediaId, {
      title,
      order: numericOrder,
    });

    const decorated = ResponseDecorator.decorate(
      result,
      "Media updated successfully"
    );
    res.json(decorated);
  } catch (err) {
    if (err.message === "Product not found") {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    if (err.message === "Media not found") {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }
    next(err);
  }
};

// Get all media files
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

//get single media by ID
const getMediaById = async (req, res, next) => {
  try {
    const mediaId = req.params.id;
    const media = await mediaManager.model.findById(mediaId);
    if (!media) {
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }
    const decorated = ResponseDecorator.decorate(
      media,
      "Media fetched successfully"
    );
    res.status(200).json(decorated);
  } catch (err) {
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
  updateMediaDetails,
  getAllMedia,
  getMediaById,
};