const EventBus = require("./EventBus");

class ProductManager {
  constructor({ mediaManager, searchStrategy, productRepository }) {
    if (!mediaManager) throw new Error("mediaManager is required");
    if (!productRepository) throw new Error("productRepository is required");

    this.mediaManager = mediaManager;
    this.searchStrategy = searchStrategy;
    this.productRepository = productRepository;
  }

  // Create product with optional media + thumbnail
  async createProduct({ data, files = [], userId }) {
    const mediaDocs = [];

    for (const file of files) {
      const mediaDoc = await this.mediaManager.upload({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId,
      });
      mediaDocs.push(mediaDoc);
    }

    let media = mediaDocs.map((m, i) => ({ mediaId: m._id, order: i }));

    // If thumbnail specified, reorder
    if (data.thumbnail) {
      const thumbId = data.thumbnail;
      media = this._reorderWithThumbnail(media, thumbId);
    }

    const productData = {
      title: data.title,
      description: data.description || "",
      price: data.price || 0,
      stock: data.stock || 0,
      categories: data.categories || [],
      media,
      createdBy: userId,
    };

    const doc = await this.productRepository.create(productData);
    EventBus.emit("product.created", doc);
    return doc;
  }
}

module.exports = ProductManager;
