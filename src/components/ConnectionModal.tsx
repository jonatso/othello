import { useState } from "react";
import { LogIn, Plus } from "lucide-react";

interface ConnectionModalProps {
  initialGameLink?: string;
  clickJoin: (gameLink: string) => void;
  clickHost: () => void;
  joinRoomError: string;
  pendingAction: "host" | "join" | null;
}

const ConnectionModal = ({
  initialGameLink = "",
  clickJoin,
  clickHost,
  joinRoomError,
  pendingAction,
}: ConnectionModalProps) => {
  const [gameLinkInputText, setGameLinkInputText] = useState(initialGameLink);
  const gameLink = gameLinkInputText.trim();

  return (
    <form
      className="modal"
      onSubmit={(event) => {
        event.preventDefault();
        if (pendingAction || !gameLink.startsWith("othello://")) return;
        clickJoin(gameLink);
        setGameLinkInputText("");
      }}
    >
      <div>
        <p className="modal-kicker">Online Reversi</p>
        <h1>Othello</h1>
      </div>
      <button
        className="primary-action"
        type="button"
        disabled={pendingAction !== null}
        onClick={clickHost}
      >
        <Plus size={18} strokeWidth={2.3} />
        <span>{pendingAction === "host" ? "Creating game..." : "Host game"}</span>
      </button>
      <div className="join-row">
        <input
          type="text"
          value={gameLinkInputText}
          placeholder="othello://join/..."
          autoComplete="off"
          onChange={(e) => setGameLinkInputText(e.target.value)}
        />
        <button
          className="secondary-action"
          type="submit"
          disabled={pendingAction !== null || !gameLink.startsWith("othello://")}
        >
          <LogIn size={18} strokeWidth={2.3} />
          <span>{pendingAction === "join" ? "Joining..." : "Join"}</span>
        </button>
      </div>
      <p className="form-error" aria-live="polite">
        {joinRoomError}
      </p>
    </form>
  );
};

export default ConnectionModal;
