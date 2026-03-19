import { useState } from 'react'

const DEMO_VIDEO_URL = 'https://ik.imagekit.io/52ma4jncuz/VELORAanimation1.mp4'

export default function VideoSection() {
  const [videoFailed, setVideoFailed] = useState(false)

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-14 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/15 bg-slate-900/60 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-sm">
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
          <video
            className="block aspect-video w-full object-cover"
            src={DEMO_VIDEO_URL}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            controls
            onError={() => setVideoFailed(true)}
            aria-label="VisionVoice demonstration video"
          />
        )}
      </div>
    </section>
  )
}
