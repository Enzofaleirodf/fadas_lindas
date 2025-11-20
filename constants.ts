
export const LORE = {
  intro: {
    title: "A Missão Fábula",
    text: "Em 2014, a Dra. Gabriela sonhou com um lugar onde cuidar dos dentinhos seria pura magia. Ela viajou até Barcelona para estudar e trouxe o conhecimento para criar a Fábula! Hoje, ela precisa de ajuda para proteger esse sonho.",
    subtext: "Escolha sua guardiã e vamos começar!"
  },
  mission1: {
    title: "O Laser de Luz",
    text: "A Cárie travessa (mas fofinha!) está pulando pelo consultório. Use o Laser de Alta Potência para transformar todas elas em brilho!",
  },
  mission2: {
    title: "A Memória Mágica", 
    text: "Para ser uma Fada da Odontopediatria, é preciso ter a mente afiada! Encontre os pares dos instrumentos mágicos e dos dentinhos felizes.",
  },
  mission3: {
    title: "O Voo Encantado",
    text: "Hora de voar! Atravesse o Reino das Nuvens de Açúcar. Desvie dos doces voadores e pegue as estrelas para chegar ao Castelo do Sorriso!",
  },
  ending: {
    title: "A Consagração",
    text: "Vocês conseguiram! O sorriso saudável venceu!",
  }
};

export const SONG_LYRICS = [
  "No reino fábula onde tudo é brilhante",
  "Vive a Dra Gabriela, fada tão elegante",
  "Com suas asas de luz e sorriso encantador",
  "Ela cuida dos dentinhos com carinho e amor",
  "Sophie e Julie voam pelo salão",
  "Com varinhas mágicas espalhando emoção",
  "Fada mãe, Fada mãe",
  "Gabriela é quem vai cuidar",
  "Com Sophie e Julie é só confiar",
  "Sorrisos mágicos brilham no ar!"
];

export const MEMORY_CARDS_DATA = [
  '🦷', '🪥', '🧚‍♀️', '👑', '✨', '🏥', '🍏', '🦕'
];

export const FOOD_ITEMS = [
  { id: 1, name: "Maçã", emoji: "🍎", isHealthy: true },
  { id: 2, name: "Chocolate", emoji: "🍫", isHealthy: false },
  { id: 3, name: "Cenoura", emoji: "🥕", isHealthy: true },
  { id: 4, name: "Bala", emoji: "🍬", isHealthy: false },
  { id: 5, name: "Leite", emoji: "🥛", isHealthy: true },
  { id: 6, name: "Pirulito", emoji: "🍭", isHealthy: false },
  { id: 7, name: "Queijo", emoji: "🧀", isHealthy: true },
  { id: 8, name: "Refrigerante", emoji: "🥤", isHealthy: false },
];

export const BACKGROUND_MUSIC_URL = "https://files.catbox.moe/rj6hp9.mp3";

// Temas para cartas colecionáveis
export const CARD_THEMES = [
  {
    id: 'pink-stars',
    name: 'Estrelas Rosa',
    primary: '#F29B93',
    secondary: '#FFB6C1',
    accent: '#FF69B4',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 0l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="%23FFB6C1" opacity="0.1"/%3E%3C/svg%3E',
    border: '4px solid #F29B93'
  },
  {
    id: 'teal-hearts',
    name: 'Corações Azuis',
    primary: '#8ACABB',
    secondary: '#ADD8E6',
    accent: '#20B2AA',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 17l-1-1C4 11 1 8 1 5c0-2 1-3 3-3 1 0 2 1 3 2 1-1 2-2 3-2 2 0 3 1 3 3 0 3-3 6-8 11z" fill="%23ADD8E6" opacity="0.15"/%3E%3C/svg%3E',
    border: '4px solid #8ACABB'
  },
  {
    id: 'gold-sparkles',
    name: 'Brilho Dourado',
    primary: '#FFD700',
    secondary: '#FFF8DC',
    accent: '#DAA520',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="10" cy="10" r="2" fill="%23FFD700" opacity="0.2"/%3E%3Ccircle cx="5" cy="5" r="1" fill="%23DAA520" opacity="0.3"/%3E%3Ccircle cx="15" cy="15" r="1" fill="%23DAA520" opacity="0.3"/%3E%3C/svg%3E',
    border: '4px solid #FFD700'
  },
  {
    id: 'purple-magic',
    name: 'Magia Roxa',
    primary: '#9B59B6',
    secondary: '#E6E6FA',
    accent: '#8B008B',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M10 2l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" fill="%23E6E6FA" opacity="0.2"/%3E%3Cpath d="M15 12l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" fill="%23E6E6FA" opacity="0.15"/%3E%3C/svg%3E',
    border: '4px solid #9B59B6'
  },
  {
    id: 'emerald-leaves',
    name: 'Folhas Esmeralda',
    primary: '#50C878',
    secondary: '#98FB98',
    accent: '#3CB371',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cellipse cx="10" cy="8" rx="4" ry="6" fill="%2398FB98" opacity="0.15"/%3E%3Cpath d="M10 2v12" stroke="%233CB371" stroke-width="0.5" opacity="0.2"/%3E%3C/svg%3E',
    border: '4px solid #50C878'
  },
  {
    id: 'sunset-waves',
    name: 'Ondas do Pôr do Sol',
    primary: '#FF6347',
    secondary: '#FFE4B5',
    accent: '#FF7F50',
    pattern: 'data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 10c5 0 5-5 10-5s5 5 10 5v10H0z" fill="%23FFE4B5" opacity="0.15"/%3E%3C/svg%3E',
    border: '4px solid #FF6347'
  }
];
