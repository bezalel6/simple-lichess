import UserData from "./UserData";
import fetch from "node-fetch";
import Game from "./Game.js";
import { PassThrough, Readable, Stream, Transform } from "stream";


type RatedRequirement = "rated" | "unrated" | "both";
interface GamesOptions {
  rated: RatedRequirement;
  accessToken?: string;
  maxGames?: number;
}
const GAMES_FETCH = "https://lichess.org/api/games/user";
export async function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions) {
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
    params.append('max', maxGames + "")
  }

  const stream = new SimpleStream<Game>();
  fetch(url + "?" + params, {
    headers,
    method: "GET",
  }).then((res) => {
    const reader = res.body!;
    const decoder = new TextDecoder();

    reader.on('readable', () => {
      const read = reader.read() as Buffer;
      if (!read) {
        console.log('finished')
        return
      }
      const dec = decoder.decode(read);
      // console.log('readable', dec)
      stream.write(new Game(dec, username));
    })
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