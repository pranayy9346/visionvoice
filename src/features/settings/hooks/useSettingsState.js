import { useCallback, useEffect, useState } from "react";
import {
  clearInteractionHistory,
  getInteractionHistory,
} from "../../../services/apiService";

const SETTINGS_UI_KEY = "visionvoice-settings-ui";
const USER_ID_KEY = "visionvoice-user-id";

const DEFAULT_SETTINGS_UI = {
  voiceGuidance: true,
  highContrast: false,
  largeText: false,
  notifications: true,
};

function readJson(key, fallback) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export default function useSettingsState() {
  const [activeModal, setActiveModal] = useState("");
  const [settingsUi, setSettingsUi] = useState(() =>
    readJson(SETTINGS_UI_KEY, DEFAULT_SETTINGS_UI),
  );
  const [historyCount, setHistoryCount] = useState(0);

  const refreshHistoryCount = useCallback(async () => {
    try {
      const entries = await getInteractionHistory();
      setHistoryCount(Array.isArray(entries) ? entries.length : 0);
    } catch {
      setHistoryCount(0);
    }
  }, []);

  const updateSettingsUi = useCallback((next) => {
    setSettingsUi(next);
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(SETTINGS_UI_KEY, JSON.stringify(next));
    } catch {
      // Keep UI responsive if storage write fails.
    }
  }, []);

  const toggleSetting = useCallback(
    (key) => {
      updateSettingsUi({
        ...settingsUi,
        [key]: !settingsUi[key],
      });
    },
    [settingsUi, updateSettingsUi],
  );

  const clearHistory = useCallback(async () => {
    await clearInteractionHistory();
    setHistoryCount(0);
  }, [refreshHistoryCount]);

  const deleteUserData = useCallback(async () => {
    await clearInteractionHistory();

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(SETTINGS_UI_KEY);
      window.localStorage.removeItem(USER_ID_KEY);
    }

    setSettingsUi(DEFAULT_SETTINGS_UI);
    setHistoryCount(0);
  }, []);

  useEffect(() => {
    if (activeModal === "history") {
      refreshHistoryCount().catch(() => {
        // Ignore modal refresh errors and keep UI responsive.
      });
    }
  }, [activeModal, refreshHistoryCount]);

  return {
    activeModal,
    setActiveModal,
    settingsUi,
    historyCount,
    toggleSetting,
    clearHistory,
    deleteUserData,
  };
}
