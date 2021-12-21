import Board from "./components/Board";
import Connect from "./components/Connect";
import React from "react";
import GameInfo from "./components/GameInfo";
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
  const [gameHasStarted, setGameHasStarted] = React.useState(false);
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
      setGameHasStarted(true);
      setConnectText("Game started!");
    });

    socket.on("opponentLeft", () => {
      setConnectText("Opponent left, please make new room");
      setGameState({
        board: emptyBoard,
        possibleMovesBoard: emptyBoard,
        isWhitesTurn: true,
      });
      setIsPlayer1(null);
      setGameHasStarted(false);
    });

    socket.on("moveError", (message) => {
      console.log(message);
    });
  }, []);

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
        gameHasStarted={gameHasStarted}
        connectText={connectText}
      />
      <GameInfo
        board={gameState.board}
        isMyTurn={isMyTurn()}
        gameHasStarted={gameHasStarted}
      />
    </div>
  );
}
