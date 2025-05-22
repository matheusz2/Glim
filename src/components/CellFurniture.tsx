import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Vector3 } from 'three';

interface Furniture {
  id: string;
  type: 'tv' | 'shelf';
  position: Vector3;
  rotation: number;
}

export const CellFurniture = () => {
  const [furniture, setFurniture] = useState<Furniture[]>([]);

  const addFurniture = (type: 'tv' | 'shelf') => {
    const newFurniture: Furniture = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: new Vector3(0, 0, 0),
      rotation: 0
    };
    setFurniture([...furniture, newFurniture]);
  };

  const FurnitureModel = ({ type, position, rotation }: { type: string; position: Vector3; rotation: number }) => {
    const { scene } = useGLTF(`/models/${type}.glb`);
    return (
      <primitive
        object={scene}
        position={position}
        rotation={[0, rotation, 0]}
        scale={1}
      />
    );
  };

  return (
    <div className="w-full h-full">
      {/* Painel de Controles */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 p-4 rounded-lg">
        <h3 className="text-white mb-2">Adicionar Móvel</h3>
        <div className="flex gap-2">
          <button
            onClick={() => addFurniture('tv')}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            TV
          </button>
          <button
            onClick={() => addFurniture('shelf')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Estante
          </button>
        </div>
      </div>

      {/* Canvas 3D */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        
        {/* Renderiza todos os móveis */}
        {furniture.map((item) => (
          <FurnitureModel
            key={item.id}
            type={item.type}
            position={item.position}
            rotation={item.rotation}
          />
        ))}
      </Canvas>
    </div>
  );
}; 