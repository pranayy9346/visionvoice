import { useEffect, useState } from "react";
import { DEFAULT_PREFERENCES, getUserProfile, updateUserProfile } from "../services/apiService";
import OnboardingHeader from "./OnboardingHeader";
import ObjectList from "./ObjectList";
import ObjectUpload from "./ObjectUpload";
import {
  deletePersonalObject,
  listPersonalObjects,
  savePersonalObject,
} from "../services/apiService";

const OPTIONS = {
  responseStyle: ["short", "detailed"],
  languageLevel: ["simple", "moderate"],
  safetySensitivity: ["high", "normal"],
  voiceSpeed: ["slow", "normal", "fast"],
};

function prettify(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SettingsPage() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [objects, setObjects] = useState([]);
  const [isObjectsLoading, setIsObjectsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const profile = await getUserProfile();
        if (mounted) {
          setPreferences(profile.preferences);
        }
      } catch {
        if (mounted) {
          setMessage("Could not load profile. Using defaults.");
        }
      }
    };

    load();

    const loadObjects = async () => {
      try {
        const items = await listPersonalObjects();
        if (mounted) {
          setObjects(items);
        }
      } catch {
        if (mounted) {
          setObjects([]);
        }
      } finally {
        if (mounted) {
          setIsObjectsLoading(false);
        }
      }
    };

    loadObjects();

    return () => {
      mounted = false;
    };
  }, []);

  const onChange = (key, value) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setIsSaving(true);
    setMessage("");

    try {
      const updated = await updateUserProfile(preferences);
      setPreferences(updated.preferences);
      setMessage("Settings saved.");
    } catch (error) {
      setMessage(error?.message || "Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    window.location.assign("/demo");
  };

  const handleSaveObject = async ({ name, image }) => {
    const saved = await savePersonalObject(name, image);
    const items = await listPersonalObjects();
    setObjects(items);
    return saved;
  };

  const handleDeleteObject = async (id) => {
    if (!id) return;
    const selected = objects.find((item) => item.id === id);
    const confirmed = window.confirm(
      `Delete${selected?.name ? ` "${selected.name}"` : ""}?`,
    );
    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    try {
      await deletePersonalObject(id);
      const items = await listPersonalObjects();
      setObjects(items);
    } catch (error) {
      setMessage(error?.message || "Failed to delete object.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="onboarding-app">
      <div className="onboarding-layout">
        <OnboardingHeader />

        <section className="onboarding-card" aria-label="Settings page">
          <section className="settings-section">
            <h2>Personal Objects</h2>
            <div className="settings-content">
              <p className="tech-description">
                Upload objects you often use so the assistant can recognize them faster.
              </p>

              <ObjectUpload onSave={handleSaveObject} />
              <ObjectList
                items={objects}
                isLoading={isObjectsLoading}
                onDelete={handleDeleteObject}
                deletingId={deletingId}
              />
            </div>
          </section>

          <section className="settings-section">
            <h2>Assistant Settings</h2>
            <div className="settings-content">
              <p className="tech-description">Customize how VisionVoice responds to you.</p>

              <div className="settings-grid">
                {Object.keys(OPTIONS).map((key) => (
                  <label key={key} className="settings-field">
                    <span>{prettify(key.replace(/([A-Z])/g, " $1"))}</span>
                    <select
                      value={preferences[key]}
                      onChange={(event) => onChange(key, event.target.value)}
                    >
                      {OPTIONS[key].map((value) => (
                        <option key={value} value={value}>
                          {prettify(value)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>

              <div className="settings-actions">
                <button
                  type="button"
                  className="primary-btn settings-primary-btn"
                  onClick={onSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Settings"}
                </button>
                <button
                  type="button"
                  className="secondary-btn settings-secondary-btn"
                  onClick={handleBack}
                >
                  Back to Demo
                </button>
              </div>

              {message && <p className="settings-message">{message}</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
