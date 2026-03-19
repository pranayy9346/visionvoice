import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_PREFERENCES,
  getUserProfile,
  updateUserProfile,
} from "../../../services/apiService";

export const PROFILE_OPTIONS = {
  responseStyle: ["short", "detailed"],
  languageLevel: ["simple", "moderate"],
  safetySensitivity: ["high", "normal"],
  voiceSpeed: ["slow", "normal", "fast"],
};

export function prettifyLabel(value) {
  if (!value) {
    return "";
  }

  const normalized = value.replace(/([A-Z])/g, " $1");
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function useProfilePreferences() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profile = await getUserProfile();
        if (mounted) {
          setPreferences(profile.preferences);
          setMessage("");
        }
      } catch {
        if (mounted) {
          setMessage("Could not load profile. Using defaults.");
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((key, value) => {
    setPreferences((previous) => ({ ...previous, [key]: value }));
  }, []);

  const savePreferences = useCallback(async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const updated = await updateUserProfile(preferences);
      setPreferences(updated.preferences);
      setMessage("Settings saved successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  }, [preferences]);

  return {
    preferences,
    isSaving,
    message,
    setPreference,
    savePreferences,
  };
}
