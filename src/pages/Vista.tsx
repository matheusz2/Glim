import { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stars, Html, Billboard } from '@react-three/drei'
import { Cell, Fragment } from '../types/cell'
import { cellService } from '../services/cellService'
import { useAuth } from '../contexts/AuthContext'
import * as THREE from 'three'
import { FragmentOrbit } from '../components/FragmentOrbit'
import { useNavigate, Link } from 'react-router-dom'
import CellEnvironment from './CellEnvironment'
import { getEmotionColor } from '../utils/emotions'
import '../styles/vista.css'

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

  const handleEmotionChange = async (emotion: 'happy' | 'excited' | 'calm') => {
    if (userCell) {
      try {
        // Atualiza no servidor
        const updatedCell = await cellService.updateCell(userCell.id, { emotion });
        // Atualiza o estado local
        setUserCell(updatedCell);
        // Atualiza a lista de células se a célula do usuário estiver nela
        setCells(prevCells => 
          prevCells.map(cell => 
            cell.id === updatedCell.id ? updatedCell : cell
          )
        );
      } catch (error) {
        console.error('Erro ao atualizar emoção:', error);
      }
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <p className="text-xl text-white/80">Você precisa estar logado para acessar o Vista</p>
          <Link to="/login" className="btn btn-primary mt-4">Fazer Login</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="card-glass p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="card-glass p-8 text-center">
          <span className="text-4xl mb-4 block">❌</span>
          <p className="text-xl text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary mt-4">
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  if (selectedCellId) {
    navigate(`/cell/${selectedCellId}`)
    return null
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
      <div className="absolute inset-0">
        {/* Menu Superior */}
        <div className="vista-menu">
          <div className="glass-panel">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-medium text-gradient">Menu</h3>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  if (userCell) {
                    navigate(`/cell/${userCell.id}`)
                  }
                }}
                className="menu-item w-full"
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
                className="menu-item w-full"
              >
                <span className="text-red-400">🎯</span>
                <span>{isCameraFocused ? 'Desfocar da célula' : 'Focar na minha célula'}</span>
              </button>
              <button
                onClick={() => setShowControls(!showControls)}
                className="menu-item w-full"
              >
                <span className="text-purple-400">🎮</span>
                <span>Controles</span>
              </button>
            </div>
          </div>

          {/* Painel de Controles */}
          {showControls && (
            <div className="glass-panel mt-2 p-4">
              <h3 className="text-lg font-medium text-gradient mb-3">Controles</h3>
              <div className="space-y-2 text-sm text-white/70">
                <div className="flex items-center gap-2">
                  <span className="text-primary">⌨️</span>
                  <span>WASD / Setas - Movimento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">⬆️</span>
                  <span>Espaço - Subir</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">⬇️</span>
                  <span>Shift - Descer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary">🖱️</span>
                  <span>Mouse - Olhar ao redor</span>
                </div>
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
        <div className="vista-controls">
          {/* Controle de Spotify */}
          <div className="glass-panel w-full p-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Cole o link do Spotify aqui..."
                value={spotifyUrl}
                onChange={handleSpotifyUrlChange}
                className="input flex-1"
              />
              <button
                className="btn btn-glass"
                onClick={toggleAudio}
              >
                {isAudioActive ? '🔊' : '🔇'}
              </button>
            </div>
          </div>

          {/* Controles de Emoção */}
          <div className="flex justify-center gap-2">
            <button
              className="btn btn-glass hover-lift"
              onClick={() => handleEmotionChange('happy')}
            >
              <span className="flex items-center gap-2">
                <span>😊</span>
                <span>Feliz</span>
              </span>
            </button>
            <button
              className="btn btn-glass hover-lift"
              onClick={() => handleEmotionChange('excited')}
            >
              <span className="flex items-center gap-2">
                <span>✨</span>
                <span>Empolgado</span>
              </span>
            </button>
            <button
              className="btn btn-glass hover-lift"
              onClick={() => handleEmotionChange('calm')}
            >
              <span className="flex items-center gap-2">
                <span>😌</span>
                <span>Calmo</span>
              </span>
            </button>
          </div>

          {/* Controles de Glow */}
          <div className="flex justify-center gap-2">
            {(Object.entries(glowEmojis) as [string, string][]).map(([type, emoji]) => (
              <button
                key={type}
                className="btn btn-glass hover-lift"
                onClick={() => handleGlow(type)}
              >
                <span className="flex items-center gap-2">
                  <span>{emoji}</span>
                  <span className="capitalize">{type}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Vista 