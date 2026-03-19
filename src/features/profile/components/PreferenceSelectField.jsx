import { prettifyLabel } from '../hooks/useProfilePreferences'

export default function PreferenceSelectField({ fieldKey, value, options, onChange }) {
  return (
    <div>
      <label htmlFor={`profile-${fieldKey}`} className="text-sm text-slate-400">
        {prettifyLabel(fieldKey)}
      </label>
      <select
        id={`profile-${fieldKey}`}
        value={value || ''}
        onChange={(event) => onChange(fieldKey, event.target.value)}
        className="mt-2 block w-full rounded-lg border border-slate-300/20 bg-slate-900/60 px-3 py-2 text-slate-100 transition focus:border-cyan-400 focus:outline-none"
      >
        {options.map((optionValue) => (
          <option key={optionValue} value={optionValue}>
            {prettifyLabel(optionValue)}
          </option>
        ))}
      </select>
    </div>
  )
}
