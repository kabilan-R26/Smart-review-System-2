const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// DB setup
const DB_FILE = path.join(__dirname, "users.json");

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

app.locals.dbFile = DB_FILE;

// Routes
const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

// 🔥 FIXED LISTEN
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});