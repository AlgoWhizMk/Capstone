// backend/routes/users.js
import express from "express";
import User    from "../models/User.js";

const router = express.Router();

// ── GET /api/users — fetch all users (admin) ─────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/users/:firebaseUid — fetch user profile ─────────────────────────
router.get("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/users — create or update user (called after Firebase login) ────
router.post("/", async (req, res) => {
  try {
    const { firebaseUid, name, email, company, phone, photoURL } = req.body;

    // Auto-assign role: if email matches admin list → admin, else user
    // Never downgrade an existing admin via this endpoint
    const adminEmails = (process.env.ADMIN_EMAIL || "")
      .split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
    const isAdminEmail = adminEmails.includes((email || "").toLowerCase());

    // Check existing role first so we don't downgrade manually-set admins
    const existing = await User.findOne({ firebaseUid });
    const resolvedRole = isAdminEmail
      ? "admin"
      : (existing?.role === "admin" ? "admin" : "user");

    const user = await User.findOneAndUpdate(
      { firebaseUid },
      { firebaseUid, name, email, role: resolvedRole, company, phone, photoURL },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/users/:firebaseUid — update profile fields ──────────────────────
router.put("/:firebaseUid", async (req, res) => {
  try {
    const allowed = ["name", "phone", "company", "address", "photoURL", "role"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.params.firebaseUid },
      { $set: updates },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── DELETE /api/users/:firebaseUid — delete a user (admin only) ──────────────
router.delete("/:firebaseUid", async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ firebaseUid: req.params.firebaseUid });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;