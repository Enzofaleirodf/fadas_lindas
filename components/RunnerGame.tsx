
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
  const [isInvulnerable, setIsInvulnerable] = useState(false);
  const [lives, setLives] = useState(3);

  // Configuração balanceada - AJUSTADA V2
  const getDifficultySettings = () => {
    switch (difficulty) {
        case Difficulty.EASY: return { speed: 0.7, goal: 2500, spawnRate: 0.018 }; // ~42s
        case Difficulty.HARD: return { speed: 1.2, goal: 3500, spawnRate: 0.035 }; // ~58s
        default: return { speed: 0.9, goal: 3000, spawnRate: 0.025 }; // MEDIUM ~50s
    }
  };
  const settings = getDifficultySettings();

  const [gameSpeed] = useState(settings.speed);
  const [gameOver, setGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [isLanding, setIsLanding] = useState(false);

  const requestRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const obstaclesRef = useRef<{id: number, x: number, y: number, type: 'germ'|'star'|'castle', variant?: 1|2|3|4}[]>([]);
  const scoreRef = useRef(0);
  const starsRef = useRef(0);
  const finishLineRef = useRef(false);
  const isInvulnerableRef = useRef(false);
  const gameOverRef = useRef(false);
  const livesRef = useRef(3);
  const invulnerabilityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setStarsCollected(0);
    setGameOver(false);
    setHasWon(false);
    setIsLanding(false);
    setObstacles([]);
    setPlayerPosition(50);
    setFinishLineAppeared(false);
    setIsInvulnerable(false);
    setLives(3);

    // Resetar todas as refs
    obstaclesRef.current = [];
    scoreRef.current = 0;
    starsRef.current = 0;
    finishLineRef.current = false;
    isInvulnerableRef.current = false;
    gameOverRef.current = false;
    livesRef.current = 3;
    obstacleIdRef.current = 0;
    playerPositionRef.current = 50;

    // Limpar timer de invulnerabilidade se existir
    if (invulnerabilityTimerRef.current) {
      clearTimeout(invulnerabilityTimerRef.current);
      invulnerabilityTimerRef.current = null;
    }

    audioService.playZap();
  };

  const playerPositionRef = useRef(50);

  const updateGame = () => {
    if (!isPlaying || gameOverRef.current) return;

    // Aumenta score
    scoreRef.current += 1;
    setScore(scoreRef.current);

    // Gerar Castelo quando perto da meta
    if (!finishLineRef.current && scoreRef.current >= settings.goal - 300) {
         finishLineRef.current = true;
         setFinishLineAppeared(true);
         obstaclesRef.current.push({
             id: obstacleIdRef.current++,
             x: 130,
             y: 50, // Centro vertical (castelo ocupa altura toda)
             type: 'castle'
         });
    }

    // Gerar obstáculos normais
    if (!finishLineRef.current && Math.random() < settings.spawnRate) {
        const isStar = Math.random() > 0.6;
        obstaclesRef.current.push({
            id: obstacleIdRef.current++,
            x: 110,
            y: Math.random() * 80 + 10,
            type: isStar ? 'star' : 'germ',
            variant: isStar ? undefined : (Math.floor(Math.random() * 4) + 1) as 1|2|3|4
        });
    }

    // Mover e filtrar obstáculos (para castelo quando chega na fada)
    obstaclesRef.current = obstaclesRef.current
        .map(obs => {
          // Para o castelo quando chega na posição da fada
          if (obs.type === 'castle' && obs.x <= 20) {
            return { ...obs, x: 20 }; // Trava na posição
          }
          return { ...obs, x: obs.x - gameSpeed };
        })
        .filter(obs => obs.type === 'castle' ? true : obs.x > -5);

    // Verificar colisões - IMPORTANTE: verificar antes de modificar o array
    const idsToRemove: number[] = [];

    obstaclesRef.current.forEach(obs => {
      // Vitória com castelo - detecção quando toca
      if (obs.type === 'castle' && !gameOverRef.current) {
        const FAIRY_X = 10;
        const CASTLE_X = 20;

        // Castelo chegou na posição da fada
        if (obs.x <= CASTLE_X && obs.x >= CASTLE_X - 2) {
          // Move fada para o centro do castelo
          playerPositionRef.current = 50;
          setPlayerPosition(50);
          handleWin();
          return;
        }
      }

      // Detecção de colisão - hitbox mais precisa
      const FAIRY_X = 10; // Fada está em left-10 (10% da tela)
      const FAIRY_SIZE = 6; // Tamanho visual da fada
      const OBSTACLE_SIZE = 5; // Tamanho dos obstáculos

      // Colisão só acontece quando realmente se tocam
      const isNearHorizontally = obs.x >= (FAIRY_X - OBSTACLE_SIZE) && obs.x <= (FAIRY_X + FAIRY_SIZE);
      const isNearVertically = Math.abs(playerPositionRef.current - obs.y) < (FAIRY_SIZE + OBSTACLE_SIZE) / 2;

      if (isNearHorizontally && isNearVertically) {
        if (obs.type === 'star') {
           // Coletar estrela
           audioService.playCollect();
           starsRef.current += 1;
           scoreRef.current += 100;
           setStarsCollected(starsRef.current);
           setScore(scoreRef.current);
           idsToRemove.push(obs.id);
        } else if (obs.type === 'germ' && !isInvulnerableRef.current) {
           // Colidir com germe
           audioService.playError();
           idsToRemove.push(obs.id);
           handleHit();
        }
      }
    });

    // Remover obstáculos coletados/colididos ANTES de atualizar state
    if (idsToRemove.length > 0) {
      obstaclesRef.current = obstaclesRef.current.filter(o => !idsToRemove.includes(o.id));
    }

    // Atualizar state com obstáculos filtrados
    setObstacles([...obstaclesRef.current]);
    requestRef.current = requestAnimationFrame(updateGame);
  };

  const handleGameOver = () => {
    gameOverRef.current = true;
    setGameOver(true);
    setIsPlaying(false);

    // Limpar timer de invulnerabilidade
    if (invulnerabilityTimerRef.current) {
      clearTimeout(invulnerabilityTimerRef.current);
      invulnerabilityTimerRef.current = null;
    }
  };

  const handleHit = () => {
    // Usar setState funcional para evitar race condition
    setLives(prevLives => {
      const newLives = prevLives - 1;
      livesRef.current = newLives;

      if (newLives <= 0) {
        // Game Over - perdeu todas as vidas
        handleGameOver();
      } else {
        // Limpar timer anterior se existir
        if (invulnerabilityTimerRef.current) {
          clearTimeout(invulnerabilityTimerRef.current);
        }

        // Perde uma vida mas continua jogando
        isInvulnerableRef.current = true;
        setIsInvulnerable(true);
        playerPositionRef.current = 50;
        setPlayerPosition(50);

        // Remove invulnerabilidade após 1.5 segundos
        invulnerabilityTimerRef.current = setTimeout(() => {
          isInvulnerableRef.current = false;
          setIsInvulnerable(false);
          invulnerabilityTimerRef.current = null;
        }, 1500);
      }

      return newLives;
    });
  };

  const handleWin = () => {
    if (gameOverRef.current) return; // Evita múltiplas chamadas

    setIsLanding(true);
    audioService.playWin();

    // Animação de pouso e vitória
    setTimeout(() => {
      gameOverRef.current = true;
      setHasWon(true);
      setIsPlaying(false);
      setGameOver(true);
      setScore(settings.goal);
    }, 1200); // Tempo para animação completa
  };

  useEffect(() => {
    if (isPlaying && !gameOver) {
        requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (invulnerabilityTimerRef.current) {
          clearTimeout(invulnerabilityTimerRef.current);
          invulnerabilityTimerRef.current = null;
        }
    };
  }, [isPlaying]); 

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
    const newPosition = Math.max(5, Math.min(95, relativeY));
    playerPositionRef.current = newPosition; // Atualiza ref
    setPlayerPosition(newPosition);
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl h-96 md:h-[500px] bg-blue-100 rounded-3xl relative overflow-hidden shadow-2xl border-4 border-fabula-secondary touch-none"
      style={{ cursor: typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches ? 'none' : 'default' }}
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
             <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50 cursor-auto animate-fade-in backdrop-blur-md p-4 overflow-y-auto">
                 <div className="flex flex-col items-center justify-center w-full max-w-md my-auto">
                     <div className="relative mb-3 md:mb-4">
                        <div className="absolute -inset-4 bg-yellow-200 blur-xl rounded-full opacity-50 animate-pulse"></div>
                        <img
                           src="https://files.catbox.moe/dajv5y.png"
                           alt="Castelo"
                           className="h-16 md:h-24 lg:h-28 w-auto object-contain relative z-10 drop-shadow-lg"
                        />
                     </div>

                    <h2 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-fabula-primary mb-1 md:mb-2 text-center">Chegada no Castelo!</h2>
                    <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3 font-bold">Vitória Mágica!</p>

                    <div className="bg-fabula-secondary/10 p-3 md:p-4 rounded-xl border-2 border-fabula-secondary/20 mb-3 md:mb-4 w-full space-y-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-fabula-secondary md:w-5 md:h-5" />
                                <span className="text-gray-700 font-bold uppercase text-xs">Distância Total</span>
                            </div>
                            <span className="text-lg md:text-xl font-display font-bold text-fabula-secondary">{score}m</span>
                        </div>
                        <div className="flex justify-between items-center bg-yellow-400/20 p-3 rounded-xl border border-yellow-400/30">
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-yellow-500 fill-yellow-500 md:w-5 md:h-5" />
                                <span className="text-gray-700 font-bold uppercase text-xs">Estrelas Coletadas</span>
                            </div>
                            <span className="text-lg md:text-xl font-display font-bold text-yellow-600">{starsCollected}</span>
                        </div>
                    </div>

                    <Button onClick={() => onComplete(score)} variant="primary" className="animate-pulse text-sm md:text-base px-6 py-2.5 w-full">
                        RECEBER CARTA MÁGICA
                    </Button>
                 </div>
            </div>
        )}

        {/* Fada (Player) */}
        <div
            className={`absolute w-16 h-16 transition-all z-30
              ${hasWon ? 'opacity-0' : 'opacity-100'}
              ${isInvulnerable ? 'animate-pulse' : ''}
              ${isLanding ? 'scale-125 duration-500' : 'duration-75 ease-out'}
            `}
            style={{
              left: isLanding ? '20%' : '10%',
              top: `${playerPosition}%`,
              transform: 'translateY(-50%)',
              transition: isLanding ? 'all 1s ease-in-out' : 'top 75ms ease-out, left 0s'
            }}
        >
            <div className="relative">
                <div className={`absolute -inset-4 blur-md rounded-full ${
                  isLanding ? 'bg-yellow-300/80 animate-pulse' :
                  isInvulnerable ? 'bg-red-400/60' : 'bg-white/40'
                }`}></div>
                <span className={`text-5xl drop-shadow-lg relative z-10 ${isLanding ? 'animate-bounce' : ''}`}>🧚‍♀️</span>
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
                     // Imagem do Castelo (ajustada para não cortar)
                     <img
                       src="https://files.catbox.moe/dajv5y.png"
                       alt="Castelo da Fábula"
                       className="drop-shadow-2xl"
                       style={{
                         height: '350px',
                         width: 'auto',
                         objectFit: 'contain',
                         filter: isLanding ? 'brightness(1.2) drop-shadow(0 0 20px gold)' : 'none',
                         transition: 'filter 0.5s'
                       }}
                     />
                ) : obs.type === 'star' ? (
                    <Star className="text-yellow-400 fill-yellow-400 w-10 h-10 animate-spin" />
                ) : (
                    <CuteGerm size={50} type={obs.variant || 1} />
                )}
            </div>
        ))}

        <div className="absolute top-4 left-4 z-30">
            <div className="bg-red-500/90 px-4 py-2 rounded-full font-bold font-display text-xl text-white border-2 border-red-600 shadow-sm flex items-center gap-2">
                <span className="text-2xl">❤️</span>
                <span>x {lives}</span>
            </div>
        </div>

        <div className="absolute top-4 right-4 flex gap-3 z-30">
            <div className="bg-yellow-400/90 px-4 py-2 rounded-full font-bold font-display text-xl text-white border-2 border-yellow-500 shadow-sm flex items-center gap-2">
                <Star className="fill-white w-5 h-5" />
                {starsCollected}
            </div>
            <div className="bg-white/80 px-4 py-2 rounded-full font-bold font-display text-2xl text-fabula-primary border border-fabula-primary shadow-sm">
                {Math.floor(score / 10)} m
            </div>
        </div>
    </div>
  );
};
