export interface OpeningHours {
  Monday: string[][];
  Tuesday: string[][];
  Wednesday: string[][];
  Thursday: string[][];
  Friday: string[][];
  Saturday: string[][];
  Sunday: string[][];
}

export interface Library {
  long_name: string;
  url: string | null;
  building: string | null;
  level: string | null;
  room: string | null;
  geo_coordinates: string;
  available_seats: number;
  opening_hours: OpeningHours;
  sub_locations: string[];
  free_seats_currently: number;
  predictions: number[];
  is_closed: boolean;
}

export interface LibraryData {
  ALLBIBS: Library[];
  FBIB: Library[];
  LAFAS: Library[];
  BIBN: Library[];
  KITBIBS_A: Library[];
  KITBIBS_N: Library[];
  INFOKOM: Library[];
  BLBIB: Library[];
}

export type LibraryCategory = keyof LibraryData | 'ALL';

export const categoryDisplayNames: Record<LibraryCategory, string> = {
  ALL: "Alle Bibliotheken",
  ALLBIBS: "Sonstige",
  FBIB: "Fachbibliotheken",
  LAFAS: "Lernzentrum Fasanenschlösschen",
  BIBN: "KIT-Bibliothek Nord",
  KITBIBS_A: "KIT-Bibliothek Süd (Altbau)",
  KITBIBS_N: "KIT-Bibliothek Süd (Neubau)",
  INFOKOM: "InformatiKOM",
  BLBIB: "Badische Landesbibliothek",
};
