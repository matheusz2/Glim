import { useEffect, useState } from 'react'

interface SpotifyTrack {
  id: string
  name: string
  previewUrl: string | null
  artists: string[]
  albumArt: string
}

interface SpotifyPreviewProps {
  spotifyUrl: string
  onPreviewUrlFound?: (previewUrl: string | null) => void
}

export const SpotifyPreview = ({ spotifyUrl, onPreviewUrlFound }: SpotifyPreviewProps) => {
  const [track, setTrack] = useState<SpotifyTrack | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const getTrackId = (url: string) => {
      const match = url.match(/track\/([a-zA-Z0-9]+)/)
      return match ? match[1] : null
    }

    const fetchTrackInfo = async () => {
      try {
        const trackId = getTrackId(spotifyUrl)
        if (!trackId) {
          throw new Error('URL do Spotify inválida')
        }

        // Usando a API pública do Spotify para obter informações da música
        const response = await fetch(`https://open.spotify.com/oembed?url=spotify:track:${trackId}`)
        const data = await response.json()

        // Extrair informações básicas
        const track: SpotifyTrack = {
          id: trackId,
          name: data.title,
          previewUrl: null, // Será atualizado pela API
          artists: [data.author_name],
          albumArt: data.thumbnail_url
        }

        // Buscar a URL de prévia usando a API do Spotify
        const previewResponse = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.SPOTIFY_ACCESS_TOKEN}`
          }
        })
        const previewData = await previewResponse.json()
        
        track.previewUrl = previewData.preview_url
        setTrack(track)
        onPreviewUrlFound?.(track.previewUrl)

      } catch (err) {
        setError('Não foi possível carregar a prévia do Spotify')
        onPreviewUrlFound?.(null)
      }
    }

    if (spotifyUrl) {
      fetchTrackInfo()
    }
  }, [spotifyUrl])

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
      </div>
    )
  }

  if (!track) {
    return null
  }

  return (
    <div className="flex items-center gap-3 bg-secondary/10 p-2 rounded-lg">
      <img 
        src={track.albumArt} 
        alt={track.name}
        className="w-12 h-12 rounded"
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{track.name}</span>
        <span className="text-xs text-white/60">{track.artists.join(', ')}</span>
      </div>
      {track.previewUrl && (
        <audio 
          src={track.previewUrl} 
          controls 
          className="w-48"
        >
          Seu navegador não suporta o elemento de áudio.
        </audio>
      )}
    </div>
  )
} 