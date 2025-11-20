import OpenAI from 'openai';
import { Character, CardRarity, CollectibleCard, GameContext } from '../types';

// Templates de Temas
const THEMES = [
  'aventura mágica',
  'conquista heroica',
  'jornada épica',
  'missão especial',
  'descoberta brilhante',
  'feito corajoso',
  'momento mágico',
  'triunfo luminoso',
  'vitória encantada',
  'façanha extraordinária'
];

// Templates de Tons
const TONES = [
  'orgulhoso e afetuoso',
  'emocionado e carinhoso',
  'maravilhado e amoroso',
  'impressionado e terno',
  'inspirado e doce',
  'admirado e protetor'
];

// Templates de Formatos
const FORMATS = [
  'carta curta e emocionante',
  'mensagem especial de 2-3 frases',
  'bilhete mágico breve',
  'recado encantado curto',
  'nota carinhosa pequena'
];

// Elementos especiais por raridade
const RARITY_ELEMENTS = {
  [CardRarity.COMMON]: {
    emoji: '⭐',
    style: 'simples e carinhoso',
    bonus: ''
  },
  [CardRarity.RARE]: {
    emoji: '✨💫',
    style: 'especial e brilhante',
    bonus: 'Mencione que essa conquista foi especialmente marcante.'
  },
  [CardRarity.EPIC]: {
    emoji: '🌟💎',
    style: 'épico e majestoso',
    bonus: 'Destaque que essa é uma conquista rara e excepcional que poucas fadas conseguem!'
  },
  [CardRarity.LEGENDARY]: {
    emoji: '👑🏆✨',
    style: 'lendário e glorioso',
    bonus: 'Enfatize que essa é uma conquista LENDÁRIA que entrará para a história da Clínica Fábula! Use linguagem épica e grandiosa.'
  }
};

// Determinar raridade baseado no desempenho + sorte
export const determineRarity = (context: GameContext): CardRarity => {
  const { difficulty, totalScore, starsCollected, gamesCompleted } = context;

  let points = 0;

  // Pontos por dificuldade (reduzido)
  if (difficulty === 'HARD') points += 15;
  else if (difficulty === 'MEDIUM') points += 8;
  else points += 3;

  // Pontos por score (mais restritivo)
  if (totalScore >= 6000) points += 15;
  else if (totalScore >= 4000) points += 8;
  else if (totalScore >= 2000) points += 3;

  // Pontos por estrelas (mais restritivo)
  if (starsCollected >= 25) points += 10;
  else if (starsCollected >= 15) points += 5;
  else if (starsCollected >= 8) points += 2;

  // Pontos por jogos completados
  points += gamesCompleted.length * 2;

  // Sistema de sorte com probabilidades realistas
  const luck = Math.random() * 100;

  // 2% chance de LENDÁRIA (super rara)
  if (luck < 2) return CardRarity.LEGENDARY;

  // 8% chance de ÉPICA (rara)
  if (luck < 10) return CardRarity.EPIC;

  // 20% chance de RARA (incomum)
  if (luck < 30) return CardRarity.RARE;

  // 70% base = COMUM (maioria)
  // Mas se jogou muito bem, pode forçar upgrade
  if (points >= 50) return CardRarity.LEGENDARY; // Precisa jogar PERFEITO
  if (points >= 35) return CardRarity.EPIC;       // Precisa jogar muito bem
  if (points >= 20) return CardRarity.RARE;       // Precisa jogar bem

  return CardRarity.COMMON; // Padrão
};

