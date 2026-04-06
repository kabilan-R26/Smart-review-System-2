const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Create users.json if it doesn't exist
const DB_FILE = path.join(__dirname, "users.json");
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

// Pass DB_FILE down to routes via req object or simple global
app.locals.dbFile = DB_FILE;

const authRoutes = require("./routes/auth");
app.use("/api", authRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port} (using local JSON storage)`);
});
