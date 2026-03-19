import CameraPanel from '../../faceRecognition/components/CameraPanel'

export default function PipelineMediaCards({
  videoRef,
  isActive,
  permissionState,
  capturedImage,
  cameraNotice,
  faceDetectionLabel,
  isDetectingFace,
  statusText,
}) {
  return (
    <section className="pipeline-grid" aria-label="Live media panel">
      <article className="pipeline-card" aria-label="Live camera">
        <h3>Live Camera</h3>
        {cameraNotice ? <p className="mb-2 text-xs text-slate-300">{cameraNotice}</p> : null}
        <div className="pipeline-media-frame">
          <CameraPanel
            videoRef={videoRef}
            label={faceDetectionLabel || 'No face detected'}
            isDetecting={isDetectingFace}
          />
          {!isActive && (
            <div className="pipeline-overlay">
              <p>
                {permissionState === 'denied'
                  ? 'Camera permission denied'
                  : 'Waiting for camera access...'}
              </p>
            </div>
          )}
        </div>
      </article>

      <article className="pipeline-card" aria-label="Captured frame">
        <h3>Latest Capture</h3>
        <div className="pipeline-media-frame">
          {capturedImage ? (
            <img className="pipeline-media" src={capturedImage} alt="Captured scene" />
          ) : (
            <div className="pipeline-overlay">
              <p>No image captured yet.</p>
            </div>
          )}
        </div>
        <p className="pipeline-meta">Status: {statusText}</p>
      </article>
    </section>
  )
}
