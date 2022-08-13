import fetch from "node-fetch";
import Game from "./Game.js";
import { PassThrough } from "stream";
const GAMES_FETCH = "https://lichess.org/api/games/user";
export async function fetchGames(username, { rated, accessToken, maxGames }) {
    let headers = {};
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
    fetch(url + "?" + params, {
        headers,
        method: "GET",
    }).then((res) => {
        const reader = res.body;
        const decoder = new TextDecoder();
        reader.on('readable', () => {
            const read = reader.read();
            if (!read) {
                console.log('finished');
                return;
            }
            const dec = decoder.decode(read);
            // console.log('readable', dec)
            stream.write(new Game(dec, username));
        });
    });
    return stream;
}
export class SimpleStream {
    stream;
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
export async function fetchUserInfo(username) {
    const userDetailsF = await fetch("https://lichess.org/api/user/" + username);
    const userDetails = await userDetailsF.json();
    return userDetails;
}
//# sourceMappingURL=Fetcher.js.map