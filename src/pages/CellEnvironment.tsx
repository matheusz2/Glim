import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Html, useGLTF } from '@react-three/drei'
import { Cell, Object3D } from '../types/cell'
import { cellService } from '../services/cellService'
import { useAuth } from '../contexts/AuthContext'
import * as THREE from 'three'

interface CellEnvironmentProps {
  cellId: string
  onClose: () => void
}

// Componente para o modelo da TV com vídeo
const TVModel = ({ 
  position = [0, 0, 0] as [number, number, number], 
  rotation = [0, 0, 0] as [number, number, number], 
  scale = 1, 
  youtubeUrl = '' 
}) => {
  const { scene } = useGLTF('/models/tv.glb')
  
  // Função para extrair o ID do vídeo do YouTube
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[2].length === 11) ? match[2] : null
    console.log('🔍 YouTube URL:', url)
    console.log('🎥 Video ID extraído:', videoId)
    return videoId
  }

  const videoId = getYoutubeId(youtubeUrl)
  
  useEffect(() => {
    if (videoId) {
      console.log('📺 Iniciando reprodução do vídeo:', videoId)
    }
  }, [videoId])
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive object={scene} />
      {videoId && (
        <Html
          transform
          position={[-0.2, 4.8, 0] as [number, number, number]}
          rotation={[0, 0, 0] as [number, number, number]}
          scale={[0.75, 0.69, 1] as [number, number, number]}
          style={{
            width: '640px',
            height: '360px',
            background: 'black',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 0 16px #000a'
          }}
        >
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={() => console.log('🎬 iframe carregado para o vídeo:', videoId)}
          />
        </Html>
      )}
    </group>
  )
}

