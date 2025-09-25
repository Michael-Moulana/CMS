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

module.exports = {
  createProduct,
};
