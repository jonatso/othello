import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createGameState,
  getFlipDirections,
  getNewPossibleMovesBoard,
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

    gameState.possibleMovesBoard = emptyBoard();

    assert.equal(needToSwitchTurns(gameState), true);
  });

  it("does not mark a horizontal move as legal through an empty gap", () => {
    const board = emptyBoard();
    board[3][3] = "b";
    board[3][5] = "w";
    const gameState = gameStateFromBoard(board);

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
