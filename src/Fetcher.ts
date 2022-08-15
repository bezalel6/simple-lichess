import UserData from "./UserData";
import { Game } from "./Game.js";
import S, { PassThrough } from "stream";
import LAME, { Response } from 'cross-fetch'

// import fetch from "node-fetch";
// import fetch from "node-fetch";



type RatedRequirement = "rated" | "unrated" | "both";
interface GamesOptions {
  rated: RatedRequirement;
  accessToken?: string;
  maxGames?: number;
}
const GAMES_FETCH = "https://lichess.org/api/games/user";
export function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions) {
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
    params.append('max', maxGames + "")
  }
  const stream = new SimpleStream<Game>();
  if (params.values())
    url += "?" + params;


  function game(pgn: string) {
    pgn
      .split("\n\n\n")
      .filter((split) => split.trim())
      .forEach(p => {
        stream.write(new Game(p, username));
      });
  }
  const IS_NODE = typeof window === "undefined"
  const LE_FETCHER = IS_NODE ? LAME : fetch;
  // if (isNode()) {
  LE_FETCHER(url, {
    headers,
    mode: "cors",
    method: 'GET',

  }).then(res => {
    try {
      const a = res.body as unknown as PassThrough
      const reader = IS_NODE ? res.body as unknown as PassThrough : res.body.getReader();
      const decoder = new TextDecoder();
      if (IS_NODE) {

        (reader as PassThrough).on('readable', () => {
          const read = reader.read() as Buffer;
          if (!read) {
            console.log('finished')
            return
          }
          const dec = decoder.decode(read);
          // console.log('readable', dec)
          game(dec)
        })
      }
      else {
        const read = () => {
          (reader as ReadableStreamDefaultReader).read().then((result) => {
            if (result.done) {
              console.log("done reading!");
              //   console.log("majesty", chunks.join(""));
              return;
            }
            const got = decoder.decode(result.value, { stream: true });
            game(got)
            read();
          });
        };
        read();
      }

    } catch (e) {
      console.error('threw', e)
    }

  })

  return stream;
}

export class SimpleStream<T>{
  private stream: PassThrough;
  constructor() {
    this.stream = new PassThrough();
  }
  write(obj: T) {
    this.stream.push(JSON.stringify(obj))
  }
  listen(callback: (obj: T) => void) {
    this.stream.on('data', chunk => {
      const converted = JSON.parse(chunk) as T;
      callback(converted);
    })
  }
}
export async function fetchUserInfo(username: string) {
  const userDetailsF = await fetch("https://lichess.org/api/user/" + username);
  const userDetails = await userDetailsF.json() as UserData;
  return userDetails;
}