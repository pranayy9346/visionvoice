function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function canAnswerFromCache(scene, imageAge = 0) {
  const ageMinutes = Math.max(0, Math.round((Number(imageAge) || 0) / 60));
  const hasSceneSignal =
    Boolean(scene?.summary) ||
    (scene?.objects || []).length > 0 ||
    (scene?.hazards || []).length > 0 ||
    (scene?.text || []).length > 0;

  if (!hasSceneSignal) {
    return {
      canUseCache: false,
      forceNewImage: true,
      confidence: 0.1,
      reason: "No usable scene memory found.",
    };
  }

  const freshnessTrust = clamp(1 - ageMinutes / 30, 0.2, 1);

  if (freshnessTrust < 0.35) {
    return {
      canUseCache: false,
      forceNewImage: true,
      confidence: Number((freshnessTrust * 0.6).toFixed(2)),
      reason: `Scene memory is stale (${ageMinutes} min old).`,
    };
  }

  return {
    canUseCache: true,
    forceNewImage: false,
    confidence: Number(
      clamp(0.55 * freshnessTrust + 0.25, 0.35, 0.9).toFixed(2),
    ),
    reason: `Scene cache is fresh enough for adaptive model decision (${ageMinutes} min old).`,
  };
}
