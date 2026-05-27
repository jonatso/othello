import { io, Socket } from "socket.io-client";
import { useState, useEffect, useMemo, useRef } from "react";
import { createGameState, type Board, type GameState } from "@othello/shared";
import BoardComponent from "./components/Board";
import TopInfo from "./components/TopInfo";
import BottomInfo from "./components/BottomInfo";
import ConnectionModal from "./components/ConnectionModal";

const ENDPOINT = "http://localhost:3001";
const socket: Socket = import.meta.env.DEV ? io(ENDPOINT) : io();

const EMPTY_BOARD: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => ""));
const GAME_CODE_PATTERN = /^[a-z0-9]{5}$/;

const getGameCodeFromPath = () => {
  const gameCode = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase() ?? "";
  return GAME_CODE_PATTERN.test(gameCode) ? gameCode : "";
};

const getGameUrl = (gameCode: string) => `${window.location.origin}/${gameCode}`;

const setGamePath = (gameCode: string) => {
  const path = gameCode ? `/${gameCode}` : "/";
  if (window.location.pathname !== path) {
    window.history.pushState(null, "", path);
  }
};

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard) throw new Error("Clipboard API is unavailable");
  await navigator.clipboard.writeText(text);
};

const countPieces = (board: Board, piece: "w" | "b") =>
  board.flatMap((row) => row).filter((p) => p === piece).length;

const getWinnerText = (state: GameState) => {
  const numWhitePieces = countPieces(state.board, "w");
  const numBlackPieces = countPieces(state.board, "b");

  if (numWhitePieces === numBlackPieces) return "It's a tie!";
  return numWhitePieces > numBlackPieces ? "White wins!" : "Black wins!";
};

const App = () => {
  const initialGameCodeFromPath = useRef(getGameCodeFromPath());
  const [isPlayer1, setIsPlayer1] = useState<boolean | null>(null);
  const [gameState, setGameState] = useState<GameState>(() => createGameState());
  const [gameHasStarted, setGameHasStarted] = useState(false);
  const [gameIsEnded, setGameIsEnded] = useState(false);
  const [connectText, setConnectText] = useState("...");
  const [joinRoomError, setJoinRoomError] = useState("");
  const [modalIsOpen, setIsOpen] = useState(true);
  const [gameCode, setGameCode] = useState(initialGameCodeFromPath.current);

  const isMyTurn = useMemo(
    () => gameState.isWhitesTurn === isPlayer1,
    [gameState.isWhitesTurn, isPlayer1],
  );

  const numWhitePieces = countPieces(gameState.board, "w");
  const numBlackPieces = countPieces(gameState.board, "b");
  const gameUrl = gameCode ? getGameUrl(gameCode) : "";

  useEffect(() => {
    socket.on("gameCode", (roomName: string) => {
      setGameCode(roomName);
      setGamePath(roomName);
      setConnectText(`Hosting on ${roomName}`);
    });
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
      setGameCode("");
      setGamePath("");
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

    if (initialGameCodeFromPath.current) {
      setGamePath(initialGameCodeFromPath.current);
      setConnectText(`Joining ${initialGameCodeFromPath.current}...`);
      socket.emit("joinGame", initialGameCodeFromPath.current);
    }

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
            gameUrl={gameUrl}
            clickCopyLink={() => {
              void copyToClipboard(gameUrl)
                .then(() => setConnectText("Link copied"))
                .catch(() => setConnectText(gameUrl));
            }}
            clickLeave={() => {
              socket.emit("leaveGame");
              setGameCode("");
              setGamePath("");
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
          initialRoomName={gameCode}
          clickJoin={(roomName) => {
            socket.emit("joinGame", roomName);
            setGameCode(roomName);
            setGamePath(roomName);
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
