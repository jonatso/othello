import Board from './components/Board';
import React from "react"
import _ from "lodash"

let gameBoard = Array.from({length: 8}, _=>(Array.from({length: 8}, _=>({
  hasPiece: false, 
  hasTransparentPiece: false,
  pieceColor: "white"
}))))

gameBoard[3][3] = {
  hasPiece: true, 
  hasTransparentPiece: false,
  pieceColor: "white"
}

gameBoard[3][4] = {
  hasPiece: true, 
  hasTransparentPiece: false,
  pieceColor: "black"
}

gameBoard[4][4] = {
  hasPiece: true, 
  hasTransparentPiece: false,
  pieceColor: "white"
}

gameBoard[4][3] = {
  hasPiece: true, 
  hasTransparentPiece: false,
  pieceColor: "black"
}

function App() {
  const [board, setBoard] = React.useState(gameBoard)
  const [isPlayer1Turn, setIsPlayer1Turn] = React.useState(true)

  function placePiece(x, y) {
    if(board[x][y].hasPiece) return
    setBoard(oldBoard => {
      const newBoard = _.cloneDeep(oldBoard)
      newBoard[x][y].hasPiece = true
      newBoard[x][y].pieceColor = isPlayer1Turn ? "white" : "black"
      return newBoard
    })
    setIsPlayer1Turn(!isPlayer1Turn)
  }

  return (
    <div className="app">
      <Board board={board} handleClick={placePiece}/>
    </div>
  );
}

export default App;
