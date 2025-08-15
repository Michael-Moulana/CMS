const Navigation = require("../models/navigation");

// Create a new navigation item
exports.createNavigation = async (req, res) => {
  try {
    const { title, slug, order, parent } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    // Check if slug is unique
    const existingNav = await Navigation.findOne({ slug });
    if (existingNav) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const navigationItem = new Navigation({
      title,
      slug,
      order: order || 0,
      parent: parent || null,
      createdBy: req.user._id, // from auth middleware
    });

    const savedNavigation = await navigationItem.save();

    res.status(201).json({
      message: "Navigation item created successfully",
      navigation: savedNavigation,
    });
  } catch (err) {
    console.error("Navigation creation failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getNavigations = async (req, res) => {
  try {
    const navigation = await Navigation.find({ createdBy: req.user._id })
      .sort("order")
      .populate("parent", "title");
    res.status(200).json({ navigation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNavigation = async (req, res) => {};
exports.updateNavigation = async (req, res) => {};
exports.deleteNavigation = async (req, res) => {};
