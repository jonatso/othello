export default function Connect(props) {
  return (
    <div className="connect">
      <button>Host Game</button>
      <br></br>
      <input type="text" />
      <button>Join Game</button>
      <p>{props.connectText}</p>
    </div>
  );
}
