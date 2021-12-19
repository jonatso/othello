export default function Tile(props) {
    return (
        <div className={`tile tile--${props.isOdd ? "odd" : "even"}`}>
            {(props.hasPiece || props.hasTransparentPiece) && <div className={`piece piece--${props.pieceColor} ${props.hasTransparentPiece ? "piece--transparent" : ""}`}></div>}
        </div>
    )
}