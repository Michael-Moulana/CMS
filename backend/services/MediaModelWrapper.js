const Media = require("../models/Media");

class MediaModel {
  async create(doc) {
    return Media.create(doc);
  }
  async findById(id) {
    return Media.findById(id);
  }
  async updateTitle(id, title) {
    return Media.findByIdAndUpdate(id, { title }, { new: true });
  }
  async findAll(filter = {}, opts = {}) {
    const q = Media.find(filter).sort({ createdAt: -1 });
    if (opts.limit) q.limit(opts.limit);
    return q.exec();
  }
  async delete(id) {
    return Media.findByIdAndDelete(id);
  }
}

module.exports = MediaModel;
