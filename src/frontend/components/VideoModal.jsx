import { useEffect, useRef } from 'react'

export default function VideoModal({ isOpen, onClose, videoSrc }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch(() => {})
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [isOpen])

  const handleClose = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }

    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label="Demo video modal">
      <div className="video-modal-backdrop" onClick={handleClose} />
      <div className="video-modal-card">
        <button type="button" className="modal-close-btn" onClick={handleClose}>
          Close
        </button>
        <video
          ref={videoRef}
          className="modal-video"
          src={videoSrc}
          controls
          autoPlay
          playsInline
          style={{ width: '100%', maxWidth: '800px', aspectRatio: '16 / 9' }}
        />
      </div>
    </div>
  )
}
