import Modal from "react-modal";
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
    <Modal
      isOpen={props.isOpen}
      onAfterOpen={props.afterOpenModal}
      style={customStyles}
      className="modal"
      overlayClassName="modal-overlay"
    >
      <h2>Welcome to Othello!</h2>
      <button onClick={props.clickHost}>Host game</button>
      <input
        type="text"
        value={roomNameInputText}
        placeholder="room code"
        onChange={handleRoomNameInput}
      />
      <button
        disabled={roomNameInputText.length < 4}
        onClick={() => props.clickJoin(roomNameInputText)}
      >
        Join game
      </button>
    </Modal>
  );
}
