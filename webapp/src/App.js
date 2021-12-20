import Board from "./components/Board";
import React from "react";
import _ from "lodash";

const directions = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

function App() {
  const [isWhitesTurn, setisWhitesTurn] = React.useState(true);
  const [board, setBoard] = React.useState([
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ]);
  const [posibleMovesBoard, setPossibleMovesBoard] = React.useState([
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
  ]);

  function placePiece(x, y) {
    console.log(
      `${isWhitesTurn ? "white" : "black"} is trying to place a piece`
    );
  }

  return (
    <div className="app">
      <Board
        board={board}
        posibleMovesBoard={posibleMovesBoard}
        handleClick={placePiece}
      />
    </div>
  );
}

export default App;
