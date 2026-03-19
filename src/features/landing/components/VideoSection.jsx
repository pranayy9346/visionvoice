const DEMO_VIDEO_URL = 'https://ik.imagekit.io/52ma4jncuz/VELORAanimation1.mp4'

export default function VideoSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pt-14 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200/15 bg-slate-900/60 shadow-[0_30px_80px_rgba(2,6,23,0.65)] backdrop-blur-sm">
        <video
          className="block aspect-video w-full object-cover"
          src={DEMO_VIDEO_URL}
          autoPlay
          loop
          playsInline
          aria-label="VisionVoice demonstration video"
        />
      </div>
    </section>
  )
}
