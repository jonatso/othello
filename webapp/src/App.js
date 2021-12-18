import Board from './components/Board';

let board = []
    
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            board.push({x: i, y: j})
        }
    }

function App() {
  return (
    <div className="app">
      <Board board={board}/>
    </div>
  );
}

export default App;
