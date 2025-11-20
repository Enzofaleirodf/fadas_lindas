
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { audioService } from '../services/audioService';
import { CuteGerm } from './CuteGerm';
import { Star, Cloud, Flag, MapPin } from 'lucide-react';
import { Difficulty } from '../types';

interface RunnerGameProps {
  onComplete: (score: number) => void;
  characterName: string;
  difficulty: Difficulty;
}

export const RunnerGame: React.FC<RunnerGameProps> = ({ onComplete, characterName, difficulty }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(50);
  const [obstacles, setObstacles] = useState<{id: number, x: number, y: number, type: 'germ'|'star'|'castle', variant?: 1|2|3|4}[]>([]);
  const [finishLineAppeared, setFinishLineAppeared] = useState(false);
  
  // Configuração balanceada para 20 segundos de gameplay
  const getDifficultySettings = () => {
    switch (difficulty) {
        case Difficulty.EASY: return { speed: 0.6, goal: 1500, spawnRate: 0.02 };
        case Difficulty.HARD: return { speed: 1.4, goal: 3000, spawnRate: 0.05 };
        default: return { speed: 0.9, goal: 2000, spawnRate: 0.03 }; // MEDIUM
    }
  };
  const settings = getDifficultySettings();

  const [gameSpeed, setGameSpeed] = useState(settings.speed);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  
  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStarsCollected(0);
    setGameOver(false);
    setHasWon(false);
    setObstacles([]);
    setPlayerPosition(50);
    setGameSpeed(settings.speed);
    setFinishLineAppeared(false);
    audioService.playZap();
  };

  const updateGame = () => {
    if (!isPlaying || gameOver) return;

    // Gerar Chegada (Castelo) quando perto da meta
    if (!finishLineAppeared && score >= settings.goal - 300) {
         setFinishLineAppeared(true);
         setObstacles(prev => [...prev, {
             id: Date.now(),
             x: 130, // Nasce bem longe
             y: 55, // Centralizado verticalmente
             type: 'castle'
         }]);
    }

    // Gerar obstáculos normais apenas se a chegada não apareceu
    if (!finishLineAppeared) {
        setObstacles(prev => {
            if (Math.random() < settings.spawnRate) {
                const isStar = Math.random() > 0.6;
                prev.push({
                id: Date.now(),
                x: 110,
                y: Math.random() * 80 + 10,
                type: isStar ? 'star' : 'germ',
                variant: isStar ? undefined : (Math.floor(Math.random() * 4) + 1) as 1|2|3|4
                });
            }
            return prev;
        });
    }

    // Mover Obstáculos
    setObstacles(prev => 
      prev
        .map(obs => ({ ...obs, x: obs.x - gameSpeed }))
        // Não remove o castelo se ele passar da tela (embora devamos parar antes)
        .filter(obs => obs.type === 'castle' ? true : obs.x > -20)
    );

    // Colisão
    obstacles.forEach(obs => {
      
      // LÓGICA DE VITÓRIA (CASTELO)
      if (obs.type === 'castle') {
          // Se o castelo chegar perto da fada (X < 40), Ganha!
          if (obs.x < 40) {
              handleWin();
          }
          return; 
      }

      // Lógica normal para germes e estrelas
      // Checa se está na mesma faixa horizontal (X)
      if (obs.x < 15 && obs.x > 5) {
        const playerY = playerPosition;
        // Checa se está na mesma altura vertical (Y)
        if (Math.abs(playerY - obs.y) < 12) {
          
          if (obs.type === 'star') {
             audioService.playCollect();
             setStarsCollected(s => s + 1);
             setScore(s => s + 100);
             // Remove estrela movendo para longe visualmente
             obs.x = -100;
             obs.y = -100;
          } else if (obs.type === 'germ') {
             audioService.playError();
             handleGameOver();
          }
        }
      }
    });

    // Score só aumenta se não tiver ganhado ainda
    if (!gameOver && !hasWon) {
        setScore(s => s + 1);
    }
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
  };

  const handleWin = () => {
    setHasWon(true);
    setIsPlaying(false); // Para o loop do jogo
    setGameOver(true); 
    setScore(settings.goal); 
    audioService.playWin();
  };

  useEffect(() => {
    if (isPlaying) {
        requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, obstacles, playerPosition, settings.goal, settings.spawnRate, finishLineAppeared]); 

  const handleInput = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !isPlaying) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientY;
    
    if ('touches' in e) {
        clientY = e.touches[0].clientY;
    } else {
        clientY = (e as React.MouseEvent).clientY;
    }

    const relativeY = ((clientY - rect.top) / rect.height) * 100;
    setPlayerPosition(Math.max(5, Math.min(95, relativeY)));
  };

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-4xl h-96 bg-blue-100 rounded-3xl relative overflow-hidden shadow-2xl border-4 border-fabula-secondary cursor-none touch-none"
      onMouseMove={handleInput}
      onTouchMove={handleInput}
    >
        <div className="absolute inset-0 opacity-30 pointer-events-none">
            <Cloud className="absolute top-10 left-10 text-white w-20 h-20 animate-float" />
            <Cloud className="absolute top-40 left-1/2 text-white w-32 h-32 animate-float" style={{ animationDelay: '1s' }} />
            <Cloud className="absolute bottom-10 right-20 text-white w-24 h-24 animate-float" style={{ animationDelay: '2s' }} />
        </div>

        {/* TELA INICIAL */}
        {!isPlaying && !gameOver && !hasWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-50 backdrop-blur-sm cursor-auto">
                <Flag size={60} className="text-fabula-primary mb-4 animate-bounce" />
                <h2 className="text-4xl font-display font-bold text-fabula-primary mb-2">Voo da Fada</h2>
                <p className="text-xl text-gray-600 mb-8 text-center max-w-md font-sans">
                    Desvie dos doces e pegue estrelas!<br/>
                    Chegue ao Castelo Mágico para vencer.
                </p>
                <Button onClick={startGame}>DECOLAR</Button>
            </div>
        )}

        {/* TELA GAME OVER */}
        {gameOver && !hasWon && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50/95 z-50 cursor-auto">
                <h2 className="text-4xl font-display font-bold text-fabula-secondary mb-4">Ops! Cuidado com a Cárie!</h2>
                <Button onClick={startGame} variant="secondary">TENTAR DE NOVO</Button>
            </div>
        )}

        {/* TELA VITÓRIA (FINAL) */}
        {hasWon && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-50 cursor-auto animate-fade-in backdrop-blur-md">
                 <div className="relative mb-4">
                    <div className="absolute -inset-4 bg-yellow-200 blur-xl rounded-full opacity-50 animate-pulse"></div>
                    <img 
                       src="https://files.catbox.moe/dajv5y.png" 
                       alt="Castelo" 
                       className="h-32 w-auto object-contain relative z-10 drop-shadow-lg"
                    />
                 </div>

                <h2 className="text-5xl font-display font-bold text-fabula-primary mb-2">Chegada no Castelo!</h2>
                <p className="text-xl text-gray-600 mb-6 font-bold">Vitória Mágica!</p>

                <div className="bg-fabula-secondary/10 p-4 rounded-2xl border-2 border-fabula-secondary/20 mb-6 w-full max-w-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <MapPin size={20} className="text-fabula-secondary" />
                            <span className="text-gray-700 font-bold uppercase text-xs">Distância Total</span>
                        </div>
                        <span className="text-2xl font-display font-bold text-fabula-secondary">{score}m</span>
                    </div>
                    <div className="flex justify-between items-center bg-yellow-400/20 p-3 rounded-xl border border-yellow-400/30">
                        <div className="flex items-center gap-2">
                            <Star size={20} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-gray-700 font-bold uppercase text-xs">Estrelas Coletadas</span>
                        </div>
                        <span className="text-2xl font-display font-bold text-yellow-600">{starsCollected}</span>
                    </div>
                </div>

                <Button onClick={() => onComplete(score)} variant="primary" className="animate-pulse text-xl px-8 py-4">
                    RECEBER CARTA MÁGICA
                </Button>
            </div>
        )}

        {/* Fada (Player) */}
        <div 
            className={`absolute left-10 w-16 h-16 transition-all duration-75 ease-out z-20 ${hasWon ? 'opacity-0' : 'opacity-100'}`}
            style={{ top: `${playerPosition}%`, transform: 'translateY(-50%)' }}
        >
            <div className="relative">
                <div className="absolute -inset-4 bg-white/40 blur-md rounded-full"></div>
                <span className="text-5xl drop-shadow-lg relative z-10">🧚‍♀️</span>
            </div>
        </div>

        {obstacles.map(obs => (
            <div 
                key={obs.id}
                className="absolute flex items-center justify-center z-10 transition-transform"
                style={{ 
                    left: `${obs.x}%`, 
                    top: `${obs.y}%`, 
                    transform: 'translate(-50%, -50%)',
                    width: obs.type === 'castle' ? 'auto' : '3rem',
                    height: obs.type === 'castle' ? 'auto' : '3rem',
                    opacity: hasWon && obs.type !== 'castle' ? 0 : 1
                }}
            >
                {obs.type === 'castle' ? (
                     // Imagem do Castelo
                     <img 
                       src="https://files.catbox.moe/dajv5y.png" 
                       alt="Castelo da Fábula"
                       className="h-64 w-auto object-contain drop-shadow-2xl"
                       style={{ transform: 'scale(1.5)' }}
                     />
                ) : obs.type === 'star' ? (
                    <Star className="text-yellow-400 fill-yellow-400 w-10 h-10 animate-spin" />
                ) : (
                    <CuteGerm size={50} type={obs.variant || 1} />
                )}
            </div>
        ))}

        <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <div className="bg-white/80 px-4 py-2 rounded-full font-bold font-display text-2xl text-fabula-primary border border-fabula-primary shadow-sm">
                {Math.floor(score / 10)} m
            </div>
            <div className="bg-yellow-400/90 px-4 py-2 rounded-full font-bold font-display text-xl text-white border-2 border-yellow-500 shadow-sm flex items-center gap-2">
                <Star className="fill-white w-5 h-5" />
                {starsCollected}
            </div>
        </div>
    </div>
  );
};
