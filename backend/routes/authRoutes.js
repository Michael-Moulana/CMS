const express = require("express");
const {
  registerUser,
  loginUser,
  updateUserProfile,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

// ------------------- Auth -------------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ------------------- Profile -------------------
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
