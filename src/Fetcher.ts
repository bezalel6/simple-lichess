import UserData from "./UserData";
import { Game } from "./Game.js";
import S, { PassThrough } from "stream";
import LAME, { Response } from 'cross-fetch'

// import fetch from "node-fetch";
// import fetch from "node-fetch";



type RatedRequirement = "rated" | "unrated" | "both";

interface FetchOptions {
  accessToken?: string;
}
interface GamesOptions extends FetchOptions {
  rated?: RatedRequirement;
  maxGames?: number;

}

const GAMES_FETCH = "https://lichess.org/api/games/user";
export function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions) {
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
class Fetch {
  params = new URLSearchParams();
  headers = {};
  constructor({ accessToken, acceptType = "application/x-chess-pgn" }: FetchOptions & { acceptType: string }) {
    this.headers["Accept"] = acceptType;
    if (accessToken)
      this.headers['Authorization'] = "Bearer " + accessToken;
  }
  private get fetcher() {
    return this.isNode ? LAME : fetch;
  }
  private get isNode() {
    return typeof window === "undefined";
  }



  startFetch = <T>(endpoint: string, construct: ((chunk: string) => T)): SimpleStream<T> => {
    const stream = new SimpleStream<T>();

    const url = endpoint + "/" + ("?" + this.params.toString())

    function readChunk(chunk: string) {
      const obj: T = construct(chunk);
      stream.write(obj)
    }
    this.fetcher(url, {
      headers: this.headers,
      mode: "cors",
      method: 'GET',

    }).then(res => {
      try {
        const a = res.body as unknown as PassThrough
        const reader = this.isNode ? res.body as unknown as PassThrough : res.body.getReader();
        const decoder = new TextDecoder();
        if (this.isNode) {
          (reader as PassThrough).on('readable', () => {
            const read = reader.read() as Buffer;
            if (!read) {
              console.log('finished')
              return
            }
            const dec = decoder.decode(read);
            // console.log('readable', dec)
            readChunk(dec)
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
              readChunk(got)
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