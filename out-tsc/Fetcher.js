import { Game } from "./Game";
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
export function fetchGame(gameID, myUsername) {
    const f = new Fetch({});
    return f.startFetch(GAME_FETCH + gameID, (str) => {
        return new Game(str, myUsername);
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
    return fetcher.startFetch(DB_ENDPOINT + "player");
}
/**
 * only to be used when one object is expected from the stream
 * @param stream
 */
export function promisifyStream(stream) {
    return new Promise((r) => {
        stream.listen(r);
    });
}
export class SimpleStream {
    constructor() {
        this.callbacks = [];
        this.errorCallbacks = [];
        this.endCallbacks = [];
        this.ended = false;
    }
    write(obj) {
        if (this.ended)
            return;
        // Emit to all registered callbacks
        for (const callback of this.callbacks) {
            try {
                callback(obj);
            }
            catch (e) {
                // Emit error but don't stop other callbacks
                this.error(new Error(`Callback error: ${e}`));
            }
        }
    }
    listen(callback) {
        this.callbacks.push(callback);
    }
    onError(callback) {
        this.errorCallbacks.push(callback);
    }
    onEnd(callback) {
        if (this.ended) {
            callback();
            return;
        }
        this.endCallbacks.push(callback);
    }
    error(error) {
        for (const callback of this.errorCallbacks) {
            callback(error);
        }
    }
    end() {
        if (this.ended)
            return;
        this.ended = true;
        for (const callback of this.endCallbacks) {
            callback();
        }
    }
}
export async function fetchUserInfo(username) {
    const userDetailsResponse = await fetch("https://lichess.org/api/user/" + username);
    if (!userDetailsResponse.ok) {
        throw new Error(`Failed to fetch user info: ${userDetailsResponse.status} ${userDetailsResponse.statusText}`);
    }
    const userDetails = (await userDetailsResponse.json());
    return userDetails;
}
//# sourceMappingURL=Fetcher.js.map