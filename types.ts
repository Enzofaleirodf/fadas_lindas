
export enum AppStage {
  INTRO = 'INTRO',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  DIFFICULTY_SELECT = 'DIFFICULTY_SELECT',
  STORY_PART_1 = 'STORY_PART_1', 
  GAME_LASER = 'GAME_LASER',      
  STORY_PART_2 = 'STORY_PART_2',  
  GAME_MEMORY = 'GAME_MEMORY',    
  STORY_PART_3 = 'STORY_PART_3',
  GAME_RUNNER = 'GAME_RUNNER',    
  ENDING = 'ENDING',
  MEMORIES = 'MEMORIES' // Nova tela de galeria
}

export enum Character {
  SOPHIE = 'Fada Sophie',
  JULIE = 'Fada Julie'
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum CursorMode {
  NORMAL = 'NORMAL', // Seta (Dente no clique)
  LASER = 'LASER',   // Mira
  HIDDEN = 'HIDDEN'  // Nenhum (para mobile ou cinemática)
}

export interface GameState {
  stage: AppStage;
  selectedCharacter: Character | null;
  difficulty: Difficulty;
  score: number;
  completedMissions: string[];
}

export interface MemoryCard {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface FoodItem {
  id: number;
  name: string;
  emoji: string;
  isHealthy: boolean;
}

export interface SavedMemory {
  id: string;
  date: string;
  character: Character;
  score: number;
  letter: string;
  themeColor: string;
}
