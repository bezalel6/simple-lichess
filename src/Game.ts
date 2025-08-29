import { DynamicMove, GameResult, Termination } from "./Misc";

class Game {
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
  constructor(pgn: string, myUsername: string) {
    try {
      this.pgn = pgn;
      this.myUsername = myUsername;
      this.event = pgnProperty("Event", pgn);
      this.site = pgnProperty("Site", pgn);
      this.white = pgnProperty("White", pgn);
      this.black = pgnProperty("Black", pgn);
      this.result = pgnProperty("Result", pgn) as GameResult;
      this.termination = pgnProperty("Termination", pgn) as Termination;
      const match = pgn.match("\n(1[.].+)");
      if (match && match[1]) {
        this.moves = match[1];
      } else {
        this.moves = "";
      }
      this.whiteMoves = [];
      this.blackMoves = [];
      const m = this.moves.split(/[0-9]+[.] /);
      for (let i = 1; i < m.length; i++) {
        const moveText = m[i];
        if (!moveText) continue;
        
        const [whiteM, blackM] = moveText
          .split(" ")
          .filter((s) => !!s.trim().length);
        
        if (whiteM) {
          this.whiteMoves.push(whiteM);
        }
        
        if (blackM && !(this.result === "1-0" && i === m.length - 1)) {
          this.blackMoves.push(blackM);
        }
      }
      this.description = `white:${this.white} vs black:${this.black} ${this.result}`;
    } catch (e) {
      throw new Error(`threw inside game constructor. pgn: ${pgn}. e: ${e}`);
    }
  }
  get didWin(): boolean {
    return (
      (this.result === "1-0" && this.isWhite) ||
      (this.result === "0-1" && !this.isWhite)
    );
  }
  get didDraw(): boolean {
    return this.result === "1/2-1/2";
  }
  get didLose(): boolean {
    return !this.didDraw && !this.didWin;
  }
  get myMoves(): string[] {
    return this.isWhite ? this.whiteMoves : this.blackMoves;
  }
  get opponentMoves(): string[] {
    return this.isWhite ? this.blackMoves : this.whiteMoves;
  }
  get isWhite(): boolean {
    return this.myUsername === this.white;
  }
  get opponentUsername(): string {
    return this.isWhite ? this.black : this.white;
  }

  get perspectiveResult(): "i won" | "i lost" | "i drew" {
    return this.didWin ? "i won" : this.didLose ? "i lost" : "i drew";
  }
  didIPlay(move: string | DynamicMove, exact: boolean = false) {
    // check if move is a string or dynamic move
    if (typeof move === "string") {
      return this.didPlay(move, this.myMoves, exact);
    }

    return this.didPlay(
      this.convertDynamic(move, this.myUsername),
      this.myMoves,
      exact
    );
  }

  didOpponentPlay(move: string | DynamicMove, exact: boolean = false) {
    // check if move is a string or dynamic move
    if (typeof move === "string") {
      return this.didPlay(move, this.opponentMoves, exact);
    }

    return this.didPlay(
      this.convertDynamic(move, this.opponentUsername),
      this.opponentMoves,
      exact
    );
  }

  didPlay(move: string, moves: string[], exact: boolean) {
    return moves.find((m) => (exact ? m === move : m.includes(move)));
  }
  convertDynamic(move: DynamicMove, player: string) {
    if (player === this.white) {
      return move.col + "" + move.row;
    }
    const a = Math.abs(move.row - 8) + 1;
    return move.col + "" + a;
  }
}
function pgnProperty(property: string, pgn: string): string {
  const match = pgn.match(`\\[${property} "([^"]+)`);
  if (!match || !match[1]) {
    throw new Error(`Required PGN property "${property}" not found or invalid`);
  }
  return match[1];
}
export { Game };
