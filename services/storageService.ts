
import { SavedMemory, Character, CollectibleCard, CardRarity } from '../types';

const STORAGE_KEY = 'fabula_memories_v1';
const CARDS_STORAGE_KEY = 'fabula_collectible_cards_v1';

class StorageService {
  saveMemory(memory: Omit<SavedMemory, 'id' | 'date'>) {
    const memories = this.getMemories();
    
    const newMemory: SavedMemory = {
      ...memory,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const updatedMemories = [newMemory, ...memories];
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));
    } catch (e) {
        console.warn("Failed to save memory", e);
    }
    return newMemory;
  }

  getMemories(): SavedMemory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getBestScore(): number {
    const memories = this.getMemories();
    if (memories.length === 0) return 0;
    return Math.max(...memories.map(m => m.score));
  }

  clearMemories() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // Sistema de Cartas Colecionáveis
  saveCard(card: CollectibleCard): void {
    const cards = this.getCards();
    const updatedCards = [card, ...cards];

    try {
      localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(updatedCards));
    } catch (e) {
      console.warn("Failed to save card", e);
    }
  }

  getCards(): CollectibleCard[] {
    try {
      const data = localStorage.getItem(CARDS_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  getCardsByCharacter(character: Character): CollectibleCard[] {
    return this.getCards().filter(card => card.character === character);
  }

  getCardsByRarity(rarity: CardRarity): CollectibleCard[] {
    return this.getCards().filter(card => card.rarity === rarity);
  }

  getTotalCards(): number {
    return this.getCards().length;
  }

  getRarityStats(): Record<CardRarity, number> {
    const cards = this.getCards();
    return {
      [CardRarity.COMMON]: cards.filter(c => c.rarity === CardRarity.COMMON).length,
      [CardRarity.RARE]: cards.filter(c => c.rarity === CardRarity.RARE).length,
      [CardRarity.EPIC]: cards.filter(c => c.rarity === CardRarity.EPIC).length,
      [CardRarity.LEGENDARY]: cards.filter(c => c.rarity === CardRarity.LEGENDARY).length,
    };
  }

  getCardById(id: string): CollectibleCard | undefined {
    return this.getCards().find(card => card.id === id);
  }

  clearCards(): void {
    localStorage.removeItem(CARDS_STORAGE_KEY);
  }
}

export const storageService = new StorageService();
