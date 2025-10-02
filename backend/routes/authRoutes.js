// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  updateUserProfile,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

// --- Avatar upload (multer) setup ---
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads/avatars exists
const uploadDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".png");
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// ------------------- Auth -------------------
router.post("/register", registerUser);
router.post("/login", loginUser);

// ------------------- Profile -------------------
router.get("/profile", protect, getProfile);
// accept multipart with optional 'avatar' file + text fields
router.put("/profile", protect, upload.single("avatar"), updateUserProfile);

module.exports = router;
