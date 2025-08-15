const express = require("express");
const router = express.Router();
const navigationController = require("../controllers/navigationController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, navigationController.createNavigation);
router.get("/", protect, navigationController.getNavigations);
router.put("/:id", protect, navigationController.updateNavigation);
router.delete("/:id", protect, navigationController.deleteNavigation);

module.exports = router;
