export default function VoiceAssistantControls({
  state,
  disabled,
  onTap,
  canReplay,
  isPlaying,
  onReplay,
  onStop,
  buttonLabel,
}) {
  const label = buttonLabel ||
    (state === "listening"
      ? "Listening..."
      : state === "processing"
        ? "Thinking..."
        : state === "speaking"
          ? "Speaking..."
          : state === "timeout"
            ? "Session ended"
        : "Tap to Speak");

  return (
    <div className="pipeline-actions">
      <div className={`voice-control-wrap ${state}`}>
        <button
          type="button"
          className={`voice-mic-btn ${state}`}
          onClick={onTap}
          disabled={disabled}
          aria-label={label}
        >
          <span className="voice-mic-icon">🎤</span>
        </button>
        {state === "listening" && <span className="voice-ring" aria-hidden="true" />}
        <p className="voice-state-label">{label}</p>
      </div>

      <button
        type="button"
        className="secondary-btn"
        onClick={onReplay}
        disabled={!canReplay || state === "processing" || state === "listening"}
      >
        Replay Audio
      </button>

      <button
        type="button"
        className="secondary-btn"
        onClick={onStop}
        disabled={!isPlaying}
      >
        Stop Audio
      </button>
    </div>
  )
}
