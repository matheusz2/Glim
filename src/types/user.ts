export interface UserProfile {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  visibility: 'public' | 'private' | 'friends';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    glows: boolean;
    vista: boolean;
    fragments: boolean;
  };
  audio: {
    enabled: boolean;
    volume: number;
  };
}

export interface UserStats {
  userId: string;
  followers: number;
  following: number;
  glows: number;
  vista: number;
  fragments: number;
  lastActive: Date;
} 