export default function Tile(props) {
    return (
        <div className={`tile tile--${props.isOdd ? "odd" : "even"}`}>
            {props.hasPiece && <div className={`piece piece--${props.pieceColor} ${props.pieceIsTransparent ? "piece--transparent" : ""}`}></div>}
        </div>
    )
}