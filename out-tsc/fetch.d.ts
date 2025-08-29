import { FetchOptions, SimpleStream } from "./Fetcher";
export declare class Fetch<T> {
    params: URLSearchParams;
    headers: Record<string, string>;
    constructor({ accessToken }: FetchOptions, acceptType?: string);
    private get fetcher();
    private get isNode();
    startFetch: (endpoint: string, construct?: (chunk: string) => T) => SimpleStream<T>;
    private nodeStreamFetch;
    private browserStreamFetch;
}
