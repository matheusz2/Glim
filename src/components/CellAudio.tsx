import { useEffect, useRef, useState } from 'react'
import { Cell, Emotion } from '../types/cell'

// Mapeamento de emoções para características de áudio
const emotionAudioProperties = {
  happy: { gain: 0.8, frequency: 440 },
  excited: { gain: 1.0, frequency: 523.25 },
  calm: { gain: 0.5, frequency: 329.63 }
}

interface CellAudioProps {
  cell: Cell
  isActive: boolean
  audioUrl?: string
}

export const CellAudio = ({ cell, isActive, audioUrl }: CellAudioProps) => {
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
    if (audioUrl && isActive && !isPlaying) {
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
        audioElementRef.current.pause()
        audioElementRef.current = null
        setIsPlaying(false)
      }
    }
  }, [audioUrl, isActive])

  // Gerenciar tom base da emoção
  useEffect(() => {
    if (!isActive || audioUrl) return

    const audioContext = audioContextRef.current
    const gainNode = gainNodeRef.current

    if (audioContext && gainNode) {
      const oscillator = audioContext.createOscillator()
      oscillatorRef.current = oscillator

      const properties = emotionAudioProperties[cell.emotion]
      oscillator.frequency.setValueAtTime(properties.frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(properties.gain * 0.1, audioContext.currentTime)

      oscillator.connect(gainNode)
      oscillator.start()

      return () => {
        oscillator.stop()
        oscillator.disconnect()
        oscillatorRef.current = null
      }
    }
  }, [cell.emotion, isActive, audioUrl])

  // Atualizar o volume baseado na intensidade dos Glows
  useEffect(() => {
    if (!gainNodeRef.current) return

    const totalIntensity = cell.glows.reduce((sum, glow) => sum + glow.intensity, 0)
    const baseGain = emotionAudioProperties[cell.emotion].gain
    const targetGain = baseGain * (1 + totalIntensity * 0.2)

    gainNodeRef.current.gain.linearRampToValueAtTime(
      targetGain * 0.1,
      audioContextRef.current!.currentTime + 0.1
    )
  }, [cell.glows, cell.emotion])

  return null // Componente não tem representação visual
} 