import { useEffect } from 'react'
import useCamera from './hooks/useCamera'
import usePipeline from './hooks/usePipeline'
import PipelineMediaCards from './components/PipelineMediaCards'
import PipelineResult from './components/PipelineResult'
import VoiceAssistantControls from './components/VoiceAssistantControls'
import useFaceRecognition from '../faceRecognition/hooks/useFaceRecognition'

export default function PipelineDemo({
  voiceSpeed = 'normal',
  ttsVoiceMode = 'default',
  ttsCustomVoiceId = '',
}) {
  const {
    videoRef,
    error: cameraError,
    cameraNotice,
    permissionState,
    isStarting,
    isActive,
    startCamera,
    captureImage,
    clearCapturedImage,
  } = useCamera()

  const {
    detectedName,
    detectionLabel,
    isDetecting,
    startRecognition,
    stopRecognition,
  } = useFaceRecognition({ videoRef })

  const {
    isListening,
    isProcessing,
    isAnalyzingImage,
    isAudioLoading,
    isPlaying,
    isLidarAvailable,
    isCheckingLidar,
    capturedImage,
    transcript,
    response,
    resultMeta,
    errorMessage,
    startListening,
    replayAudio,
    stopAudio,
    resetPipeline,
  } = usePipeline({
    captureImage,
    clearCapturedImage,
    voiceSpeed,
    ttsVoiceMode,
    ttsCustomVoiceId,
    detectedName,
  })

  useEffect(() => {
    const initializeCamera = async () => {
      await startCamera()
    }

    initializeCamera()
  }, [startCamera])

  useEffect(() => {
    if (isActive) {
      startRecognition()
    } else {
      stopRecognition()
    }

    return () => {
      stopRecognition()
    }
  }, [isActive, startRecognition, stopRecognition])

  const displayState =
    isListening
      ? 'listening'
      : isAnalyzingImage && resultMeta.usedImage
        ? 'analyzing-image'
        : isProcessing || isAudioLoading
        ? 'processing'
        : isPlaying
          ? 'speaking'
          : 'idle'

  return (
    <section className="pipeline-demo" id="demo-section" aria-label="Live pipeline demo">
      <h3>Live Demo Pipeline</h3>
      <p className="tech-description">
        Listen + Capture (parallel) → Process → Speak
      </p>

      <PipelineMediaCards
        videoRef={videoRef}
        isActive={isActive}
        permissionState={permissionState}
        capturedImage={capturedImage}
        cameraNotice={cameraNotice}
        faceDetectionLabel={detectionLabel}
        isDetectingFace={isDetecting}
        statusText={
          displayState === 'analyzing-image'
            ? 'Analyzing image...'
            : displayState === 'listening'
              ? 'Listening...'
              : displayState === 'processing'
                ? 'Processing...'
                : displayState === 'speaking'
                  ? 'Speaking...'
                  : 'Live'
        }
      />

      <VoiceAssistantControls
        state={displayState}
        disabled={isStarting || !isActive || isListening || isProcessing}
        onTap={startListening}
        canReplay={Boolean(response)}
        isPlaying={isPlaying}
        onReplay={replayAudio}
        onStop={stopAudio}
        onReset={resetPipeline}
      />

      <PipelineResult
        transcript={transcript}
        responseText={response}
        confidence={resultMeta.confidence}
        reason={resultMeta.reason}
        usedImage={resultMeta.usedImage}
        source={resultMeta.source}
        detectedObject={resultMeta.detectedObject}
        distanceDisplay={resultMeta.distanceDisplay}
        lidarStatus={resultMeta.lidarStatus}
        distanceIndicator={resultMeta.distanceIndicator}
        isLidarAvailable={isLidarAvailable}
        isCheckingLidar={isCheckingLidar}
        errorMessage={cameraError || errorMessage}
        showTimeout={false}
      />
    </section>
  )
}
