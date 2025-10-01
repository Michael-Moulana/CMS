// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");
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

// serve uploaded images

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

//  Products API (this must exist for /api/products)
app.use("/api/products", require("./routes/productRoutes"));

if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
