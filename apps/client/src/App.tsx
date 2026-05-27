import { io, Socket } from "socket.io-client";
import { useState, useEffect, useMemo } from "react";
import { createGameState, type Board, type GameState } from "@othello/shared";
import BoardComponent from "./components/Board";
import TopInfo from "./components/TopInfo";
import BottomInfo from "./components/BottomInfo";
import ConnectionModal from "./components/ConnectionModal";

const ENDPOINT = "http://localhost:3001";
const socket: Socket = import.meta.env.DEV ? io(ENDPOINT) : io();

const EMPTY_BOARD: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));

const countPieces = (board: Board, piece: "w" | "b") =>
  board.flatMap((row) => row).filter((p) => p === piece).length;

const getWinnerText = (state: GameState) => {
  const numWhitePieces = countPieces(state.board, "w");
  const numBlackPieces = countPieces(state.board, "b");

  if (numWhitePieces === numBlackPieces) return "It's a tie!";
  return numWhitePieces > numBlackPieces ? "White wins!" : "Black wins!";
};

const App = () => {
  const [isPlayer1, setIsPlayer1] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => createGameState());
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [gameIsEnded, setGameIsEnded] = useState(false);
  const [connectText, setConnectText] = useState("...");
  const [joinRoomError, setJoinRoomError] = useState("");
  const [modalIsOpen, setIsOpen] = useState(true);

  const isMyTurn = useMemo(
    () => gameState.isWhitesTurn === isPlayer1,
    [gameState.isWhitesTurn, isPlayer1],
  );

  const numWhitePieces = countPieces(gameState.board, "w");
  const numBlackPieces = countPieces(gameState.board, "b");

  useEffect(() => {
    socket.on("gameCode", (roomName: string) => setConnectText(`Hosting on ${roomName}`));
    socket.on("gameStateUpdate", (state: GameState) => setGameState(state));
    socket.on("isPlayer1", (val: boolean) => {
      setIsPlayer1(val);
      setIsOpen(false);
    });
    socket.on("startGame", (state: GameState) => {
      setGameState(state);
      setGameHasStarted(true);
      setGameIsEnded(false);
      setConnectText("Game started!");
    });
    socket.on("opponentLeft", () => {
      setConnectText("Your opponent left the game");
      setGameState(createGameState());
      setIsPlayer1(null);
      setGameHasStarted(false);
      setGameIsEnded(false);
    });
    socket.on("moveError", console.log);
    socket.on("badCode", (msg: string) => {
      setJoinRoomError(msg);
      console.log(msg);
    });
    socket.on("gameEnded", (state: GameState) => {
      setGameState(state);
      setGameIsEnded(true);
      setConnectText(getWinnerText(state));
    });

    return () => {
      [
        "gameCode",
        "gameStateUpdate",
        "isPlayer1",
        "startGame",
        "opponentLeft",
        "moveError",
        "badCode",
        "gameEnded",
      ].forEach((ev) => socket.off(ev));
    };
  }, []);

  return (
    <div className="app">
      <main className="game-layout">
        {!modalIsOpen && (
          <TopInfo
            connectText={connectText}
            clickLeave={() => {
              socket.emit("leaveGame");
              setIsOpen(true);
            }}
          />
        )}
        <BoardComponent
          board={gameState.board}
          possibleMovesBoard={
            !modalIsOpen && gameHasStarted && isMyTurn ? gameState.possibleMovesBoard : EMPTY_BOARD
          }
          handleClick={(x, y) => {
            if (!isMyTurn || modalIsOpen) return;
            if (gameState.possibleMovesBoard[x][y] === "") return;
            socket.emit("makeMove", { x, y });
          }}
        />
        {!modalIsOpen && (
          <BottomInfo
            numWhitePieces={numWhitePieces}
            numBlackPieces={numBlackPieces}
            isMyTurn={isMyTurn}
            gameIsOngoing={gameHasStarted && !gameIsEnded}
          />
        )}
      </main>
      {modalIsOpen && (
        <ConnectionModal
          clickJoin={(roomName) => {
            socket.emit("joinGame", roomName);
            setJoinRoomError("");
          }}
          clickHost={() => {
            socket.emit("createGame");
            setGameState(createGameState());
            setIsOpen(false);
            setGameIsEnded(false);
            setJoinRoomError("");
          }}
          joinRoomError={joinRoomError}
        />
      )}
    </div>
  );
};

export default App;
