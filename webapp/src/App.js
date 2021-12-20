import Board from './components/Board';
import React from "react"
import _ from "lodash"

const directions = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]]

function App() {
  const [isWhitesTurn, setisWhitesTurn] = React.useState(true)
  const [board, setBoard] = React.useState([
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', 'w', 'b', '', '', ''],
    ['', '', '', 'b', 'w', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '']
  ])
  const [posibleMovesBoard, setPossibleMovesBoard] = React.useState([
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', 'w', '', '', ''],
    ['', '', 'w', '', '', '', '', ''],
    ['', '', '', '', '', 'w', '', ''],
    ['', '', '', 'w', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '']
  ])

  function placePiece(x, y) {
    console.log(`${isWhitesTurn ? 'white' : 'black'} is trying to place a piece`)
    if (!canPlacePiece(x, y)) return
    setBoard(oldBoard => {
      const newBoard = _.cloneDeep(oldBoard)
      newBoard[x][y] = (isWhitesTurn ? 'w' : 'b')
      return newBoard
    })
  }

  function getNewPossibleMovesBoard() {
    const newPMBoard = Array.from({length: 8}, _=>(Array.from({length: 8}, _=>(''))))

    for (let x = 0; x < newPMBoard.length; x++) {
      for (let y = 0; y < newPMBoard[0].length; y++) {
        if (canPlacePiece(x, y)) {
          newPMBoard[x][y] = (isWhitesTurn ? 'w' : 'b')
        }
      }
    }
    return newPMBoard
  }

  function canPlacePiece(x, y) {
    if (board[x][y] !== '') return false
    if (x > 7 || y > 7 || x < 0 || y < 0) return false

    for (var [dx, dy] of directions) {
      if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) continue
      if (board[x + dx][y + dy] !== (isWhitesTurn ? 'b' : 'w')) continue
      if (searchForMove(x + dx, y + dy, dx, dy)) return true
    }
    return false
  }

  function searchForMove(x, y, dx, dy) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false
    if (board[x + dx][y + dy] === (isWhitesTurn ? 'w' : 'b')) return true
    return searchForMove(x + dx, y + dy, dx, dy)
  }

  React.useEffect(() => {
    console.log("changing turns")
    setisWhitesTurn(!isWhitesTurn)
  }, [board])

  React.useEffect(() => {
    console.log("changing possible moves")
    setPossibleMovesBoard(getNewPossibleMovesBoard())
  }, [isWhitesTurn])

  return (
    <div className="app">
      <Board board={board} posibleMovesBoard={posibleMovesBoard} handleClick={placePiece}/>
    </div>
  );
}

export default App;
