
import React, { useState, useEffect } from 'react';
import { AppStage, Character, Difficulty, GameState, CursorMode, SavedMemory, CardTheme, CollectibleCard, GameContext, CardRarity } from './types';
import { LORE, SONG_LYRICS, CARD_THEMES } from './constants';
import { generateCollectibleCard } from './services/openaiService';
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
  const [currentCardTheme, setCurrentCardTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [currentCard, setCurrentCard] = useState<CollectibleCard | null>(null);
  const [starsCollected, setStarsCollected] = useState(0);

  // --- CURSOR LOGIC ---
  const getCursorMode = () => {
    if (gameState.stage === AppStage.GAME_LASER) return CursorMode.LASER;
    return CursorMode.NORMAL;
  };

  // --- RARITY HELPERS ---
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'lendária': return { bg: '#ffd700', border: '#ffaa00', glow: '#ffea00', text: '#8B4513' };
      case 'épica': return { bg: '#a855f7', border: '#7c3aed', glow: '#c084fc', text: '#ffffff' };
      case 'rara': return { bg: '#3b82f6', border: '#2563eb', glow: '#60a5fa', text: '#ffffff' };
      default: return { bg: '#9ca3af', border: '#6b7280', glow: '#d1d5db', text: '#1f2937' };
    }
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
    const memories = storageService.getMemories();
    setSavedMemories(memories);
    setGameState(prev => ({ ...prev, stage: AppStage.MEMORIES }));
  };

  const [collectibleCards, setCollectibleCards] = useState<CollectibleCard[]>([]);
  const [cardFilter, setCardFilter] = useState<'all' | 'comum' | 'rara' | 'épica' | 'lendária'>('all');

  useEffect(() => {
    if (gameState.stage === AppStage.MEMORIES) {
      setCollectibleCards(storageService.getCards());
    }
  }, [gameState.stage]);

  // Calcula o melhor score de cada personagem
  const getBestScoreByCharacter = (character: Character) => {
    return savedMemories
      .filter(m => m.character === character)
      .reduce((max, m) => Math.max(max, m.score), 0);
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
      // Escolhe um tema aleatório para a carta
      const randomTheme = CARD_THEMES[Math.floor(Math.random() * CARD_THEMES.length)];
      setCurrentCardTheme(randomTheme);

      setIsLoadingLetter(true);
      setLyricIndex(0);

      // Criar contexto do jogo para gerar carta colecionável
      const gameContext: GameContext = {
        character: gameState.selectedCharacter,
        difficulty: gameState.difficulty,
        totalScore: finalScore,
        starsCollected: starsCollected,
        gamesCompleted: gameState.completedMissions,
        previousCards: storageService.getTotalCards()
      };

      // Gera a carta colecionável
      const minDelay = new Promise(resolve => setTimeout(resolve, 3000));
      const cardPromise = generateCollectibleCard(gameContext);
      const [card] = await Promise.all([cardPromise, minDelay]);

      setCurrentCard(card);
      setFairyLetter(card.letterText);
      setIsLoadingLetter(false);
      audioService.playWin();

      // Salva a carta colecionável
      storageService.saveCard(card);

      // Mantém compatibilidade com memórias antigas
      storageService.saveMemory({
        character: gameState.selectedCharacter,
        score: finalScore,
        letter: card.letterText,
        themeColor: gameState.selectedCharacter === Character.SOPHIE ? '#F29B93' : '#8ACABB',
        theme: randomTheme
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
    setCurrentCard(null);
    setStarsCollected(0);
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
                  <div className="absolute -top-8 left-1/2 z-20" style={{ marginLeft: '-20px' }}>
                      <Crown className="text-fabula-secondary fill-fabula-secondary drop-shadow-md animate-bounce" size={40} />
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
                  <div className="absolute -top-8 left-1/2 z-20" style={{ marginLeft: '-20px' }}>
                      <Crown className="text-fabula-accent fill-fabula-accent drop-shadow-md animate-bounce" size={40} style={{ animationDelay: '0.5s' }} />
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
    <div className="min-h-screen bg-fabula-bg p-4 md:p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6 sticky top-0 bg-fabula-bg z-20 py-3">
           <button onClick={() => setGameState(prev => ({ ...prev, stage: AppStage.CHARACTER_SELECT }))} className="p-2 md:p-3 bg-white rounded-full shadow-md hover:scale-105 text-fabula-primary">
              <ArrowLeft size={20} className="md:w-6 md:h-6" />
           </button>
           <h2 className="text-2xl md:text-4xl font-display font-bold text-fabula-primary flex items-center gap-2">
             <Archive className="text-fabula-secondary w-6 h-6 md:w-8 md:h-8" /> Galeria Mágica
           </h2>
           <button
             onClick={() => {
               if (window.confirm('🗑️ Tem certeza que quer limpar TODAS as cartas e recordes? Esta ação não pode ser desfeita!')) {
                 localStorage.clear();
                 window.location.reload();
               }
             }}
             className="p-2 md:p-3 bg-red-500 text-white rounded-full shadow-md hover:scale-105 hover:bg-red-600 transition-all text-xs font-bold"
             title="Limpar todas as cartas"
           >
             🗑️
           </button>
        </div>

        {/* Cards de Recordes - Um para cada Fada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
            {/* Recorde da Fada Sophie */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center border-2 md:border-4 border-fabula-secondary relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-fabula-secondary/10 w-24 h-24 md:w-32 md:h-32 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 md:border-4 border-fabula-secondary shadow-lg mb-2 md:mb-3">
                        <img
                            src="https://files.catbox.moe/lrszum.jpeg"
                            alt="Fada Sophie"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Recorde</p>
                    <h3 className="text-lg md:text-2xl font-display font-bold text-fabula-secondary mb-1 md:mb-2">Fada Sophie</h3>
                    <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-500 fill-yellow-500 md:w-6 md:h-6" />
                        <p className="text-2xl md:text-4xl font-display font-bold text-fabula-primary">
                            {getBestScoreByCharacter(Character.SOPHIE)} pts
                        </p>
                    </div>
                </div>
            </div>

            {/* Recorde da Fada Julie */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg flex flex-col items-center border-2 md:border-4 border-fabula-accent relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-fabula-accent/10 w-24 h-24 md:w-32 md:h-32 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
                <div className="relative z-10 flex flex-col items-center w-full">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 md:border-4 border-fabula-accent shadow-lg mb-2 md:mb-3">
                        <img
                            src="https://files.catbox.moe/3qpa2c.jpeg"
                            alt="Fada Julie"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Recorde</p>
                    <h3 className="text-lg md:text-2xl font-display font-bold text-fabula-accent mb-1 md:mb-2">Fada Julie</h3>
                    <div className="flex items-center gap-2">
                        <Trophy size={20} className="text-yellow-500 fill-yellow-500 md:w-6 md:h-6" />
                        <p className="text-2xl md:text-4xl font-display font-bold text-fabula-primary">
                            {getBestScoreByCharacter(Character.JULIE)} pts
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Collectible Cards Section */}
        {collectibleCards.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-fabula-primary flex items-center gap-2">
                ✨ Cartas Colecionáveis ({collectibleCards.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setCardFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    cardFilter === 'all' ? 'bg-fabula-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  Todas
                </button>
                {storageService.getRarityStats()[CardRarity.LEGENDARY] > 0 && (
                  <button
                    onClick={() => setCardFilter('lendária')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      cardFilter === 'lendária' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    👑 Lendárias
                  </button>
                )}
                {storageService.getRarityStats()[CardRarity.EPIC] > 0 && (
                  <button
                    onClick={() => setCardFilter('épica')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      cardFilter === 'épica' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    Épicas
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {collectibleCards
                .filter(card => cardFilter === 'all' || card.rarity === cardFilter)
                .map((card) => {
                  const rarityColors = getRarityColor(card.rarity);
                  return (
                    <div
                      key={card.id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden relative"
                      style={{
                        border: `3px solid ${rarityColors.border}`,
                        boxShadow: `0 4px 20px ${rarityColors.glow}40`
                      }}
                    >
                      {/* Rarity Badge */}
                      <div
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold uppercase z-10"
                        style={{
                          backgroundColor: rarityColors.bg,
                          color: rarityColors.text
                        }}
                      >
                        {card.rarity === 'lendária' && '👑'} {card.rarity}
                      </div>

                      {/* Card Number */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                        #{card.metadata.cardNumber}
                      </div>

                      {/* Card Header */}
                      <div className="p-4 border-b" style={{ backgroundColor: rarityColors.bg + '20' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: rarityColors.border }}>
                            <img
                              src={card.character === Character.SOPHIE ? "https://files.catbox.moe/lrszum.jpeg" : "https://files.catbox.moe/3qpa2c.jpeg"}
                              alt={card.character}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-display font-bold text-sm" style={{ color: rarityColors.border }}>
                              {card.character}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(card.stats.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4">
                        <div className="bg-gray-50 p-3 rounded-lg mb-3 min-h-[80px] max-h-[200px] overflow-y-auto">
                          <p className="text-xs italic text-gray-700">
                            "{card.letterText}"
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Pontos</p>
                            <p className="text-sm font-bold text-fabula-primary">{card.stats.score}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">⭐</p>
                            <p className="text-sm font-bold text-yellow-600">{card.stats.starsCollected}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Nível</p>
                            <p className="text-xs font-bold text-purple-600">
                              {card.stats.difficulty === 'EASY' ? 'FÁCIL' : card.stats.difficulty === 'MEDIUM' ? 'MÉDIO' : 'DIFÍCIL'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Empty state quando não há cartas */}
        {collectibleCards.length === 0 && (
            <div className="text-center py-12 md:py-20 bg-white/50 rounded-2xl md:rounded-3xl border-2 border-dashed border-gray-300">
                <Sparkles className="mx-auto text-gray-300 mb-3 md:mb-4 w-10 h-10 md:w-12 md:h-12" />
                <p className="text-xl md:text-2xl font-display text-gray-400">O baú ainda está vazio.</p>
                <p className="text-sm md:text-base text-gray-500">Jogue uma aventura para ganhar sua primeira carta!</p>
            </div>
        )}
      </div>
    </div>
  );

  const renderStoryScreen = (title: string, text: string, onNext: () => void, icon: React.ReactNode, colorClass: string) => (
    <div className={`min-h-[100dvh] flex flex-col items-center justify-center p-4 md:p-6 ${colorClass}`}>
      <div className="max-w-2xl w-full text-center bg-white p-6 md:p-10 lg:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl border-b-8 border-fabula-primary">
        <div className="inline-block p-3 md:p-4 rounded-full bg-gray-100 mb-4 md:mb-6">{icon}</div>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-fabula-primary mb-4 md:mb-6 leading-tight">{title}</h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-10 font-sans leading-relaxed">{text}</p>
        <Button onClick={onNext} variant="primary" className="px-6 py-3 md:px-8 md:py-4">VAMOS LÁ!</Button>
      </div>
    </div>
  );

  // --- TELA FINAL ---
  const renderEnding = () => (
    <div className="min-h-[100dvh] w-full bg-white p-4 md:p-5 lg:p-6 py-6 md:py-6 lg:py-8 overflow-y-auto flex items-center justify-center">
       <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-2xl text-center relative z-10 my-auto" style={{ border: currentCardTheme.border }}>

         {/* Header Sólido */}
         <div className="p-4 md:p-5 lg:p-6 border-b-4" style={{
           backgroundColor: currentCardTheme.secondary + '40',
           borderColor: currentCardTheme.primary
         }}>
            <Crown size={40} className="mx-auto mb-2 md:mb-3 animate-bounce md:w-12 md:h-12 lg:w-14 lg:h-14" style={{ color: currentCardTheme.primary }} />
            <h2 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold text-fabula-primary drop-shadow-sm">
              Missão Cumprida!
            </h2>
            {currentCard && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="text-xs font-bold px-3 py-1 rounded-full inline-block" style={{
                  backgroundColor: currentCardTheme.primary + '20',
                  color: currentCardTheme.accent
                }}>
                  ⭐ {currentCardTheme.name} ⭐
                </div>
                <div
                  className="text-xs font-bold px-3 py-1 rounded-full inline-block uppercase animate-pulse"
                  style={{
                    backgroundColor: getRarityColor(currentCard.rarity).bg,
                    color: getRarityColor(currentCard.rarity).text,
                    boxShadow: `0 0 15px ${getRarityColor(currentCard.rarity).glow}`,
                    border: `2px solid ${getRarityColor(currentCard.rarity).border}`
                  }}
                >
                  {currentCard.rarity === 'lendária' && '👑'} {currentCard.rarity}
                </div>
              </div>
            )}
         </div>

         <div className="p-4 md:p-5 lg:p-6" style={{ backgroundImage: `url("${currentCardTheme.pattern}")` }}>
             {/* Caixa da Carta (Design de Card Colecionável) */}
             <div className="bg-white p-4 md:p-5 lg:p-6 rounded-xl shadow-inner mb-4 md:mb-5 lg:mb-6 relative" style={{
               border: `3px solid ${currentCardTheme.primary}30`
             }}>
               <div className="absolute -top-2 -left-2 transform -rotate-12">
                  <Star fill={currentCardTheme.accent} size={28} className="md:w-8 md:h-8" style={{ color: currentCardTheme.accent }} />
               </div>
               <div className="absolute -bottom-2 -right-2 transform rotate-12">
                  <Heart fill={currentCardTheme.secondary} size={28} className="md:w-8 md:h-8" style={{ color: currentCardTheme.secondary }} />
               </div>

               <h3 className="text-sm md:text-base lg:text-lg font-bold text-fabula-primary uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                   <Sparkles size={16} className="md:w-4 md:h-4" /> Carta da Fada Mãe <Sparkles size={16} className="md:w-4 md:h-4" />
               </h3>

               {/* Badge de Raridade na Carta */}
               {!isLoadingLetter && currentCard && (
                 <div className="flex justify-center mb-3">
                   <div
                     className="text-xs font-bold px-3 py-1.5 rounded-full uppercase"
                     style={{
                       backgroundColor: getRarityColor(currentCard.rarity).bg,
                       color: getRarityColor(currentCard.rarity).text,
                       boxShadow: `0 0 10px ${getRarityColor(currentCard.rarity).glow}`,
                       border: `2px solid ${getRarityColor(currentCard.rarity).border}`
                     }}
                   >
                     {currentCard.rarity === 'lendária' && '👑 '}
                     {currentCard.rarity === 'épica' && '💎 '}
                     {currentCard.rarity === 'rara' && '✨ '}
                     {currentCard.rarity === 'comum' && '⭐ '}
                     CARTA {currentCard.rarity.toUpperCase()}
                   </div>
                 </div>
               )}

               {isLoadingLetter ? (
                 <div className="py-6 md:py-8 flex flex-col items-center">
                   <div className="animate-spin text-fabula-secondary mb-3"><Sparkles size={32} className="md:w-9 md:h-9" /></div>
                   <p className="text-lg md:text-xl font-display text-fabula-primary animate-pulse">Escrevendo magia...</p>
                   <p className="text-xs text-gray-400 mt-2">♫ {SONG_LYRICS[lyricIndex]} ♫</p>
                 </div>
               ) : (
                 <div className="bg-fabula-bg/50 p-3 md:p-4 lg:p-5 rounded-lg border border-fabula-primary/5">
                    <p className="text-sm md:text-base lg:text-lg text-gray-700 font-sans italic leading-relaxed whitespace-pre-line">
                        {fairyLetter}
                    </p>
                 </div>
               )}
             </div>

             {/* Stats Grid */}
             {!isLoadingLetter && currentCard && (
                <div className="space-y-3 mb-4 md:mb-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase">Pontos Totais</p>
                            <p className="text-lg md:text-xl lg:text-2xl font-display font-bold text-fabula-primary">{gameState.score}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl text-center">
                            <p className="text-xs text-gray-400 font-bold uppercase">Jogadora</p>
                            <p className="text-base md:text-lg lg:text-xl font-display font-bold text-fabula-secondary">{gameState.selectedCharacter}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-yellow-50 p-2 rounded-lg text-center border border-yellow-200">
                            <p className="text-xs text-gray-400 font-bold">⭐ Estrelas</p>
                            <p className="text-sm font-bold text-yellow-600">{currentCard.stats.starsCollected}</p>
                        </div>
                        <div className="bg-purple-50 p-2 rounded-lg text-center border border-purple-200">
                            <p className="text-xs text-gray-400 font-bold">🎯 Dificuldade</p>
                            <p className="text-xs font-bold text-purple-600">
                              {currentCard.stats.difficulty === 'EASY' ? 'FÁCIL' : currentCard.stats.difficulty === 'MEDIUM' ? 'MÉDIO' : 'DIFÍCIL'}
                            </p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded-lg text-center border border-blue-200">
                            <p className="text-xs text-gray-400 font-bold">📜 Carta</p>
                            <p className="text-sm font-bold text-blue-600">#{currentCard.metadata.cardNumber}</p>
                        </div>
                    </div>
                </div>
             )}

             {!isLoadingLetter && (
                 <div className="flex flex-col gap-2 md:gap-3 pb-2">
                    <Button onClick={handleRestart} variant="primary" className="w-full py-3 text-base md:text-lg animate-pulse">
                        JOGAR NOVAMENTE
                    </Button>
                    <button
                        onClick={handleOpenMemories}
                        className="text-gray-400 font-bold text-xs md:text-sm hover:text-fabula-primary transition-colors py-2"
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
