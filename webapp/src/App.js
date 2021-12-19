import Board from './components/Board';
import React from "react"

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

  function handleClick() {
    
  }

  return (
    <div className="app">
      <Board board={board} handleClick={handleClick}/>
    </div>
  );
}

export default App;
