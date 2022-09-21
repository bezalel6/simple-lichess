import { PassThrough } from "stream";
import LAME from "cross-fetch";
import { FetchOptions, SimpleStream } from "./fetcher";

export class Fetch<T> {
  params = new URLSearchParams();
  headers = {};
  constructor(
    { accessToken }: FetchOptions,
    acceptType = "application/x-chess-pgn"
  ) {
    this.headers["Accept"] = acceptType;
    if (accessToken) this.headers["Authorization"] = "Bearer " + accessToken;
  }
  private get fetcher() {
    return this.isNode
      ? LAME
      : (url: string, obj: any) => window.fetch(url, obj);
    // return fetch;
  }
  private get isNode() {
    return typeof window === "undefined";
  }

  startFetch = (
    endpoint: string,
    construct: (chunk: string) => T = (a) => {
      return JSON.parse(a) as unknown as T;
    }
  ): SimpleStream<T> => {
    const stream = new SimpleStream<T>();

    const url = endpoint + ("?" + this.params.toString());
    console.log("url", url);
    function readChunk(chunk: string) {
      const obj: T = construct(chunk);
      stream.write(obj);
    }
    this.fetcher(url, {
      headers: this.headers,
      mode: "cors",
      method: "GET",
    }).then((res) => {
      try {
        const a = res.body as unknown as PassThrough;
        const reader = this.isNode
          ? (res.body as unknown as PassThrough)
          : res.body.getReader();
        const decoder = new TextDecoder();
        if (this.isNode) {
          (reader as PassThrough).on("readable", () => {
            const read = reader.read() as Buffer;
            if (!read) {
              console.log("finished");
              return;
            }
            const dec = decoder.decode(read);
            // console.log('readable', dec)
            readChunk(dec);
          });
        } else {
          const read = () => {
            (reader as ReadableStreamDefaultReader).read().then((result) => {
              if (result.done) {
                console.log("done reading!");
                //   console.log("majesty", chunks.join(""));
                return;
              }
              const got = decoder.decode(result.value, { stream: true });
              readChunk(got);
              read();
            });
          };
          read();
        }
      } catch (e) {
        console.error("threw", e);
      }
    });
    return stream;
  };
}
