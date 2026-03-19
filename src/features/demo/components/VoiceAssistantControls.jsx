function resolveStateLabel(state) {
  if (state === 'listening') return 'Listening...'
  if (state === 'analyzing-image') return 'Analyzing image...'
  if (state === 'processing') return 'Processing...'
  if (state === 'speaking') return 'Speaking...'
  if (state === 'timeout') return 'Session timed out'
  return 'Tap to Speak'
}

export default function VoiceAssistantControls({
  state,
  disabled,
  onTap,
  canReplay,
  isPlaying,
  onReplay,
  onStop,
  onReset,
  buttonLabel,
}) {
  const stateLabel = resolveStateLabel(state)
  const buttonClass =
    state === 'listening'
      ? 'voice-mic-btn listening'
      : state === 'processing'
        ? 'voice-mic-btn processing'
        : 'voice-mic-btn idle'

  return (
    <section className="pipeline-actions" aria-label="Voice assistant controls">
      <div className={`voice-control-wrap ${state}`}>
        <button
          type="button"
          className={buttonClass}
          onClick={onTap}
          disabled={disabled}
          aria-label={buttonLabel || 'Tap to speak'}
        >
          <span className="voice-mic-icon">🎤</span>
          {state === 'listening' && <span className="voice-ring" aria-hidden="true" />}
        </button>
        <p className="voice-state-label">{buttonLabel || stateLabel}</p>
      </div>

      <button
        type="button"
        className="secondary-btn"
        onClick={onReplay}
        disabled={!canReplay}
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

      <button
        type="button"
        className="secondary-btn"
        onClick={onReset}
      >
        Reset
      </button>
    </section>
  )
}
