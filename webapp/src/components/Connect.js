import React from "react";

export default function Connect(props) {
  const [roomNameInputText, setRoomNameInputText] = React.useState("");
  function handleRoomNameInput(event) {
    setRoomNameInputText(event.target.value);
  }

  return (
    <div className="connect">
      {!props.gameHasStarted && (
        <div>
          <button onClick={props.clickHost}>Host Game</button>
          <br></br>
          <input
            type="text"
            value={roomNameInputText}
            onChange={handleRoomNameInput}
          />
          <button onClick={() => props.clickJoin(roomNameInputText)}>
            Join Game
          </button>
        </div>
      )}
      <p>{props.connectText}</p>
    </div>
  );
}
