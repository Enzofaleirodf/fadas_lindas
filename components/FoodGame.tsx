
import React, { useState, useEffect } from 'react';
import { FOOD_ITEMS } from '../constants';
import { FoodItem } from '../types';
import { Button } from './Button';
import { CheckCircle, XCircle, Smile, Frown } from 'lucide-react';

interface FoodGameProps {
  onComplete: (score: number) => void;
}

export const FoodGame: React.FC<FoodGameProps> = ({ onComplete }) => {
  const [gameItems, setGameItems] = useState<FoodItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'good' | 'bad' | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Shuffle and pick 5 random items on mount
  useEffect(() => {
    const shuffled = [...FOOD_ITEMS].sort(() => 0.5 - Math.random());
    setGameItems(shuffled.slice(0, 5));
  }, []);

  const currentFood = gameItems[currentIndex];

  const handleChoice = (choiceIsHealthy: boolean) => {
    if (!currentFood) return;
    
    const isCorrect = choiceIsHealthy === currentFood.isHealthy;
    
    if (isCorrect) {
      setScore(s => s + 50);
      setFeedback('good');
    } else {
      setFeedback('bad');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIndex < gameItems.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onComplete(score + (isCorrect ? 50 : 0));
      }
    }, 1000);
  };

  if (showIntro) {
    return (
      <div className="text-center bg-white p-8 rounded-3xl shadow-xl border-b-8 border-fabula-secondary max-w-lg mx-auto">
        <div className="flex justify-center mb-4">
            <div className="bg-fabula-secondary p-4 rounded-full">
                <Smile className="text-white w-12 h-12" />
            </div>
        </div>
        <h3 className="text-4xl font-display font-bold text-fabula-primary mb-4">
          O que faz o dente sorrir?
        </h3>
        <p className="text-xl mb-8 text-gray-600">Ajude a Fada Mãe a separar os alimentos amigos dos dentes!</p>
        <Button onClick={() => setShowIntro(false)} variant="secondary">COMEÇAR DESAFIO</Button>
      </div>
    );
  }

  if (!currentFood) return null;

  return (
    <div className="w-full max-w-md relative">
       {/* Progress Bar */}
       <div className="absolute -top-8 left-0 right-0 flex justify-center gap-2">
         {gameItems.map((_, idx) => (
           <div key={idx} className={`h-2 w-8 rounded-full transition-colors ${idx === currentIndex ? 'bg-fabula-secondary' : idx < currentIndex ? 'bg-fabula-accent' : 'bg-gray-300'}`} />
         ))}
       </div>

       {/* Card Container */}
       <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden min-h-[400px] flex flex-col justify-between transform transition-all">
          
          {/* Feedback Overlay */}
          {feedback && (
            <div className={`absolute inset-0 z-20 flex flex-col items-center justify-center bg-opacity-95 backdrop-blur-sm ${feedback === 'good' ? 'bg-green-50' : 'bg-red-50'}`}>
              {feedback === 'good' ? (
                <>
                    <CheckCircle size={100} className="text-fabula-accent mb-4 animate-bounce" />
                    <span className="text-4xl font-display font-bold text-fabula-primary">DENTE FELIZ!</span>
                </>
              ) : (
                <>
                    <XCircle size={100} className="text-fabula-secondary mb-4 animate-pulse" />
                    <span className="text-4xl font-display font-bold text-fabula-secondary">CUIDADO!</span>
                </>
              )}
            </div>
          )}

          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Arquivo Fábula #{currentFood.id}</span>
            <span className="font-display text-2xl text-fabula-primary font-bold">{score} pts</span>
          </div>
          
          <div className="flex-grow flex flex-col items-center justify-center mb-6">
            <div className="bg-gray-50 w-48 h-48 rounded-full flex items-center justify-center border-4 border-dashed border-fabula-accent mb-4">
                <span className="text-[8rem] filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300" role="img" aria-label={currentFood.name}>
                {currentFood.emoji}
                </span>
            </div>
            <h2 className="text-4xl font-display font-bold text-fabula-primary">
                {currentFood.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleChoice(true)}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-fabula-accent bg-white hover:bg-green-50 active:scale-95 transition-all group"
            >
              <Smile className="text-fabula-accent mb-2 group-hover:scale-110 transition-transform" size={40} />
              <span className="font-bold text-fabula-primary text-lg font-display">Dente Feliz</span>
            </button>
            
            <button
              onClick={() => handleChoice(false)}
              className="flex flex-col items-center p-4 rounded-2xl border-2 border-fabula-secondary bg-white hover:bg-red-50 active:scale-95 transition-all group"
            >
              <Frown className="text-fabula-secondary mb-2 group-hover:scale-110 transition-transform" size={40} />
              <span className="font-bold text-fabula-secondary text-lg font-display">Dente Triste</span>
            </button>
          </div>
       </div>
    </div>
  );
};