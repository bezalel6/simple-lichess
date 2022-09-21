import { DynamicMove, GameResult, Termination } from "./misc";
declare class Game {
    event: string;
    site: string;
    white: string;
    black: string;
    result: GameResult;
    termination: Termination;
    moves: string;
    whiteMoves: string[];
    blackMoves: string[];
    pgn: string;
    myUsername: string;
    description: string;
    constructor(pgn: string, myUsername: string);
    get didWin(): boolean;
    get didDraw(): boolean;
    get didLose(): boolean;
    get myMoves(): string[];
    get opponentMoves(): string[];
    get isWhite(): boolean;
    get opponentUsername(): string;
    get perspectiveResult(): "i won" | "i lost" | "i drew";
    didIPlay(move: string | DynamicMove, exact?: boolean): string;
    didOpponentPlay(move: string | DynamicMove, exact?: boolean): string;
    didPlay(move: string, moves: string[], exact: boolean): string;
    convertDynamic(move: DynamicMove, player: string): string;
}
export { Game };
