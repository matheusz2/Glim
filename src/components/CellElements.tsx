import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Image, Video } from '@react-three/drei';
import { Vector3 } from 'three';

interface Element {
  id: string;
  type: 'text' | 'image' | 'video';
  position: Vector3;
  content: string;
  scale?: number;
}

export const CellElements = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedType, setSelectedType] = useState<'text' | 'image' | 'video'>('text');

  const addElement = (type: 'text' | 'image' | 'video') => {
    const newElement: Element = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      position: new Vector3(0, 0, 0),
      content: type === 'text' ? 'Novo texto' : type === 'image' ? '/placeholder.jpg' : '/placeholder.mp4',
      scale: 1
    };
    setElements([...elements, newElement]);
  };

  const renderElement = (element: Element) => {
    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            position={element.position}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {element.content}
          </Text>
        );
      case 'image':
        return (
          <Image
            key={element.id}
            position={element.position}
            url={element.content}
            scale={[1, 1, 1]}
          />
        );
      case 'video':
        return (
          <Video
            key={element.id}
            position={element.position}
            url={element.content}
            scale={[1, 1, 1]}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full">
      {/* Painel de Controles */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-lg">
        <h3 className="text-white mb-2">Adicionar Elemento</h3>
        <div className="flex gap-2">
          <button
            onClick={() => addElement('text')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Texto
          </button>
          <button
            onClick={() => addElement('image')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Imagem
          </button>
          <button
            onClick={() => addElement('video')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Vídeo
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
        
        {/* Renderiza todos os elementos */}
        {elements.map(renderElement)}
      </Canvas>
    </div>
  );
}; 