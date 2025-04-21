export type WordType = "noun" | "verb" | "adjective" | "adverb";
export type LexiconLevel = "deep" | "surface";
export type SurfaceSubtype = "general" | "verbalBrand";

export interface Word {
  id: string;
  word: string;
  translation: string;
  type: WordType;
  semanticField: string;
  favorite: boolean;
  example: string;
  lexicon: {
    level: LexiconLevel;
    subtype?: SurfaceSubtype; // Only if level === "surface"
  };
}