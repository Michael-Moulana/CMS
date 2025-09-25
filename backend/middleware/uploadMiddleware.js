const multer = require("multer");

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const MAX_FILES = 3; // maximum files allowed

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG and PNG images are allowed"));
  }
  cb(null, true);
};

// create multer instance
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).array("images", MAX_FILES);

// wrapper middleware to catch errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_UNEXPECTED_FILE":
            return res.status(400).json({
              success: false,
              message: `Too many files. Max ${MAX_FILES} allowed.`,
            });
          case "LIMIT_FILE_SIZE":
            return res.status(400).json({
              success: false,
              message: `File too large. Max ${
                MAX_FILE_SIZE / (1024 * 1024)
              }MB.`,
            });
          case "LIMIT_FILE_TYPE":
            return res.status(400).json({
              success: false,
              message: "Invalid file type. Only JPG and PNG allowed.",
            });
        }
      }

      // generic error
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = uploadMiddleware;
