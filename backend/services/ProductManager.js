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

  async addMediaToProduct(productId, files = [], userId) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    // Check limit before uploading
    const currentCount = product.media.length;
    if (currentCount >= 3) {
      throw new Error(
        "This product already has 3 images. Delete one before adding new ones."
      );
    }
    if (currentCount + files.length > 3) {
      throw new Error(`You can only add ${3 - currentCount} more image(s).`);
    }

    // Upload new files
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

    await product.save();
    EventBus.emit("product.mediaAdded", { product, mediaDocs });
    return product;
  }

  async deleteProduct(id) {
    // Find the product first
    const product = await this.productRepository.model.findById(id);
    if (!product) return null;

    // Delete attached media
    if (product.media && product.media.length > 0) {
      for (const m of product.media) {
        try {
          await this.mediaManager.delete(m.mediaId);
        } catch (err) {
          console.error(`Failed to delete media ${m.mediaId}:`, err.message);
        }
      }
    }

    // Delete the product itself
    const deleted = await this.productRepository.model.findByIdAndDelete(id);

    EventBus.emit("product.deleted", deleted);
    return deleted;
  }

  async updateMediaDetails(productId, mediaId, { title, order }) {
    const product = await this.productRepository.model
      .findById(productId)
      .populate("media.mediaId");

    if (!product) throw new Error("Product not found");

    const mediaItem = product.media.find(
      (m) => m.mediaId._id.toString() === mediaId
    );
    if (!mediaItem) throw new Error("Media not found");

    // Update title if provided
    if (title) {
      await this.mediaManager.updateTitle(mediaId, title);
    }

    // Update order if provided
    if (order !== undefined) {
      if (order < 0 || order >= product.media.length) {
        throw new Error(
          `Order must be between 0 and ${product.media.length - 1}`
        );
      }

      // Remove the item temporarily
      const otherMedia = product.media.filter(
        (m) => m.mediaId._id.toString() !== mediaId
      );

      // Insert it at the new position
      otherMedia.splice(order, 0, mediaItem);

      // Reassign orders
      product.media = otherMedia.map((m, idx) => ({
        ...(m.toObject?.() ?? m),
        order: idx,
      }));
    }

    await product.save();
    return product;
  }

  async deleteMediaFromProduct(productId, mediaId) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    const index = product.media.findIndex(
      (m) => m.mediaId.toString() === mediaId
    );
    if (index === -1) throw new Error("Media not found");

    const removed = product.media.splice(index, 1)[0];
    await this.mediaManager.delete(removed.mediaId);

    // Re-sequence
    product.media = product.media.map((m, idx) => ({ ...m, order: idx }));

    await product.save();
    return product;
  }

  async updateThumbnail(productId, mediaId) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    product.media = this._reorderWithThumbnail(product.media, mediaId);

    await product.save();
    EventBus.emit("product.thumbnailUpdated", { product, mediaId });
    return product;
  }

  async search(q, opts = {}) {
    if (
      !this.searchStrategy ||
      typeof this.searchStrategy.search !== "function"
    ) {
      throw new Error("Search strategy not configured");
    }
    return this.searchStrategy.search(q, opts);
  }

  // --- private helper
  _reorderWithThumbnail(media, thumbId) {
    const thumbFirst = [];
    const others = [];
    for (const m of media) {
      if (m.mediaId.toString() === thumbId) thumbFirst.push(m);
      else others.push(m);
    }
    const reordered = [...thumbFirst, ...others].map((m, idx) => ({
      ...(m.toObject?.() ?? m),
      order: idx,
    }));
    return reordered;
  }
}

module.exports = ProductManager;
