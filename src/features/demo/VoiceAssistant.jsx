import useAuth from '../../hooks/useAuth'
import PipelineDemo from './PipelineDemo'

export default function VoiceAssistant() {
  const { profile } = useAuth()

  return <PipelineDemo voiceSpeed={profile?.preferences?.voiceSpeed || 'normal'} />
}