// Gerar prompt único com variações infinitas
const generatePrompt = (
  context: GameContext,
  rarity: CardRarity
): string => {
  const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
  const tone = TONES[Math.floor(Math.random() * TONES.length)];
  const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];
  const rarityElement = RARITY_ELEMENTS[rarity];

  const difficultyText = {
    EASY: 'suave',
    MEDIUM: 'desafiadora',
    HARD: 'extremamente difícil'
  }[context.difficulty];

  return `
Você é a "Fada Mãe Gabriela" (Dra. Gabriela), dentista odontopediatra que criou a Clínica Fábula.

CONTEXTO DO DESEMPENHO:
- Filha: ${context.character}
- Dificuldade escolhida: ${difficultyText}
- Pontuação total: ${context.totalScore} pontos
- Estrelas coletadas: ${context.starsCollected}
- Jogos completados: ${context.gamesCompleted.join(', ')}
- Esta é a carta #${context.previousCards + 1} dela

RARIDADE DA CARTA: ${rarity} ${rarityElement.emoji}
${rarityElement.bonus}

TAREFA:
Escreva uma ${format} para sua filha ${context.character} (6-8 anos).
Use um tom ${tone} e aborde o tema de ${theme}.
O estilo deve ser ${rarityElement.style}.

REGRAS:
- Máximo 3 frases
- Use emojis ${rarityElement.emoji}
- Mencione que você tem orgulho dela
- Faça referência à batalha contra a cárie
- O tom deve ser maternal e mágico
- NÃO use aspas ou formatação markdown
- Seja única e criativa - esta carta não pode parecer com outras!

Escreva APENAS a carta, sem introduções.
  `.trim();
};

// Gerar carta com OpenAI
export const generateCollectibleCard = async (
  context: GameContext
): Promise<CollectibleCard> => {
  // Verificar API key
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return createFallbackCard(context);
  }

  try {
    const openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Para desenvolvimento
    });

    const rarity = determineRarity(context);
    const prompt = generatePrompt(context, rarity);

    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const tone = TONES[Math.floor(Math.random() * TONES.length)];
    const format = FORMATS[Math.floor(Math.random() * FORMATS.length)];

    // Gerar texto da carta
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é a Fada Mãe Gabriela, uma dentista amorosa que escreve cartas mágicas para suas filhas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.9, // Alta criatividade
      max_tokens: 150
    });

    const letterText = completion.choices[0].message.content || createFallbackText(context);

    // Criar objeto da carta
    const card: CollectibleCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      character: context.character,
      rarity,
      theme,
      letterText: letterText.trim(),
      stats: {
        score: context.totalScore,
        starsCollected: context.starsCollected,
        difficulty: context.difficulty,
        gamesCompleted: [...context.gamesCompleted],
        date: new Date().toISOString()
      },
      metadata: {
        cardNumber: context.previousCards + 1,
        seasonYear: new Date().getFullYear().toString(),
        promptTheme: theme,
        promptTone: tone,
        promptFormat: format
      }
    };

    return card;

  } catch (error) {
    console.error('Erro ao gerar carta com OpenAI:', error);
    return createFallbackCard(context);
  }
};

// Carta de fallback quando API não está disponível
const createFallbackCard = (context: GameContext): CollectibleCard => {
  const rarity = determineRarity(context);

  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    character: context.character,
    rarity,
    theme: 'conquista mágica',
    letterText: createFallbackText(context),
    stats: {
      score: context.totalScore,
      starsCollected: context.starsCollected,
      difficulty: context.difficulty,
      gamesCompleted: [...context.gamesCompleted],
      date: new Date().toISOString()
    },
    metadata: {
      cardNumber: context.previousCards + 1,
      seasonYear: new Date().getFullYear().toString(),
      promptTheme: 'aventura mágica',
      promptTone: 'orgulhoso',
      promptFormat: 'carta especial'
    }
  };
};

const createFallbackText = (context: GameContext): string => {
  const rarityEmoji = RARITY_ELEMENTS[determineRarity(context)].emoji;
  return `Querida ${context.character}, que orgulho da sua vitória contra a cárie! ${rarityEmoji} Você foi corajosa e brilhante. A mamãe ama você! 💖✨`;
};

// Função legacy para compatibilidade com código antigo
export const generateFairyLetter = async (
  character: Character,
  score: number
): Promise<string> => {
  const context: GameContext = {
    character,
    difficulty: 'MEDIUM',
    totalScore: score,
    starsCollected: 0,
    gamesCompleted: ['laser', 'memory', 'runner'],
    previousCards: 0
  };

  const card = await generateCollectibleCard(context);
  return card.letterText;
};
