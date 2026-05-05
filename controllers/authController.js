import db from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ? OR username = ?";

  db.query(checkQuery, [email, username], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length > 0) {
      return res.status(400).json({
        message: "Username or Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(insertQuery, [username, email, hashedPassword], (err) => {
      if (err) return res.status(500).json({ message: "Insert error" });

      res.status(201).json({ message: "User registered successfully" });
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });
  });
};

export const forgotPassword = (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(20).toString("hex");

  db.query(
    "UPDATE users SET reset_token = ? WHERE email = ?",
    [token, email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log("Reset token (send via email):", token);

      res.json({
        message: "Reset token generated (check email)",
        resetToken: token
      });
    }
  );
};

export const resetPassword = async (req, res) => {
  const { email, token, newPassword } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND reset_token = ?",
    [email, token],
    async (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(400).json({ message: "Invalid token or email" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE users SET password = ?, reset_token = NULL WHERE email = ?",
        [hashedPassword, email],
        (err) => {
          if (err) return res.status(500).json({ message: "DB error" });

          res.json({ message: "Password reset successful" });
        }
      );
    }
  );
};