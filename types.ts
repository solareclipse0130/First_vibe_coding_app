export enum AppView {
  SNAKE_GAME = 'SNAKE_GAME',
  IMAGE_EDITOR = 'IMAGE_EDITOR',
  IMAGE_ANALYZER = 'IMAGE_ANALYZER',
}

export interface SnakeSegment {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum FoodType {
  NORMAL = 'NORMAL',
  SPEED = 'SPEED',         // Increases speed
  DOUBLE_SCORE = 'DOUBLE_SCORE', // Double points
}

export interface FoodItem extends SnakeSegment {
  type: FoodType;
}

export interface ActiveEffect {
  type: FoodType;
  remainingTicks: number;
}

export interface GameState {
  snake: SnakeSegment[];
  food: FoodItem;
  direction: Direction;
  gameOver: boolean;
  score: number;
  isPlaying: boolean;
  highScore: number;
  activeEffects: ActiveEffect[];
}
