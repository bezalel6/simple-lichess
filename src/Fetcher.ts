import UserInfo from "./UserData";
import { Game } from "./Game";
import { PassThrough } from "stream";
import { Fetch } from "./fetch";
import { PlayerOpenings, PositionJson } from "./lookupTypes";

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

export function fetchGame(gameID: string, myUsername: string) {
  const f = new Fetch<Game>({});
  return f.startFetch(GAME_FETCH + gameID, (str) => {
    return new Game(str, myUsername);
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
  const fetcher = new Fetch<PlayerOpenings>({});
  fetcher.params.append("color", color);
  if (fen) fetcher.params.append("fen", fen);
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
export function promisifyStream<T>(stream: SimpleStream<T>) {
  return new Promise<T>((r) => {
    stream.listen(r);
  });
}
export class SimpleStream<T> {
  private callbacks: Array<(obj: T) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private endCallbacks: Array<() => void> = [];
  private ended = false;

  write(obj: T): void {
    if (this.ended) return;
    
    // Emit to all registered callbacks
    for (const callback of this.callbacks) {
      try {
        callback(obj);
      } catch (e) {
        // Emit error but don't stop other callbacks
        this.error(new Error(`Callback error: ${e}`));
      }
    }
  }

  listen(callback: (obj: T) => void): void {
    this.callbacks.push(callback);
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  onEnd(callback: () => void): void {
    if (this.ended) {
      callback();
      return;
    }
    this.endCallbacks.push(callback);
  }

  error(error: Error): void {
    for (const callback of this.errorCallbacks) {
      callback(error);
    }
  }

  end(): void {
    if (this.ended) return;
    this.ended = true;
    
    for (const callback of this.endCallbacks) {
      callback();
    }
  }
}
export async function fetchUserInfo(username: string): Promise<UserInfo> {
  const userDetailsResponse = await fetch("https://lichess.org/api/user/" + username);
  
  if (!userDetailsResponse.ok) {
    throw new Error(`Failed to fetch user info: ${userDetailsResponse.status} ${userDetailsResponse.statusText}`);
  }
  
  const userDetails = (await userDetailsResponse.json()) as UserInfo;
  return userDetails;
}
