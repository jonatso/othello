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

  function placePiece(x, y) {
    console.log("clicked", x, y)
    setBoard(oldBoard => {
      const newBoard = _.cloneDeep(oldBoard)
      newBoard[x][y].hasPiece = true
      return newBoard
    })
  }

  return (
    <div className="app">
      <Board board={board} handleClick={placePiece}/>
    </div>
  );
}

export default App;
