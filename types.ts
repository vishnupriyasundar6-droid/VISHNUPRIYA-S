
export interface GameState {
  birdY: number;
  birdVelocity: number;
  birdScale: number; // For the "grow" mechanic
  pipes: PipeData[];
  score: number;
  isGameOver: boolean;
  isGameStarted: boolean;
  theme: GameTheme;
  aiMessage: string;
}

export interface PipeData {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GameTheme {
  name: string;
  skyColor: string;
  pipeColor: string;
  birdEmoji: string;
  groundColor: string;
  accentColor: string;
}

export const DEFAULT_THEME: GameTheme = {
  name: "Classic Sky",
  skyColor: "bg-sky-400",
  pipeColor: "bg-green-500",
  birdEmoji: "🐦",
  groundColor: "bg-yellow-800",
  accentColor: "text-yellow-400"
};
