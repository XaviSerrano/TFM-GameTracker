export interface CustomList {
  id: number;
  title: string;
  description?: string;

  user: {
    id: number;
    username: string;
    displayName?: string;
  };

  createdAt?: string;
  games?: CustomListGame[];
}

export interface CustomListGame {
  id: number;
  gameId: number;
  name: string;
  backgroundImage?: string | null;
  rating?: number;
}