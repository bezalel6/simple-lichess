export interface Player {
  name: string;
  rating: number;
}

export interface Opening {
  eco: string;
  name: string;
}

export interface DatabaseGame {
  id: string;
  winner: string;
  white: Player;
  black: Player;
  year: number;
  month: string;
}

export interface PlayerGame extends DatabaseGame {
  speed: string;
  mode: string;
}

export interface DatabaseMove {
  uci: string;
  san: string;
  averageRating: number;
  white: number;
  draws: number;
  black: number;
  game: DatabaseGame;
}

export interface PlayerMove {
  uci: string;
  san: string;
  averageOpponentRating: number;
  performance: number;
  white: number;
  draws: number;
  black: number;
  game: PlayerGame;
}

export interface TopGame {
  uci: string;
  id: string;
  winner: string;
  white: Player;
  black: Player;
  year: number;
  month: string;
}

export interface PositionJson {
  white: number;
  draws: number;
  black: number;
  moves: DatabaseMove[];
  topGames: TopGame[];
  recentGames: any[];
  opening: Opening;
}

export interface PlayerOpenings {
  white: number;
  draws: number;
  black: number;
  moves: PlayerMove[];
  recentGames: PlayerGame[];
  opening: Opening;
}
