import Tile from "./Tile"

export default function Board() {
    let board = []
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            board.push({x: i, y: j})
        }
    }
    console.log(board)
    return (
        <div className="board">
            {board.map(coord => <Tile isOdd={((coord.x + coord.y) % 2) === 0}/>)}
        </div>
    )
}