const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Root route (IMPORTANT for testing)
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Create users.json if not exists
const DB_FILE = path.join(__dirname, "users.json");

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Make DB accessible
app.locals.dbFile = DB_FILE;

// Load routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});