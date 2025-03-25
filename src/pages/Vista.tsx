import { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Html, Billboard } from '@react-three/drei'
import { Cell, Fragment } from '../types/cell'
import { cellService } from '../services/cellService'
import { useAuth } from '../contexts/AuthContext'
import * as THREE from 'three'
import { FragmentOrbit } from '../components/FragmentOrbit'
import { useNavigate } from 'react-router-dom'
import CellEnvironment from './CellEnvironment'

const glowEmojis = {
  curiosity: '💠',
  impact: '🔥',
  empathy: '🌫',
  connection: '✨'
}

// Componente para a célula 3D
const CellMesh = ({ cell, isUserCell = false, scale = [1, 1, 1], opacity = 1 }: { 
  cell: Cell; 
  isUserCell?: boolean;
  scale?: [number, number, number];
  opacity?: number;
}) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      // Rotação suave
      meshRef.current.rotation.y += 0.005
      
      // Pulsação
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      meshRef.current.scale.set(scale, scale, scale)
    }
  })

  // Log para debug
  console.log('Renderizando célula:', cell)

  return (
    <mesh
      ref={meshRef}
      position={[cell.position[0], cell.position[1], cell.position[2]]}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => {
        if (!isUserCell) {
          cellService.sendGlow(cell.id, 'happy', 1)
        }
      }}
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color={getEmotionColor(cell.emotion)}
        emissive={hovered ? getEmotionColor(cell.emotion) : '#000000'}
        emissiveIntensity={hovered ? 0.5 : 0}
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}

// Componente para controles de teclado
const CameraControls = ({ enabled = true }: { enabled?: boolean }) => {
  const { camera } = useThree();
  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false
  });
  const moveSpeed = 0.3;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;
      
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = true;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = true;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = true;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = true;
          break;
        case ' ':  // Tecla espaço
          keys.current.up = true;
          break;
        case 'shift':
          keys.current.down = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          keys.current.forward = false;
          break;
        case 's':
        case 'arrowdown':
          keys.current.backward = false;
          break;
        case 'a':
        case 'arrowleft':
          keys.current.left = false;
          break;
        case 'd':
        case 'arrowright':
          keys.current.right = false;
          break;
        case ' ':
          keys.current.up = false;
          break;
        case 'shift':
          keys.current.down = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [enabled]);

  useFrame(() => {
    if (!enabled) return;

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    
    if (keys.current.forward) {
      camera.position.addScaledVector(direction.normalize(), moveSpeed);
    }
    if (keys.current.backward) {
      camera.position.addScaledVector(direction.normalize(), -moveSpeed);
    }
    
    if (keys.current.left || keys.current.right) {
      const sideways = new THREE.Vector3();
      sideways.crossVectors(direction, camera.up);
      sideways.normalize();
      const multiplier = keys.current.left ? -moveSpeed : moveSpeed;
      camera.position.addScaledVector(sideways, multiplier);
    }
    
    if (keys.current.up) {
      camera.position.y += moveSpeed;
    }
    if (keys.current.down) {
      camera.position.y -= moveSpeed;
    }
  });

  return null;
};

