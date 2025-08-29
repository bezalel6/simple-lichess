export type Column = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
export type Row = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export interface DynamicMove {
    col: Column;
    row: Row;
}
export type Termination = "Abandoned" | "Death" | "Emergency" | "Normal" | "Rules infraction" | "Time forfeit";
export type GameResult = "1-0" | "0-1" | "1/2-1/2";
