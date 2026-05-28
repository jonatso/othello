import clsx from "clsx";
import type { Piece } from "../types";

interface TileProps {
  animation: "idle" | "placed" | "flipped";
  pieceColor: Piece;
  possibleMoveColor: Piece;
  isOdd: boolean;
  isPossibleMove: boolean;
  onClick: () => void;
}

const Tile = ({
  animation,
  pieceColor,
  possibleMoveColor,
  isOdd,
  isPossibleMove,
  onClick,
}: TileProps) => {
  const hasPiece = pieceColor !== null;
  const pieceAnimation =
    animation === "placed"
      ? "animate-[place-piece_300ms_cubic-bezier(0.2,0.8,0.2,1)]"
      : animation === "flipped"
        ? "animate-[flip-piece_440ms_cubic-bezier(0.2,0.72,0.15,1)]"
        : "";

  return (
    <button
      type="button"
      className={clsx(
        "group relative grid h-full w-full place-items-center border-r border-b border-[#0c231940] p-0 disabled:cursor-default",
        isOdd ? "bg-[#377258]" : "bg-[#30684f]",
        isPossibleMove && "cursor-pointer",
      )}
      disabled={!isPossibleMove}
      onClick={onClick}
      aria-label={isPossibleMove ? "Play move" : "Board square"}
    >
      {hasPiece && (
        <span
          className={clsx(
            "relative z-[2] block aspect-square w-[72%] rounded-full shadow-[0_5px_12px_rgba(0,0,0,0.26)] [transform-style:preserve-3d]",
            pieceColor === "w" ? "bg-[#f1f4ee]" : "bg-[#121417]",
            pieceAnimation,
          )}
        />
      )}
      {isPossibleMove && (
        <span
          className={clsx(
            "z-[1] block aspect-square w-[72%] scale-100 rounded-full opacity-[0.42] shadow-[inset_0_0_0_2px_currentColor] transition-[opacity,transform] duration-150 ease-out group-hover:scale-[1.18] group-hover:opacity-[0.86]",
            possibleMoveColor === "w"
              ? "bg-[rgba(245,249,242,0.08)] text-[rgba(245,249,242,0.72)]"
              : "bg-[rgba(14,17,20,0.08)] text-[rgba(14,17,20,0.5)]",
          )}
        />
      )}
    </button>
  );
};

export default Tile;
