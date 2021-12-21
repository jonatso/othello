import Board from "./components/Board";
import Connect from "./components/Connect";
import React from "react";
import _ from "lodash";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";

const socket = socketIOClient(ENDPOINT);
const emptyBoard = [
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
];

export default function App() {
  const [isPlayer1, setIsPlayer1] = React.useState(null);
  const [gameState, setGameState] = React.useState({
    board: emptyBoard,
    possibleMovesBoard: emptyBoard,
    isWhitesTurn: true,
  });

  const [connectText, setConnectText] = React.useState("...");

  function placePiece(x, y) {
    if (!isMyTurn()) {
      console.log("not my turn :(");
      return;
    }
    if (gameState.possibleMovesBoard[x][y] === "") {
      console.log("not a possible move...");
      return;
    }
    socket.emit("makeMove", { x, y });
  }

  function isMyTurn() {
    return gameState.isWhitesTurn === isPlayer1;
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

    socket.on("gameStateUpdate", (gameState) => {
      setGameState(gameState);
    });

    socket.on("isPlayer1", (isPlayer1) => {
      setIsPlayer1(isPlayer1);
    });

    socket.on("startGame", (gameState) => {
      console.log(gameState);
      setGameState(gameState);
      console.log("game started");
    });
  }, []);

  React.useEffect(() => {
    if (isPlayer1 === null) {
      return;
    }
    setConnectText(`It's ${isMyTurn() ? "your" : "their"} turn`);
  }, [gameState]);

  return (
    <div className="app">
      <Board
        board={gameState.board}
        posibleMovesBoard={
          isMyTurn() ? gameState.possibleMovesBoard : emptyBoard
        }
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
