// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// CORS + JSON
app.use(cors());
app.use(express.json());

// Existing routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard/pages", require("./routes/pageRoutes"));
app.use("/api/dashboard/navigations", require("./routes/navigationRoutes"));
app.use("/api/dashboard/products", require("./routes/productRoutes"));

// Serve uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Products API (this must exist for /api/products)
app.use("/api/products", require("./routes/productRoutes"));

// ---- Always starts the server (works with PM2) ----
(async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(` Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(" MongoDB connection failed:", err.message);
    process.exit(1);
  }
})();

module.exports = app;
