export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Cell {
  id: string;
  userId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  emotion: string;
  intensity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Glow {
  id: string;
  cellId: string;
  emotion: string;
  intensity: number;
  createdAt: string;
}

export interface VistaSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  cells: Cell[];
}

export interface ApiError {
  error: string;
  message?: string;
}

export interface ApiCell {
  id: string;
  userId: string;
  emotion: string;
  intensity: number;
  color?: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  objects?: Array<{
    id: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
  }>;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface ApiGlow {
  type: string;
  intensity: number;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  fromCellId: string;
} 