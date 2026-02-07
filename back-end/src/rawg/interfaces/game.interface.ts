export interface NormalizedGame {
  id: number;
  name: string;
  description?: string;
  backgroundImage?: string;
  rating?: number;
  ratingsCount?: number;
  released?: string;
  platforms?: string[];
  genres?: string[];
  developers?: string[];
  publishers?: string[];
  esrbRating?: string;
  metacritic?: number;
  playtime?: number;
  screenshots?: string[];
}

export interface NormalizedGameList {
  results: NormalizedGame[];
  count?: number;
  next?: string;
  previous?: string;
}