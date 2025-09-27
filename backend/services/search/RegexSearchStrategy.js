const Product = require("../../models/Product");

class RegexSearchStrategy {
  async search(q, opts = {}) {
    if (!q) {
      return Product.find()
        .limit(opts.limit || 50)
        .sort({ createdAt: -1 })
        .exec();
    }
    const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"); // escape
    return Product.find({ $or: [{ title: re }, { description: re }] })
      .limit(opts.limit || 50)
      .exec();
  }
}

module.exports = RegexSearchStrategy;
