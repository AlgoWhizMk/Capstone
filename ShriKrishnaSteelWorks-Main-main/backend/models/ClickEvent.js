// backend/models/ClickEvent.js
import mongoose from "mongoose";

const clickEventSchema = new mongoose.Schema(
  {
    path:      { type: String, default: "/" },
    tagName:   { type: String, default: "DIV" },
    id:        { type: String, default: "" },
    className: { type: String, default: "" },
    user:      { type: String, default: "Anonymous" },  // email or "Anonymous"
    sessionId: { type: String, default: "" },
  },
  { timestamps: true }   // createdAt = the click timestamp
);

// Auto-expire documents after 30 days
clickEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 3600 });

export default mongoose.model("ClickEvent", clickEventSchema);
