const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs").promises;

const router = express.Router();

// 🔹 Read users
async function readUsers(dbFile) {
  try {
    const data = await fs.readFile(dbFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// 🔹 Write users
async function writeUsers(dbFile, users) {
  await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
}

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const dbFile = req.app.locals.dbFile;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!["student", "faculty"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const users = await readUsers(dbFile);

    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      name: email.split("@")[0],
      subjects: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeUsers(dbFile, users);

    res.status(201).json({ message: "Registration successful" });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const dbFile = req.app.locals.dbFile;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔹 Mock faculty
    const MOCK_FACULTY = [
      { id: "f1", name: "Dr. Kamesh R", role: "faculty", email: "kamesh.r@vitfaculty.ac.in", password: "kamesh.r", subjects: ["c1", "c2"] },
      { id: "f2", name: "Dr. Meera S", role: "faculty", email: "meera.s@vitfaculty.ac.in", password: "meera.s", subjects: ["c3"] }
    ];

    const mockUser = MOCK_FACULTY.find(u => u.email === email.toLowerCase());

    if (mockUser) {
      if (password !== mockUser.password) {
        return res.status(400).json({ error: "Invalid password" });
      }

      return res.json({ user: mockUser });
    }

    const users = await readUsers(dbFile);
    const user = users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        subjects: user.subjects
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;