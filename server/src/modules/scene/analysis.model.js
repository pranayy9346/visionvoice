import mongoose from "mongoose";

const sceneSchema = new mongoose.Schema(
  {
    objects: { type: [String], default: [] },
    positions: { type: [String], default: [] },
    hazards: { type: [String], default: [] },
    text: { type: [String], default: [] },
    summary: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: "demo-user", index: true },
  imageUrl: { type: String, default: null },
  query: { type: String, required: true },
  description: { type: String, required: true },
  confidence: { type: Number, default: 0.5 },
  reason: { type: String, default: "" },
  source: {
    type: String,
    enum: ["image", "cache", "text", "fallback"],
    default: "text",
  },
  scene: { type: sceneSchema, default: null },
  createdAt: { type: Date, default: Date.now },
});

const Analysis = mongoose.model("Analysis", analysisSchema);

export default Analysis;
