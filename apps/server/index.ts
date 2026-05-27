import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import { Server, Socket } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";
import { applyMove, createGameState, type GameState } from "@othello/shared";

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDistPath = process.env.CLIENT_DIST_DIR ?? join(__dirname, "../../client/dist");

const app = express();
app.use(cors());
app.use(express.static(clientDistPath));

app.use((_req, res) => {
  res.type("html").send(readFileSync(join(clientDistPath, "index.html"), "utf8"));
});

const server = createServer(app);
const port = process.env.PORT || 3001;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
});

interface PlayerSocket extends Socket {
  isPlayer1: boolean;
}

const socketToRoom = new Map<string, string>();
const gameStates = new Map<string, GameState>();

io.on("connection", (socket) => {
  const playerSocket = socket as PlayerSocket;
  console.log(`Connected: ${socket.id}`);

  socket.on("disconnect", handleDisconnect);
  socket.on("leaveGame", handleDisconnect);
  socket.on("joinGame", handleJoinGame);
  socket.on("createGame", handleCreateGame);
  socket.on("makeMove", handleMakeMove);

  async function handleJoinGame(roomName: string) {
    console.log(`${socket.id} is trying to join ${roomName}`);
    const room = io.sockets.adapter.rooms.get(roomName);

    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      console.log("Incorrect code");
      socket.emit("badCode", "No players in room");
      return;
    } else if (numClients > 1) {
      console.log("The game is full");
      socket.emit("badCode", "Room is full");
      return;
    }

    socketToRoom.set(socket.id, roomName);
    await playerSocket.join(roomName);
    playerSocket.isPlayer1 = false;
    playerSocket.emit("isPlayer1", false);
    io.in(roomName).emit("startGame", gameStates.get(roomName));
  }

  async function handleCreateGame() {
    const roomName = makeId(5);
    socketToRoom.set(socket.id, roomName);
    playerSocket.emit("gameCode", roomName);
    playerSocket.emit("isPlayer1", true);

    gameStates.set(roomName, createGameState());
    await playerSocket.join(roomName);
    playerSocket.isPlayer1 = true;
    console.log(`${socket.id} created ${roomName}`);
  }

  function handleDisconnect() {
    console.log(`${socket.id} disconnected`);
    const roomName = socketToRoom.get(socket.id);
    socketToRoom.delete(socket.id);
    if (roomName) {
      const room = io.sockets.adapter.rooms.get(roomName);
      if (room) {
        for (const socketId of room) {
          io.sockets.sockets.get(socketId)?.emit("opponentLeft");
        }
        io.sockets.adapter.rooms.delete(roomName);
      }
      gameStates.delete(roomName);
    }
  }

  function handleMakeMove(data: { x: number; y: number }) {
    const roomName = socketToRoom.get(socket.id);
    if (!roomName) return;
    const gameState = gameStates.get(roomName);
    if (!gameState) return;

    if (gameState.isWhitesTurn !== playerSocket.isPlayer1) {
      socket.emit("moveError", "...it's not your turn");
      return;
    }
    const result = applyMove(gameState, { row: data.x, col: data.y });

    if (!result.ok) {
      socket.emit("moveError", "...invalid move");
      return;
    }

    gameStates.set(roomName, result.gameState);

    if (result.gameEnded) {
      io.in(roomName).emit("gameEnded", result.gameState);
      return;
    }

    io.to(roomName).emit("gameStateUpdate", result.gameState);
  }
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function makeId(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
    "",
  );
}
