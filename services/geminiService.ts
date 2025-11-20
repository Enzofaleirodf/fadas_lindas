
import { GoogleGenAI } from "@google/genai";
import { Character } from "../types";

export const generateFairyLetter = async (character: Character, score: number): Promise<string> => {
  if (!process.env.API_KEY) {
    return `Querida ${character}, parabéns por completar a missão! A mamãe tem muito orgulho de você e da nossa família mágica. (Adicione sua API KEY para ver a mensagem completa!)`;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Aja como a "Fada Mãe Gabriela" (Dra. Gabriela).
    Escreva uma carta MUITO CURTA (máximo 3 frases) para sua filha ${character} (6-8 anos).
    
    Diga que ela foi corajosa por vencer a cárie e que a mamãe tem muito orgulho dela.
    Use emojis.
    Não escreva mais do que 3 frases.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "A magia falhou momentaneamente, mas o amor da mamãe é eterno!";
  } catch (error) {
    console.error("Error generating fairy letter:", error);
    return `Querida ${character}, você foi incrível! A magia do seu sorriso ilumina toda a clínica Fábula. Com amor, Mamãe.`;
  }
};
