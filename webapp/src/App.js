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
  const [isPlayer1Turn, setIsPlayer1Turn] = React.useState(true)
  const [board, setBoard] = React.useState(gameBoard)
  const [posibleMovesBoard, setPossibleMovesBoard] = React.useState(
    getNewPossibleMovesBoard()
  )
  

  function placePiece(x, y) {
    if (!canPlacePiece(x, y)) return
    setBoard(oldBoard => {
      const newBoard = _.cloneDeep(oldBoard)
      newBoard[x][y].hasPiece = true
      newBoard[x][y].pieceColor = (isPlayer1Turn ? "white" : "black")
      return newBoard
    })
    setIsPlayer1Turn(!isPlayer1Turn)
    console.log("getting there")
    setPossibleMovesBoard(getNewPossibleMovesBoard())
  }

  function getNewPossibleMovesBoard() {
    console.log("we doing it")
    const newPMBoard = Array.from({length: 8}, _=>(Array.from({length: 8}, _=>({
      hasPiece: false, 
      pieceColor: "white"
    }))))

    for (let x = 0; x < newPMBoard.length; x++) {
      for (let y = 0; y < newPMBoard[0].length; y++) {
        if (canPlacePiece(x, y)) {
          newPMBoard[x][y] = {
            hasPiece: true,
            pieceColor: (isPlayer1Turn ? "white" : "black")
          }
        }
      }
    }

    return newPMBoard
  }

  function canPlacePiece(x, y) {
    if (board[x][y].hasPiece) return false
    if (x > 7 || y > 7 || x < 0 || y < 0) return false

    for (var [dx, dy] of directions) {
      if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) continue
      if (!board[x + dx][y + dy].hasPiece) continue
      if (board[x + dx][y + dy].pieceColor === (isPlayer1Turn ? "white" : "black")) continue
      if (searchForMove(x + dx, y + dy, dx, dy)) return true
    }
    return false
  }

  function searchForMove(x, y, dx, dy) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false
    if (!board[x + dx][y + dy].hasPiece) return false
    if (board[x + dx][y + dy].pieceColor === (isPlayer1Turn ? "white" : "black")) return true
    return searchForMove(x + dx, y + dy, dx, dy)
  }

  return (
    <div className="app">
      <Board board={board} posibleMovesBoard={posibleMovesBoard} handleClick={placePiece}/>
    </div>
  );
}

export default App;
