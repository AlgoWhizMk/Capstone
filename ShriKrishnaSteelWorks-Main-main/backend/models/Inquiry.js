import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    enquiryType: { type: String },
    projectType: { type: String },
    steelGrade: { type: String },
    quantity: { type: String },
    message: { type: String },
    timeline: { type: String },
    customDimensions: { type: String },
    customFinish: { type: String },
    customMaterial: { type: String },
    customNotes: { type: String },
    customizationFiles: [{ type: String }],
    firebaseUid: { type: String },
    status: { type: String, default: "Pending" }, // Pending, Reviewed, Responded
    adminNotes: { type: String },
    adminResponse: { type: String },
    referenceName: { type: String },
    referenceCategory: { type: String },
    productId: { type: String },
    projectId: { type: String },
    type: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", InquirySchema);
