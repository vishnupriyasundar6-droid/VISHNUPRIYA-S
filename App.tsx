
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameView from './components/GameView';
import { GameState, DEFAULT_THEME, PipeData } from './types';
import { 
  GAME_HEIGHT, 
  BIRD_SIZE, 
  GRAVITY, 
  JUMP_STRENGTH, 
  PIPE_WIDTH, 
  PIPE_GAP, 
  PIPE_SPEED, 
  GAME_WIDTH 
} from './constants';
import { getGameCommentary, getDynamicTheme } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    birdY: GAME_HEIGHT / 2,
    birdVelocity: 0,
    birdScale: 1.0,
    pipes: [],
    score: 0,
    isGameOver: false,
    isGameStarted: false,
    theme: DEFAULT_THEME,
    aiMessage: "Ready to grow & flap?"
  });

  const stateRef = useRef(state);
  const requestRef = useRef<number>();
  const lastPipeSpawnTime = useRef<number>(0);

  // Sync ref with state for the animation loop
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Initial Theme Fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      const theme = await getDynamicTheme();
      setState(prev => ({ ...prev, theme }));
    };
    fetchInitialData();
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current.isGameOver) return;
    
    if (!stateRef.current.isGameStarted) {
      setState(prev => ({ ...prev, isGameStarted: true, aiMessage: "Let's go!" }));
      return;
    }

    setState(prev => ({
      ...prev,
      birdVelocity: JUMP_STRENGTH
    }));
  }, []);

  const checkCollision = (birdY: number, birdScale: number, pipes: PipeData[]) => {
    const currentBirdSize = BIRD_SIZE * birdScale;
    
    // Ground or Ceiling (Accounting for scale)
    if (birdY < 0 || birdY + currentBirdSize > GAME_HEIGHT - 48) return true;

    // Pipes
    for (const pipe of pipes) {
      const birdLeft = 50;
      const birdRight = 50 + currentBirdSize;
      const birdTop = birdY;
      const birdBottom = birdY + currentBirdSize;

      const pipeLeft = pipe.x;
      const pipeRight = pipe.x + PIPE_WIDTH;

      if (birdRight > pipeLeft && birdLeft < pipeRight) {
        // Dynamic gap check
        if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + PIPE_GAP) {
          return true;
        }
      }
    }
    return false;
  };

  const update = useCallback((time: number) => {
    const s = stateRef.current;
    if (!s.isGameStarted || s.isGameOver) {
      requestRef.current = requestAnimationFrame(update);
      return;
    }

    let nextBirdY = s.birdY + s.birdVelocity;
    let nextVelocity = s.birdVelocity + GRAVITY;
    let nextPipes = [...s.pipes];
    let nextScore = s.score;
    let nextScale = 1.0 + (nextScore * 0.05); // Grows 5% per point

    // Cap the scale so it's not impossible immediately
    if (nextScale > 2.5) nextScale = 2.5;

    // Spawn pipes (Faster interval as score increases?)
    const spawnInterval = Math.max(1200, 1800 - (nextScore * 20));
    if (time - lastPipeSpawnTime.current > spawnInterval) {
      const minPipeHeight = 50;
      const maxPipeHeight = GAME_HEIGHT - PIPE_GAP - 150;
      const topHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight)) + minPipeHeight;
      
      nextPipes.push({
        id: Date.now(),
        x: GAME_WIDTH,
        topHeight,
        passed: false
      });
      lastPipeSpawnTime.current = time;
    }

    // Move pipes
    nextPipes = nextPipes
      .map(p => ({ ...p, x: p.x - (PIPE_SPEED + (nextScore * 0.05)) }))
      .filter(p => p.x + PIPE_WIDTH > 0);

    // Update Score
    let scoredInThisFrame = false;
    nextPipes.forEach(p => {
      if (!p.passed && p.x + PIPE_WIDTH < 50) {
        p.passed = true;
        nextScore += 1;
        scoredInThisFrame = true;
      }
    });

    if (scoredInThisFrame && nextScore % 5 === 0) {
      getGameCommentary(nextScore, false, nextScale).then(msg => {
        setState(prev => ({ ...prev, aiMessage: msg }));
      });
    }

    // Check collision
    if (checkCollision(nextBirdY, nextScale, nextPipes)) {
      setState(prev => ({ ...prev, isGameOver: true }));
      getGameCommentary(nextScore, true, nextScale).then(msg => {
        setState(prev => ({ ...prev, aiMessage: msg }));
      });
      return;
    }

    setState(prev => ({
      ...prev,
      birdY: nextBirdY,
      birdVelocity: nextVelocity,
      birdScale: nextScale,
      pipes: nextPipes,
      score: nextScore
    }));

    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update]);

  // Handle keyboard and global clicks
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [jump]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white p-4 font-sans">
      <div className="pixel-shadow border-8 border-neutral-800 rounded-xl overflow-hidden mb-6 shadow-2xl">
        <GameView state={state} onJump={jump} />
      </div>
      
      <div className="max-w-md w-full bg-neutral-900 border-2 border-neutral-800 p-6 rounded-lg text-center shadow-lg">
        <h3 className="text-[10px] text-neutral-500 mb-1 tracking-[0.2em] uppercase font-bold">Dynamic Dimension</h3>
        <p className={`text-lg ${state.theme.accentColor} uppercase tracking-widest font-black italic`}>{state.theme.name}</p>
        
        <div className="mt-4 flex justify-center gap-3">
           <div className={`w-6 h-6 rounded-full ${state.theme.skyColor} border border-white/10`} title="Sky"></div>
           <div className={`w-6 h-6 rounded-sm ${state.theme.pipeColor} border border-white/10`} title="Pipes"></div>
           <div className={`w-6 h-6 rounded-b-lg ${state.theme.groundColor} border border-white/10`} title="Ground"></div>
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-[9px] text-neutral-400 leading-relaxed uppercase">
            Click to Jump. Bird grows with every point.
          </p>
          <p className="text-[8px] text-neutral-600 italic">
            Powered by Gemini 3 Flash. Built for Vercel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
