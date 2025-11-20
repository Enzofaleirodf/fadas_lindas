
import { SavedMemory, Character } from '../types';

const STORAGE_KEY = 'fabula_memories_v1';

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
}

export const storageService = new StorageService();
