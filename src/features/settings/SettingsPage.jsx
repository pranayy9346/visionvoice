import { useClerk } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import SettingsCard from './components/SettingsCard'
import SettingsModal from './components/SettingsModal'
import useSettingsState from './hooks/useSettingsState'
import { getSettingsCards } from './settingsCards'
import PersonalizationFaceManager from './components/PersonalizationFaceManager'
import AccountModalContent from './components/AccountModalContent'
import HistoryModalContent from './components/HistoryModalContent'
import AccessibilityModalContent from './components/AccessibilityModalContent'
import NotificationsModalContent from './components/NotificationsModalContent'
import PrivacyModalContent from './components/PrivacyModalContent'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { signOut } = useClerk()
  const { user } = useAuth()
  const {
    activeModal,
    setActiveModal,
    settingsUi,
    historyCount,
    toggleSetting,
    clearHistory,
    deleteUserData,
  } = useSettingsState()

  const cards = getSettingsCards({ setActiveModal })

  return (
    <section className="w-full max-w-5xl" aria-label="Settings dashboard page">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-semibold text-slate-100 sm:text-4xl">Settings</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-400">
          Configure your VisionVoice experience from one clean dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <SettingsCard
            key={card.id}
            icon={card.icon}
            title={card.title}
            description={card.description}
            onClick={card.onClick}
          />
        ))}
      </div>

      {activeModal === 'account' && (
        <SettingsModal title="Account" onClose={() => setActiveModal('')}>
          <AccountModalContent
            user={user}
            onManageAccount={() => {
              setActiveModal('')
              navigate('/profile')
            }}
            onLogout={() => signOut({ redirectUrl: '/' })}
          />
        </SettingsModal>
      )}

      {activeModal === 'personalization' && (
        <SettingsModal title="Personalization" onClose={() => setActiveModal('')}>
          <PersonalizationFaceManager onClose={() => setActiveModal('')} />
        </SettingsModal>
      )}

      {activeModal === 'history' && (
        <SettingsModal title="History" onClose={() => setActiveModal('')}>
          <HistoryModalContent
            historyCount={historyCount}
            onViewHistory={() => {
              setActiveModal('')
              navigate('/history')
            }}
            onClearHistory={clearHistory}
          />
        </SettingsModal>
      )}

      {activeModal === 'accessibility' && (
        <SettingsModal title="Accessibility" onClose={() => setActiveModal('')}>
          <AccessibilityModalContent settingsUi={settingsUi} onToggle={toggleSetting} />
        </SettingsModal>
      )}

      {activeModal === 'notifications' && (
        <SettingsModal title="Notifications" onClose={() => setActiveModal('')}>
          <NotificationsModalContent
            enabled={settingsUi.notifications}
            onToggle={() => toggleSetting('notifications')}
          />
        </SettingsModal>
      )}

      {activeModal === 'privacy' && (
        <SettingsModal title="Privacy & Data" onClose={() => setActiveModal('')}>
          <PrivacyModalContent onDeleteUserData={deleteUserData} />
        </SettingsModal>
      )}
    </section>
  )
}
