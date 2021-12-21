import React from "react";

const customStyles = {
  content: {},
};

export default function ConnctionModal(props) {
  const [roomNameInputText, setRoomNameInputText] = React.useState("");
  function handleRoomNameInput(event) {
    setRoomNameInputText(event.target.value);
  }

  return (
    <div className="modal">
      <h2>Welcome to Othello!</h2>
      <button onClick={props.clickHost}>Host game</button>
      <input
        type="text"
        value={roomNameInputText}
        placeholder="enter room code"
        onChange={handleRoomNameInput}
      />
      <button
        disabled={roomNameInputText.length < 4}
        onClick={() => {
          props.clickJoin(roomNameInputText);
          setRoomNameInputText("");
        }}
      >
        Join game
      </button>
      <p>{props.joinRoomError}</p>
    </div>
  );
}
