export default function PipelineMediaCards({
  videoRef,
  isActive,
  permissionState,
  capturedImage,
  resultImageUrl,
  statusText,
}) {
  return (
    <div className="pipeline-grid">
      <article className="pipeline-card">
        <h3>Live Camera</h3>
        <div className="pipeline-media-frame">
          <video ref={videoRef} className="pipeline-media" autoPlay muted playsInline />
          {!isActive && <span className="pipeline-overlay">Camera not active</span>}
        </div>
        <p className="pipeline-meta">Permission: {permissionState}</p>
      </article>

      <article className="pipeline-card">
        <h3>Captured / Stored Image</h3>
        <div className="pipeline-media-frame">
          {resultImageUrl || capturedImage ? (
            <img
              src={resultImageUrl || capturedImage}
              alt="Captured scene"
              className="pipeline-media"
            />
          ) : (
            <span className="pipeline-overlay">Capture preview will appear here</span>
          )}
        </div>
        <p className="pipeline-meta">Status: {statusText}</p>
      </article>
    </div>
  )
}
