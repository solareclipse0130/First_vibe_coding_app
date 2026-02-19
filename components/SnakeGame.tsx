import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SnakeSegment, Direction, GameState, FoodType, FoodItem } from '../types';
import { Button } from './ui/Button';

const GRID_SIZE = 20;
const BASE_SPEED = 150;
const FAST_SPEED = 80;
const EFFECT_DURATION_TICKS = 100; // Duration of special effects in ticks

export const SnakeGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
    food: { x: 5, y: 5, type: FoodType.NORMAL },
    direction: Direction.UP,
    gameOver: false,
    score: 0,
    isPlaying: false,
    highScore: 0,
    activeEffects: [],
  });

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const directionRef = useRef<Direction>(Direction.UP);

  // Initialize high score
  useEffect(() => {
    const saved = localStorage.getItem('snakeHighScore');
    if (saved) {
      setGameState(prev => ({ ...prev, highScore: parseInt(saved, 10) }));
    }
  }, []);

  // Determine current speed based on active effects
  const currentSpeed = gameState.activeEffects.some(e => e.type === FoodType.SPEED) 
    ? FAST_SPEED 
    : BASE_SPEED;

  const generateFood = (snake: SnakeSegment[]): FoodItem => {
    let newFood: FoodItem;
    let isOnSnake = true;
    
    while (isOnSnake) {
      const x = Math.floor(Math.random() * GRID_SIZE);
      const y = Math.floor(Math.random() * GRID_SIZE);
      
      // Determine food type
      const rand = Math.random();
      let type = FoodType.NORMAL;
      if (rand > 0.90) type = FoodType.DOUBLE_SCORE; // 10% chance
      else if (rand > 0.80) type = FoodType.SPEED;   // 10% chance

      newFood = { x, y, type };
      
      // eslint-disable-next-line no-loop-func
      isOnSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) return newFood;
    }
    // Fallback
    return { x: 0, y: 0, type: FoodType.NORMAL };
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      snake: [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }],
      food: generateFood([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]),
      direction: Direction.UP,
      gameOver: false,
      score: 0,
      isPlaying: true,
      activeEffects: [],
    }));
    directionRef.current = Direction.UP;
  };

  // WASD Controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!gameState.isPlaying) return;

    const key = e.key.toLowerCase();

    switch (key) {
      case 'w':
      case 'arrowup':
        if (directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP;
        break;
      case 's':
      case 'arrowdown':
        if (directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN;
        break;
      case 'a':
      case 'arrowleft':
        if (directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT;
        break;
      case 'd':
      case 'arrowright':
        if (directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT;
        break;
    }
  }, [gameState.isPlaying]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (prev.gameOver || !prev.isPlaying) return prev;

      const head = { ...prev.snake[0] };
      const currentDir = directionRef.current;

      switch (currentDir) {
        case Direction.UP: head.y -= 1; break;
        case Direction.DOWN: head.y += 1; break;
        case Direction.LEFT: head.x -= 1; break;
        case Direction.RIGHT: head.x += 1; break;
      }

      // Check collision with walls
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('snakeHighScore', newHighScore.toString());
        return { ...prev, gameOver: true, isPlaying: false, highScore: newHighScore };
      }

      // Check collision with self
      if (prev.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        const newHighScore = Math.max(prev.score, prev.highScore);
        localStorage.setItem('snakeHighScore', newHighScore.toString());
        return { ...prev, gameOver: true, isPlaying: false, highScore: newHighScore };
      }

      let newSnake = [head, ...prev.snake];
      let newScore = prev.score;
      let newFood = prev.food;
      let newEffects = prev.activeEffects
          .map(e => ({ ...e, remainingTicks: e.remainingTicks - 1 }))
          .filter(e => e.remainingTicks > 0);

      // Check collision with food
      if (head.x === prev.food.x && head.y === prev.food.y) {
        // Calculate Score
        const isDoubleScore = prev.activeEffects.some(e => e.type === FoodType.DOUBLE_SCORE);
        const points = isDoubleScore ? 20 : 10;
        newScore += points;

        // Apply Special Effects
        if (prev.food.type !== FoodType.NORMAL) {
            // Remove existing effect of same type to refresh it
            newEffects = newEffects.filter(e => e.type !== prev.food.type);
            newEffects.push({ type: prev.food.type, remainingTicks: EFFECT_DURATION_TICKS });
        }

        newFood = generateFood(newSnake);
      } else {
        newSnake.pop(); // Remove tail
      }

      return {
        ...prev,
        snake: newSnake,
        score: newScore,
        food: newFood,
        activeEffects: newEffects,
        direction: currentDir,
      };
    });
  }, []);

  // Handle Game Loop with variable speed
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      // Clear existing loop to update speed
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(moveSnake, currentSpeed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState.isPlaying, gameState.gameOver, currentSpeed, moveSnake]);

  // Helper to get food style
  const getFoodStyle = (type: FoodType) => {
      switch (type) {
          case FoodType.SPEED:
              return 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] border border-white animate-pulse';
          case FoodType.DOUBLE_SCORE:
              return 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,1)] border border-white animate-bounce';
          default:
              return 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] border border-pink-300 animate-pulse';
      }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-2xl mx-auto font-orbitron">
      <div className="mb-4 flex justify-between w-full items-end">
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] font-[Orbitron] uppercase tracking-wider">
            HRJ的贪吃蛇
          </h2>
          <div className="flex gap-4 text-xs mt-2 font-mono">
             <span className="flex items-center gap-2 text-pink-300 drop-shadow-[0_0_5px_rgba(244,114,182,0.8)]"><div className="w-2 h-2 bg-pink-500 shadow-[0_0_5px_rgba(236,72,153,1)]"></div> Normal</span>
             <span className="flex items-center gap-2 text-cyan-300 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]"><div className="w-2 h-2 bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)]"></div> Speed</span>
             <span className="flex items-center gap-2 text-purple-300 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]"><div className="w-2 h-2 bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,1)]"></div> 2x Score</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]">SCORE: {gameState.score.toString().padStart(4, '0')}</p>
          <p className="text-xs text-cyan-700 font-mono tracking-widest">BEST: {gameState.highScore.toString().padStart(4, '0')}</p>
        </div>
      </div>

      {/* Active Effects Bar */}
      <div className="w-full h-8 mb-2 flex gap-2">
         {gameState.activeEffects.map((effect, idx) => (
             <div key={idx} className={`px-3 py-1 rounded border backdrop-blur-md text-xs font-bold flex items-center gap-2 font-mono uppercase tracking-wider animate-fadeIn shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                 effect.type === FoodType.SPEED ? 'bg-cyan-900/40 text-cyan-200 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-purple-900/40 text-purple-200 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
             }`}>
                 <span>{effect.type === FoodType.SPEED ? '⚡ SPEED BOOST' : '★ MULTIPLIER'}</span>
                 <div className="h-1.5 w-12 bg-black/50 rounded-full overflow-hidden ml-2">
                    <div 
                      className={`h-full ${effect.type === FoodType.SPEED ? 'bg-cyan-400' : 'bg-purple-400'}`} 
                      style={{ width: `${(effect.remainingTicks / EFFECT_DURATION_TICKS) * 100}%` }}
                    />
                 </div>
             </div>
         ))}
      </div>

      <div 
        className="relative bg-black/40 border border-cyan-500/30 backdrop-blur-sm rounded-none shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden"
        style={{ 
          width: 'min(90vw, 400px)', 
          height: 'min(90vw, 400px)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
        }}
      >
        {/* Render Grid Cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
           const x = i % GRID_SIZE;
           const y = Math.floor(i / GRID_SIZE);
           const isSnake = gameState.snake.some(s => s.x === x && s.y === y);
           const isHead = gameState.snake[0].x === x && gameState.snake[0].y === y;
           const isFood = gameState.food.x === x && gameState.food.y === y;

           return (
             <div 
                key={i} 
                className={`
                  w-full h-full border-[0.5px] border-cyan-900/20
                  ${isHead ? 'bg-cyan-100 shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10' : ''}
                  ${isSnake && !isHead ? 'bg-cyan-500/80 shadow-[0_0_10px_rgba(6,182,212,0.5)] backdrop-blur-md' : ''}
                  ${isFood ? getFoodStyle(gameState.food.type) : ''}
                `}
             />
           );
        })}

        {/* Overlay for Game Over / Start */}
        {(!gameState.isPlaying || gameState.gameOver) && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 border-4 border-double border-cyan-900/50">
            {gameState.gameOver ? (
              <div className="text-center mb-6 animate-pulse">
                <h3 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-t from-red-600 to-red-400 mb-2 font-[Orbitron] drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">GAME OVER</h3>
                <p className="text-cyan-200 font-mono text-xl mt-4">SCORE: {gameState.score}</p>
              </div>
            ) : (
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-cyan-400 mb-4 font-[Orbitron] tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">SYSTEM READY</h3>
                <div className="flex justify-center gap-2 text-cyan-600 font-mono text-sm border border-cyan-900/50 p-2 bg-black/50">
                  <span>W</span><span>A</span><span>S</span><span>D</span>
                  <span className="ml-2 text-cyan-400">TO MOVE</span>
                </div>
              </div>
            )}
            <Button 
              variant="primary" 
              onClick={resetGame}
              className="text-lg px-10 py-4 border-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              {gameState.gameOver ? 'REBOOT SYSTEM' : 'INITIATE'}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 w-full max-w-[400px] border border-cyan-900/30 bg-black/20 p-4 relative backdrop-blur-md">
        <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-500"></div>
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-500"></div>
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-500"></div>

        <h4 className="font-semibold text-cyan-600 mb-4 text-xs font-mono tracking-[0.2em] uppercase text-center border-b border-cyan-900/30 pb-2">Manual Override</h4>
        <div className="grid grid-cols-3 gap-2 max-w-[150px] mx-auto">
          <div />
          <Button variant="secondary" className="h-12 w-full flex items-center justify-center font-bold text-cyan-400 border-cyan-800 bg-cyan-950/20" onClick={() => { if(directionRef.current !== Direction.DOWN) directionRef.current = Direction.UP }}>W</Button>
          <div />
          <Button variant="secondary" className="h-12 w-full flex items-center justify-center font-bold text-cyan-400 border-cyan-800 bg-cyan-950/20" onClick={() => { if(directionRef.current !== Direction.RIGHT) directionRef.current = Direction.LEFT }}>A</Button>
          <Button variant="secondary" className="h-12 w-full flex items-center justify-center font-bold text-cyan-400 border-cyan-800 bg-cyan-950/20" onClick={() => { if(directionRef.current !== Direction.UP) directionRef.current = Direction.DOWN }}>S</Button>
          <Button variant="secondary" className="h-12 w-full flex items-center justify-center font-bold text-cyan-400 border-cyan-800 bg-cyan-950/20" onClick={() => { if(directionRef.current !== Direction.LEFT) directionRef.current = Direction.RIGHT }}>D</Button>
        </div>
      </div>
    </div>
  );
};