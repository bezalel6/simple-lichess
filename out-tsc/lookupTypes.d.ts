export interface White {
    name: string;
    rating: number;
}
export interface Black {
    name: string;
    rating: number;
}
export interface Game {
    id: string;
    winner: string;
    white: White;
    black: Black;
    year: number;
    month: string;
}
export interface Move {
    uci: string;
    san: string;
    averageRating: number;
    white: number;
    draws: number;
    black: number;
    game: Game;
}
export interface White2 {
    name: string;
    rating: number;
}
export interface Black2 {
    name: string;
    rating: number;
}
export interface TopGame {
    uci: string;
    id: string;
    winner: string;
    white: White2;
    black: Black2;
    year: number;
    month: string;
}
export interface Opening {
    eco: string;
    name: string;
}
export interface PositionJson {
    white: number;
    draws: number;
    black: number;
    moves: Move[];
    topGames: TopGame[];
    recentGames: any[];
    opening: Opening;
}
export interface Black {
    name: string;
    rating: number;
}
export interface White {
    name: string;
    rating: number;
}
export interface Game {
    id: string;
    winner: string;
    speed: string;
    mode: string;
    black: Black;
    white: White;
    year: number;
    month: string;
}
export interface Move {
    uci: string;
    san: string;
    averageOpponentRating: number;
    performance: number;
    white: number;
    draws: number;
    black: number;
    game: Game;
}
export interface Black2 {
    name: string;
    rating: number;
}
export interface White2 {
    name: string;
    rating: number;
}
export interface RecentGame {
    uci: string;
    id: string;
    winner: string;
    speed: string;
    mode: string;
    black: Black2;
    white: White2;
    year: number;
    month: string;
}
export interface Opening {
    eco: string;
    name: string;
}
export interface PlayerOpenings {
    white: number;
    draws: number;
    black: number;
    moves: Move[];
    recentGames: RecentGame[];
    opening: Opening;
}
