import { Word } from "./types";

const STORAGE_KEY = "vocaxWords"; // Updated to match app name

export const getWordsFromStorage = (): Word[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      console.warn("Unexpected format in localStorage");
      return [];
    }
  } catch (err) {
    console.error("Error reading from localStorage:", err);
    return [];
  }
};

export const saveWordsToStorage = (words: Word[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
  } catch (err) {
    console.error("Error saving to localStorage:", err);
  }
};

// For quotes storage
const QUOTES_STORAGE_KEY = "vocaxQuotes";

export const getQuotesFromStorage = (): string[] => {
  try {
    const data = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      return parsed;
    } else {
      console.warn("Unexpected format in localStorage for quotes");
      return [];
    }
  } catch (err) {
    console.error("Error reading quotes from localStorage:", err);
    return [];
  }
};

export const saveQuotesToStorage = (quotes: string[]): void => {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Error saving quotes to localStorage:", err);
  }
};