import mongoose from "mongoose";

const knownPersonSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    embeddings: {
      type: [[Number]],
      required: true,
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

knownPersonSchema.index({ userId: 1, name: 1 }, { unique: true });

const KnownPerson = mongoose.model("KnownPerson", knownPersonSchema);

export default KnownPerson;
