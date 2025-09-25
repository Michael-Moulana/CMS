const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, default: "" },
  price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  categories: { type: [String], default: [] },
  media: [
    {
      mediaId: { type: mongoose.Schema.Types.ObjectId, ref: "Media" },
      order: { type: Number, default: 0 },
    },
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

// text index to support text search
ProductSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Product", ProductSchema);
