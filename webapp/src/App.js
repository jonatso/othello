import Board from './components/Board';
import React from "react"
import _ from "lodash"

let gameBoard = Array.from({length: 8}, _=>(Array.from({length: 8}, _=>({
  hasPiece: false, 
  pieceColor: "white"
}))))

gameBoard[3][3] = {
  hasPiece: true, 
  pieceColor: "white"
}

gameBoard[3][4] = {
  hasPiece: true, 
  pieceColor: "black"
}

gameBoard[4][4] = {
  hasPiece: true, 
  pieceColor: "white"
}

gameBoard[4][3] = {
  hasPiece: true, 
  pieceColor: "black"
}

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]

function App() {
  const [board, setBoard] = React.useState(gameBoard)
  const [isPlayer1Turn, setIsPlayer1Turn] = React.useState(true)

  function placePiece(x, y) {
    if (!canPlacePiece(x, y, isPlayer1Turn)) return
    setBoard(oldBoard => {
      const newBoard = _.cloneDeep(oldBoard)
      newBoard[x][y].hasPiece = true
      newBoard[x][y].pieceColor = isPlayer1Turn ? "white" : "black"
      return newBoard
    })
    setIsPlayer1Turn(!isPlayer1Turn)
  }

  function canPlacePiece(x, y, isPlayer1Turn) {
    if (board[x][y].hasPiece) return false
    if (x > 7 || y > 7 || x < 0 || y < 0) return false

    for (var [dx, dy] of directions) {
      console.log(dx, dy)
      if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) continue
      if (!board[x + dx][y + dy].hasPiece) continue
      if (board[x + dx][y + dy].pieceColor === (isPlayer1Turn ? "white" : "black")) continue
      console.log("goingin")
      if (traverseBoard(x + dx, y + dy, dx, dy, isPlayer1Turn)) return true
    }
    return false
  }

  function traverseBoard(x, y, dx, dy, isPlayer1Turn) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false
    if (!board[x + dx][y + dy].hasPiece) return false
    if (board[x + dx][y + dy].pieceColor === (isPlayer1Turn ? "white" : "black")) return true
    return traverseBoard(x + dx, y + dy, dx, dy, isPlayer1Turn)
  }

  return (
    <div className="app">
      <Board board={board} handleClick={placePiece}/>
    </div>
  );
}

export default App;
