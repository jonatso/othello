interface BottomInfoProps {
  isMyTurn: boolean;
  playerColor: "white" | "black" | null;
  gameIsOngoing: boolean;
  canRequestRematch: boolean;
  numWhitePieces: number;
  numBlackPieces: number;
  clickRematch: () => void;
}

const BottomInfo = ({
  isMyTurn,
  playerColor,
  gameIsOngoing,
  canRequestRematch,
  numWhitePieces,
  numBlackPieces,
  clickRematch,
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
    {playerColor && <p className="color-label">You are {playerColor}</p>}
    {canRequestRematch && (
      <button className="rematch-button" type="button" onClick={clickRematch}>
        Rematch
      </button>
    )}
  </div>
);

export default BottomInfo;
