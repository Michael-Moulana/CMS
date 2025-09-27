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
}

module.exports = ProductRepository;
