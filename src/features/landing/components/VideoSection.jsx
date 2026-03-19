import { useEffect, useRef, useState } from 'react'

const DEMO_VIDEO_URL = 'https://ik.imagekit.io/52ma4jncuz/VELORAanimation1.mp4'

export default function VideoSection() {
  const [videoFailed, setVideoFailed] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    if (!videoRef.current) {
      return
    }

    videoRef.current.muted = false
    videoRef.current
      .play()
      .then(() => {
        setIsMuted(false)
      })
      .catch(() => {
        // Browser autoplay policies may still require a user gesture for sound.
      })
  }, [])

  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)

    if (videoRef.current) {
      videoRef.current.muted = nextMuted
      if (!nextMuted) {
        videoRef.current.play().catch(() => {})
      }
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-14 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/15 bg-slate-900/60 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-sm">
        {videoFailed ? (
          <div className="flex aspect-video items-center justify-center p-6 text-center text-slate-300">
            <div>
              <p className="text-base font-medium text-slate-100">Demo video is temporarily unavailable.</p>
              <a
                href={DEMO_VIDEO_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-cyan-300 underline"
              >
                Open video directly
              </a>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="block aspect-video w-full object-cover"
              src={DEMO_VIDEO_URL}
              autoPlay
              muted={isMuted}
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoFailed(true)}
              aria-label="VisionVoice demonstration video"
            />

            <button
              type="button"
              onClick={handleToggleMute}
              className="absolute bottom-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-100/30 bg-slate-900/75 text-slate-100 backdrop-blur"
              aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
            >
              {isMuted ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M19 6a9 9 0 0 1 0 12" />
                </svg>
              )}
            </button>
          </>
        )}
      </div>
    </section>
  )
}
