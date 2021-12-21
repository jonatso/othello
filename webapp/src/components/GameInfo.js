import React from "react";

export default function GameInfo(props) {
  const numWhite = props.board
    .map((row) => row.filter((p) => p === "w").length)
    .reduce((a, b) => a + b, 0);

  const numBlack = props.board
    .map((row) => row.filter((p) => p === "b").length)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="game-info">
      <p>{`⚪: ${numWhite} ⚫: ${numBlack}`}</p>
      {props.gameHasStarted && (
        <p>{`It's ${props.isMyTurn ? "your" : "their"} turn`}</p>
      )}
    </div>
  );
}
