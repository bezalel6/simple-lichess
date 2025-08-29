import { PassThrough } from "stream";
import * as https from "https";
import * as http from "http";
import crossFetch from "cross-fetch";
import { FetchOptions, SimpleStream } from "./Fetcher";

export class Fetch<T> {
  params = new URLSearchParams();
  headers: Record<string, string> = {};
  
  constructor(
    { accessToken }: FetchOptions,
    acceptType = "application/x-chess-pgn"
  ) {
    this.headers["Accept"] = acceptType;
    if (accessToken) {
      this.headers["Authorization"] = "Bearer " + accessToken;
    }
  }
  private get fetcher() {
    return this.isNode
      ? crossFetch
      : (url: string, obj: any) => window.fetch(url, obj);
  }
  private get isNode(): boolean {
    return typeof window === "undefined";
  }

  startFetch = (
    endpoint: string,
    construct: (chunk: string) => T = (a) => {
      return JSON.parse(a) as unknown as T;
    }
  ): SimpleStream<T> => {
    const stream = new SimpleStream<T>();
    const fullUrl = endpoint + ("?" + this.params.toString());
    
    if (this.isNode) {
      // Use native Node.js streaming for true network streaming
      this.nodeStreamFetch(fullUrl, construct, stream);
    } else {
      // Use fetch API for browser
      this.browserStreamFetch(fullUrl, construct, stream);
    }
    
    return stream;
  };

  private nodeStreamFetch<T>(
    url: string,
    construct: (chunk: string) => T,
    stream: SimpleStream<T>
  ): void {
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
            const obj: T = construct(trimmed);
            stream.write(obj);
          } catch (e) {
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
      
      res.on('data', (chunk: string) => {
        buffer += chunk;
        processBuffer();
      });

      res.on('end', () => {
        // Process any remaining buffer
        if (buffer.trim()) {
          try {
            const obj: T = construct(buffer.trim());
            stream.write(obj);
          } catch (e) {
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

  private browserStreamFetch<T>(
    url: string,
    construct: (chunk: string) => T,
    stream: SimpleStream<T>
  ): void {
    let buffer = "";
    
    const processBuffer = () => {
      const delimiter = url.includes('games/user') ? '\n\n' : '\n';
      const parts = buffer.split(delimiter);
      buffer = parts.pop() || "";
      
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) {
          try {
            const obj: T = construct(trimmed);
            stream.write(obj);
          } catch (e) {
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
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Response body is null");
      }
      
      const decoder = new TextDecoder();
      
      const read = () => {
        reader.read().then((result) => {
          if (result.done) {
            if (buffer.trim()) {
              try {
                const obj: T = construct(buffer.trim());
                stream.write(obj);
              } catch (e) {
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
