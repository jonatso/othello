const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io')
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        preflightContinue: false,
        optionsSuccessStatus: 204
    }
});

const socketToRoom = {};
const gameStates = {};

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id}`);
    
    socket.on('disconnect', handleDisconnect);
    socket.on('joinGame', handleJoinGame);
    socket.on('createGame', handleCreateGame);

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
          socket.emit('unknownCode');
          return;
        } else if (numClients > 1) {
          socket.emit('tooManyPlayers');
          return;
        }
    
        socketToRoom[socket.id] = roomName;
    
        socket.join(roomName);
        socket.number = 2;
        socket.emit('initGame', 2);
        
        startGameInterval(roomName);
    }

    function handleCreateGame() {
        let roomName = makeid(5);
        socketToRoom[socket.id] = roomName;
        socket.emit('gameCode', roomName);
    
        gameStates[roomName] = initGame();
    
        socket.join(roomName);
        socket.number = 1;
        socket.emit('initGame', 1);
    }

    function handleDisconnect() {
        const roomName = socketToRoom[socket.id];
        delete socketToRoom[socket.id];
        if (roomName) {
            const room = io.sockets.adapter.rooms[roomName];
            if (room) {
                for (socket of room.sockets) {
                    socket.emit('opponentLeft'); 
                }
            }
            delete gameStates[roomName];
        }
    }

    function makeid(length) {
        var res = '';
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charsL = chars.length;
        for (var i = 0; i < length; i++ ) {
           res += chars.charAt(Math.floor(Math.random() * charsL));
        }
        return res;
    }


});

server.listen(3001, () => {
   console.log("Server is running on port 3001"); 
});