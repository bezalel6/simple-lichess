import LAME from "cross-fetch";
import { SimpleStream } from "./fetcher";
export class Fetch {
    constructor({ accessToken }, acceptType = "application/x-chess-pgn") {
        this.params = new URLSearchParams();
        this.headers = {};
        this.startFetch = (endpoint, construct = (a) => {
            return JSON.parse(a);
        }) => {
            const stream = new SimpleStream();
            const url = endpoint + ("?" + this.params.toString());
            console.log("url", url);
            function readChunk(chunk) {
                const obj = construct(chunk);
                stream.write(obj);
            }
            this.fetcher(url, {
                headers: this.headers,
                mode: "cors",
                method: "GET",
            }).then((res) => {
                try {
                    const a = res.body;
                    const reader = this.isNode
                        ? res.body
                        : res.body.getReader();
                    const decoder = new TextDecoder();
                    if (this.isNode) {
                        reader.on("readable", () => {
                            const read = reader.read();
                            if (!read) {
                                console.log("finished");
                                return;
                            }
                            const dec = decoder.decode(read);
                            // console.log('readable', dec)
                            readChunk(dec);
                        });
                    }
                    else {
                        const read = () => {
                            reader.read().then((result) => {
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
                }
                catch (e) {
                    console.error("threw", e);
                }
            });
            return stream;
        };
        this.headers["Accept"] = acceptType;
        if (accessToken)
            this.headers["Authorization"] = "Bearer " + accessToken;
    }
    get fetcher() {
        return this.isNode
            ? LAME
            : (url, obj) => window.fetch(url, obj);
        // return fetch;
    }
    get isNode() {
        return typeof window === "undefined";
    }
}
//# sourceMappingURL=fetch.js.map