const CellEnvironment = ({ cellId, onClose }: CellEnvironmentProps) => {
  const { user } = useAuth()
  const [cell, setCell] = useState<Cell | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedObject, setSelectedObject] = useState<string | null>(null)
  const [objects, setObjects] = useState<Object3D[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')

  useEffect(() => {
    const loadCell = async () => {
      try {
        setLoading(true)
        const userCells = await cellService.getUserCells()
        const foundCell = userCells.find(c => c.id === cellId)
        if (foundCell) {
          setCell(foundCell)
          setObjects(foundCell.objects || [])
        } else {
          setError('Célula não encontrada')
        }
      } catch (err) {
        console.error('Erro ao carregar célula:', err)
        setError('Erro ao carregar o ambiente')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadCell()
    }
  }, [user, cellId])

  const addObject = (type: 'cube' | 'sphere' | 'cylinder' | 'tv') => {
    const newObject: Object3D = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: '#646cff'
    }
    setObjects([...objects, newObject])
    setHasChanges(true)
  }

  const updateObject = (id: string, updates: Partial<Object3D>) => {
    setObjects(objects.map(obj => 
      obj.id === id ? { ...obj, ...updates } : obj
    ))
    setHasChanges(true)
  }

  const deleteObject = (id: string) => {
    setObjects(objects.filter(obj => obj.id !== id))
    setSelectedObject(null)
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      if (cell) {
        await cellService.updateCell(cell.id, { objects })
        setHasChanges(false)
      }
    } catch (err) {
      console.error('Erro ao salvar ambiente:', err)
      setError('Erro ao salvar o ambiente')
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex">
      {/* Painel de Controles */}
      <div className="w-64 bg-[#1a1b1e] p-4 text-white">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">Ambiente da Célula</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-white/70">Personalize seu espaço</p>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold mb-2">Adicionar Objeto</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => addObject('cube')}
                className="px-3 py-1 bg-secondary/20 hover:bg-secondary/30 rounded text-sm"
              >
                Cubo
              </button>
              <button
                onClick={() => addObject('sphere')}
                className="px-3 py-1 bg-secondary/20 hover:bg-secondary/30 rounded text-sm"
              >
                Esfera
              </button>
              <button
                onClick={() => addObject('cylinder')}
                className="px-3 py-1 bg-secondary/20 hover:bg-secondary/30 rounded text-sm"
              >
                Cilindro
              </button>
              <button
                onClick={() => addObject('tv')}
                className="px-3 py-1 bg-secondary/20 hover:bg-secondary/30 rounded text-sm"
              >
                TV
              </button>
            </div>
          </div>

          {selectedObject && (
            <div>
              <h3 className="text-sm font-bold mb-2">Propriedades</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-white/70">Posição</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['x', 'y', 'z'].map((axis) => (
                      <input
                        key={axis}
                        type="number"
                        className="w-full px-2 py-1 bg-secondary/20 rounded text-sm"
                        value={objects.find(o => o.id === selectedObject)?.position[axis === 'x' ? 0 : axis === 'y' ? 1 : 2]}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          const obj = objects.find(o => o.id === selectedObject)
                          if (obj) {
                            const newPosition = [...obj.position] as [number, number, number]
                            newPosition[axis === 'x' ? 0 : axis === 'y' ? 1 : 2] = value
                            updateObject(obj.id, { position: newPosition })
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70">Escala</label>
                  <div className="grid grid-cols-3 gap-1">
                    {['x', 'y', 'z'].map((axis) => (
                      <input
                        key={axis}
                        type="number"
                        className="w-full px-2 py-1 bg-secondary/20 rounded text-sm"
                        value={objects.find(o => o.id === selectedObject)?.scale[axis === 'x' ? 0 : axis === 'y' ? 1 : 2]}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value)
                          const obj = objects.find(o => o.id === selectedObject)
                          if (obj) {
                            const newScale = [...obj.scale] as [number, number, number]
                            newScale[axis === 'x' ? 0 : axis === 'y' ? 1 : 2] = value
                            updateObject(obj.id, { scale: newScale })
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/70">Cor</label>
                  <input
                    type="color"
                    className="w-full h-8 bg-secondary/20 rounded"
                    value={objects.find(o => o.id === selectedObject)?.color}
                    onChange={(e) => {
                      const obj = objects.find(o => o.id === selectedObject)
                      if (obj) {
                        updateObject(obj.id, { color: e.target.value })
                      }
                    }}
                  />
                </div>

                <button
                  onClick={() => deleteObject(selectedObject)}
                  className="w-full px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-sm text-red-400"
                >
                  Deletar Objeto
                </button>
              </div>
            </div>
          )}

          {selectedObject && objects.find(o => o.id === selectedObject)?.type === 'tv' && (
            <div className="mt-4">
              <h3 className="text-sm font-bold mb-2">Configurar TV</h3>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-white/70">URL do YouTube</label>
                  <input
                    type="text"
                    className="w-full px-2 py-1 bg-secondary/20 rounded text-sm"
                    placeholder="https://youtube.com/watch?v=..."
                    value={objects.find(o => o.id === selectedObject)?.youtubeUrl || ''}
                    onChange={(e) => {
                      const obj = objects.find(o => o.id === selectedObject)
                      if (obj) {
                        updateObject(obj.id, { youtubeUrl: e.target.value })
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {hasChanges && (
            <button
              onClick={handleSave}
              className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded text-white font-medium"
            >
              Salvar Alterações
            </button>
          )}
        </div>
      </div>

      {/* Canvas 3D */}
      <div className="flex-1">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {objects.map((obj) => (
            <mesh
              key={obj.id}
              position={obj.position}
              rotation={obj.rotation}
              scale={obj.scale}
              onClick={() => setSelectedObject(obj.id)}
            >
              {obj.type === 'cube' && <boxGeometry />}
              {obj.type === 'sphere' && <sphereGeometry />}
              {obj.type === 'cylinder' && <cylinderGeometry />}
              {obj.type === 'tv' && (
                <TVModel
                  position={obj.position}
                  rotation={obj.rotation}
                  scale={obj.scale[0]}
                  youtubeUrl={obj.youtubeUrl || ''}
                />
              )}
              {obj.type !== 'tv' && <meshStandardMaterial color={obj.color} />}
            </mesh>
          ))}

          <OrbitControls />
          <Environment preset="night" />
        </Canvas>
      </div>
    </div>
  )
}

export default CellEnvironment 