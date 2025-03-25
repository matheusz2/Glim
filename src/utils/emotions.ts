export const getEmotionColor = (emotion: string): string => {
  const colors: Record<string, string> = {
    happy: '#FFD700',
    sad: '#4169E1',
    angry: '#FF4500',
    calm: '#98FB98',
    excited: '#FF69B4',
    neutral: '#808080',
    alegria: '#FCD34D',
    tristeza: '#60A5FA',
    raiva: '#F87171',
    medo: '#A78BFA',
    surpresa: '#34D399',
    nojo: '#FBBF24',
    amor: '#F472B6',
    paz: '#9CA3AF'
  }
  return colors[emotion.toLowerCase()] || colors.neutral
} 