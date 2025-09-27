// backend/server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
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

//  Products API (this must exist for /api/products)
app.use("/api/products", require("./routes/productController"));

if (require.main === module) {
  connectDB();
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
