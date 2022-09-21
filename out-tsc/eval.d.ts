interface Params {
    fen: string;
    multipv?: number;
    depth?: number;
}
export declare function evaluatePosition(params: Params): Promise<void>;
export {};
