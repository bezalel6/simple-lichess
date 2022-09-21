class Game {
    constructor(pgn, myUsername) {
        try {
            this.pgn = pgn;
            this.myUsername = myUsername;
            this.event = pgnProperty("Event", pgn);
            this.site = pgnProperty("Site", pgn);
            this.white = pgnProperty("White", pgn);
            this.black = pgnProperty("Black", pgn);
            this.result = pgnProperty("Result", pgn);
            this.termination = pgnProperty("Termination", pgn);
            const match = pgn.match("\n(1[.].+)");
            if (match)
                this.moves = match[1];
            else {
                this.moves = "";
            }
            this.whiteMoves = [];
            this.blackMoves = [];
            const m = this.moves.split(/[0-9]+[.] /);
            for (let i = 1; i < m.length; i++) {
                const [whiteM, blackM] = m[i].split(" ").filter(s => !!s.trim().length);
                if (!(this.result === "1-0" && i === m.length - 1)) {
                    this.blackMoves.push(blackM);
                }
                this.whiteMoves.push(whiteM);
            }
            this.description = `white:${this.white} vs black:${this.black} ${this.result}`;
        }
        catch (e) {
            throw new Error(`threw inside game constructor. pgn: ${pgn}. e: ${e}`);
        }
    }
    get didWin() {
        return (this.result === "1-0" && this.isWhite) || (this.result === "0-1" && !this.isWhite);
    }
    get didDraw() {
        return this.result === "1/2-1/2";
    }
    get didLose() {
        return !this.didDraw;
    }
    get myMoves() {
        return this.isWhite ? this.whiteMoves : this.blackMoves;
    }
    get opponentMoves() {
        return this.isWhite ? this.blackMoves : this.whiteMoves;
    }
    get isWhite() {
        return this.myUsername === this.white;
    }
    get opponentUsername() {
        return this.isWhite ? this.black : this.white;
    }
    get perspectiveResult() {
        return this.didWin ? "i won" : this.didLose ? "i lost" : "i drew";
    }
    didIPlay(move, exact = false) {
        // check if move is a string or dynamic move
        if (typeof move === "string") {
            return this.didPlay(move, this.myMoves, exact);
        }
        return this.didPlay(this.convertDynamic(move, this.myUsername), this.myMoves, exact);
    }
    didOpponentPlay(move, exact = false) {
        // check if move is a string or dynamic move
        if (typeof move === "string") {
            return this.didPlay(move, this.opponentMoves, exact);
        }
        return this.didPlay(this.convertDynamic(move, this.opponentUsername), this.opponentMoves, exact);
    }
    didPlay(move, moves, exact) {
        return moves.find(m => (exact ? m === move : m.includes(move)));
    }
    convertDynamic(move, player) {
        if (player === this.white) {
            return move.col + "" + move.row;
        }
        const a = Math.abs(move.row - 8) + 1;
        return move.col + "" + a;
    }
}
function pgnProperty(property, pgn) {
    return pgn.match(`\\[${property} "([^"]+)`)[1];
}
export { Game };
//# sourceMappingURL=game.js.map