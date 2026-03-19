import { useEffect, useMemo, useState } from 'react'

export default function AddPersonForm({ isBusy, onSubmit }) {
  const [name, setName] = useState('')
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')

  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  )

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [previews])

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles((previous) => {
      const merged = [...previous]

      selectedFiles.forEach((file) => {
        const exists = merged.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        )

        if (!exists && merged.length < 5) {
          merged.push(file)
        }
      })

      return merged
    })

    // Let users pick the same file again if they removed/reselected it.
    event.target.value = ''
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    if (files.length < 1) {
      setError('Upload at least 1 image (up to 5).')
      return
    }

    try {
      await onSubmit({ name: name.trim(), files })
      setName('')
      setFiles([])
      setError('')
    } catch (submitError) {
      setError(submitError?.message || 'Failed to add person.')
    }
  }

  const removeFile = (fileToRemove) => {
    setFiles((previous) =>
      previous.filter(
        (file) =>
          !(
            file.name === fileToRemove.name &&
            file.size === fileToRemove.size &&
            file.lastModified === fileToRemove.lastModified
          ),
      ),
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="person-name" className="block text-sm text-slate-300">Person name</label>
        <input
          id="person-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-500/40 bg-slate-900/70 px-3 py-2 text-slate-100 focus:border-cyan-300 focus:outline-none"
          placeholder="Mom, Dad, John..."
        />
      </div>

      <div>
        <label htmlFor="person-images" className="block text-sm text-slate-300">Upload 1-5 images</label>
        <input
          id="person-images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="mt-2 block w-full text-sm text-slate-200"
        />
        <p className="mt-1 text-xs text-slate-400">
          Selected: {files.length}/5 (you can add images in multiple steps)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview) => (
            <div key={preview.url} className="relative">
              <img
                src={preview.url}
                alt={preview.name}
                className="h-20 w-full rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(preview.file)}
                className="absolute right-1 top-1 rounded-full bg-slate-950/80 px-2 py-0.5 text-xs text-slate-100 hover:bg-rose-700/90"
                aria-label={`Remove ${preview.name}`}
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <button
        type="submit"
        disabled={isBusy}
        className="rounded-lg border border-cyan-300/50 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/20 disabled:opacity-60"
      >
        {isBusy ? 'Processing faces...' : 'Add Person'}
      </button>
    </form>
  )
}
