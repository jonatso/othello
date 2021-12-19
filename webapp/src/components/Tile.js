export default function Tile(props) {
    return (
        <div onClick={props.handleClick} className={`tile tile--${props.isOdd ? "odd" : "even"}`}>
            {(props.hasPiece) && <div className={`piece piece--${props.pieceColor}`}></div>}
        </div>
    )
}