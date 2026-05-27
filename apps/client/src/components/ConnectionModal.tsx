import { useState } from "react";

interface ConnectionModalProps {
  clickJoin: (roomName: string) => void;
  clickHost: () => void;
  joinRoomError: string;
}

const ConnectionModal = ({ clickJoin, clickHost, joinRoomError }: ConnectionModalProps) => {
  const [roomNameInputText, setRoomNameInputText] = useState("");

  return (
    <div className="modal">
      <h2>Welcome to Othello!</h2>
      <button onClick={clickHost}>Host game</button>
      <input
        type="text"
        value={roomNameInputText}
        placeholder="enter room code"
        onChange={(e) => setRoomNameInputText(e.target.value)}
      />
      <button
        disabled={roomNameInputText.length < 4}
        onClick={() => {
          clickJoin(roomNameInputText);
          setRoomNameInputText("");
        }}
      >
        Join game
      </button>
      <p>{joinRoomError}</p>
    </div>
  );
};

export default ConnectionModal;
