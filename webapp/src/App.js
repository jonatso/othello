import Board from "./components/Board";
import Connect from "./components/Connect";
import React from "react";
import _ from "lodash";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:3001";

const socket = socketIOClient(ENDPOINT);

export default function App() {
  const [isPlayer1, setIsPlayer1] = React.useState(true);
  const [gameState, setGameState] = React.useState({
    board: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
    possibleMovesBoard: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
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

  return (
    <div className="app">
      <Board
        board={gameState.board}
        posibleMovesBoard={gameState.possibleMovesBoard}
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
