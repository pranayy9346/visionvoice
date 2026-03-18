import mongoose from "mongoose";

const personalObjectSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    signature: { type: String, required: true },
    embedding: { type: [Number], required: true, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

personalObjectSchema.index({ userId: 1, name: 1 }, { unique: true });

const PersonalObject = mongoose.model("PersonalObject", personalObjectSchema);

export default PersonalObject;
