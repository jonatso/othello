import { listen } from "@tauri-apps/api/event";
import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { useCallback, useEffect, useMemo, useState } from "react";
import BoardComponent from "./components/Board";
import TopInfo from "./components/TopInfo";
import BottomInfo from "./components/BottomInfo";
import ConnectionModal from "./components/ConnectionModal";
import { invokeTauri, isTauriRuntime } from "./tauri";
import type { Board, GameSnapshot, PeerEvent } from "./types";

const EMPTY_BOARD: Board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));

const INITIAL_SNAPSHOT: GameSnapshot = {
  gameState: {
    board: EMPTY_BOARD,
    possibleMovesBoard: EMPTY_BOARD,
    isWhitesTurn: true,
  },
  gameHasStarted: false,
  gameIsEnded: false,
  isPlayer1: null,
  status: "Ready",
  gameLink: null,
};

const copyToClipboard = async (text: string) => {
  if (!navigator.clipboard) throw new Error("Clipboard API is unavailable");
  await navigator.clipboard.writeText(text);
};

const countPieces = (board: Board, piece: "w" | "b") =>
  board.flatMap((row) => row).filter((p) => p === piece).length;

const App = () => {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(INITIAL_SNAPSHOT);
  const [joinRoomError, setJoinRoomError] = useState("");
  const [connectionPending, setConnectionPending] = useState<"host" | "join" | null>(null);
  const [modalIsOpen, setIsOpen] = useState(true);

  const isPlayer1 = snapshot.isPlayer1;
  const isMyTurn = useMemo(
    () => isPlayer1 !== null && snapshot.gameState.isWhitesTurn === isPlayer1,
    [snapshot.gameState.isWhitesTurn, isPlayer1],
  );

  const numWhitePieces = countPieces(snapshot.gameState.board, "w");
  const numBlackPieces = countPieces(snapshot.gameState.board, "b");
  const canRequestRematch =
    !modalIsOpen && snapshot.gameIsEnded && snapshot.gameHasStarted && snapshot.isPlayer1 !== null;

  const applySnapshot = useCallback((nextSnapshot: GameSnapshot) => {
    setSnapshot(nextSnapshot);
    setIsOpen(nextSnapshot.isPlayer1 === null);
  }, []);

  const joinGame = useCallback(
    async (gameLink: string) => {
      try {
        setJoinRoomError("");
        setConnectionPending("join");
        const nextSnapshot = await invokeTauri<GameSnapshot>("join_game", { gameLink });
        applySnapshot(nextSnapshot);
      } catch (error) {
        setJoinRoomError(String(error));
      } finally {
        setConnectionPending(null);
      }
    },
    [applySnapshot],
  );

  useEffect(() => {
    let cancelled = false;
    let unlistenPeer: (() => void) | undefined;
    let unlistenDeepLink: (() => void) | undefined;

    const boot = async () => {
      try {
        if (!isTauriRuntime()) {
          throw new Error(
            "Open the app with `pnpm dev` or the built Othello.app. The plain browser preview cannot host or join P2P games.",
          );
        }

        unlistenPeer = await listen<PeerEvent>("peer-event", (event) => {
          applySnapshot(event.payload.snapshot);
        });

        unlistenDeepLink = await onOpenUrl((urls) => {
          const gameLink = urls.find((url) => url.startsWith("othello://"));
          if (gameLink) void joinGame(gameLink);
        });

        const current = await invokeTauri<GameSnapshot>("current_game");
        if (!cancelled) applySnapshot(current);

        const urls = await getCurrent();
        const gameLink = urls?.find((url) => url.startsWith("othello://"));
        if (!cancelled && gameLink) void joinGame(gameLink);
      } catch (error) {
        if (!cancelled) setJoinRoomError(String(error));
      }
    };

    void boot();

    return () => {
      cancelled = true;
      unlistenPeer?.();
      unlistenDeepLink?.();
    };
  }, [applySnapshot, joinGame]);

  return (
    <div className="app">
      <main className="game-layout">
        {!modalIsOpen && (
          <TopInfo
            connectText={snapshot.status}
            gameUrl={snapshot.gameLink ?? ""}
            clickCopyLink={() => {
              if (!snapshot.gameLink) return;
              void copyToClipboard(snapshot.gameLink)
                .then(() => setSnapshot((current) => ({ ...current, status: "Link copied" })))
                .catch(() =>
                  setSnapshot((current) => ({ ...current, status: snapshot.gameLink ?? "" })),
                );
            }}
            clickLeave={() => {
              void invokeTauri<GameSnapshot>("leave_game").then(applySnapshot);
            }}
          />
        )}
        <BoardComponent
          board={snapshot.gameState.board}
          possibleMovesBoard={
            !modalIsOpen && snapshot.gameHasStarted && isMyTurn
              ? snapshot.gameState.possibleMovesBoard
              : EMPTY_BOARD
          }
          handleClick={(row, col) => {
            if (!isMyTurn || modalIsOpen) return;
            if (snapshot.gameState.possibleMovesBoard[row][col] === null) return;
            void invokeTauri<GameSnapshot>("make_move", { row, col }).then(applySnapshot);
          }}
        />
        {!modalIsOpen && (
          <BottomInfo
            numWhitePieces={numWhitePieces}
            numBlackPieces={numBlackPieces}
            isMyTurn={isMyTurn}
            gameIsOngoing={snapshot.gameHasStarted && !snapshot.gameIsEnded}
            canRequestRematch={canRequestRematch}
            clickRematch={() => {
              void invokeTauri<GameSnapshot>("request_rematch").then(applySnapshot);
            }}
          />
        )}
      </main>
      {modalIsOpen && (
        <ConnectionModal
          clickJoin={joinGame}
          clickHost={() => {
            setConnectionPending("host");
            setJoinRoomError("");
            void invokeTauri<GameSnapshot>("create_game")
              .then((nextSnapshot) => {
                setJoinRoomError("");
                applySnapshot(nextSnapshot);
              })
              .catch((error) => setJoinRoomError(String(error)))
              .finally(() => setConnectionPending(null));
          }}
          joinRoomError={joinRoomError}
          pendingAction={connectionPending}
        />
      )}
    </div>
  );
};

export default App;
