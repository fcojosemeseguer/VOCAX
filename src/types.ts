export type WordType = "noun" | "verb" | "adjective" | "adverb";

export interface Word {
  id: string;
  word: string;
  translation: string;
  type: WordType;
  semanticField: string;
  favorite: boolean;
}
