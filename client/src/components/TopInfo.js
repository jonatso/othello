import React from "react";

export default function TopInfo(props) {
  return (
    <div className="connect">
      <p>{props.connectText}</p>
      <button onClick={props.clickLeave}>Leave Game</button>
    </div>
  );
}
