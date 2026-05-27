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
  <div className="bottom-info">
    <div className="scoreboard" aria-label="Score">
      <div className="score score--white">
        <span className="score-dot" />
        <span>{numWhitePieces}</span>
      </div>
      <div className="score-divider" />
      <div className="score score--black">
        <span>{numBlackPieces}</span>
        <span className="score-dot" />
      </div>
    </div>
    {gameIsOngoing && (
      <p className={`turn-label ${isMyTurn ? "turn-label--active" : ""}`}>
        {isMyTurn ? "Your turn" : "Opponent's turn"}
      </p>
    )}
  </div>
);

export default BottomInfo;
