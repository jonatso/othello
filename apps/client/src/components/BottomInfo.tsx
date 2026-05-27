interface BottomInfoProps {
  isMyTurn: boolean;
  gameIsOngoing: boolean;
  numWhitePieces: number;
  numBlackPieces: number;
}

const BottomInfo = ({
  isMyTurn,
  gameIsOngoing,
  numWhitePieces,
  numBlackPieces,
}: BottomInfoProps) => (
  <div className="game-info">
    <p>{`⚪: ${numWhitePieces} ⚫: ${numBlackPieces}`}</p>
    {gameIsOngoing && <p>{`It's ${isMyTurn ? "your" : "their"} turn`}</p>}
  </div>
);

export default BottomInfo;
