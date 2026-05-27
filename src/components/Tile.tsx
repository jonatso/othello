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

  return (
    <button
      type="button"
      className={`tile tile--${isOdd ? "odd" : "even"} ${isPossibleMove ? "tile--playable" : ""}`}
      disabled={!isPossibleMove}
      onClick={onClick}
      aria-label={isPossibleMove ? "Play move" : "Board square"}
    >
      {hasPiece && <span className={`piece piece--${pieceColor} piece--${animation}`} />}
      {isPossibleMove && <span className={`move-hint move-hint--${possibleMoveColor}`} />}
    </button>
  );
};

export default Tile;
