const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);
var _ = require("lodash");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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
    socket.on("joinGame", handleJoinGame);
    socket.on("createGame", handleCreateGame);
    socket.on("makeMove", handleMakeMove);

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];

        let allUsers;
        if (room) {
            allUsers = room.sockets;
        }

        let numClients = 0;
        if (allUsers) {
            numClients = Object.keys(allUsers).length;
        }

        if (numClients === 0) {
            socket.emit("badCode", "No players in room");
            return;
        } else if (numClients > 1) {
            socket.emit("badCode", "Room is full");
            return;
        }

        socketToRoom[socket.id] = roomName;

        socket.join(roomName);
        socket.isPlayer1 = false;
        socket.emit("initGame", false);

        startGameInterval(roomName);
    }

    function handleCreateGame() {
        let roomName = makeid(5);
        socketToRoom[socket.id] = roomName;
        socket.emit("gameCode", roomName);

        gameStates[roomName] = createGameState();

        socket.join(roomName);
        socket.isPlayer1 = true;
        socket.emit("initGame", true);
    }

    function handleDisconnect() {
        const roomName = socketToRoom[socket.id];
        delete socketToRoom[socket.id];
        if (roomName) {
            const room = io.sockets.adapter.rooms[roomName];
            if (room) {
                for (socket of room.sockets) {
                    socket.emit("opponentLeft");
                }
            }
            delete gameStates[roomName];
        }
    }
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});

function makeid(length) {
    var res = "";
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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

function placePiece(x, y, gameState) {
    //console.log(`${isWhitesTurn ? 'white' : 'black'} is trying to place a piece`)
    const flipDirections = getFlipDirections(x, y, gameState);
    if (flipDirections.length === 0) return false;
    const newBoard = _.cloneDeep(oldBoard);
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
        if (board[x + dx][y + dy] !== (isWhitesTurn ? "b" : "w")) continue;
        if (searchForMove(x + dx, y + dy, dx, dy, gameState)) {
            flipDirections.push([dx, dy]);
        }
    }
    return flipDirections;
}

function searchForMove(x, y, dx, dy, gameState) {
    if (x + dx > 7 || y + dy > 7 || x + dx < 0 || y + dy < 0) return false;
    if (board[x + dx][y + dy] === (isWhitesTurn ? "w" : "b")) return true;
    return searchForMove(x + dx, y + dy, dx, dy, gameState);
}

function flipPieces(x, y, dx, dy, newBoard, gameState) {
    while (board[x + dx][y + dy] !== (gameState.isWhitesTurn ? "w" : "b")) {
        newBoard[x + dx][y + dy] = gameState.isWhitesTurn ? "w" : "b";
        x += dx;
        y += dy;
    }
}
