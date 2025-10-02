const Product = require("../../models/Product");

class ExactSearchStrategy {
  async search(q, opts = {}) {
    const limit = opts.limit || 50;

    if (!q || q.length < 1) {
      return Product.find().limit(limit).sort({ createdAt: -1 }).exec();
    }

    // case-insensitive regex
    const regex = new RegExp(q, "i");

    return Product.find({
      $or: [{ title: regex }, { description: regex }],
    })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }
}

module.exports = ExactSearchStrategy;
