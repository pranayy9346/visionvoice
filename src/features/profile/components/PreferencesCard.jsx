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

      {preferences?.ttsVoiceMode === 'custom' && (
        <div>
          <label htmlFor="profile-ttsCustomVoiceId" className="text-sm text-slate-400">
            Custom Voice ID (Clone)
          </label>
          <input
            id="profile-ttsCustomVoiceId"
            type="text"
            value={preferences?.ttsCustomVoiceId || ''}
            onChange={(event) => onChange('ttsCustomVoiceId', event.target.value)}
            placeholder="Enter your Murf cloned voice ID"
            className="mt-2 block w-full rounded-lg border border-slate-300/20 bg-slate-900/60 px-3 py-2 text-slate-100 transition focus:border-cyan-400 focus:outline-none"
          />
          <p className="mt-1 text-xs text-slate-400">
            Use your Murf cloned voice ID so assistant replies in that voice.
          </p>
        </div>
      )}

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
