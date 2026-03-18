import Analysis from "../models/Analysis.js";
import { describeSceneFromBase64Image } from "../services/geminiService.js";
import { saveBase64Image } from "../utils/imageUtils.js";

export function createAnalysisController({ uploadsDir }) {
  const analyze = async (request, response) => {
    try {
      const { image } = request.body || {};

      if (!image || typeof image !== "string") {
        return response
          .status(400)
          .json({ error: "Request body must include image base64 string." });
      }

      const baseUrl = `${request.protocol}://${request.get("host")}`;
      const { imageUrl, base64Data, mimeType } = saveBase64Image({
        base64Image: image,
        uploadsDir,
        baseUrl,
      });

      let description = "";
      let analysisSource = "gemini";

      try {
        description = await describeSceneFromBase64Image({
          base64Data,
          mimeType,
        });
      } catch (geminiError) {
        analysisSource = "fallback";
        description =
          "I captured your surroundings, but live AI analysis is currently unavailable. Please continue carefully and try again in a moment.";
        console.warn(
          "Gemini analysis failed, using fallback description:",
          geminiError?.message,
        );
      }

      const saved = await Analysis.create({ imageUrl, description });

      return response.status(201).json({
        description: saved.description,
        imageUrl: saved.imageUrl,
        analysisSource,
      });
    } catch (error) {
      if (error?.message?.includes("Invalid image data format")) {
        return response.status(400).json({ error: error.message });
      }

      if (
        error?.message?.includes("Base64 image payload is missing or invalid")
      ) {
        return response.status(400).json({ error: error.message });
      }

      return response
        .status(500)
        .json({ error: error.message || "Failed to analyze image." });
    }
  };

  const history = async (_request, response) => {
    try {
      const recentHistory = await Analysis.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select({ _id: 0, imageUrl: 1, description: 1, createdAt: 1 })
        .lean();

      return response.json(recentHistory);
    } catch {
      return response.status(500).json({ error: "Failed to load history." });
    }
  };

  return { analyze, history };
}
