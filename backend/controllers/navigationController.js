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

exports.updateNavigation = async (req, res) => {
  try {
    const { title, slug, order, parent } = req.body;

    const updatedNav = await Navigation.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        order: order || 0,
        parent: parent || null,
      },
      { new: true } // return updated document
    ).populate("parent", "title");

    res.status(200).json({ navigation: updatedNav });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNavigation = async (req, res) => {
  try {
    const deleted = await Navigation.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Navigation not found" });
    res.status(200).json({ message: "Navigation deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
