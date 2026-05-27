import { useState } from "react";
import { LogIn, Plus } from "lucide-react";

interface ConnectionModalProps {
  initialRoomName?: string;
  clickJoin: (roomName: string) => void;
  clickHost: () => void;
  joinRoomError: string;
}

const ConnectionModal = ({
  initialRoomName = "",
  clickJoin,
  clickHost,
  joinRoomError,
}: ConnectionModalProps) => {
  const [roomNameInputText, setRoomNameInputText] = useState(initialRoomName);
  const roomCode = roomNameInputText.trim().toLowerCase();

  return (
    <form
      className="modal"
      onSubmit={(event) => {
        event.preventDefault();
        if (roomCode.length < 5) return;
        clickJoin(roomCode);
        setRoomNameInputText("");
      }}
    >
      <div>
        <p className="modal-kicker">Online Reversi</p>
        <h1>Othello</h1>
      </div>
      <button className="primary-action" type="button" onClick={clickHost}>
        <Plus size={18} strokeWidth={2.3} />
        <span>Host game</span>
      </button>
      <div className="join-row">
        <input
          type="text"
          value={roomNameInputText}
          placeholder="room code"
          maxLength={5}
          autoComplete="off"
          onChange={(e) => setRoomNameInputText(e.target.value)}
        />
        <button className="secondary-action" type="submit" disabled={roomCode.length < 5}>
          <LogIn size={18} strokeWidth={2.3} />
          <span>Join</span>
        </button>
      </div>
      <p className="form-error" aria-live="polite">
        {joinRoomError}
      </p>
    </form>
  );
};

export default ConnectionModal;
