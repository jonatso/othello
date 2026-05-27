import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Board as BoardState } from "@othello/shared";
import Tile from "./Tile";

interface BoardProps {
  board: BoardState;
  possibleMovesBoard: BoardState;
  handleClick: (x: number, y: number) => void;
}

type Animation = "idle" | "placed" | "flipped";

const Board = ({ board, possibleMovesBoard, handleClick }: BoardProps) => {
  const previousBoardRef = useRef<BoardState>(board);
  const [animations, setAnimations] = useState<Record<string, Animation>>({});
  const tiles: ReactNode[] = [];

  useEffect(() => {
    const nextAnimations: Record<string, Animation> = {};
    const previousBoard = previousBoardRef.current;

    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const previousPiece = previousBoard[row]?.[col] ?? "";
        const currentPiece = board[row][col];

        if (previousPiece === "" && currentPiece !== "") {
          nextAnimations[`${row}-${col}`] = "placed";
        } else if (previousPiece !== "" && previousPiece !== currentPiece) {
          nextAnimations[`${row}-${col}`] = "flipped";
        }
      }
    }

    previousBoardRef.current = structuredClone(board);
    setAnimations(nextAnimations);

    const timeout = window.setTimeout(() => setAnimations({}), 520);
    return () => window.clearTimeout(timeout);
  }, [board]);

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      const boardPiece = board[i][j];
      const possiblePiece = possibleMovesBoard[i][j];
      const isPossibleMove = possiblePiece !== "";

      tiles.push(
        <Tile
          key={`${i}-${j}`}
          animation={animations[`${i}-${j}`] ?? "idle"}
          isOdd={(i + j) % 2 === 0}
          isPossibleMove={isPossibleMove}
          pieceColor={boardPiece}
          possibleMoveColor={possiblePiece}
          onClick={() => handleClick(i, j)}
        />,
      );
    }
  }

  return (
    <div className="board-shell">
      <div className="board">{tiles}</div>
    </div>
  );
};

export default Board;
