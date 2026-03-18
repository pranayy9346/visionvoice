function getConfidenceMeta(confidence) {
  const percentage = Math.max(0, Math.min(100, Math.round((confidence || 0) * 100)));

  if (percentage > 80) {
    return {
      percentage,
      label: "High confidence",
      barClass: "bg-emerald-500",
      textClass: "text-emerald-300",
    };
  }

  if (percentage >= 50) {
    return {
      percentage,
      label: "Moderate confidence",
      barClass: "bg-amber-400",
      textClass: "text-amber-300",
    };
  }

  return {
    percentage,
    label: "Low confidence",
    barClass: "bg-red-400",
    textClass: "text-red-300",
  };
}

export default function PipelineResult({
  transcript,
  responseText,
  confidence,
  usedImage,
  source,
  reason,
  errorMessage,
  showTimeout,
}) {
  const confidenceMeta = getConfidenceMeta(confidence);

  return (
    <>
      <div className="pipeline-output">
        <p>
          <strong>You:</strong> {transcript || "Tap the mic and ask your question."}
        </p>
        <p>
          <strong>Assistant:</strong>{" "}
          {responseText || "I will respond after listening and analyzing the scene."}
        </p>

        {responseText && (
          <div className="mt-3 rounded-lg border border-slate-600/70 bg-slate-900/55 p-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-300">Confidence</span>
              <span className="font-semibold text-slate-100">{confidenceMeta.percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-700/80">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${confidenceMeta.barClass}`}
                style={{ width: `${confidenceMeta.percentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={`font-medium ${confidenceMeta.textClass}`}>{confidenceMeta.label}</span>
              <span className="text-slate-300">
                {source === "image" || usedImage ? "Used live image" : "Used memory"}
              </span>
            </div>
            {reason && <p className="mt-2 text-xs text-slate-400">{reason}</p>}
          </div>
        )}
      </div>

      {showTimeout && (
        <div className="pipeline-error" role="alert">
          Session ended due to inactivity. Tap the button to restart.
        </div>
      )}

      {errorMessage && (
        <div className="pipeline-error" role="alert">
          {errorMessage}
        </div>
      )}
    </>
  )
}
