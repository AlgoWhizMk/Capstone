// backend/routes/orders.js
import express from "express";
import Order   from "../models/Order.js";

const router = express.Router();

// ── GET /api/orders — get all orders ─────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── GET /api/orders/:firebaseUid — get all orders for a user ─────────────────
router.get("/:firebaseUid", async (req, res) => {
  try {
    const orders = await Order.find({ firebaseUid: req.params.firebaseUid })
      .sort({ createdAt: -1 }); // newest first
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── POST /api/orders — create a new order (admin use) ────────────────────────
router.post("/", async (req, res) => {
  try {
    const { firebaseUid, product, quantity, amount, status, deliveryAddress, notes } = req.body;

    // auto-generate order ID: SKW-YYYY-XXXX
    const count   = await Order.countDocuments();
    const orderId = `SKW-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const order = await Order.create({
      orderId, firebaseUid, product, quantity, amount,
      status: status || "Pending", deliveryAddress, notes,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── PUT /api/orders/:orderId/status — update order status ────────────────────
router.put("/:orderId/status", async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;