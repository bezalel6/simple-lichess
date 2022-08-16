import UserData from "./UserData";
import { Game } from "./Game.js";
declare type RatedRequirement = "rated" | "unrated" | "both";
interface FetchOptions {
    accessToken?: string;
}
interface GamesOptions extends FetchOptions {
    rated?: RatedRequirement;
    maxGames?: number;
}
export declare function fetchGames(username: string, { rated, accessToken, maxGames }: GamesOptions): SimpleStream<Game>;
export declare class SimpleStream<T> {
    private stream;
    constructor();
    write(obj: T): void;
    listen(callback: (obj: T) => void): void;
}
export declare function fetchUserInfo(username: string): Promise<UserData>;
export {};
