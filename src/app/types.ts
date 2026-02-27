export type MediaType =
  | "movie"
  | "short"
  | "series"
  | "book"
  | "play"
  | "short_story"
  | "sports";

export interface Entry {
  id: string;
  date: string; // "YYYY-MM-DD"
  type: MediaType;
  title: string;
  // optional enrichments
  year?: number;           // movies, shorts
  author?: string;         // books, plays, short stories
  episode?: string;        // series e.g. "S1E1–4"
  teams?: string;          // sports e.g. "Eagles vs Chiefs"
  result?: string;         // sports e.g. "40–22"
  rating?: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

export type GroupedEntries = [string, Entry[]][]; // [monthKey, entries][]