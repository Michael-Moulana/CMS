// Backend/services/search/ExactSearchStrategy.js
const Product = require("../../models/Product");

class ExactSearchStrategy {
  async search(q, opts = {}) {
    if (!q) {
      return Product.find()
        .limit(opts.limit || 50)
        .sort({ createdAt: -1 })
        .exec();
    }
    // use text index
    return Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(opts.limit || 50)
      .exec();
  }
}

module.exports = ExactSearchStrategy;
