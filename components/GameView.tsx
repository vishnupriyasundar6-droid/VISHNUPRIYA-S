import React from 'react';
import { GameState } from '../types.ts';
import { GAME_WIDTH, GAME_HEIGHT, BIRD_SIZE, PIPE_WIDTH, PIPE_GAP } from '../constants.ts';

interface GameViewProps {
  state: GameState;
  onJump: () => void;
}

const GameView: React.FC<GameViewProps> = ({ state, onJump }) => {
  const { birdY, birdScale, pipes, score, theme, isGameOver, isGameStarted, aiMessage } = state;

  return (
    <div 
      className={`relative overflow-hidden cursor-pointer select-none transition-colors duration-1000 ${theme.skyColor}`}
      style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      onClick={onJump}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl">☁️</div>
        <div className="absolute top-40 right-20 text-4xl">☁️</div>
        <div className="absolute bottom-60 left-40 text-5xl">☁️</div>
      </div>

      {/* Score & AI Commentary */}
      <div className="absolute top-12 left-0 right-0 text-center z-20 pointer-events-none">
        <h1 className="text-6xl text-white font-black drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] outline-black">
          {score}
        </h1>
        <div className="min-h-[40px] flex items-center justify-center px-6">
          {aiMessage && (
            <p className={`${theme.accentColor} text-[10px] uppercase font-bold tracking-tighter animate-bounce bg-black/30 py-1 px-3 rounded-full backdrop-blur-sm border border-white/10 shadow-lg`}>
              {aiMessage}
            </p>
          )}
        </div>
      </div>

      {/* Bird (with Growth Mechanic) */}
      <div 
        className="absolute transition-all duration-75 pointer-events-none flex items-center justify-center"
        style={{ 
          top: birdY, 
          left: 50, 
          width: BIRD_SIZE, 
          height: BIRD_SIZE,
          transform: `scale(${birdScale}) rotate(${state.birdVelocity * 3}deg)`,
          transformOrigin: 'center center'
        }}
      >
        <span className="text-5xl drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
          {theme.birdEmoji}
        </span>
      </div>

      {/* Pipes */}
      {pipes.map((pipe) => (
        <React.Fragment key={pipe.id}>
          <div 
            className={`absolute border-x-4 border-black/20 ${theme.pipeColor} transition-colors duration-500 shadow-inner`}
            style={{ 
              left: pipe.x, 
              top: 0, 
              width: PIPE_WIDTH, 
              height: pipe.topHeight,
              borderRadius: '0 0 12px 12px'
            }} 
          >
            <div className="absolute bottom-0 left-[-4px] right-[-4px] h-6 bg-inherit border-4 border-black/20 rounded-md" />
          </div>
          <div 
            className={`absolute border-x-4 border-black/20 ${theme.pipeColor} transition-colors duration-500 shadow-inner`}
            style={{ 
              left: pipe.x, 
              top: pipe.topHeight + PIPE_GAP, 
              width: PIPE_WIDTH, 
              height: GAME_HEIGHT - (pipe.topHeight + PIPE_GAP),
              borderRadius: '12px 12px 0 0'
            }} 
          >
            <div className="absolute top-0 left-[-4px] right-[-4px] h-6 bg-inherit border-4 border-black/20 rounded-md" />
          </div>
        </React.Fragment>
      ))}

      {/* Ground */}
      <div className={`absolute bottom-0 w-full h-12 ${theme.groundColor} z-10 border-t-8 border-black/20 flex items-start overflow-hidden`}>
        <div className="w-[200%] h-full opacity-30 animate-[slide_2s_linear_infinite]" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, black 20px, black 40px)' }} />
      </div>

      {/* Overlays */}
      {!isGameStarted && !isGameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white p-8 text-center z-30">
          <div className="mb-2 text-[10px] tracking-[0.4em] opacity-60 uppercase">The Evolution of</div>
          <h2 className="text-4xl font-black mb-12 tracking-tighter italic">GEMINI FLAP</h2>
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 animate-pulse">
            <div className="text-sm font-bold mb-2 uppercase tracking-widest">Tap to Launch</div>
            <p className="text-[9px] opacity-70">Watch out: You grow as you go.</p>
          </div>
          <div className="mt-20 text-[8px] opacity-40 uppercase tracking-widest">World: {theme.name}</div>
        </div>
      )}

      {isGameOver && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-8 text-center z-30 animate-in fade-in duration-500">
          <h2 className="text-5xl font-black mb-2 text-white italic tracking-tighter">EXTINCT</h2>
          <div className="text-2xl mb-8 font-bold opacity-80 uppercase tracking-widest">Final Size: {birdScale.toFixed(2)}x</div>
          
          <div className="bg-black/40 p-6 rounded-xl mb-10 border border-white/10 w-full max-w-xs">
            <div className="text-[10px] text-neutral-400 mb-2 uppercase tracking-widest font-bold">AI Verdict</div>
            <p className="text-sm text-yellow-300 italic font-medium leading-relaxed">"{aiMessage}"</p>
          </div>

          <button 
            className="bg-white text-black font-black px-10 py-5 rounded-full shadow-[0_10px_0_0_#d1d5db] active:shadow-none active:translate-y-[10px] transition-all text-sm uppercase tracking-[0.2em]"
            onClick={(e) => { e.stopPropagation(); location.reload(); }}
          >
            Restart
          </button>
        </div>
      )}

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(-40px); }
        }
      `}</style>
    </div>
  );
};

export default GameView;