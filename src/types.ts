export type Color = "w" | "b";
export type Piece = Color | null;
export type Board = Piece[][];

export interface GameState {
  board: Board;
  possibleMovesBoard: Board;
  isWhitesTurn: boolean;
}

export interface GameSnapshot {
  gameState: GameState;
  gameHasStarted: boolean;
  gameIsEnded: boolean;
  isPlayer1: boolean | null;
  status: string;
  gameLink: string | null;
}

export interface PeerEvent {
  snapshot: GameSnapshot;
}
