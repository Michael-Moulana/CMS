const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

class FileStorageAdapter {
  constructor(opts = {}) {
    // base directory for uploads
    this.baseDir = opts.baseDir || path.join(process.cwd(), "uploads");
  }

  _ensureDir() {
    return fsp.mkdir(this.baseDir, { recursive: true });
  }

  async saveFile(buffer, filename) {
    await this._ensureDir();
    const filepath = path.join(this.baseDir, filename);
    await fsp.writeFile(filepath, buffer);

    return `/uploads/${filename}`;
  }

  async deleteFile(filepath) {
    try {
      await fsp.unlink(filepath);
    } catch (err) {
      // ignore missing file errors
      if (err.code !== "ENOENT") throw err;
    }
  }

  // produce a readable stream for serving files
  getFileStream(filepath) {
    return fs.createReadStream(filepath);
  }

  // generate safe filename
  generateFilename(originalName) {
    const safe = originalName
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\.-]/g, "");
    return `${Date.now()}-${safe}`;
  }
}

module.exports = FileStorageAdapter;
