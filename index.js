const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
app.use(express.static("client/build")));

const server = http.createServer(app);
var _ = require("lodash");
const directions = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const io = new Server(server, {
  cors: {
    origin: "http://localhost",
    methods: ["GET", "POST", "PUT", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});

const socketToRoom = {};
const gameStates = {};

io.on("connection", (socket) => {
  console.log(`Connected: ${socket.id}`);

  socket.on("disconnect", handleDisconnect);
  socket.on("leaveGame", handleDisconnect); //clicking leave game does the same as closing the tab
  socket.on("joinGame", handleJoinGame);
  socket.on("createGame", handleCreateGame);
  socket.on("makeMove", handleMakeMove);

  function handleJoinGame(roomName) {
    console.log(`${socket.id} is trying to join ${roomName}`);
    const room = io.sockets.adapter.rooms.get(roomName);

    let numClients = 0;
    if (room) {
      numClients = room.size;
    }

    if (numClients === 0) {
      console.log("Incorrect code");
      socket.emit("badCode", "No players in room");
      return;
    } else if (numClients > 1) {
      console.log("The game is full");
      socket.emit("badCode", "Room is full");
      return;
    }

    socketToRoom[socket.id] = roomName;

    socket.join(roomName);
    socket.isPlayer1 = false;
    socket.emit("isPlayer1", false);
    io.in(roomName).emit("startGame", gameStates[roomName]);
  }

  function handleCreateGame() {
    let roomName = makeid(5);
    socketToRoom[socket.id] = roomName;
    socket.emit("gameCode", roomName);
    socket.emit("isPlayer1", true);

    gameStates[roomName] = createGameState();

    socket.join(roomName);
    socket.isPlayer1 = true;
    console.log(`${socket.id} created ${roomName}`);
  }

  function handleDisconnect() {
    console.log(`${socket.id} disconnected`);
    const roomName = socketToRoom[socket.id];
    delete socketToRoom[socket.id];
    if (roomName) {
      const room = io.sockets.adapter.rooms.get(roomName);
      if (room) {
        room.forEach((socketId) => {
          io.sockets.sockets.get(socketId).emit("opponentLeft");
        });
        io.sockets.adapter.rooms.delete(roomName);
      }
      delete gameStates[roomName];
    }
  }

  function handleMakeMove(data) {
    const roomName = socketToRoom[socket.id];
    const gameState = gameStates[roomName];
    if (gameState.isWhitesTurn !== socket.isPlayer1) {
      socket.emit("moveError", "...it's not your turn");
      return;
    }
    if (gameState.possibleMovesBoard[data.x][data.y] === "") {
      socket.emit("moveError", "...invalid move");
      return;
    }
    if (placePiece(data.x, data.y, gameState)) {
      if (needToSwitchTurns(gameState)) {
        gameState.isWhitesTurn = !gameState.isWhitesTurn;
        gameState.possibleMovesBoard = getNewPossibleMovesBoard(gameState);
        if (needToSwitchTurns(gameState)) {
          io.in(roomName).emit("gameEnded", gameState);
          return;
        }
      }
      io.to(roomName).emit("gameStateUpdate", gameState);
    }
  }
});

server.listen(process.env.PORT || 3001, () => {
  console.log("Server is running on port 3001");
});

function makeid(length) {
  var res = "";
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charsL = chars.length;
  for (var i = 0; i < length; i++) {
    res += chars.charAt(Math.floor(Math.random() * charsL));
  }
  return res;
}

function createGameState() {
  return {
    board: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "w", "b", "", "", ""],
      ["", "", "", "b", "w", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
    possibleMovesBoard: [
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "w", "", "", ""],
      ["", "", "w", "", "", "", "", ""],
      ["", "", "", "", "", "w", "", ""],
      ["", "", "", "w", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
    ],
    isWhitesTurn: true,
  };
}

function needToSwitchTurns(gameState) {
  return (
    gameState.possibleMovesBoard
      .map((row) => row.filter((p) => p === "").length)
      .reduce((a, b) => a + b, 0) === 0
  );
}

function placePiece(x, y, gameState) {
  //console.log(`${isWhitesTurn ? 'white' : 'black'} is trying to place a piece`)
  const flipDirections = getFlipDirections(x, y, gameState);
  if (flipDirections.length === 0) return false;
  const newBoard = _.cloneDeep(gameState.board);
  newBoard[x][y] = gameState.isWhitesTurn ? "w" : "b";
  for (var [dx, dy] of flipDirections) {
    flipPieces(x, y, dx, dy, newBoard, gameState);
  }

  gameState.board = newBoard;
  gameState.isWhitesTurn = !gameState.isWhitesTurn;
  gameState.possibleMovesBoard = getNewPossibleMovesBoard(gameState);
  return true;
}

function getNewPossibleMovesBoard(gameState) {
  const newPMBoard = Array.from(
    {
      length: 8,
    },
    (_) =>
      Array.from(
        {
          length: 8,
        },
        (_) => ""
      )
  );

  for (let x = 0; x < newPMBoard.length; x++) {
    for (let y = 0; y < newPMBoard[0].length; y++) {
      if (getFlipDirections(x, y, gameState).length !== 0) {
        newPMBoard[x][y] = gameState.isWhitesTurn ? "w" : "b";
      }
    }
  }

  return newPMBoard;
}

function getFlipDirections(x, y, gameState) {
  const flipDirections = [];
  if (gameState.board[x][y] !== "") return flipDirections;
  if (x > 7 || y > 7 || x < 0 || y < 0) return flipDirections;

  for (var [dx, dy] of directions) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) continue;
    if (
      gameState.board[x + dx][y + dy] !== (gameState.isWhitesTurn ? "b" : "w")
    )
      continue;
    if (searchForMove(x + dx, y + dy, dx, dy, gameState)) {
      flipDirections.push([dx, dy]);
    }
  }
  return flipDirections;
}

function searchForMove(x, y, dx, dy, gameState) {
  if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false;
  if (gameState.board[x + dx][y + dy] === (gameState.isWhitesTurn ? "w" : "b"))
    return true;
  return searchForMove(x + dx, y + dy, dx, dy, gameState);
}

function flipPieces(x, y, dx, dy, newBoard, gameState) {
  while (
    gameState.board[x + dx][y + dy] !== (gameState.isWhitesTurn ? "w" : "b")
  ) {
    newBoard[x + dx][y + dy] = gameState.isWhitesTurn ? "w" : "b";
    x += dx;
    y += dy;
  }
}
