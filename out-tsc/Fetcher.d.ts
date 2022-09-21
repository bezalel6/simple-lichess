import UserInfo from "./UserData";
import { Game } from "./game";
import { PositionJson } from "./lookupTypes";
declare type RatedRequirement = "rated" | "unrated" | "both";
export interface FetchOptions {
    accessToken?: string;
}
interface GamesOptions extends FetchOptions {
    rated: RatedRequirement;
    maxGames?: number;
}
export declare function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions): SimpleStream<Game>;
export declare function fetchGame(gameID: string, myUn: any): SimpleStream<Game>;
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
}): SimpleStream<PositionJson>;
export declare class SimpleStream<T> {
    private stream;
    constructor();
    write(obj: T): void;
    listen(callback: (obj: T) => void): void;
}
export declare function fetchUserInfo(username: string): Promise<UserInfo>;
export {};
