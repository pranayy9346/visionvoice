import { PROFILE_OPTIONS } from '../hooks/useProfilePreferences'
import PreferenceSelectField from './PreferenceSelectField'

export default function PreferencesCard({ preferences, message, isSaving, onChange, onSave }) {
  return (
    <div className="mt-8 space-y-4 rounded-lg border border-slate-200/10 bg-slate-900/40 p-6">
      <h3 className="text-lg font-semibold text-slate-100">Assistant Preferences</h3>

      {Object.entries(PROFILE_OPTIONS).map(([key, values]) => (
        <PreferenceSelectField
          key={key}
          fieldKey={key}
          value={preferences[key]}
          options={values}
          onChange={onChange}
        />
      ))}

      {message && (
        <p className={message.includes('success') ? 'text-green-400' : 'text-red-400'}>
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="primary-btn mt-4 w-full"
      >
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  )
}
