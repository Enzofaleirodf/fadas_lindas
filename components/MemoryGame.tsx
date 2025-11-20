
import React, { useState, useEffect } from 'react';
import { MEMORY_CARDS_DATA } from '../constants';
import { MemoryCard, Difficulty } from '../types';
import { Button } from './Button';
import { audioService } from '../services/audioService';
import { Sparkles, Trophy, Star, Brain } from 'lucide-react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  difficulty: Difficulty;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete, difficulty }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    // Definir quantas cartas usar baseado na dificuldade
    let itemsToUse;
    switch (difficulty) {
        case Difficulty.EASY:
            itemsToUse = MEMORY_CARDS_DATA.slice(0, 4); // 4 pares (8 cartas)
            break;
        case Difficulty.HARD:
            itemsToUse = MEMORY_CARDS_DATA.slice(0, 8); // 8 pares (16 cartas - Todos)
            break;
        default: // MEDIUM
            itemsToUse = MEMORY_CARDS_DATA.slice(0, 6); // 6 pares (12 cartas)
            break;
    }

    const pairs = [...itemsToUse, ...itemsToUse];
    const shuffled = pairs
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
  }, [difficulty]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) return;

    audioService.playZap();

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      checkForMatch(newFlipped[0], newFlipped[1]);
    }
  };

  const checkForMatch = (index1: number, index2: number) => {
    if (cards[index1].emoji === cards[index2].emoji) {
      audioService.playCollect();
      setTimeout(() => {
        setCards(prev => prev.map((card, i) => 
          i === index1 || i === index2 ? { ...card, isMatched: true } : card
        ));
        setFlippedIndices([]);
        setMatches(m => m + 1);
      }, 500);
    } else {
      setTimeout(() => {
        setCards(prev => prev.map((card, i) => 
          i === index1 || i === index2 ? { ...card, isFlipped: false } : card
        ));
        setFlippedIndices([]);
        audioService.playError();
      }, 1000);
    }
  };

  useEffect(() => {
    const totalPairs = cards.length / 2;
    if (totalPairs > 0 && matches === totalPairs) {
      const calculatedScore = Math.max(100, 1000 - (moves * 20));
      setFinalScore(calculatedScore);
      setIsFinished(true);
      audioService.playWin();
    }
  }, [matches, cards.length, moves]);

  // Ajuste de Grid responsivo
  const getGridClass = () => {
      if (difficulty === Difficulty.EASY) return "grid-cols-4 max-w-sm"; 
      if (difficulty === Difficulty.HARD) return "grid-cols-4 max-w-xl"; 
      return "grid-cols-4 max-w-lg"; 
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-fabula-accent text-center max-w-3xl relative overflow-hidden min-h-[500px] flex flex-col">
      
      {/* HUD */}
      <div className="mb-4 md:mb-8 flex justify-between items-center font-display text-2xl md:text-3xl text-fabula-primary opacity-80 border-b pb-4 border-fabula-accent/20">
        <span>Pares: {matches}/{cards.length / 2}</span>
        <span>Jogadas: {moves}</span>
      </div>

      {/* GRID DE CARTAS */}
      <div className={`grid gap-3 md:gap-4 mx-auto w-full justify-center transition-all duration-500 ${getGridClass()} ${isFinished ? 'blur-sm opacity-40' : ''}`}>
        {cards.map((card, index) => (
        <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            disabled={card.isMatched || isFinished}
            className={`
                aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 transform shadow-md
                ${card.isFlipped || card.isMatched 
                    ? 'bg-white border-4 border-fabula-primary scale-100' 
                    : 'bg-fabula-accent hover:scale-105 hover:bg-fabula-accent/80'
                }
            `}
        >
            {card.isFlipped || card.isMatched ? (
                <span className="text-4xl md:text-6xl animate-bounce select-none">{card.emoji}</span>
            ) : (
                <Sparkles className="text-white opacity-60 w-8 h-8 md:w-12 md:h-12" />
            )}
        </button>
        ))}
      </div>

      {/* TELA DE VITÓRIA (Overlay) */}
      {isFinished && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-2xl p-8 text-center animate-fade-in">
           <div className="relative mb-6">
               <div className="absolute inset-0 bg-yellow-200 blur-xl rounded-full animate-pulse"></div>
               <Trophy size={80} className="text-yellow-400 fill-yellow-400 relative z-10 animate-bounce" />
           </div>

           <h3 className="text-4xl md:text-5xl font-display font-bold text-fabula-primary mb-2">
            Memória Brilhante!
           </h3>
           
           <div className="flex items-center gap-2 mb-6">
             <Star className="text-fabula-accent fill-fabula-accent" size={24} />
             <p className="text-xl text-gray-600 font-bold">Você encontrou todos os pares!</p>
             <Star className="text-fabula-accent fill-fabula-accent" size={24} />
           </div>

           <div className="bg-fabula-accent/10 p-6 rounded-2xl border-2 border-fabula-accent/20 mb-8 w-full max-w-sm">
              <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                      <Brain size={20} className="text-fabula-primary" />
                      <span className="text-gray-600 font-bold uppercase text-sm">Jogadas</span>
                  </div>
                  <span className="text-2xl font-display font-bold text-fabula-primary">{moves}</span>
              </div>
              <div className="w-full h-px bg-fabula-accent/20 my-2"></div>
              <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold uppercase text-sm">Pontuação</span>
                  <span className="text-4xl font-display font-bold text-fabula-secondary">{finalScore}</span>
              </div>
           </div>

           <Button onClick={() => onComplete(finalScore)} variant="primary" className="animate-pulse shadow-xl">
             PRÓXIMA FASE
           </Button>
        </div>
      )}
    </div>
  );
};
