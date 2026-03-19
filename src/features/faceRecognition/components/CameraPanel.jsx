import { useEffect } from 'react'

export default function CameraPanel({
  videoRef,
  label,
  isDetecting,
  error,
  onStart,
  onStop,
}) {
  useEffect(() => {
    onStart?.()
    return () => {
      onStop?.()
    }
  }, [onStart, onStop])

  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-500/30 bg-slate-900/60">
      <video ref={videoRef} className="block aspect-video w-full object-cover" autoPlay muted playsInline />
      <div className="absolute left-3 top-3 rounded-md bg-slate-950/75 px-3 py-1 text-xs text-slate-100">
        {isDetecting ? label : 'Detecting...'}
      </div>
      {error && (
        <div className="absolute bottom-3 left-3 rounded-md bg-rose-900/75 px-3 py-1 text-xs text-rose-100">
          {error}
        </div>
      )}
    </section>
  )
}
