const express = require("express");
const bcrypt = require("bcryptjs");
const fs = require("fs").promises;

const router = express.Router();

async function readUsers(dbFile) {
  try {
    const data = await fs.readFile(dbFile, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function writeUsers(dbFile, users) {
  await fs.writeFile(dbFile, JSON.stringify(users, null, 2));
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const dbFile = req.app.locals.dbFile;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (role !== "student" && role !== "faculty") {
      return res.status(400).json({ error: "Role must be student or faculty" });
    }

    const users = await readUsers(dbFile);
    
    // Check duplicates
    if (users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const dbFile = req.app.locals.dbFile;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const MOCK_FACULTY = [
      { id: "f1", name: "Dr. Kamesh R", role: "faculty", email: "kamesh.r@vitfaculty.ac.in", password: "kamesh.r", subjects: ["c1", "c2", "c4", "c_lsm"] },
      { id: "f2", name: "Dr. Meera S", role: "faculty", email: "meera.s@vitfaculty.ac.in", password: "meera.s", subjects: ["c3", "c5"] },
      { id: "f3", name: "Dr. Ravi Kumar", role: "faculty", email: "ravi.k@vitfaculty.ac.in", password: "ravi.k", subjects: [] }
    ];

    const mockUser = MOCK_FACULTY.find(u => u.email === email.toLowerCase());

    if (mockUser) {
      if (password !== mockUser.password) {
        return res.status(400).json({ error: "Invalid password" });
      }
      return res.json({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          name: mockUser.name,
          subjects: mockUser.subjects
        }
      });
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
        subjects: user.subjects,
      }
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
