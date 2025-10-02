const FileStorageAdapter = require("./FileStorageAdapter");
const MediaModel = require("./MediaModelWrapper");
const EventBus = require("./EventBus");

class MediaManager {
  constructor({
    storageAdapter = new FileStorageAdapter(),
    mediaModel = new MediaModel(),
  } = {}) {
    this.storage = storageAdapter;
    this.model = mediaModel;
    this.MAX_SIZE = 3 * 1024 * 1024; // 3MB
    this.ALLOWED = ["image/jpeg", "image/png"];
  }

  // validates, saves file and db doc
  async upload({ buffer, originalName, mimeType, size, userId }) {
    if (!this.ALLOWED.includes(mimeType)) throw new Error("Invalid file type");
    if (size > this.MAX_SIZE) throw new Error("File too large");

    const filename = this.storage.generateFilename(originalName);
    const filepath = await this.storage.saveFile(buffer, filename);

    const doc = await this.model.create({
      filename,
      originalName,
      mimeType,
      size,
      path: filepath,
      createdBy: userId,
    });

    EventBus.emit("media.created", doc);
    return doc;
  }

  async updateTitle(mediaId, title) {
    return this.model.updateTitle(mediaId, title);
  }

  async listAll(limit = 100) {
    return this.model.findAll({}, { limit });
  }

  async delete(mediaId) {
    try {
      const m = await this.model.findById(mediaId);
      if (!m) return null;
      await this.storage.deleteFile(m.path);
      await this.model.delete(mediaId);
      EventBus.emit("media.deleted", m);
      return m;
    } catch (err) {
      console.error("Error deleting media:", err);
      throw err;
    }
  }

  getFileStream(path) {
    return this.storage.getFileStream(path);
  }
}

module.exports = MediaManager;
