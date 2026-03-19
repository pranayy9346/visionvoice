export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function buildDisplayName(user, profile) {
  return (
    profile?.name || user?.fullName || user?.firstName || "VisionVoice User"
  );
}

export function buildDisplayEmail(user, profile) {
  return profile?.email || user?.primaryEmailAddress?.emailAddress || "";
}
