export type Piece = "" | "w" | "b";
export type Board = Piece[][];

export interface GameState {
  board: Board;
  possibleMovesBoard: Board;
  isWhitesTurn: boolean;
}
