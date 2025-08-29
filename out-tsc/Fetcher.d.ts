import UserInfo from "./UserData";
import { Game } from "./Game";
import { PlayerOpenings, PositionJson } from "./lookupTypes";
type RatedRequirement = "rated" | "unrated" | "both";
export interface FetchOptions {
    accessToken?: string;
}
interface GamesOptions extends FetchOptions {
    rated: RatedRequirement;
    maxGames?: number;
}
export declare function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions): SimpleStream<Game>;
export declare function fetchGame(gameID: string, myUsername: string): SimpleStream<Game>;
export interface LookupParams {
    database: "masters" | "lichess";
    fen?: string;
    play?: string;
}
export declare function lookup({ fen, database, play }: LookupParams): SimpleStream<PositionJson>;
export declare function lookupPlayer({ fen, play, player, color, }: {
    fen?: string;
    play?: string;
    player: string;
    color: "white" | "black";
}): SimpleStream<PlayerOpenings>;
/**
 * only to be used when one object is expected from the stream
 * @param stream
 */
export declare function promisifyStream<T>(stream: SimpleStream<T>): Promise<T>;
export declare class SimpleStream<T> {
    private callbacks;
    private errorCallbacks;
    private endCallbacks;
    private ended;
    write(obj: T): void;
    listen(callback: (obj: T) => void): void;
    onError(callback: (error: Error) => void): void;
    onEnd(callback: () => void): void;
    error(error: Error): void;
    end(): void;
}
export declare function fetchUserInfo(username: string): Promise<UserInfo>;
export {};
