const express = require("express");
const router = express.Router();
const pageController = require("../controllers/pageController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.post("/create", protect, pageController.createPage);
router.get("/", protect, pageController.getPages);
router.get("/:id", protect, pageController.getPage);
router.put("/update/:id", protect, pageController.updatePage);
router.delete("/remove/:id", protect, pageController.deletePage);

module.exports = router;
