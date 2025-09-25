const FileStorageAdapter = require("./FileStorageAdapter");
const MediaModel = require("./MediaModelWrapper");
const MediaManager = require("./MediaManager");
const ProductManager = require("./ProductManager");
const ExactSearchStrategy = require("./search/ExactSearchStrategy");
const ProductRepository = require("./repositories/ProductRepository");

class ModelFactory {
  static createMediaManager() {
    const storage = new FileStorageAdapter();
    const model = new MediaModel();
    return new MediaManager({ storageAdapter: storage, mediaModel: model });
  }

  static createProductManager({
    searchStrategy = new ExactSearchStrategy(),
  } = {}) {
    const mediaManager = this.createMediaManager();
    const productRepository = new ProductRepository();
    return new ProductManager({
      mediaManager,
      searchStrategy,
      productRepository,
    });
  }
}

module.exports = ModelFactory;
