import { useEffect, useRef, useState } from 'react'
import { Cell, Emotion } from '../types/cell'

// Mapeamento de emoções para características de áudio
const emotionAudioProperties = {
  happy: { gain: 0.8, frequency: 440 },
  excited: { gain: 1.0, frequency: 523.25 },
  calm: { gain: 0.5, frequency: 329.63 },
  sad: { gain: 0.3, frequency: 261.63 },
  angry: { gain: 0.9, frequency: 392.00 },
  neutral: { gain: 0.6, frequency: 349.23 }
}

interface CellAudioProps {
  cell: Cell
  isActive: boolean
  audioUrl?: string
  hasYoutubeVideo?: boolean // Nova prop para controlar quando há vídeo do YouTube
}

export const CellAudio = ({ cell, isActive, audioUrl, hasYoutubeVideo }: CellAudioProps) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Inicializar o contexto de áudio
  useEffect(() => {
    audioContextRef.current = new AudioContext()
    gainNodeRef.current = audioContextRef.current.createGain()
    gainNodeRef.current.connect(audioContextRef.current.destination)

    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  // Gerenciar áudio da URL quando fornecido
  useEffect(() => {
    console.log('🎵 Estado do áudio:', {
      audioUrl,
      isActive,
      isPlaying,
      hasYoutubeVideo
    })

    if (audioUrl && isActive && !isPlaying && !hasYoutubeVideo) { // Não reproduz se houver vídeo do YouTube
      console.log('🔊 Iniciando reprodução do áudio:', audioUrl)
      const audioElement = new Audio(audioUrl)
      audioElement.loop = true
      audioElementRef.current = audioElement

      if (audioContextRef.current) {
        const source = audioContextRef.current.createMediaElementSource(audioElement)
        source.connect(gainNodeRef.current!)
        audioElement.play()
        setIsPlaying(true)
      }
    }

    return () => {
      if (audioElementRef.current) {
        console.log('🔇 Parando reprodução do áudio')
        audioElementRef.current.pause()
        audioElementRef.current = null
        setIsPlaying(false)
      }
    }
  }, [audioUrl, isActive, hasYoutubeVideo])

  // Gerenciar tom base da emoção
  useEffect(() => {
    console.log('🎼 Estado do tom base:', {
      isActive,
      audioUrl,
      hasYoutubeVideo
    })

    if (!isActive || audioUrl || hasYoutubeVideo) return // Não reproduz se houver vídeo do YouTube

    const audioContext = audioContextRef.current
    const gainNode = gainNodeRef.current

    if (audioContext && gainNode) {
      console.log('🎹 Iniciando tom base para emoção:', cell.emotion)
      const oscillator = audioContext.createOscillator()
      oscillatorRef.current = oscillator

      const properties = emotionAudioProperties[cell.emotion] || emotionAudioProperties.neutral
      oscillator.frequency.setValueAtTime(properties.frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(properties.gain * 0.1, audioContext.currentTime)

      oscillator.connect(gainNode)
      oscillator.start()

      return () => {
        console.log('🎹 Parando tom base')
        oscillator.stop()
        oscillator.disconnect()
        oscillatorRef.current = null
      }
    }
  }, [cell.emotion, isActive, audioUrl, hasYoutubeVideo])

  // Atualizar o volume baseado na intensidade dos Glows
  useEffect(() => {
    if (!gainNodeRef.current || hasYoutubeVideo) return // Não atualiza se houver vídeo do YouTube

    const totalIntensity = cell.glows?.reduce((sum: number, glow: any) => sum + glow.intensity, 0) || 0
    const baseGain = (emotionAudioProperties[cell.emotion] || emotionAudioProperties.neutral).gain
    const targetGain = baseGain * (1 + totalIntensity * 0.2)

    gainNodeRef.current.gain.linearRampToValueAtTime(
      targetGain * 0.1,
      audioContextRef.current!.currentTime + 0.1
    )
  }, [cell.glows, cell.emotion, hasYoutubeVideo])

  return null // Componente não tem representação visual
} 