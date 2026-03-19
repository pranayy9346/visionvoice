import ToggleRow from './ToggleRow'

export default function NotificationsModalContent({ enabled, onToggle }) {
  return (
    <ToggleRow
      label="App alerts and updates"
      value={enabled}
      onToggle={onToggle}
    />
  )
}
