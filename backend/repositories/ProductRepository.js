// backend/repositories/ProductRepository.js
const BaseRepository = require("./BaseRepository");
const Product = require("../models/Product");

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findByCategory(category) {
    return this.model.find({ categories: category }).populate("media.mediaId");
  }

  async findAll() {
    return this.model.find().populate("media.mediaId");
  }

  // push one media ref with an order
  async addMediaToProduct(productId, mediaId, order) {
    return this.model.findByIdAndUpdate(
      productId,
      { $push: { media: { mediaId, order } } },
      { new: true }
    ).populate("media.mediaId");
  }

  // pull one media ref (accept media.mediaId or media._id)
  async removeMediaFromProduct(productId, mediaId) {
    return this.model.findOneAndUpdate(
      {
        _id: productId,
        $or: [
          { "media.mediaId": mediaId },
          { "media._id": mediaId }
        ]
      },
      { $pull: { media: { $or: [{ mediaId }, { _id: mediaId }] } } },
      { new: true }
    ).populate("media.mediaId");
  }

  // set order for a specific media (accept both IDs)
  async updateMediaOrder(productId, mediaId, order) {
    return this.model.findOneAndUpdate(
      {
        _id: productId,
        $or: [
          { "media.mediaId": mediaId },
          { "media._id": mediaId }
        ]
      },
      { $set: { "media.$.order": order } },
      { new: true }
    ).populate("media.mediaId");
  }
}

module.exports = ProductRepository;
