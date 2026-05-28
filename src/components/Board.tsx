import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Board as BoardState } from "../types";
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
        const previousPiece = previousBoard[row]?.[col] ?? null;
        const currentPiece = board[row][col];

        if (previousPiece === null && currentPiece !== null) {
          nextAnimations[`${row}-${col}`] = "placed";
        } else if (previousPiece !== null && previousPiece !== currentPiece) {
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
      const isPossibleMove = possiblePiece !== null;

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
    <div className="aspect-square w-[min(68vh,94vw)] rounded-lg border border-white/15 bg-[linear-gradient(145deg,#2f3b37,#151a1a)] p-[7px] shadow-[0_30px_80px_rgba(0,0,0,0.44),inset_0_1px_0_rgba(255,255,255,0.12)] sm:w-[min(70vh,92vw,640px)] sm:p-2.5">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-[5px] border border-[#08120ed1] bg-[#3c795d]">
        {tiles}
      </div>
    </div>
  );
};

export default Board;
