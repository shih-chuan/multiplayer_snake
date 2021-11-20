const server = require('http').createServer();
const io = require("socket.io")(server, {
    cors: {
        origin: ["http://127.0.0.1:5500", "http://172.20.10.13:5500"],
        methods: ["GET", "POST"],
        credentials: true
    }
});
const { FRAME_RATE } = require("./constants");
const { makeId } = require("./utils");
const { gameLoop, getUpdatedVelocity, initGame } = require("./game");

const state = {};
const clientRooms = {};

io.on('connection', client => {

    const handleNewGame = () => {
        let roomName = makeId(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        state[roomName] = initGame();
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
    }

    const handleJoinGame = (gameCode) => {
        console.log(gameCode);
        const room = io.sockets.adapter.rooms.get(gameCode);
        console.log(io.sockets.adapter.rooms);
        console.log(room);
        let numClients = 0;
        if(room){
            numClients = Array.from(room).length;
        }
        console.log(numClients);
        if(numClients === 0){
            client.emit('unknownGame');
            return;
        }else if(numClients > 1){
            client.emit('tooManyPlayers');
            return;
        }
        clientRooms[client.id] = gameCode;
        client.join(gameCode);
        client.number = 2;
        client.emit('init', 2);

        console.log('join game successed')
        startGameInterval(gameCode);
    }

    const handleKeydown = (keyCode) => {
        const roomName = clientRooms[client.id];
        if(!roomName){
            return;
        }
        try {
            keyCode = parseInt(keyCode);
        }catch(err){
            console.error(err);
            return;
        }
        const vel = getUpdatedVelocity(keyCode);
    
        if(vel) {
            state[roomName].players[client.number - 1].vel = vel;
        }
    }
    
    console.log('connected');
    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
});

const emitGameState = (roomName, state) => {
    io.sockets.in(roomName)
        .emit('gameState', JSON.stringify(state));
}

const emitGameOver = (roomName, winner) => {
    io.sockets.in(roomName)
        .emit('gameOver', JSON.stringify({ winner }));
}

const startGameInterval = (roomName) => {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);
        console.log('winner: ', winner);
        if(!winner) {
            emitGameState(roomName, state[roomName]);
        }else{
            console.log('emit winner')
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000/FRAME_RATE)
}

server.listen(3000);
