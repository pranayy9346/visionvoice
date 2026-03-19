import ToggleRow from './ToggleRow'

export default function AccessibilityModalContent({ settingsUi, onToggle }) {
  return (
    <div className="space-y-3">
      <ToggleRow
        label="Voice guidance"
        value={settingsUi.voiceGuidance}
        onToggle={() => onToggle('voiceGuidance')}
      />
      <ToggleRow
        label="High contrast mode"
        value={settingsUi.highContrast}
        onToggle={() => onToggle('highContrast')}
      />
      <ToggleRow
        label="Large text mode"
        value={settingsUi.largeText}
        onToggle={() => onToggle('largeText')}
      />
    </div>
  )
}
