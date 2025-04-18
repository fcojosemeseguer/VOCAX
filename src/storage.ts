import { Word } from "./types";

const STORAGE_KEY = "vocaMuseWords";

export const getWordsFromStorage = (): Word[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      console.warn("Formato inesperado en localStorage");
      return [];
    }
  } catch (err) {
    console.error("Error leyendo localStorage:", err);
    return [];
  }
};

export const saveWordsToStorage = (words: Word[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (err) {
    console.error("Error guardando en localStorage:", err);
  }
};
