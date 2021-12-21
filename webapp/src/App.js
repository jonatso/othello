import Board from "./components/Board";
import Connect from "./components/Connect";
import React from "react";
import GameInfo from "./components/GameInfo";
import ConnectionModal from "./components/ConnectionModal";
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
    closeModal();
  }

  function clickLeave() {
    console.log("clickLeave");
    socket.emit("leaveGame");
    setIsOpen(true);
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
      closeModal();
    });

    socket.on("startGame", (gameState) => {
      console.log(gameState);
      setGameState(gameState);
      setGameHasStarted(true);
      setConnectText("Game started!");
    });

    socket.on("opponentLeft", () => {
      setConnectText("Please make new room");
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

  const [modalIsOpen, setIsOpen] = React.useState(true);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  return (
    <div className="app">
      <ConnectionModal
        isOpen={modalIsOpen}
        close={closeModal}
        clickJoin={clickJoin}
        clickHost={clickHost}
      >
        <h2>Welcome to Othello!</h2>
      </ConnectionModal>
      {!modalIsOpen && (
        <Connect
          clickLeave={clickLeave}
          gameHasStarted={gameHasStarted}
          connectText={connectText}
        />
      )}
      {!modalIsOpen && (
        <Board
          board={gameState.board}
          posibleMovesBoard={
            isMyTurn() ? gameState.possibleMovesBoard : emptyBoard
          }
          handleClick={placePiece}
        />
      )}
      {!modalIsOpen && (
        <GameInfo
          board={gameState.board}
          isMyTurn={isMyTurn()}
          gameHasStarted={gameHasStarted}
        />
      )}
    </div>
  );
}
