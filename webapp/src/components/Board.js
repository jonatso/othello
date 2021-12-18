import Tile from "./Tile"

export default function Board(props) {
    
    return (
        <div className="board">
            {props.board.map(coord => {
                return (
                    <Tile 
                        isOdd={((coord.x + coord.y) % 2) === 0} 
                        hasPiece={true}
                        pieceIsTransparent={coord.y % 2 === 0}
                        pieceColor={coord.x % 2 === 0 ? "white" : "black"}
                    />
                )
            })}
        </div>
    )
}