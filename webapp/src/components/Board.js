import Tile from "./Tile"

export default function Board(props) {
    
    const tiles = []
    console.log("hello")

    for (let i = 0; i < props.board.length; i++) {
        for (let j = 0; j < props.board[0].length; j++) {
            console.log("test")
            tiles.push(
                <Tile 
                    hasPiece={props.board[i][j].hasPiece}
                    hasTransparentPiece={props.board[i][j].hasTransparentPiece}
                    pieceColor={props.board[i][j].pieceColor}
                    isOdd={(i + j) % 2 === 0}
                />
            )
        }
    }
    
    console.log(tiles)

    return (
        <div className="board">
            {tiles}
        </div>
    )
}