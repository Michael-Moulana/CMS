const Page = require("../models/Page");

// Create Page
exports.createPage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    const page = new Page({ title, content, slug });
    const savedPage = await page.save();
    res.status(201).json({ message: "Page created", page: savedPage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all pages
exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find();
    res.status(200).json({ pages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single page
exports.getPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.status(200).json(page);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Page
exports.updatePage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const page = await Page.findByIdAndUpdate(
      req.params.id,
      { title, content, updatedAt: Date.now() },
      { new: true }
    );
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.status(200).json({ message: "Page updated", page });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Page
exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    res.status(200).json({ message: "Page deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
