// backend/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId:     { type: String, required: true, unique: true },
    firebaseUid: { type: String, required: true },
    product:     { type: String, required: true },
    quantity:    { type: String, required: true },
    amount:      { type: String, required: true },
    status: {
      type:    String,
      enum:    ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },

    // ── Customized order fields ──────────────────────────────────────────────
    isCustomized: { type: Boolean, default: false },
    customDetails: {
      specifications: { type: String, default: "" },
      materials:       { type: String, default: "" },
      designNotes:     { type: String, default: "" },
      agreedTerms:     { type: String, default: "" },
    },

    // ── Delivery ─────────────────────────────────────────────────────────────
    expectedDelivery: { type: Date },
    deliveredDate:    { type: Date },
    deliveryAddress: {
      street:  { type: String, default: "" },
      city:    { type: String, default: "" },
      state:   { type: String, default: "" },
      pincode: { type: String, default: "" },
    },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);