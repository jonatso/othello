import Tile from "./Tile"

export default function Board(props) {
    
    const tiles = []

    for (let i = 0; i < props.board.length; i++) {
        for (let j = 0; j < props.board[0].length; j++) {
            tiles.push(
                <Tile
                    hasPiece={props.board[i][j] !== ''}
                    hasTransparentPiece={props.posibleMovesBoard[i][j] !== ''}
                    pieceColor={props.board[i][j] !== '' ? props.board[i][j] : props.posibleMovesBoard[i][j]}
                    isOdd={(i + j) % 2 === 0}
                    handleClick={() => props.handleClick(i, j)}
                    key={`${i}-${j}`}
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