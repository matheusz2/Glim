import { CellElements } from './CellElements';
import { CellFurniture } from './CellFurniture';

export const CellEnvironment = () => {
  return (
    <div className="relative w-full h-full">
      {/* Ambiente 3D Principal */}
      <div className="absolute inset-0">
        <CellFurniture />
      </div>

      {/* Camada de Elementos */}
      <div className="absolute inset-0 pointer-events-none">
        <CellElements />
      </div>

      {/* Instruções */}
      <div className="absolute bottom-4 left-4 z-10 bg-black/50 p-4 rounded-lg text-white">
        <h3 className="text-lg font-bold mb-2">Como Usar</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Use os botões no topo para adicionar elementos</li>
          <li>Clique e arraste para mover a câmera</li>
          <li>Use a roda do mouse para zoom</li>
          <li>Clique nos elementos para interagir</li>
        </ul>
      </div>
    </div>
  );
}; 