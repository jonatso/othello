export type Color = "w" | "b";
export type Piece = Color | "";
export type Board = Piece[][];

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  possibleMovesBoard: Board;
  isWhitesTurn: boolean;
}

export type MoveResult =
  | {
      ok: true;
      gameState: GameState;
      gameEnded: boolean;
    }
  | {
      ok: false;
      reason: "invalid-move";
    };

const BOARD_SIZE = 8;

const directions: ReadonlyArray<Position> = [
  { row: 0, col: 1 },
  { row: 0, col: -1 },
  { row: 1, col: 0 },
  { row: -1, col: 0 },
  { row: 1, col: 1 },
  { row: 1, col: -1 },
  { row: -1, col: 1 },
  { row: -1, col: -1 },
];

export function createGameState(): GameState {
  const board: Board = [
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "b", "w", "", "", ""],
    ["", "", "", "w", "b", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ];

  return createGameStateFromBoard(board, "w");
}

export function createGameStateFromBoard(board: Board, currentPlayer: Color): GameState {
  return {
    board,
    possibleMovesBoard: createPossibleMovesBoard(board, currentPlayer),
    isWhitesTurn: currentPlayer === "w",
  };
}

export function applyMove(gameState: GameState, position: Position): MoveResult {
  const currentPlayer = getCurrentPlayer(gameState);
  const flips = getFlipsForMove(gameState.board, currentPlayer, position);

  if (flips.length === 0) {
    return { ok: false, reason: "invalid-move" };
  }

  const board = cloneBoard(gameState.board);
  board[position.row][position.col] = currentPlayer;

  for (const flip of flips) {
    board[flip.row][flip.col] = currentPlayer;
  }

  const nextPlayer = getNextPlayer(board, currentPlayer);

  return {
    ok: true,
    gameState: createGameStateFromBoard(board, nextPlayer),
    gameEnded:
      !hasAnyValidMoves(board, currentPlayer) &&
      !hasAnyValidMoves(board, opponentOf(currentPlayer)),
  };
}

export function getFlipsForMove(board: Board, player: Color, position: Position): Position[] {
  if (!isOnBoard(position) || getCell(board, position) !== "") return [];

  const opponent = opponentOf(player);
  const flips: Position[] = [];

  for (const direction of directions) {
    const lineFlips: Position[] = [];
    let cursor = step(position, direction);

    while (isOnBoard(cursor)) {
      const piece = getCell(board, cursor);

      if (piece === opponent) {
        lineFlips.push(cursor);
      } else if (piece === player) {
        if (lineFlips.length > 0) flips.push(...lineFlips);
        break;
      } else {
        break;
      }

      cursor = step(cursor, direction);
    }
  }

  return flips;
}

export function getValidMoves(board: Board, player: Color): Position[] {
  const moves: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const position = { row, col };
      if (getFlipsForMove(board, player, position).length > 0) {
        moves.push(position);
      }
    }
  }

  return moves;
}

export function hasAnyValidMoves(board: Board, player: Color): boolean {
  return getValidMoves(board, player).length > 0;
}

export function createPossibleMovesBoard(board: Board, player: Color): Board {
  const possibleMovesBoard = createEmptyBoard();

  for (const move of getValidMoves(board, player)) {
    possibleMovesBoard[move.row][move.col] = player;
  }

  return possibleMovesBoard;
}

export function getCurrentPlayer(gameState: GameState): Color {
  return gameState.isWhitesTurn ? "w" : "b";
}

export function getWinner(board: Board): Color | "tie" {
  const whitePieces = countPieces(board, "w");
  const blackPieces = countPieces(board, "b");

  if (whitePieces === blackPieces) return "tie";
  return whitePieces > blackPieces ? "w" : "b";
}

export function getNewPossibleMovesBoard(gameState: GameState): Board {
  return createPossibleMovesBoard(gameState.board, getCurrentPlayer(gameState));
}

export function needToSwitchTurns(gameState: GameState): boolean {
  return !hasAnyValidMoves(gameState.board, getCurrentPlayer(gameState));
}

export function placePiece(row: number, col: number, gameState: GameState): boolean {
  const result = applyMove(gameState, { row, col });
  if (!result.ok) return false;

  gameState.board = result.gameState.board;
  gameState.isWhitesTurn = result.gameState.isWhitesTurn;
  gameState.possibleMovesBoard = result.gameState.possibleMovesBoard;
  return true;
}

export function getFlipDirections(
  row: number,
  col: number,
  gameState: GameState,
): [number, number][] {
  const player = getCurrentPlayer(gameState);

  return directions
    .filter(
      (direction) =>
        getFlipsForMoveInDirection(gameState.board, player, { row, col }, direction).length > 0,
    )
    .map((direction) => [direction.row, direction.col]);
}

function getFlipsForMoveInDirection(
  board: Board,
  player: Color,
  position: Position,
  direction: Position,
): Position[] {
  if (!isOnBoard(position) || getCell(board, position) !== "") return [];

  const opponent = opponentOf(player);
  const flips: Position[] = [];
  let cursor = step(position, direction);

  while (isOnBoard(cursor)) {
    const piece = getCell(board, cursor);

    if (piece === opponent) {
      flips.push(cursor);
    } else if (piece === player) {
      return flips;
    } else {
      return [];
    }

    cursor = step(cursor, direction);
  }

  return [];
}

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => ""));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function getNextPlayer(board: Board, currentPlayer: Color): Color {
  const opponent = opponentOf(currentPlayer);
  return hasAnyValidMoves(board, opponent) ? opponent : currentPlayer;
}

function opponentOf(player: Color): Color {
  return player === "w" ? "b" : "w";
}

function countPieces(board: Board, piece: Color): number {
  return board.flatMap((row) => row).filter((p) => p === piece).length;
}

function isOnBoard(position: Position): boolean {
  return (
    position.row >= 0 && position.row < BOARD_SIZE && position.col >= 0 && position.col < BOARD_SIZE
  );
}

function getCell(board: Board, position: Position): Piece {
  return board[position.row][position.col];
}

function step(position: Position, direction: Position): Position {
  return {
    row: position.row + direction.row,
    col: position.col + direction.col,
  };
}
