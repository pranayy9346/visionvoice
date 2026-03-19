import { SETTINGS_ICONS } from "./components/SettingsIcons";

export function getSettingsCards({ setActiveModal }) {
  return [
    {
      id: "personalization",
      title: "Personalization",
      description:
        "Manage AI behavior, voice speed, language, and response style.",
      icon: SETTINGS_ICONS.personalization,
      onClick: () => setActiveModal("personalization"),
    },
    {
      id: "account",
      title: "Account",
      description: "Review Clerk account details, manage profile, and logout.",
      icon: SETTINGS_ICONS.account,
      onClick: () => setActiveModal("account"),
    },
    {
      id: "history",
      title: "History",
      description:
        "View previous interactions and clear saved session history.",
      icon: SETTINGS_ICONS.history,
      onClick: () => setActiveModal("history"),
    },
    {
      id: "accessibility",
      title: "Accessibility",
      description:
        "Control voice guidance, high contrast, and large text mode.",
      icon: SETTINGS_ICONS.accessibility,
      onClick: () => setActiveModal("accessibility"),
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Toggle update alerts and interaction reminders.",
      icon: SETTINGS_ICONS.notifications,
      onClick: () => setActiveModal("notifications"),
    },
    {
      id: "privacy",
      title: "Privacy & Data",
      description: "Manage data usage and remove local user data quickly.",
      icon: SETTINGS_ICONS.privacy,
      onClick: () => setActiveModal("privacy"),
    },
  ];
}
