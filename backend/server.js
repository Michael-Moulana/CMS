const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard/pages", require("./routes/pageRoutes"));
app.use("/api/dashboard/navigation", require("./routes/navigationRoutes"));
// Serve React static files
app.use(express.static(path.join(__dirname, "../frontend/build")));
// Catch-all route to handle client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
});

// Export the app object for testing
if (require.main === module) {
  connectDB();
  // If the file is run directly, start the server
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
