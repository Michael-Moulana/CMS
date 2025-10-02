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
    let media = Array.isArray(data.media)
      ? data.media.map((m) => ({
          mediaId: m.mediaId?._id || m.mediaId || m._id,
          order: Number(m.order ?? 0),
        }))
      : [];

    if (media.length === 0 && files.length > 0) {
      const uploaded = [];
      for (const file of files) {
        const doc = await this.mediaManager.upload({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId,
        });
        uploaded.push(doc);
      }
      media = uploaded.map((m, i) => ({ mediaId: m._id, order: i }));
    }

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

  // (polymorphism)
  async search(q, opts = {}) {
    if (
      this.searchStrategy &&
      typeof this.searchStrategy.search === "function"
    ) {
      return this.searchStrategy.search(q, this.productRepository.model, opts);
    }
    return this.productRepository.findAll();
  }

  async updateProduct(id, { data, files = [], userId, thumbnailMediaId }) {
    const product = await this.productRepository.model.findById(id);
    if (!product) throw new Error("Product not found");

    Object.assign(product, {
      title: data.title ?? product.title,
      description: data.description ?? product.description,
      price: data.price ?? product.price,
      stock: data.stock ?? product.stock,
      categories: data.categories ?? product.categories,
    });

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

    if (files.length > 0) {
      const uploaded = [];
      for (const file of files) {
        const mediaDoc = await this.mediaManager.upload({
          buffer: file.buffer,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          userId,
        });
        uploaded.push(mediaDoc);
      }

      product.media.push(
        ...uploaded.map((m, i) => ({
          mediaId: m._id,
          order: product.media.length + i,
        }))
      );
    }

    if (data.mediaEdits && Array.isArray(data.mediaEdits)) {
      for (const edit of data.mediaEdits) {
        const mediaItem = product.media.find(
          (m) =>
            m.mediaId.toString() === String(edit.mediaId) ||
            String(m._id) === String(edit.mediaId)
        );
        if (mediaItem) {
          if (edit.order !== undefined) {
            const o = parseInt(edit.order, 10);
            if (!Number.isNaN(o)) mediaItem.order = o;
          }
          if (edit.title) {
            await this.mediaManager.updateTitle(mediaItem.mediaId, edit.title);
          }
        }
      }
      // only sort by order
      product.media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }

    if (thumbnailMediaId) {
      const thumb = product.media.find(
        (m) => m.mediaId.toString() === String(thumbnailMediaId)
      );
      if (thumb) {
        thumb.order = 0;
        let counter = 1;
        for (const m of product.media) {
          if (m.mediaId.toString() !== String(thumbnailMediaId)) {
            m.order = counter++;
          }
        }
      }
    }

    await product.save();
    EventBus.emit("product.updated", product);
    return product.populate("media.mediaId");
  }

  // Delete a product (and its media files)
  async deleteProduct(id) {
    const product = await this.productRepository.model.findById(id);
    if (!product) {
      return { _id: id, deleted: false };
    }

    if (Array.isArray(product.media)) {
      for (const m of product.media) {
        const mid = m?.mediaId?._id || m?.mediaId;
        if (!mid) continue;
        try {
          await this.mediaManager.delete(mid);
        } catch (_) {}
      }
    }

    await this.productRepository.model.findByIdAndDelete(product._id);

    EventBus.emit("product.deleted", { _id: product._id });
    return { _id: product._id, deleted: true };
  }

  async addMediaToProduct(productId, files = [], userId) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    const current = product.media.length;
    if (current >= 3) throw new Error("Product already has 3 images");
    if (current + files.length > 3) {
      throw new Error(`You can only add ${3 - current} more image(s).`);
    }

    const uploaded = [];
    for (const file of files) {
      const mediaDoc = await this.mediaManager.upload({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        userId,
      });
      uploaded.push(mediaDoc);
    }

    for (let i = 0; i < uploaded.length; i++) {
      await this.productRepository.addMediaToProduct(
        productId,
        uploaded[i]._id,
        current + i
      );
    }

    const updated = await this.getById(productId);
    EventBus.emit("product.updated", updated);
    return updated;
  }

  async deleteMediaFromProduct(productId, mediaId) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    const idx = product.media.findIndex(
      (m) =>
        m.mediaId.toString() === String(mediaId) ||
        String(m._id) === String(mediaId)
    );
    if (idx === -1) throw new Error("Media not found");

    const [removed] = product.media.splice(idx, 1);
    await product.save();

    // keep the relative orders intact
    product.media.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    await product.save();

    await this.mediaManager.delete(removed.mediaId);
    EventBus.emit("product.updated", product);
    return product.populate("media.mediaId");
  }

  // Update media details (single item)
  async updateMediaDetails(productId, mediaId, { title, order }) {
    const product = await this.productRepository.model.findById(productId);
    if (!product) throw new Error("Product not found");

    const item = product.media.find(
      (m) =>
        m.mediaId.toString() === String(mediaId) ||
        String(m._id) === String(mediaId)
    );
    if (!item) throw new Error("Media not found");

    // Update title on Media doc
    if (title !== undefined && title !== null) {
      await this.mediaManager.updateTitle(item.mediaId, title);
    }

    if (order !== undefined && order !== null) {
      const target = Math.max(
        0,
        Math.min(parseInt(order, 10) || 0, product.media.length - 1)
      );

      const arr = [...product.media].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );

      const fromIdx = arr.findIndex(
        (m) =>
          m.mediaId.toString() === String(item.mediaId) ||
          String(m._id) === String(item._id)
      );

      if (fromIdx !== -1) {
        const [picked] = arr.splice(fromIdx, 1);
        arr.splice(target, 0, picked);
        // reindex 0..n-1
        arr.forEach((m, i) => {
          m.order = i;
        });
        // write back to product
        product.media = arr;
      }
    }

    await product.save();
    const updated = await this.getById(productId);
    EventBus.emit("product.updated", updated);
    return updated;
  }
  _reorderWithThumbnail(mediaArray, thumbId) {
    const arr = [...mediaArray];
    const i = arr.findIndex((m) => m.mediaId.toString() === String(thumbId));
    if (i === -1) return arr;
    const [picked] = arr.splice(i, 1);
    picked.order = 0;
    arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const reordered = [picked, ...arr];
    reordered.forEach((m, idx) => (m.order = idx));
    return reordered;
  }
}

module.exports = ProductManager;
