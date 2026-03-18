export default function OnboardingHeader() {
  const hashPath = window.location.hash.replace(/^#/, "") || "/";
  const resolvedPath = hashPath !== "/" ? hashPath : window.location.pathname;
  const isSettingsPage = resolvedPath === "/settings";

  const handleOpenSettings = () => {
    if (isSettingsPage) {
      window.location.assign("/#/demo");
      return;
    }

    window.location.assign("/#/settings");
  };

  return (
    <header className="navbar" aria-label="App header">
      <div className="brand">
        <span className="brand-logo" aria-hidden="true">
          V
        </span>
        <span className="brand-name">VisionVoice AI</span>
      </div>

      <button
        type="button"
        className="profile-btn"
        onClick={handleOpenSettings}
        aria-label={isSettingsPage ? "Back to demo" : "Open settings"}
      >
        {isSettingsPage ? "←" : "👤"}
      </button>
    </header>
  )
}
