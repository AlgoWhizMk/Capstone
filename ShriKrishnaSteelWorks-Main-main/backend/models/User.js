// backend/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true }, // links to Firebase Auth
    name:        { type: String, required: true },
    email:       { type: String, required: true, unique: true },
    role:        { type: String, enum: ["user", "admin"], default: "user" },
    company:     { type: String, default: "" },
    phone:       { type: String, default: "" },
    address:     {
      street:  { type: String, default: "" },
      city:    { type: String, default: "" },
      state:   { type: String, default: "" },
      pincode: { type: String, default: "" },
    },
    photoURL:    { type: String, default: "" },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

export default mongoose.model("User", userSchema);