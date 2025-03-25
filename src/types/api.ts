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