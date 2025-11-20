
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Crosshair, Trophy, Star } from 'lucide-react';
import { Button } from './Button';
import { CuteGerm } from './CuteGerm';
import { audioService } from '../services/audioService';
import { Difficulty, CursorMode } from '../types';
import { CustomCursor } from './CustomCursor';

interface LaserGameProps {
  onComplete: (score: number) => void;
  difficulty: Difficulty;
}

interface BugEntity {
  id: number;
  x: number;
  y: number;
  createdAt: number;
  isZapped: boolean;
  variant: 1 | 2 | 3 | 4;
}

export const LaserGame: React.FC<LaserGameProps> = ({ onComplete, difficulty }) => {
  const [bugs, setBugs] = useState<BugEntity[]>([]);
  const [score, setScore] = useState(0);
  const [zappedCount, setZappedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  // Configuração baseada na dificuldade
  const getDifficultySettings = () => {
      switch (difficulty) {
          // Easy: Mais tempo de jogo, bugs duram mais na tela
          case Difficulty.EASY: return { time: 30, spawnRate: 1000, bugLife: 3000 };
          // Hard: Menos tempo, bugs somem rápido
          case Difficulty.HARD: return { time: 20, spawnRate: 400, bugLife: 1200 };
          // Medium
          default: return { time: 25, spawnRate: 700, bugLife: 2000 }; 
      }
  };
  const settings = getDifficultySettings();

  const [timeLeft, setTimeLeft] = useState(settings.time);
  const [isActive, setIsActive] = useState(false);

  const spawnBug = useCallback(() => {
    const newBug: BugEntity = {
      id: Math.random(),
      x: Math.random() * 70 + 10, 
      y: Math.random() * 60 + 15, 
      createdAt: Date.now(),
      isZapped: false,
      variant: Math.floor(Math.random() * 4) + 1 as 1|2|3|4
    };
    setBugs(prev => [...prev, newBug]);
    audioService.playJump(); 
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const gameLoop = setInterval(() => {
        const now = Date.now();
        setBugs(prev => prev.filter(bug => {
             if (bug.isZapped) return true; // Mantém os mortos pela animação
             return (now - bug.createdAt) < settings.bugLife;
        }));
      }, 100); 

      const timerInterval = setInterval(() => setTimeLeft(t => t - 1), 1000);
      const spawnerInterval = setInterval(spawnBug, settings.spawnRate); 
      
      return () => {
        clearInterval(gameLoop);
        clearInterval(timerInterval);
        clearInterval(spawnerInterval);
      };
    } else if (isActive && timeLeft === 0) {
      setIsActive(false);
      setIsFinished(true);
      audioService.playWin();
    }
  }, [isActive, timeLeft, spawnBug, settings.spawnRate, settings.bugLife]);

  const handleZap = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    audioService.playZap(); 
    setBugs(prev => prev.map(bug => 
      bug.id === id ? { ...bug, isZapped: true } : bug
    ));
    setScore(s => s + 100);
    setZappedCount(c => c + 1);
  };

  const startGame = () => {
    setIsActive(true);
    setIsFinished(false);
    setScore(0);
    setZappedCount(0);
    setTimeLeft(settings.time);
    setBugs([]);
    audioService.playZap();
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-2xl border-4 border-fabula-accent relative overflow-hidden h-[500px] flex flex-col">
      {isActive && <CustomCursor mode={CursorMode.LASER} />}
      
      {/* TELA INICIAL */}
      {!isActive && !isFinished && timeLeft === settings.time && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/95 rounded-2xl p-8 text-center cursor-auto">
          <Crosshair size={64} className="text-fabula-primary mb-4" />
          <h3 className="text-4xl font-display font-bold text-fabula-primary mb-4">
            Limpeza Mágica
          </h3>
          <p className="mb-8 text-xl text-gray-600 max-w-md font-sans">
            A cárie aparece e some rápido! Seja veloz com o laser.
          </p>
          <Button onClick={startGame} variant="primary">
            ATIVAR LASER
          </Button>
        </div>
      )}

      {/* TELA DE VITÓRIA / FEEDBACK */}
      {isFinished && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center animate-fade-in cursor-auto">
          <Trophy size={80} className="text-yellow-400 fill-yellow-400 mb-6 animate-bounce" />
          
          <h3 className="text-5xl font-display font-bold text-fabula-primary mb-2">
            Limpeza Completa!
          </h3>
          
          <div className="flex items-center gap-2 mb-8">
             <Star className="text-fabula-accent fill-fabula-accent" />
             <p className="text-2xl text-gray-600 font-bold">Você protegeu o sorriso!</p>
             <Star className="text-fabula-accent fill-fabula-accent" />
          </div>

          <div className="bg-fabula-primary/5 p-6 rounded-2xl border-2 border-fabula-primary/10 mb-8 w-full max-w-sm">
              <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500 font-bold uppercase text-sm">Pontuação Total</span>
                  <span className="text-3xl font-display font-bold text-fabula-primary">{score}</span>
              </div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase text-sm">Cárie Eliminada</span>
                  <span className="text-3xl font-display font-bold text-fabula-secondary">{zappedCount}</span>
              </div>
          </div>

          <Button onClick={() => onComplete(score)} variant="primary" className="animate-pulse">
            CONTINUAR AVENTURA
          </Button>
        </div>
      )}

      {/* HUD */}
      <div className="flex justify-between mb-4 font-display text-3xl font-bold text-fabula-primary px-4 select-none relative z-10">
        <div className="flex items-center gap-2 bg-white/80 px-4 py-1 rounded-full shadow-sm">
            <span className="w-24">Tempo: {timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2 bg-white/80 px-4 py-1 rounded-full shadow-sm">
            <span>Pontos: {score}</span>
        </div>
      </div>

      {/* ÁREA DO JOGO */}
      <div className="relative flex-grow bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 overflow-hidden shadow-inner cursor-none">
         <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#095751 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         {bugs.map(bug => (
           <div
             key={bug.id}
             onMouseDown={(e) => !bug.isZapped && handleZap(bug.id, e)}
             style={{ left: `${bug.x}%`, top: `${bug.y}%` }}
             className={`absolute transform transition-all duration-200 p-4
               ${bug.isZapped ? 'scale-150 opacity-0 pointer-events-none' : 'scale-100 animate-float'}`}
           >
             {bug.isZapped ? (
               <div className="relative pointer-events-none">
                 <Zap size={60} className="text-cyan-400 fill-current drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
               </div>
             ) : (
               <CuteGerm 
                 size={70} 
                 type={bug.variant}
                 className="pointer-events-auto hover:scale-110 transition-transform"
               />
             )}
           </div>
         ))}
      </div>
    </div>
  );
};
