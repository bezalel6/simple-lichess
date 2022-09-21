import { Game } from "./game";
import { PassThrough } from "stream";
import { Fetch } from "./fetch";
const GAMES_FETCH = "https://lichess.org/api/games/user";
const GAME_FETCH = "https://lichess.org/game/export/";
export function fetchGames(username, { rated = "both", accessToken, maxGames }) {
    const fetcher = new Fetch({ accessToken });
    let url = GAMES_FETCH + `/${username}`;
    const params = fetcher.params;
    switch (rated) {
        case "rated": {
            params.append("rated", "true");
            break;
        }
        case "unrated": {
            params.append("rated", "false");
            break;
        }
    }
    if (maxGames) {
        params.append("max", maxGames + "");
    }
    return fetcher.startFetch(url, (str) => {
        return new Game(str, username);
    });
}
export function fetchGame(gameID, myUn) {
    const f = new Fetch({});
    return f.startFetch(GAME_FETCH + gameID, (str) => {
        return new Game(str, myUn);
    });
}
const DB_ENDPOINT = "https://explorer.lichess.ovh/";
export function lookup({ fen, database, play }) {
    const fetcher = new Fetch({});
    if (fen)
        fetcher.params.append("fen", fen);
    if (play) {
        fetcher.params.append("play", play);
    }
    return fetcher.startFetch(DB_ENDPOINT + database);
}
export function lookupPlayer({ fen, play, player, color, }) {
    const fetcher = new Fetch({});
    fetcher.params.append("color", color);
    if (fen)
        fetcher.params.append("fen", fen);
    if (play) {
        fetcher.params.append("play", play);
    }
    if (player) {
        fetcher.params.append("player", player);
    }
    console.log("params - ", fetcher.params.toString());
    return fetcher.startFetch(DB_ENDPOINT + "player");
}
export class SimpleStream {
    constructor() {
        this.stream = new PassThrough();
    }
    write(obj) {
        this.stream.push(JSON.stringify(obj));
    }
    listen(callback) {
        this.stream.on("data", (chunk) => {
            const converted = JSON.parse(chunk);
            callback(converted);
        });
    }
}
export async function fetchUserInfo(username) {
    const userDetailsF = await fetch("https://lichess.org/api/user/" + username);
    const userDetails = (await userDetailsF.json());
    return userDetails;
}
//# sourceMappingURL=fetcher.js.map