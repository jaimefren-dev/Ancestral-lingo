
export type Language = 'kichwa' | 'shuar';
export type CategoryId = 'greetings' | 'numbers' | 'colors' | 'animals' | 'food' | 'sentences';

export interface Category {
  id: CategoryId;
  title: string;
  nativeTitle: string;
  icon: string;
  color: string;
}

export interface VocabItem {
  native: string;
  spanish: string;
  image?: string; // Optional URL for visuals
}

export interface Question {
  id: string;
  type: 'translate_to_native' | 'translate_to_spanish' | 'listening' | 'matching';
  question?: string; // For text questions
  audioText?: string; // For listening questions
  correctAnswer?: string; // For multiple choice
  options?: string[]; // For multiple choice
  pairs?: { id: string; text: string; type: 'native' | 'spanish'; matchId: string }[]; // For matching
  optionImages?: Record<string, string>; // Map option text to image URL
  imageUrl?: string; // Image associated with the question prompt
}

export interface UserProgress {
  xp: number;
  streak: number;
  lastLoginDate: string;
  lessonsCompleted: number;
  completedCategories: Record<string, boolean>; // key: "language-category"
  claimedAchievements: string[]; // List of Achievement IDs claimed
}

export interface GameState {
  view: 'home' | 'lesson' | 'result';
  activeLanguage: Language | null;
  activeCategory: CategoryId | null;
  hearts: number;
  currentLessonXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'xp' | 'streak' | 'lessons';
  targetValue: number;
  xpReward: number;
  icon: any; // Lucide icon name context
}
