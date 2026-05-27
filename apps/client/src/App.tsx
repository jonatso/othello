import { io, Socket } from "socket.io-client";
import { useState, useEffect, useMemo } from "react";
import type { Board, GameState } from "@othello/shared";
import BoardComponent from "./components/Board";
import TopInfo from "./components/TopInfo";
import BottomInfo from "./components/BottomInfo";
import ConnectionModal from "./components/ConnectionModal";

const ENDPOINT = "http://localhost:3001";
const socket: Socket = import.meta.env.DEV ? io(ENDPOINT) : io();

const EMPTY_BOARD: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));

const INITIAL_STATE: GameState = {
  board: structuredClone(EMPTY_BOARD),
  possibleMovesBoard: structuredClone(EMPTY_BOARD),
  isWhitesTurn: true,
};

const App = () => {
  const [isPlayer1, setIsPlayer1] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [gameIsEnded, setGameIsEnded] = useState(false);
  const [connectText, setConnectText] = useState("...");
  const [joinRoomError, setJoinRoomError] = useState("");
  const [modalIsOpen, setIsOpen] = useState(true);

  const isMyTurn = useMemo(
    () => gameState.isWhitesTurn === isPlayer1,
    [gameState.isWhitesTurn, isPlayer1],
  );

  const count = (piece: "w" | "b") =>
    gameState.board.flatMap((row) => row).filter((p) => p === piece).length;

  const numWhitePieces = count("w");
  const numBlackPieces = count("b");

  const getWinnerText = () => {
    if (numWhitePieces === numBlackPieces) return "It's a tie!";
    return numWhitePieces > numBlackPieces ? "White wins!" : "Black wins!";
  };

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
      setConnectText("Game started!");
    });
    socket.on("opponentLeft", () => {
      setConnectText("Your opponent left the game");
      setGameState({ ...INITIAL_STATE });
      setIsPlayer1(null);
      setGameHasStarted(false);
    });
    socket.on("moveError", console.log);
    socket.on("badCode", (msg: string) => {
      setJoinRoomError(msg);
      console.log(msg);
    });
    socket.on("gameEnded", (state: GameState) => {
      setGameState(state);
      setGameIsEnded(true);
      setConnectText(getWinnerText());
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
      {modalIsOpen && (
        <ConnectionModal
          clickJoin={(roomName) => {
            socket.emit("joinGame", roomName);
            setJoinRoomError("");
          }}
          clickHost={() => {
            socket.emit("createGame");
            setIsOpen(false);
            setJoinRoomError("");
          }}
          joinRoomError={joinRoomError}
        />
      )}
      {!modalIsOpen && (
        <TopInfo
          connectText={connectText}
          gameHasStarted={gameHasStarted}
          clickLeave={() => {
            socket.emit("leaveGame");
            setIsOpen(true);
          }}
        />
      )}
      {!modalIsOpen && (
        <BoardComponent
          board={gameState.board}
          possibleMovesBoard={isMyTurn ? gameState.possibleMovesBoard : EMPTY_BOARD}
          handleClick={(x, y) => {
            if (!isMyTurn) return;
            if (gameState.possibleMovesBoard[x][y] === "") return;
            socket.emit("makeMove", { x, y });
          }}
        />
      )}
      {!modalIsOpen && (
        <BottomInfo
          numWhitePieces={numWhitePieces}
          numBlackPieces={numBlackPieces}
          isMyTurn={isMyTurn}
          gameIsOngoing={gameHasStarted && !gameIsEnded}
        />
      )}
    </div>
  );
};

export default App;
