export default function Tile(props) {
  return (
    <div className={`tile tile--${props.isOdd ? "odd" : "even"}`}>
      {props.hasPiece && (
        <div className={`piece piece--${props.pieceColor}`}></div>
      )}
      {props.hasTransparentPiece && (
        <div
          onClick={props.handleClick}
          className={`piece piece--${props.pieceColor} piece--t`}
        ></div>
      )}
    </div>
  );
}
