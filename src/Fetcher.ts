import UserInfo from "./UserData";
import { Game } from "./game";
import S, { PassThrough } from "stream";
import { Response } from "cross-fetch";
import { Fetch } from "./fetch";
import { PositionJson } from "./lookupTypes";

// import fetch from "node-fetch";
// import fetch from "node-fetch";

type RatedRequirement = "rated" | "unrated" | "both";

export interface FetchOptions {
  accessToken?: string;
}
interface GamesOptions extends FetchOptions {
  rated: RatedRequirement;
  maxGames?: number;
}

const GAMES_FETCH = "https://lichess.org/api/games/user";
const GAME_FETCH = "https://lichess.org/game/export/";
export function fetchGames(
  username: string,
  { rated = "both", accessToken, maxGames }: GamesOptions
) {
  const fetcher = new Fetch<Game>({ accessToken });
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

export function fetchGame(gameID: string, myUn) {
  const f = new Fetch<Game>({});
  return f.startFetch(GAME_FETCH + gameID, (str) => {
    return new Game(str, myUn);
  });
}

export interface LookupParams {
  database: "masters" | "lichess";
  fen?: string;
  play?: string;
}
const DB_ENDPOINT = "https://explorer.lichess.ovh/";
export function lookup({ fen, database, play }: LookupParams) {
  const fetcher = new Fetch<PositionJson>({});
  if (fen) fetcher.params.append("fen", fen);
  if (play) {
    fetcher.params.append("play", play);
  }
  return fetcher.startFetch(DB_ENDPOINT + database);
}

export function lookupPlayer({
  fen,
  play,
  player,
  color,
}: {
  fen?: string;
  play?: string;
  player: string;
  color: "white" | "black";
}) {
  const fetcher = new Fetch<PositionJson>({});
  fetcher.params.append("color", color);
  if (fen) fetcher.params.append("fen", fen);
  if (play) {
    fetcher.params.append("play", play);
  }
  if (player) {
    fetcher.params.append("player", player);
  }
  console.log("params - ", fetcher.params.toString());
  return fetcher.startFetch(DB_ENDPOINT + "player");
}

export class SimpleStream<T> {
  private stream: PassThrough;
  constructor() {
    this.stream = new PassThrough();
  }
  write(obj: T) {
    this.stream.push(JSON.stringify(obj));
  }
  listen(callback: (obj: T) => void) {
    this.stream.on("data", (chunk) => {
      const converted = JSON.parse(chunk) as T;
      callback(converted);
    });
  }
}
export async function fetchUserInfo(username: string) {
  const userDetailsF = await fetch("https://lichess.org/api/user/" + username);
  const userDetails = (await userDetailsF.json()) as UserInfo;
  return userDetails;
}
