export default function Tile(props) {
    return (
        <div onClick={props.handleClick} className={`tile tile--${props.isOdd ? "odd" : "even"}`}>
            {(props.hasPiece || props.hasTransparentPiece) && <div className={`piece piece--${props.pieceColor} ${props.hasTransparentPiece ? "piece--transparent" : ""}`}></div>}
        </div>
    )
}