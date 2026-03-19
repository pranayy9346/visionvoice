import mongoose from "mongoose";

const preferencesSchema = new mongoose.Schema(
  {
    responseStyle: {
      type: String,
      enum: ["short", "detailed"],
      default: "short",
    },
    languageLevel: {
      type: String,
      enum: ["simple", "moderate"],
      default: "simple",
    },
    safetySensitivity: {
      type: String,
      enum: ["high", "normal"],
      default: "high",
    },
    voiceSpeed: {
      type: String,
      enum: ["slow", "normal", "fast"],
      default: "normal",
    },
    ttsVoiceMode: {
      type: String,
      enum: ["default", "custom"],
      default: "default",
    },
    ttsCustomVoiceId: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    useCase: { type: String, default: "" },
    onboarded: { type: Boolean, default: false },
    preferences: { type: preferencesSchema, default: () => ({}) },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

export default UserProfile;
