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

  async getAll() {
    return this.productRepository.findAll();
  }

  async getById(id) {
    return this.productRepository.model
      .findById(id)
      .populate("media.mediaId")
      .exec();
  }

  async updateProduct(id, { data, files = [], userId, thumbnailMediaId }) {
    const product = await this.productRepository.model.findById(id);
    if (!product) throw new Error("Product not found");

    // Update base fields
    Object.assign(product, {
      title: data.title ?? product.title,
      description: data.description ?? product.description,
      price: data.price ?? product.price,
      stock: data.stock ?? product.stock,
      categories: data.categories ?? product.categories,
    });

    // Check image count before uploading new ones
    if (files.length > 0) {
      const currentCount = product.media.length;
      if (currentCount >= 3) {
        throw new Error(
          "You must delete an image before uploading a new one (max 3 allowed)."
        );
      }
      if (currentCount + files.length > 3) {
        throw new Error(`You can only add ${3 - currentCount} more image(s).`);
      }
    }

    // New media uploads
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

    product.media.push(
      ...mediaDocs.map((m, i) => ({
        mediaId: m._id,
        order: product.media.length + i,
      }))
    );

    // Handle media edits (title/order)
    if (data.mediaEdits && Array.isArray(data.mediaEdits)) {
      for (const edit of data.mediaEdits) {
        const mediaItem = product.media.find(
          (m) => m.mediaId.toString() === edit.mediaId
        );
        if (mediaItem) {
          if (edit.order !== undefined) mediaItem.order = edit.order;
          if (edit.title) {
            await this.mediaManager.updateTitle(edit.mediaId, edit.title);
          }
        }
      }
    }

    // Handle thumbnail reordering
    if (thumbnailMediaId) {
      const thumb = product.media.find(
        (m) => m.mediaId.toString() === thumbnailMediaId.toString()
      );
      if (thumb) {
        thumb.order = 0;
        let counter = 1;
        for (const m of product.media) {
          if (m.mediaId.toString() !== thumbnailMediaId.toString()) {
            m.order = counter++;
          }
        }
      }
    }

    await product.save();
    EventBus.emit("product.updated", product);
    return product;
  }
}

module.exports = ProductManager;
