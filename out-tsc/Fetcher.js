var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Game } from "./Game.js";
import { PassThrough } from "stream";
import LAME from 'cross-fetch';
const GAMES_FETCH = "https://lichess.org/api/games/user";
export function fetchGames(username, { rated, accessToken, maxGames }) {
    rated = rated ? rated : "both";
    // accept application/x-chess-pgn 
    let headers = {
        Accept: 'application/x-chess-pgn'
    };
    if (accessToken) {
        headers['Authorization'] = "Bearer " + accessToken;
    }
    let url = GAMES_FETCH + `/${username}`;
    const params = new URLSearchParams();
    switch (rated) {
        case "rated": {
            params.append('rated', 'true');
            break;
        }
        case "unrated": {
            params.append('rated', 'false');
            break;
        }
    }
    if (maxGames) {
        params.append('max', maxGames + "");
    }
    const stream = new SimpleStream();
    if (params.values())
        url += "?" + params;
    function game(pgn) {
        pgn
            .split("\n\n\n")
            .filter((split) => split.trim())
            .forEach(p => {
            stream.write(new Game(p, username));
        });
    }
    const IS_NODE = typeof window === "undefined";
    const LE_FETCHER = IS_NODE ? LAME : fetch;
    // if (isNode()) {
    LE_FETCHER(url, {
        headers,
        mode: "cors",
        method: 'GET',
    }).then(res => {
        try {
            const a = res.body;
            const reader = IS_NODE ? res.body : res.body.getReader();
            const decoder = new TextDecoder();
            if (IS_NODE) {
                reader.on('readable', () => {
                    const read = reader.read();
                    if (!read) {
                        console.log('finished');
                        return;
                    }
                    const dec = decoder.decode(read);
                    // console.log('readable', dec)
                    game(dec);
                });
            }
            else {
                const read = () => {
                    reader.read().then((result) => {
                        if (result.done) {
                            console.log("done reading!");
                            //   console.log("majesty", chunks.join(""));
                            return;
                        }
                        const got = decoder.decode(result.value, { stream: true });
                        game(got);
                        read();
                    });
                };
                read();
            }
        }
        catch (e) {
            console.error('threw', e);
        }
    });
    return stream;
}
function createFetch() {
    return {
        params: new URLSearchParams(),
        paramsSetup: () => {
        },
        headers: {},
        startFetch: (endpoint, modEach = null) => {
        }
    };
}
export class SimpleStream {
    constructor() {
        this.stream = new PassThrough();
    }
    write(obj) {
        this.stream.push(JSON.stringify(obj));
    }
    listen(callback) {
        this.stream.on('data', chunk => {
            const converted = JSON.parse(chunk);
            callback(converted);
        });
    }
}
export function fetchUserInfo(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const userDetailsF = yield fetch("https://lichess.org/api/user/" + username);
        const userDetails = yield userDetailsF.json();
        return userDetails;
    });
}
//# sourceMappingURL=Fetcher.js.map