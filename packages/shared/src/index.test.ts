import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyMove,
  createGameState,
  getFlipsForMove,
  getFlipDirections,
  getNewPossibleMovesBoard,
  getValidMoves,
  needToSwitchTurns,
  placePiece,
  type Board,
} from "./index.ts";

const emptyBoard = (): Board =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));

const gameStateFromBoard = (board: Board, isWhitesTurn = true) => ({
  board,
  possibleMovesBoard: emptyBoard(),
  isWhitesTurn,
});

describe("game rules", () => {
  it("creates the initial Othello board state", () => {
    const gameState = createGameState();

    assert.equal(gameState.isWhitesTurn, true);
    assert.equal(gameState.board[3][3], "b");
    assert.equal(gameState.board[3][4], "w");
    assert.equal(gameState.board[4][3], "w");
    assert.equal(gameState.board[4][4], "b");
    assert.deepEqual(gameState.possibleMovesBoard, [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "w", "", "", "", ""],
      ["", "", "w", "", "", "", "", ""],
      ["", "", "", "", "", "w", "", ""],
      ["", "", "", "", "w", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ]);
  });

  it("finds flip directions for an opening move", () => {
    const gameState = createGameState();

    assert.deepEqual(getFlipDirections(2, 3, gameState), [[1, 0]]);
  });

  it("places a piece, flips captured pieces, and advances the turn", () => {
    const gameState = createGameState();

    assert.equal(placePiece(2, 3, gameState), true);
    assert.equal(gameState.board[2][3], "w");
    assert.equal(gameState.board[3][3], "w");
    assert.equal(gameState.isWhitesTurn, false);
    assert.deepEqual(gameState.possibleMovesBoard, getNewPossibleMovesBoard(gameState));
  });

  it("rejects a move that has no flips", () => {
    const gameState = createGameState();

    assert.equal(placePiece(0, 0, gameState), false);
    assert.deepEqual(gameState, createGameState());
  });

  it("detects when the current player has no possible moves", () => {
    const gameState = createGameState();

    assert.equal(needToSwitchTurns(gameState), false);

    assert.equal(needToSwitchTurns(gameStateFromBoard(emptyBoard())), true);
  });

  it("gets valid opening moves from the board and current player", () => {
    assert.deepEqual(getValidMoves(createGameState().board, "w"), [
      { row: 2, col: 3 },
      { row: 3, col: 2 },
      { row: 4, col: 5 },
      { row: 5, col: 4 },
    ]);
  });

  it("applies a move without mutating the previous game state", () => {
    const gameState = createGameState();
    const originalBoard = structuredClone(gameState.board);
    const result = applyMove(gameState, { row: 2, col: 3 });

    assert.equal(result.ok, true);
    assert.deepEqual(gameState.board, originalBoard);

    if (!result.ok) return;

    assert.equal(result.gameState.board[2][3], "w");
    assert.equal(result.gameState.board[3][3], "w");
    assert.equal(result.gameState.isWhitesTurn, false);
  });

  it("does not mark a horizontal move as legal through an empty gap", () => {
    const board = emptyBoard();
    board[3][3] = "b";
    board[3][5] = "w";
    const gameState = gameStateFromBoard(board);

    assert.deepEqual(getFlipsForMove(board, "w", { row: 3, col: 2 }), []);
    assert.deepEqual(getFlipDirections(3, 2, gameState), []);
    assert.equal(getNewPossibleMovesBoard(gameState)[3][2], "");
  });

  it("does not place a piece through an empty horizontal gap", () => {
    const board = emptyBoard();
    board[3][3] = "b";
    board[3][5] = "w";
    const gameState = gameStateFromBoard(board);

    assert.equal(placePiece(3, 2, gameState), false);
    assert.deepEqual(gameState.board, board);
  });

  it("does not mark a diagonal move as legal through an empty gap", () => {
    const board = emptyBoard();
    board[3][3] = "b";
    board[5][5] = "w";
    const gameState = gameStateFromBoard(board);

    assert.deepEqual(getFlipDirections(2, 2, gameState), []);
    assert.equal(getNewPossibleMovesBoard(gameState)[2][2], "");
  });
});
