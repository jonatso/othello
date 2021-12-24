import Board from "./components/Board";
import TopInfo from "./components/TopInfo";
import React from "react";
import BottomInfo from "./components/BottomInfo";
import ConnectionModal from "./components/ConnectionModal";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3001";
var socket;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  //for testing without express launch
  socket = socketIOClient(ENDPOINT);
  console.log("dev");
} else {
  //socket io finds port automatically if launched with express
  socket = socketIOClient();
  console.log("prod");
}

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
  const [gameIsEnded, setGameIsEnded] = React.useState(false);
  const [connectText, setConnectText] = React.useState("...");
  const [joinRoomError, setJoinRoomError] = React.useState("");

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
    setJoinRoomError("");
  }

  function clickHost() {
    console.log("clickHost");
    socket.emit("createGame");
    closeModal();
    setJoinRoomError("");
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
      setGameState(gameState);
      setGameHasStarted(true);
      setConnectText("Game started!");
    });

    socket.on("opponentLeft", () => {
      setConnectText("Your opponent left the game");
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

    socket.on("badCode", (msg) => {
      setJoinRoomError(msg);
      console.log(msg);
    });

    socket.on("gameEnded", (gameState) => {
      setGameState(gameState);
      setGameIsEnded(true);
      setConnectText(getWinnerText());
    });
  }, []);

  const [modalIsOpen, setIsOpen] = React.useState(true);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const numWhitePieces = gameState.board
    .map((row) => row.filter((p) => p === "w").length)
    .reduce((a, b) => a + b, 0);

  const numBlackPieces = gameState.board
    .map((row) => row.filter((p) => p === "b").length)
    .reduce((a, b) => a + b, 0);

  function getWinnerText() {
    if (numWhitePieces === numBlackPieces) {
      return "It's a tie!";
    }
    if (numWhitePieces > numBlackPieces) {
      return "White wins!";
    }
    return "Black wins!";
  }

  return (
    <div className="app">
      {modalIsOpen && (
        <ConnectionModal
          close={closeModal}
          clickJoin={clickJoin}
          clickHost={clickHost}
          joinRoomError={joinRoomError}
        >
          <h2>Welcome to Othello!</h2>
        </ConnectionModal>
      )}
      {!modalIsOpen && (
        <TopInfo
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
        <BottomInfo
          isMyTurn={isMyTurn()}
          gameIsOngoing={gameHasStarted && !gameIsEnded}
          numWhitePieces={numWhitePieces}
          numBlackPieces={numBlackPieces}
        />
      )}
    </div>
  );
}
