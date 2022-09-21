import { FetchOptions, SimpleStream } from "./fetcher";
export declare class Fetch<T> {
    params: URLSearchParams;
    headers: {};
    constructor({ accessToken }: FetchOptions, acceptType?: string);
    private get fetcher();
    private get isNode();
    startFetch: (endpoint: string, construct?: (chunk: string) => T) => SimpleStream<T>;
}
