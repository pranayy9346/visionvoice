import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddPersonForm from '../../faceRecognition/components/AddPersonForm'
import PersonList from '../../faceRecognition/components/PersonList'
import useFaceRecognition from '../../faceRecognition/hooks/useFaceRecognition'

export default function PersonalizationFaceManager({ onClose }) {
  const navigate = useNavigate()
  const [formMessage, setFormMessage] = useState('')
  const {
    persons,
    isModelLoading,
    error,
    upsertPerson,
    removePerson,
    clearPersons,
  } = useFaceRecognition()

  const handleSubmit = async ({ name, files }) => {
    setFormMessage('')
    await upsertPerson({ name, files })
    setFormMessage(`${name} was added successfully.`)
  }

  return (
    <div className="space-y-5 text-sm text-slate-300">
      <p>
        Register known people with 1-5 photos each. Face recognition runs fully on-device using
        local models.
      </p>

      <AddPersonForm isBusy={isModelLoading} onSubmit={handleSubmit} />

      {formMessage && <p className="text-emerald-300">{formMessage}</p>}
      {error && <p className="text-rose-300">{error}</p>}

      <PersonList persons={persons} onRemove={removePerson} onClear={clearPersons} />

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={() => {
            onClose()
            navigate('/profile')
          }}
          className="rounded-xl border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/20"
        >
          Manage AI Preferences
        </button>
      </div>
    </div>
  )
}
