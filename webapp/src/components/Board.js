import Tile from "./Tile"

export default function Board(props) {
    
    const tiles = []

    for (let i = 0; i < props.board.length; i++) {
        for (let j = 0; j < props.board[0].length; j++) {
            tiles.push(
                <Tile
                    coord={{x: i, y: j}}
                    hasPiece={props.board[i][j].hasPiece}
                    hasTransparentPiece={props.posibleMovesBoard[i][j].hasPiece}
                    pieceColor={props.board[i][j].hasPiece ? props.board[i][j].pieceColor : props.posibleMovesBoard[i][j].pieceColor}
                    isOdd={(i + j) % 2 === 0}
                    handleClick={() => props.handleClick(i, j)}
                />
            )
        }
    }
    
    return (
        <div className="board">
            {tiles}
        </div>
    )
}