export type Piece = "" | "w" | "b";
export type Board = Piece[][];

export interface GameState {
  board: Board;
  possibleMovesBoard: Board;
  isWhitesTurn: boolean;
}

const directions: ReadonlyArray<[number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export function createGameState(): GameState {
  return {
    board: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "b", "w", "", "", ""],
      ["", "", "", "w", "b", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
    possibleMovesBoard: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "w", "", "", "", ""],
      ["", "", "w", "", "", "", "", ""],
      ["", "", "", "", "", "w", "", ""],
      ["", "", "", "", "w", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
    isWhitesTurn: true,
  };
}

export function needToSwitchTurns(gameState: GameState): boolean {
  return gameState.possibleMovesBoard.flatMap((row) => row.filter((p) => p !== "")).length === 0;
}

export function placePiece(x: number, y: number, gameState: GameState): boolean {
  const flipDirections = getFlipDirections(x, y, gameState);
  if (flipDirections.length === 0) return false;

  const newBoard: Board = structuredClone(gameState.board);
  newBoard[x][y] = gameState.isWhitesTurn ? "w" : "b";

  for (const [dx, dy] of flipDirections) {
    flipPieces(x, y, dx, dy, newBoard, gameState);
  }

  gameState.board = newBoard;
  gameState.isWhitesTurn = !gameState.isWhitesTurn;
  gameState.possibleMovesBoard = getNewPossibleMovesBoard(gameState);
  return true;
}

export function getNewPossibleMovesBoard(gameState: GameState): Board {
  const newPMBoard: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));

  for (let x = 0; x < newPMBoard.length; x++) {
    for (let y = 0; y < newPMBoard[0].length; y++) {
      if (getFlipDirections(x, y, gameState).length !== 0) {
        newPMBoard[x][y] = gameState.isWhitesTurn ? "w" : "b";
      }
    }
  }

  return newPMBoard;
}

export function getFlipDirections(x: number, y: number, gameState: GameState): [number, number][] {
  const flipDirections: [number, number][] = [];
  if (gameState.board[x][y] !== "") return flipDirections;
  if (x > 7 || y > 7 || x < 0 || y < 0) return flipDirections;

  for (const [dx, dy] of directions) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) continue;
    if (gameState.board[x + dx][y + dy] !== (gameState.isWhitesTurn ? "b" : "w")) continue;
    if (searchForMove(x + dx, y + dy, dx, dy, gameState)) {
      flipDirections.push([dx, dy]);
    }
  }
  return flipDirections;
}

function searchForMove(
  x: number,
  y: number,
  dx: number,
  dy: number,
  gameState: GameState,
): boolean {
  if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false;
  if (gameState.board[x + dx][y + dy] === (gameState.isWhitesTurn ? "w" : "b")) return true;
  if (gameState.board[x + dx][y + dy] === "") return false;
  return searchForMove(x + dx, y + dy, dx, dy, gameState);
}

function flipPieces(
  x: number,
  y: number,
  dx: number,
  dy: number,
  newBoard: Board,
  gameState: GameState,
) {
  const myPiece = gameState.isWhitesTurn ? "w" : "b";
  while (gameState.board[x + dx][y + dy] !== myPiece) {
    newBoard[x + dx][y + dy] = myPiece;
    x += dx;
    y += dy;
  }
}
