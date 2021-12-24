import React from "react";

export default function BottomInfo(props) {
  return (
    <div className="game-info">
      <p>{`⚪: ${props.numWhitePieces} ⚫: ${props.numBlackPieces}`}</p>
      {props.gameIsOngoing && (
        <p>{`It's ${props.isMyTurn ? "your" : "their"} turn`}</p>
      )}
    </div>
  );
}
