
import React, { useState, useEffect } from 'react';
import { AppStage, Character, Difficulty, GameState, CursorMode, SavedMemory } from './types';
import { LORE, SONG_LYRICS } from './constants';
import { generateFairyLetter } from './services/geminiService';
import { audioService } from './services/audioService';
import { storageService } from './services/storageService';
import { Button } from './components/Button';
import { MemoryGame } from './components/MemoryGame';
import { LaserGame } from './components/LaserGame';
import { RunnerGame } from './components/RunnerGame';
import { CustomCursor } from './components/CustomCursor';
import { Sparkles, Crown, Star, Heart, Volume2, VolumeX, Archive, ArrowLeft, Trophy, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    stage: AppStage.INTRO,
    selectedCharacter: null,
    difficulty: Difficulty.MEDIUM,
    score: 0,
    completedMissions: []
  });
  const [fairyLetter, setFairyLetter] = useState<string>('');
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lyricIndex, setLyricIndex] = useState(0);
  const [savedMemories, setSavedMemories] = useState<SavedMemory[]>([]);
  const [bestScore, setBestScore] = useState(0);

  // --- CURSOR LOGIC ---
  const getCursorMode = () => {
    if (gameState.stage === AppStage.GAME_LASER) return CursorMode.LASER;
    return CursorMode.NORMAL;
  };

  useEffect(() => {
    audioService.tryAutoplay();
    setBestScore(storageService.getBestScore());

    const unlockAudio = () => {
      audioService.tryAutoplay();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [gameState.stage]);

  useEffect(() => {
    if (isLoadingLetter) {
      const interval = setInterval(() => {
        setLyricIndex(prev => (prev + 1) % SONG_LYRICS.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoadingLetter]);

  const handleStart = () => {
    audioService.tryAutoplay();
    setGameState(prev => ({ ...prev, stage: AppStage.CHARACTER_SELECT }));
  };

  const handleOpenMemories = () => {
    setSavedMemories(storageService.getMemories());
    setGameState(prev => ({ ...prev, stage: AppStage.MEMORIES }));
  };

  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  const selectCharacter = (char: Character) => {
    setGameState(prev => ({ ...prev, selectedCharacter: char, stage: AppStage.DIFFICULTY_SELECT }));
    audioService.playCollect();
  };

  const selectDifficulty = (diff: Difficulty) => {
    setGameState(prev => ({ ...prev, difficulty: diff, stage: AppStage.STORY_PART_1 }));
    audioService.playCollect();
  };

  const advanceStage = (scoreToAdd: number, nextStage: AppStage) => {
    setGameState(prev => ({ 
      ...prev, 
      score: prev.score + scoreToAdd,
      stage: nextStage 
    }));
  };

  const handleEnding = async (scoreToAdd: number) => {
    const finalScore = gameState.score + scoreToAdd;
    setGameState(prev => ({ ...prev, score: finalScore, stage: AppStage.ENDING }));
    
    if (gameState.selectedCharacter) {
      setIsLoadingLetter(true);
      setLyricIndex(0);
      
      // Gera a carta
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));
      const letterPromise = generateFairyLetter(gameState.selectedCharacter, finalScore);
      const [letter] = await Promise.all([letterPromise, minDelay]);
      
      setFairyLetter(letter);
      setIsLoadingLetter(false);
      audioService.playWin();

      // Salva no Baú automaticamente
      storageService.saveMemory({
        character: gameState.selectedCharacter,
        score: finalScore,
        letter: letter,
        themeColor: gameState.selectedCharacter === Character.SOPHIE ? '#F29B93' : '#8ACABB'
      });
      setBestScore(Math.max(bestScore, finalScore));
    }
  };

  const handleRestart = () => {
    setGameState({
        stage: AppStage.INTRO,
        selectedCharacter: null,
        difficulty: Difficulty.MEDIUM,
        score: 0,
        completedMissions: []
    });
    setFairyLetter('');
    audioService.playBackgroundMelody();
  }

  // --- RENDERS ---

  const renderIntro = () => (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-evenly bg-fabula-bg px-4 py-4 relative overflow-hidden">
      <div className="flex-shrink-0 animate-float">
        <img 
          src="https://fabulaodonto.com.br/wp-content/uploads/2020/05/Fa%CC%81bula_Site_Logo-barra-64-1024x239.png" 
          alt="Fábula Logo" 
          className="w-48 md:w-80 mx-auto drop-shadow-md"
        />
      </div>
      
      <div className="flex flex-col items-center text-center w-full max-w-2xl">
          <div className="relative mb-4 md:mb-6">
             <div className="absolute -inset-4 bg-fabula-secondary/20 rounded-full blur-xl animate-pulse-slow"></div>
             <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-[6px] border-fabula-secondary shadow-2xl relative z-10 bg-white flex items-center justify-center">
                <img 
                    src="https://files.catbox.moe/579ljg.png" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    alt="Dra Gabriela" 
                    className="w-full h-full object-cover"
                />
             </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-fabula-primary mb-2 drop-shadow-sm">
            A Missão Fábula
          </h1>
          
          <div className="bg-white/60 backdrop-blur-sm p-3 md:p-4 rounded-2xl border border-fabula-primary/10 shadow-sm mx-4">
            <p className="text-sm md:text-xl text-gray-700 font-sans leading-relaxed">
              {LORE.intro.text}
            </p>
          </div>
      </div>

      <div className="w-full max-w-xs md:max-w-md px-4">
        <Button onClick={handleStart} variant="primary" className="w-full text-xl md:text-2xl py-4 shadow-fabula-accent shadow-lg">
          COMEÇAR AVENTURA
        </Button>
      </div>
    </div>
  );

  const renderCharacterSelect = () => (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-fabula-bg px-4 py-4 relative overflow-hidden">
      <div className="flex flex-col items-center w-full max-w-4xl gap-8 md:gap-12">
        
        <div className="text-center flex-shrink-0">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-fabula-primary leading-tight">
            Quem vai ajudar a<br/>Dra. Gabriela?
          </h2>
          <p className="text-gray-500 text-sm md:text-xl mt-2">Toque na sua fada para começar!</p>
        </div>
        
        <div className="flex flex-row justify-center gap-4 w-full px-2">
          {/* CARD SOPHIE */}
          <div onClick={() => selectCharacter(Character.SOPHIE)} className="cursor-pointer group flex-1 max-w-[220px]">
            <div className="relative bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center border-4 border-fabula-secondary p-4 transition-transform active:scale-95 hover:scale-105 h-full">
              <div className="relative w-fit mx-auto mb-4">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                      <Crown className="text-fabula-secondary fill-fabula-secondary drop-shadow-md" size={40} />
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-fabula-secondary shadow-md bg-pink-50 relative z-10">
                      <img src="https://files.catbox.moe/lrszum.jpeg" alt="Fada Sophie" className="w-full h-full object-cover" />
                  </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-fabula-primary text-center">Sophie</h3>
              <div className="bg-fabula-secondary/10 px-3 py-1 rounded-full mt-2">
                  <p className="text-fabula-secondary text-[10px] md:text-xs font-bold uppercase">Coragem</p>
              </div>
            </div>
          </div>

          {/* CARD JULIE */}
          <div onClick={() => selectCharacter(Character.JULIE)} className="cursor-pointer group flex-1 max-w-[220px]">
            <div className="relative bg-white rounded-[2rem] shadow-xl flex flex-col items-center justify-center border-4 border-fabula-accent p-4 transition-transform active:scale-95 hover:scale-105 h-full">
              <div className="relative w-fit mx-auto mb-4">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
                      <Crown className="text-fabula-accent fill-fabula-accent drop-shadow-md" size={40} />
                  </div>
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-fabula-accent shadow-md bg-teal-50 relative z-10">
                      <img src="https://files.catbox.moe/3qpa2c.jpeg" alt="Fada Julie" className="w-full h-full object-cover" />
                  </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-fabula-primary text-center">Julie</h3>
              <div className="bg-fabula-accent/10 px-3 py-1 rounded-full mt-2">
                  <p className="text-fabula-accent text-[10px] md:text-xs font-bold uppercase">Alegria</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO DO BAÚ */}
        <div className="w-full flex justify-center">
          <button 
              onClick={handleOpenMemories}
              className="bg-white px-8 py-3 rounded-full shadow-lg border-2 border-fabula-primary/20 flex items-center gap-3 text-fabula-primary font-display text-xl md:text-2xl hover:bg-fabula-accent hover:text-white hover:border-fabula-accent transition-all transform hover:scale-105"
          >
              <Archive size={24} />
              Baú de Memórias
          </button>
        </div>
      </div>
    </div>
  );

  const renderDifficultySelect = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-fabula-bg">
      <div className="absolute top-6 left-6">
          <button onClick={() => setGameState(prev => ({ ...prev, stage: AppStage.CHARACTER_SELECT }))} className="p-3 bg-white rounded-full shadow hover:scale-105">
              <ArrowLeft />
          </button>
      </div>
      <h2 className="text-4xl font-display font-bold text-fabula-primary mb-8 text-center">Escolha o Nível</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl w-full">
        {[
            { d: Difficulty.EASY, label: "Fadinha Aprendiz", icon: <Star size={24} />, color: "border-green-300" },
            { d: Difficulty.MEDIUM, label: "Fada Guardiã", icon: <div className="flex"><Star size={24}/><Star size={24}/></div>, color: "border-fabula-accent" },
            { d: Difficulty.HARD, label: "Super Fada", icon: <div className="flex"><Star size={24}/><Star size={24}/><Star size={24}/></div>, color: "border-fabula-secondary" }
        ].map(diff => (
            <button 
                key={diff.d}
                onClick={() => selectDifficulty(diff.d)} 
                className={`bg-white p-6 rounded-3xl shadow-lg border-4 ${diff.color} hover:scale-105 transition-transform flex flex-col items-center`}
            >
                <div className="bg-gray-50 p-3 rounded-full mb-2 text-fabula-primary">{diff.icon}</div>
                <h3 className="text-2xl font-display font-bold text-fabula-primary">{diff.label}</h3>
            </button>
        ))}
      </div>
    </div>
  );

  const renderMemories = () => (
    <div className="min-h-screen bg-fabula-bg p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-fabula-bg z-20 py-4">
           <button onClick={() => setGameState(prev => ({ ...prev, stage: AppStage.CHARACTER_SELECT }))} className="p-3 bg-white rounded-full shadow-md hover:scale-105 text-fabula-primary">
              <ArrowLeft size={24} />
           </button>
           <h2 className="text-4xl md:text-5xl font-display font-bold text-fabula-primary flex items-center gap-2">
             <Archive className="text-fabula-secondary" /> Galeria Mágica
           </h2>
           <div className="w-12"></div> 
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg mb-8 flex flex-col md:flex-row justify-between items-center border-l-8 border-fabula-secondary">
            <div className="mb-4 md:mb-0 text-center md:text-left">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Seu Melhor Recorde</p>
                <p className="text-5xl font-display font-bold text-fabula-primary">{bestScore} pts</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-full">
                <Trophy size={48} className="text-yellow-500 fill-yellow-500" />
            </div>
        </div>

        {savedMemories.length === 0 ? (
            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-gray-300">
                <Sparkles className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-2xl font-display text-gray-400">O baú ainda está vazio.</p>
                <p className="text-gray-500">Jogue uma aventura para ganhar sua primeira carta!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                {savedMemories.map((memory) => (
                    <div key={memory.id} className="bg-white p-6 rounded-2xl shadow-md border-4 hover:shadow-xl transition-all transform hover:-translate-y-1" style={{ borderColor: memory.themeColor }}>
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                            {/* EXIBE O NOME DA JOGADORA AQUI */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                                     {/* Simple avatar placeholder based on char */}
                                     <div className="w-full h-full" style={{ backgroundColor: memory.themeColor }}></div>
                                </div>
                                <span className="font-display text-2xl font-bold" style={{ color: memory.themeColor }}>
                                    {memory.character}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded">{memory.date}</span>
                        </div>
                        
                        <div className="bg-fabula-bg/30 p-5 rounded-xl mb-4 relative">
                             <Sparkles className="absolute -top-2 -right-2 text-yellow-400" size={24} fill="currentColor" />
                             <p className="italic text-gray-700 font-sans text-sm leading-relaxed">
                                "{memory.letter}"
                             </p>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex gap-1">
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            </div>
                            <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                                Score: {memory.score}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );

  const renderStoryScreen = (title: string, text: string, onNext: () => void, icon: React.ReactNode, colorClass: string) => (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${colorClass}`}>
      <div className="max-w-2xl text-center bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border-b-8 border-fabula-primary">
        <div className="inline-block p-4 rounded-full bg-gray-100 mb-6">{icon}</div>
        <h2 className="text-4xl md:text-5xl font-display font-bold text-fabula-primary mb-6">{title}</h2>
        <p className="text-xl text-gray-600 mb-10 font-sans">{text}</p>
        <Button onClick={onNext} variant="primary">VAMOS LÁ!</Button>
      </div>
    </div>
  );

  // --- TELA FINAL ---
  const renderEnding = () => (
    <div className="min-h-screen h-full bg-white p-6 py-12 overflow-y-auto flex flex-col items-center">
       <div className="max-w-3xl w-full bg-white rounded-[2rem] shadow-2xl border-4 border-fabula-accent text-center relative z-10 my-auto overflow-hidden">
         
         {/* Header Sólido */}
         <div className="bg-fabula-bg p-8 border-b-4 border-fabula-accent">
            <Crown size={60} className="text-fabula-secondary mx-auto mb-4 animate-bounce" />
            <h2 className="text-5xl md:text-6xl font-display font-bold text-fabula-primary drop-shadow-sm">
              Missão Cumprida!
            </h2>
         </div>

         <div className="p-6 md:p-10">
             {/* Caixa da Carta (Design de Card Colecionável) */}
             <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-fabula-primary/10 shadow-inner mb-8 relative transform transition-all hover:scale-[1.02]">
               <div className="absolute -top-3 -left-3 text-fabula-secondary transform -rotate-12">
                  <Star fill="currentColor" size={40} />
               </div>
               <div className="absolute -bottom-3 -right-3 text-fabula-accent transform rotate-12">
                  <Heart fill="currentColor" size={40} />
               </div>

               <h3 className="text-xl font-bold text-fabula-primary uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                   <Sparkles size={20} /> Carta da Fada Mãe <Sparkles size={20} />
               </h3>
               
               {isLoadingLetter ? (
                 <div className="py-12 flex flex-col items-center">
                   <div className="animate-spin text-fabula-secondary mb-4"><Sparkles size={40} /></div>
                   <p className="text-2xl font-display text-fabula-primary animate-pulse">Escrevendo magia...</p>
                   <p className="text-xs text-gray-400 mt-2">♫ {SONG_LYRICS[lyricIndex]} ♫</p>
                 </div>
               ) : (
                 <div className="bg-fabula-bg/50 p-6 rounded-xl border border-fabula-primary/5">
                    <p className="text-xl md:text-2xl text-gray-700 font-sans italic leading-relaxed whitespace-pre-line">
                        {fairyLetter}
                    </p>
                 </div>
               )}
             </div>
             
             {/* Stats Grid */}
             {!isLoadingLetter && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Pontos Totais</p>
                        <p className="text-3xl font-display font-bold text-fabula-primary">{gameState.score}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase">Jogadora</p>
                        <p className="text-2xl font-display font-bold text-fabula-secondary">{gameState.selectedCharacter}</p>
                    </div>
                </div>
             )}

             {!isLoadingLetter && (
                 <div className="flex flex-col gap-3">
                    <Button onClick={handleRestart} variant="primary" className="w-full py-4 text-xl animate-pulse">
                        JOGAR NOVAMENTE
                    </Button>
                    <button 
                        onClick={handleOpenMemories}
                        className="text-gray-400 font-bold text-sm hover:text-fabula-primary transition-colors"
                    >
                        Ver Galeria de Memórias
                    </button>
                 </div>
             )}
         </div>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen font-sans bg-fabula-bg text-fabula-text selection:bg-fabula-accent selection:text-white cursor-none">
      <CustomCursor mode={getCursorMode()} />
      
      <button 
        onClick={toggleMute} 
        className="fixed top-4 right-4 z-50 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white transition-all cursor-auto border border-gray-200"
      >
        {isMuted ? <VolumeX className="text-gray-400" size={24} /> : <Volume2 className="text-fabula-primary" size={24} />}
      </button>

      {gameState.stage === AppStage.INTRO && renderIntro()}
      {gameState.stage === AppStage.MEMORIES && renderMemories()}
      {gameState.stage === AppStage.CHARACTER_SELECT && renderCharacterSelect()}
      {gameState.stage === AppStage.DIFFICULTY_SELECT && renderDifficultySelect()}
      
      {gameState.stage === AppStage.STORY_PART_1 && renderStoryScreen(
          LORE.mission1.title, 
          LORE.mission1.text, 
          () => advanceStage(0, AppStage.GAME_LASER),
          <Star size={48} className="text-fabula-primary" />,
          "bg-fabula-primary/5"
      )}
      
      {gameState.stage === AppStage.GAME_LASER && (
        <div className="min-h-screen flex items-center justify-center bg-fabula-primary/5 p-4">
          <LaserGame 
            onComplete={(score) => advanceStage(score, AppStage.STORY_PART_2)} 
            difficulty={gameState.difficulty}
          />
        </div>
      )}
      
      {gameState.stage === AppStage.STORY_PART_2 && renderStoryScreen(
          LORE.mission2.title, 
          LORE.mission2.text, 
          () => advanceStage(0, AppStage.GAME_MEMORY),
          <Heart size={48} className="text-fabula-accent" />,
          "bg-fabula-accent/10"
      )}

      {gameState.stage === AppStage.GAME_MEMORY && (
        <div className="min-h-screen flex items-center justify-center bg-fabula-accent/10 p-4">
          <MemoryGame 
            onComplete={(score) => advanceStage(score, AppStage.STORY_PART_3)}
            difficulty={gameState.difficulty}
          />
        </div>
      )}

      {gameState.stage === AppStage.STORY_PART_3 && renderStoryScreen(
          LORE.mission3.title, 
          LORE.mission3.text, 
          () => advanceStage(0, AppStage.GAME_RUNNER),
          <Sparkles size={48} className="text-fabula-secondary" />,
          "bg-fabula-secondary/10"
      )}

      {gameState.stage === AppStage.GAME_RUNNER && (
         <div className="min-h-screen flex items-center justify-center bg-fabula-secondary/10 p-4">
           <RunnerGame 
             onComplete={handleEnding} 
             characterName={gameState.selectedCharacter || 'Fada'} 
             difficulty={gameState.difficulty}
            />
         </div>
      )}

      {gameState.stage === AppStage.ENDING && renderEnding()}
    </div>
  );
};

export default App;
