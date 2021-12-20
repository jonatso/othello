import Board from "./components/Board";
import Connect from "./components/Connect";
import React from "react";
import _ from "lodash";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";

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

const socket = socketIOClient(ENDPOINT);

function App() {
  const [isWhitesTurn, setisWhitesTurn] = React.useState(true);
  const [isPlayer1, setIsPlayer1] = React.useState(true);
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
  const [connectText, setConnectText] = React.useState("...");

  function placePiece(x, y) {
    console.log(
      `${isWhitesTurn ? "white" : "black"} is trying to place a piece`
    );
  }

  function clickJoin(roomName) {
    console.log("clickJoin", roomName);
    socket.emit("joinGame", roomName);
  }

  function clickHost() {
    console.log("clickHost");
    socket.emit("createGame");
  }

  React.useEffect(() => {
    socket.on("gameCode", (roomName) => {
      setConnectText(`Hosting on ${roomName}`);
    });

    socket.on("startGame", (isPlayer1) => {
      setIsPlayer1(isPlayer1);
      console.log("game started");
    });
  }, []);

  return (
    <div className="app">
      <Board
        board={board}
        posibleMovesBoard={posibleMovesBoard}
        handleClick={placePiece}
      />
      <Connect
        clickJoin={clickJoin}
        clickHost={clickHost}
        connectText={connectText}
      />
    </div>
  );
}

export default App;
