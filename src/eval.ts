interface Params {
    fen: string;
    multipv?: number;
    depth?: number;
}
export async function evaluatePosition(params: Params) {
    throw "meow"
    try {
        // const { chessAnalysisApi } = await import("chess-analysis-api")

        // return chessAnalysisApi.getAnalysis(params)
    } catch (e) {
        console.error("caught", e)
        throw e
    }
}

