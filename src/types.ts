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
  lexicon: {
    level: LexiconLevel;
    subtype?: SurfaceSubtype; // solo si level === "surface"
  };
}