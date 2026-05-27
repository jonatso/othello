import Tile from "./Tile";

interface BoardProps {
  board: string[][];
  possibleMovesBoard: string[][];
  handleClick: (x: number, y: number) => void;
}

const Board = ({ board, possibleMovesBoard, handleClick }: BoardProps) => {
  const tiles: React.ReactNode[] = [];

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      tiles.push(
        <Tile
          key={`${i}-${j}`}
          isOdd={(i + j) % 2 === 0}
          hasPiece={board[i][j] !== ""}
          hasTransparentPiece={possibleMovesBoard[i][j] !== ""}
          pieceColor={board[i][j] !== "" ? board[i][j] : possibleMovesBoard[i][j]}
          onClick={() => handleClick(i, j)}
        />,
      );
    }
  }

  return <div className="board">{tiles}</div>;
};

export default Board;
