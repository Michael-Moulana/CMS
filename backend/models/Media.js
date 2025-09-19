// backend/src/models/Media.js
const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    alt: { type: String, default: "" },
    tags: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

mediaSchema.index({ originalName: "text", tags: 1 });

module.exports = mongoose.model("Media", mediaSchema);