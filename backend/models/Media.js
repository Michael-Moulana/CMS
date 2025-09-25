const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // stored filename on disk
  originalName: { type: String, required: true }, // original upload name
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  title: { type: String, default: "" }, // title for the media, can be used for alt text
  path: { type: String, required: true }, // absolute path on server
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Media", MediaSchema);
