
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Sparkles, Heart, Shield, Zap, Skull, Bug } from 'lucide-react';
import { Button } from './Button';

interface BossGameProps {
  onComplete: (score: number) => void;
}

interface FallingNote {
  id: number;
  lane: 0 | 1 | 2; // 0: Gabriela, 1: Sophie, 2: Julie
  y: number; // Percentage 0 to 100
  speed: number;
  type: 'normal' | 'fast';
}

export const BossGame: React.FC<BossGameProps> = ({ onComplete }) => {
  const [bossHp, setBossHp] = useState(100);
  const [score, setScore] = useState(0);
  const [notes, setNotes] = useState<FallingNote[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [combo, setCombo] = useState(0);
  const [laneFlash, setLaneFlash] = useState<[boolean, boolean, boolean]>([false, false, false]);
  
  const requestRef = useRef<number | null>(null);
  const lastSpawnTime = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Game Loop for movement
  const updateGame = useCallback((time: number) => {
    if (gameStatus !== 'playing') return;

    // Spawn Logic
    if (time - lastSpawnTime.current > 1200) { // Spawn every 1.2s
      const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const newNote: FallingNote = {
        id: Date.now(),
        lane,
        y: 0,
        speed: 0.4 + (Math.random() * 0.2), // Random speed
        type: Math.random() > 0.8 ? 'fast' : 'normal'
      };
      setNotes(prev => [...prev, newNote]);
      lastSpawnTime.current = time;
    }

    // Movement Logic
    setNotes(prev => {
      const nextNotes = prev.map(note => ({
        ...note,
        y: note.y + note.speed
      })).filter(note => note.y < 110); // Remove if off screen

      // Check for misses (went past 95%)
      const misses = prev.filter(n => n.y > 95 && n.y < 96);
      if (misses.length > 0) {
        setCombo(0); // Reset combo on miss
      }

      return nextNotes;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameStatus]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateGame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateGame]);

  // Handle Player Input
  const handleLanePress = (laneIndex: 0 | 1 | 2) => {
    if (gameStatus !== 'playing') return;

    // Visual Flash
    const newFlash = [...laneFlash] as [boolean, boolean, boolean];
    newFlash[laneIndex] = true;
    setLaneFlash(newFlash);
    setTimeout(() => setLaneFlash([false, false, false]), 150);

    // Hit Detection
    // Hit window is between 80% and 95% Y position
    const hitNoteIndex = notes.findIndex(n => n.lane === laneIndex && n.y > 75 && n.y < 95);

    if (hitNoteIndex !== -1) {
      // HIT!
      const note = notes[hitNoteIndex];
      setNotes(prev => prev.filter((_, i) => i !== hitNoteIndex));
      
      const damage = 5 + (combo > 5 ? 2 : 0); // Bonus damage on combo
      const newHp = Math.max(0, bossHp - damage);
      setBossHp(newHp);
      setScore(s => s + 100 + (combo * 10));
      setCombo(c => c + 1);

      if (newHp <= 0) {
        handleWin();
      }
    } else {
      // Miss click (penalty?)
      setCombo(0);
    }
  };

  const handleWin = () => {
    setGameStatus('won');
    setNotes([]);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    setTimeout(() => onComplete(score), 3000);
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') handleLanePress(0);
      if (e.key === 'ArrowDown' || e.key === 's') handleLanePress(1);
      if (e.key === 'ArrowRight' || e.key === 'd') handleLanePress(2);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, bossHp, combo, gameStatus]);

  return (
    <div className="w-full h-screen max-h-[800px] max-w-4xl relative flex flex-col bg-gray-900 rounded-xl border-4 border-fabula-primary shadow-2xl overflow-hidden select-none">
      
      {/* HUD */}
      <div className="absolute top-4 left-4 z-50 text-white font-display text-2xl">
        <div className="flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" />
            <span>{score}</span>
        </div>
        <div className="text-sm font-sans text-gray-400 mt-1">Combo: {combo}x</div>
      </div>

      {/* BOSS AREA (Top) */}
      <div className="h-1/3 relative flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 z-10 border-b-4 border-fabula-primary/30">
         {gameStatus === 'won' ? (
             <div className="flex flex-col items-center animate-bounce">
                 <Star size={120} className="text-yellow-400 fill-current drop-shadow-[0_0_30px_rgba(250,204,21,1)]" />
                 <h2 className="text-5xl font-display text-white font-bold mt-4">VITÓRIA!</h2>
             </div>
         ) : (
             <div className="relative w-full max-w-md flex flex-col items-center">
                {/* HP Bar */}
                <div className="w-64 h-6 bg-gray-700 rounded-full border-2 border-gray-500 mb-4 overflow-hidden relative">
                    <div 
                        className="h-full bg-gradient-to-r from-green-500 to-red-500 transition-all duration-200"
                        style={{ width: `${bossHp}%` }}
                    />
                </div>
                
                {/* Boss Sprite */}
                <div className="relative animate-float">
                    <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
                    <Skull size={120} className="text-gray-200 relative z-10" />
                    <div className="absolute top-8 left-6 w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                    <div className="absolute top-8 right-6 w-4 h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                        <CrownIcon />
                    </div>
                </div>
                <p className="text-red-500 font-display text-2xl mt-2">REI CÁRIE</p>
             </div>
         )}
      </div>

      {/* RHYTHM LANES AREA (Bottom 2/3) */}
      <div className="flex-grow relative bg-gray-900 perspective-container" ref={gameContainerRef}>
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(0deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,rgba(255,255,255,.3)_25%,rgba(255,255,255,.3)_26%,transparent_27%,transparent_74%,rgba(255,255,255,.3)_75%,rgba(255,255,255,.3)_76%,transparent_77%,transparent)] bg-[length:50px_50px]"></div>
        
        <div className="w-full h-full flex relative">
            {/* Lane 0: Gabriela */}
            <div className={`flex-1 border-r-2 border-gray-800 relative group transition-colors duration-100 ${laneFlash[0] ? 'bg-blue-900/40' : ''}`}>
                 {/* Target Zone */}
                 <div className="absolute bottom-4 left-2 right-2 h-24 rounded-xl border-4 border-blue-500/50 bg-blue-900/20 flex items-center justify-center">
                 </div>
            </div>

            {/* Lane 1: Sophie */}
            <div className={`flex-1 border-r-2 border-gray-800 relative transition-colors duration-100 ${laneFlash[1] ? 'bg-pink-900/40' : ''}`}>
                 {/* Target Zone */}
                 <div className="absolute bottom-4 left-2 right-2 h-24 rounded-xl border-4 border-pink-500/50 bg-pink-900/20 flex items-center justify-center">
                 </div>
            </div>

            {/* Lane 2: Julie */}
            <div className={`flex-1 relative transition-colors duration-100 ${laneFlash[2] ? 'bg-purple-900/40' : ''}`}>
                 {/* Target Zone */}
                 <div className="absolute bottom-4 left-2 right-2 h-24 rounded-xl border-4 border-purple-500/50 bg-purple-900/20 flex items-center justify-center">
                 </div>
            </div>

            {/* FALLING NOTES */}
            {notes.map(note => (
                <div 
                    key={note.id}
                    className="absolute w-16 h-16 z-20 transition-transform will-change-transform"
                    style={{
                        left: `${(note.lane * 33.33) + 16.66}%`, // Center of lane
                        top: `${note.y}%`,
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg
                     ${note.lane === 0 ? 'bg-blue-500 shadow-blue-500/50' : 
                       note.lane === 1 ? 'bg-pink-500 shadow-pink-500/50' : 
                       'bg-purple-500 shadow-purple-500/50'
                     }`}>
                       <Bug className="text-white w-8 h-8" />
                   </div>
                </div>
            ))}
        </div>

        {/* TOUCH CONTROLS (Buttons at bottom) */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-around px-4 z-30">
            <button 
                className="w-24 h-24 rounded-full bg-blue-600 border-4 border-blue-300 shadow-lg active:scale-90 transition-transform flex flex-col items-center justify-center"
                onPointerDown={() => handleLanePress(0)}
            >
                <Shield className="text-white mb-1" />
                <span className="text-white text-xs font-bold">DRA. GABRIELA</span>
            </button>

            <button 
                className="w-24 h-24 rounded-full bg-pink-600 border-4 border-pink-300 shadow-lg active:scale-90 transition-transform flex flex-col items-center justify-center"
                onPointerDown={() => handleLanePress(1)}
            >
                <Zap className="text-white mb-1" />
                <span className="text-white text-xs font-bold">FADA SOPHIE</span>
            </button>

            <button 
                className="w-24 h-24 rounded-full bg-purple-600 border-4 border-purple-300 shadow-lg active:scale-90 transition-transform flex flex-col items-center justify-center"
                onPointerDown={() => handleLanePress(2)}
            >
                <Heart className="text-white mb-1" />
                <span className="text-white text-xs font-bold">FADA JULIE</span>
            </button>
        </div>

      </div>
    </div>
  );
};

const CrownIcon = () => (
    <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 40L0 10L15 25L30 0L45 25L60 10L50 40H10Z" fill="#FACC15"/>
    </svg>
);
