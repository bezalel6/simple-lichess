import { fetchGame } from "./fetcher";
function fetcher() {
    fetchGame("UGvK3Qpa", "bezalel6").listen((game) => {
        const s = game.description;
        console.log("fetchedd", s);
    });
}
export function test() {
    // fetcher();
    // evaluatePosition({ fen: "rnbqkbnQ/pppppppp/8/8/8/8/PPPPPPPP/RNB1KBNR w KQq - 0 1" })
    // lookup({ fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", database: "masters" }).listen(console.log)
    // lookupPlayer({
    //   fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    //   player: "damnsaltythatsport",
    //   play: "d2d4",
    // }).listen(console.log);
}
//# sourceMappingURL=test.js.map