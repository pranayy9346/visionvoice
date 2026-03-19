import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../utils/constants'

export default function AppHeader({ showSettingsToggle = true, rightContent = null }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSettingsPage = location.pathname === ROUTES.settings

  const handleOpenSettings = () => {
    navigate(isSettingsPage ? ROUTES.demo : ROUTES.settings)
  }

  return (
    <header className="navbar" aria-label="App header">
      <div className="brand">
        <span className="brand-logo" aria-hidden="true">
          V
        </span>
        <span className="brand-name">VisionVoice AI</span>
      </div>

      <div className="header-actions">
        {rightContent}
        {showSettingsToggle && (
          <button
            type="button"
            className="profile-btn"
            onClick={handleOpenSettings}
            aria-label={isSettingsPage ? 'Back to demo' : 'Open settings'}
          >
            {isSettingsPage ? '←' : '⚙'}
          </button>
        )}
      </div>
    </header>
  )
}
