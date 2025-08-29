import * as https from "https";
import * as http from "http";
import crossFetch from "cross-fetch";
import { SimpleStream } from "./Fetcher";
export class Fetch {
    constructor({ accessToken }, acceptType = "application/x-chess-pgn") {
        this.params = new URLSearchParams();
        this.headers = {};
        this.startFetch = (endpoint, construct = (a) => {
            return JSON.parse(a);
        }) => {
            const stream = new SimpleStream();
            const fullUrl = endpoint + ("?" + this.params.toString());
            if (this.isNode) {
                // Use native Node.js streaming for true network streaming
                this.nodeStreamFetch(fullUrl, construct, stream);
            }
            else {
                // Use fetch API for browser
                this.browserStreamFetch(fullUrl, construct, stream);
            }
            return stream;
        };
        this.headers["Accept"] = acceptType;
        if (accessToken) {
            this.headers["Authorization"] = "Bearer " + accessToken;
        }
    }
    get fetcher() {
        return this.isNode
            ? crossFetch
            : (url, obj) => window.fetch(url, obj);
    }
    get isNode() {
        return typeof window === "undefined";
    }
    nodeStreamFetch(url, construct, stream) {
        const parsedUrl = new URL(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;
        let buffer = "";
        const processBuffer = () => {
            // Split on double newlines (PGN separator) or single newlines (JSON lines)  
            const delimiter = url.includes('games/user') ? '\n\n' : '\n';
            const parts = buffer.split(delimiter);
            // Keep the last part as it might be incomplete
            buffer = parts.pop() || "";
            // Process complete parts
            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed) {
                    try {
                        const obj = construct(trimmed);
                        stream.write(obj);
                    }
                    catch (e) {
                        console.warn("Failed to parse chunk:", trimmed, e);
                    }
                }
            }
        };
        const req = client.request(parsedUrl, {
            method: 'GET',
            headers: this.headers
        }, (res) => {
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                stream.error(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                buffer += chunk;
                processBuffer();
            });
            res.on('end', () => {
                // Process any remaining buffer
                if (buffer.trim()) {
                    try {
                        const obj = construct(buffer.trim());
                        stream.write(obj);
                    }
                    catch (e) {
                        console.warn("Failed to parse final chunk:", buffer, e);
                    }
                }
                stream.end();
            });
            res.on('error', (error) => {
                stream.error(new Error(`Response stream error: ${error.message}`));
            });
        });
        req.on('error', (error) => {
            stream.error(new Error(`Request error: ${error.message}`));
        });
        req.setTimeout(30000, () => {
            req.destroy();
            stream.error(new Error('Request timeout'));
        });
        req.end();
    }
    browserStreamFetch(url, construct, stream) {
        let buffer = "";
        const processBuffer = () => {
            const delimiter = url.includes('games/user') ? '\n\n' : '\n';
            const parts = buffer.split(delimiter);
            buffer = parts.pop() || "";
            for (const part of parts) {
                const trimmed = part.trim();
                if (trimmed) {
                    try {
                        const obj = construct(trimmed);
                        stream.write(obj);
                    }
                    catch (e) {
                        console.warn("Failed to parse chunk:", trimmed, e);
                    }
                }
            }
        };
        this.fetcher(url, {
            headers: this.headers,
            mode: "cors",
            method: "GET",
        }).then((res) => {
            var _a;
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            const reader = (_a = res.body) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader) {
                throw new Error("Response body is null");
            }
            const decoder = new TextDecoder();
            const read = () => {
                reader.read().then((result) => {
                    if (result.done) {
                        if (buffer.trim()) {
                            try {
                                const obj = construct(buffer.trim());
                                stream.write(obj);
                            }
                            catch (e) {
                                console.warn("Failed to parse final chunk:", buffer, e);
                            }
                        }
                        stream.end();
                        return;
                    }
                    const decoded = decoder.decode(result.value, { stream: true });
                    buffer += decoded;
                    processBuffer();
                    read();
                }).catch(e => {
                    stream.error(new Error(`Stream read error: ${e}`));
                });
            };
            read();
        }).catch(e => {
            stream.error(new Error(`Fetch failed: ${e}`));
        });
    }
}
//# sourceMappingURL=fetch.js.map