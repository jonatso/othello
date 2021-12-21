import React from "react";

export default function Connect(props) {
  const [roomNameInputText, setRoomNameInputText] = React.useState("");
  function handleRoomNameInput(event) {
    setRoomNameInputText(event.target.value);
  }

  return (
    <div className="connect">
      <p>{props.connectText}</p>
      <button onClick={props.clickLeave}>Leave Game</button>
    </div>
  );
}
