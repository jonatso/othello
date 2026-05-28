export type Color = "w" | "b";
export type Piece = Color | null;
export type Board = Piece[][];

export interface GameState {
  board: Board;
  possibleMovesBoard: Board;
  isBlacksTurn: boolean;
}

export interface GameSnapshot {
  gameState: GameState;
  gameHasStarted: boolean;
  gameIsEnded: boolean;
  isBlack: boolean | null;
  status: string;
  gameLink: string | null;
}

export interface PeerEvent {
  snapshot: GameSnapshot;
}

export interface NearbyGame {
  id: string;
  name: string;
  gameLink: string;
}
