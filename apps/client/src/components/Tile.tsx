interface TileProps {
  hasPiece: boolean;
  hasTransparentPiece: boolean;
  pieceColor: string;
  isOdd: boolean;
  onClick: () => void;
}

const Tile = ({ hasPiece, hasTransparentPiece, pieceColor, isOdd, onClick }: TileProps) => {
  const colorClass = pieceColor === "w" ? "w" : pieceColor === "b" ? "b" : "";
  return (
    <div className={`tile tile--${isOdd ? "odd" : "even"}`}>
      {hasPiece && <div className={`piece piece--${colorClass}`} />}
      {hasTransparentPiece && (
        <div onClick={onClick} className={`piece piece--${colorClass} piece--t`} />
      )}
    </div>
  );
};

export default Tile;