// Componente para o ambiente 3D
const Scene = ({ cells, userCell, onFocusCell }: { 
  cells: Cell[]; 
  userCell: Cell | null; 
  onFocusCell: (callback: (shouldFocus: boolean) => void, isFocused: boolean) => void;
}) => {
  const controlsRef = useRef<any>(null);
  const [cameraLocked, setCameraLocked] = useState(true);
  const initialFocusRef = useRef(false);
  const [isFocused, setIsFocused] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'entering' | 'inside' | 'exiting'>('entering');

  const focusOnUserCell = () => {
    if (userCell && controlsRef.current) {
      // Fase 1: Preparar para entrada
      setTransitionPhase('entering');
      
      // Fase 2: Animação de entrada
      const targetPosition = new THREE.Vector3(
        userCell.position[0],
        userCell.position[1] + 5,
        userCell.position[2]
      );
      
      controlsRef.current.object.position.copy(targetPosition);
      controlsRef.current.target.set(
        userCell.position[0],
        userCell.position[1],
        userCell.position[2]
      );
      
      controlsRef.current.update();
      
      // Fase 3: Entrar na célula
      setTimeout(() => {
        setTransitionPhase('inside');
        setIsFocused(true);
      }, 1000);
    }
  };

  const unfocusFromUserCell = () => {
    if (controlsRef.current) {
      setTransitionPhase('exiting');
      
      const direction = new THREE.Vector3();
      controlsRef.current.object.getWorldDirection(direction);
      const currentPos = controlsRef.current.object.position.clone();
      const targetPos = currentPos.add(direction.multiplyScalar(10));
      controlsRef.current.target.copy(targetPos);
      controlsRef.current.update();
      
      setTimeout(() => {
        setTransitionPhase('entering');
        setIsFocused(false);
      }, 1000);
    }
  };

  useEffect(() => {
    onFocusCell((shouldFocus: boolean) => {
      if (shouldFocus) {
        focusOnUserCell();
      } else {
        unfocusFromUserCell();
      }
    }, isFocused);
  }, [onFocusCell, isFocused]);

  useEffect(() => {
    if (userCell && controlsRef.current && !initialFocusRef.current) {
      focusOnUserCell();
      initialFocusRef.current = true;
      
      setTimeout(() => {
        setCameraLocked(false);
        unfocusFromUserCell();
      }, 1000);
    }
  }, [userCell]);

  // Efeitos visuais baseados no estado emocional
  const getEmotionEffects = () => {
    if (!userCell) return null;
    
    switch (userCell.emotion) {
      case 'happy':
        return {
          skyColor: '#ffb',
          ambientIntensity: 0.5,
          particleCount: 1000,
          particleColor: '#FFD700'
        };
      case 'excited':
        return {
          skyColor: '#ff6b6b',
          ambientIntensity: 0.8,
          particleCount: 2000,
          particleColor: '#FF4500'
        };
      case 'calm':
        return {
          skyColor: '#98FB98',
          ambientIntensity: 0.3,
          particleCount: 500,
          particleColor: '#98FB98'
        };
      default:
        return {
          skyColor: '#334',
          ambientIntensity: 0.2,
          particleCount: 800,
          particleColor: '#646cff'
        };
    }
  };

  const effects = getEmotionEffects();

  return (
    <>
      <ambientLight intensity={effects?.ambientIntensity || 0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      {/* Efeitos de partículas baseados na emoção */}
      <Stars
        radius={100}
        depth={50}
        count={effects?.particleCount || 5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      
      {/* Célula do usuário com efeitos de transição */}
      {userCell && (
        <group>
          <CellMesh 
            cell={userCell} 
            isUserCell 
            scale={transitionPhase === 'inside' ? [2, 2, 2] : [1, 1, 1]}
            opacity={transitionPhase === 'inside' ? 0.5 : 1}
          />
          
          {/* Fragmentos orbitais visíveis apenas quando dentro da célula */}
          {transitionPhase === 'inside' && userCell.fragments.map((fragment) => (
            <FragmentOrbit
              key={fragment.id}
              fragment={fragment}
              orbitRadius={3}
              orbitSpeed={0.5}
            />
          ))}
        </group>
      )}
      
      {/* Outras células */}
      {cells.map((cell) => (
        <CellMesh key={cell.id} cell={cell} />
      ))}
      
      <OrbitControls
        ref={controlsRef}
        enablePan={!cameraLocked && !isFocused}
        enableRotate={!cameraLocked && !isFocused}
        enableZoom={!cameraLocked && !isFocused}
        minDistance={2}
        maxDistance={50}
        enableDamping
        dampingFactor={0.05}
      />
      <CameraControls enabled={!cameraLocked && !isFocused} />
      <Environment preset="night" />
      
      {/* Efeito de transição */}
      {transitionPhase !== 'entering' && (
        <Html center>
          <div className="fixed inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-black transition-opacity duration-1000"
              style={{ 
                opacity: transitionPhase === 'inside' ? 0.3 : 0,
                background: `radial-gradient(circle at center, transparent 0%, ${effects?.skyColor}22 100%)`
              }}
            />
          </div>
        </Html>
      )}
    </>
  );
};

const Vista = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cells, setCells] = useState<Cell[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userCell, setUserCell] = useState<Cell | null>(null)
  const [isAudioActive, setIsAudioActive] = useState(true)
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const focusCellRef = useRef<((shouldFocus: boolean) => void) | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [isCameraFocused, setIsCameraFocused] = useState(false);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);

  useEffect(() => {
    const initializeVista = async () => {
      try {
        setLoading(true)
        
        // Primeiro, cria ou obtém a célula do usuário
        const initialCell = await cellService.createInitialCell()
        console.log('Célula inicial criada:', initialCell)
        setUserCell(initialCell)

        // Depois, busca células próximas
        const nearbyCells = await cellService.getNearbyCells(
          initialCell.position[0],
          initialCell.position[1],
          initialCell.position[2]
        )
        console.log('Células próximas:', nearbyCells)
        setCells(nearbyCells)
      } catch (err) {
        console.error('Erro ao inicializar Vista:', err)
        setError('Erro ao carregar o ambiente Vista')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      initializeVista()
    }
  }, [user])

  const handleEmotionChange = (emotion: 'happy' | 'excited' | 'calm') => {
    if (userCell) {
      cellService.updateCell(userCell.id, { emotion })
    }
  };

  const handleGlow = async (type: string) => {
    if (userCell) {
      try {
        await cellService.sendGlow(userCell.id, type, 1)
      } catch (err) {
        console.error('Erro ao enviar glow:', err)
      }
    }
  }

  const toggleAudio = () => {
    setIsAudioActive(!isAudioActive)
  }

  const handleSpotifyUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyUrl(e.target.value)
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500">Você precisa estar logado para acessar o Vista</div>
      </div>
    )
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

  if (selectedCellId) {
    navigate(`/cell/${selectedCellId}`)
    return null
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho do Vista */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Vista</h1>
          <p className="text-white/70">Explore o universo de células e conecte-se com outros usuários</p>
        </div>

        {/* Container do Vista com altura fixa */}
        <div className="relative h-[600px] bg-black/50 rounded-lg overflow-hidden">
          {/* Menu Superior Fixo - Estilo atualizado */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-[#1a1b1e] rounded-lg overflow-hidden shadow-lg">
              <div className="px-4 py-2 bg-[#2c2d31] text-white/70 text-sm font-bold">
                MENU
              </div>
              <div className="p-1">
                <button
                  onClick={() => {
                    if (userCell) {
                      navigate(`/cell/${userCell.id}`)
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-white/5 rounded-md text-white text-sm transition-colors"
                >
                  <span className="text-blue-400">🏠</span>
                  <span>Entrar na minha célula</span>
                </button>
                <button
                  onClick={() => {
                    if (focusCellRef.current) {
                      focusCellRef.current(!isCameraFocused);
                      setIsCameraFocused(!isCameraFocused);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-white/5 rounded-md text-white text-sm transition-colors"
                >
                  <span className="text-red-400">🎯</span>
                  <span>{isCameraFocused ? 'Desfocar da célula' : 'Focar na minha célula'}</span>
                </button>
                <button
                  onClick={() => setShowControls(!showControls)}
                  className="flex items-center gap-2 px-4 py-2 w-full hover:bg-white/5 rounded-md text-white text-sm transition-colors"
                >
                  <span className="text-purple-400">🎮</span>
                  <span>Controles</span>
                </button>
              </div>
            </div>

            {/* Painel de Controles */}
            {showControls && (
              <div className="mt-2 bg-[#1a1b1e] rounded-lg p-4 text-sm text-white/70">
                <div className="mb-2 font-bold">Controles:</div>
                <div className="space-y-1">
                  <div>WASD / Setas - Movimento</div>
                  <div>Espaço - Subir</div>
                  <div>Shift - Descer</div>
                  <div>Mouse - Olhar ao redor</div>
                </div>
              </div>
            )}
          </div>

          {/* Ambiente Three.js */}
          <Canvas camera={{ position: [0, 0, 8] }}>
            <Scene 
              cells={cells} 
              userCell={userCell} 
              onFocusCell={(callback: (shouldFocus: boolean) => void, isFocused: boolean) => {
                focusCellRef.current = callback;
                setIsCameraFocused(isFocused);
              }}
            />
          </Canvas>

          {/* Interface de Controle Inferior */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col items-center gap-4 pointer-events-auto">
            {/* Controle de Spotify */}
            <div className="flex flex-col items-center gap-2 w-full max-w-md">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="Cole o link do Spotify aqui..."
                  value={spotifyUrl}
                  onChange={handleSpotifyUrlChange}
                  className="flex-1 px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-white placeholder-white/50 outline-none focus:bg-secondary/30"
                />
                <button
                  className="px-4 py-2 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 rounded-full text-white text-xl"
                  onClick={toggleAudio}
                >
                  {isAudioActive ? '🔊' : '🔇'}
                </button>
              </div>
            </div>

            {/* Controles de Emoção */}
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 rounded-full text-white"
                onClick={() => handleEmotionChange('happy')}
              >
                😊 Feliz
              </button>
              <button
                className="px-4 py-2 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 rounded-full text-white"
                onClick={() => handleEmotionChange('excited')}
              >
                ✨ Empolgado
              </button>
              <button
                className="px-4 py-2 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 rounded-full text-white"
                onClick={() => handleEmotionChange('calm')}
              >
                😌 Calmo
              </button>
            </div>

            {/* Controles de Glow */}
            <div className="flex justify-center gap-4">
              {(Object.entries(glowEmojis) as [string, string][]).map(([type, emoji]) => (
                <button
                  key={type}
                  className="px-4 py-2 bg-secondary/20 backdrop-blur-sm hover:bg-secondary/30 rounded-full text-white text-xl"
                  onClick={() => handleGlow(type)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getEmotionColor = (emotion: string): string => {
  const colors: Record<string, string> = {
    happy: '#FFD700',
    sad: '#4169E1',
    angry: '#FF4500',
    calm: '#98FB98',
    excited: '#FF69B4',
    neutral: '#808080'
  }
  return colors[emotion as keyof typeof colors] || colors.neutral
}

export default Vista 