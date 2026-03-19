import Analysis from "./analysis.model.js";

export async function createAnalysisRecord(payload) {
  return Analysis.create(payload);
}

export async function getRecentAnalysesByUser(userId, limit = 10) {
  return Analysis.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
}

export async function getHistoryByUser(userId, limit = 10) {
  return Analysis.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select({
      _id: 0,
      imageUrl: 1,
      query: 1,
      description: 1,
      confidence: 1,
      source: 1,
      scene: 1,
      createdAt: 1,
    })
    .lean();
}

export async function clearHistoryByUser(userId) {
  const result = await Analysis.deleteMany({ userId });
  return { deletedCount: result.deletedCount || 0 };
}
