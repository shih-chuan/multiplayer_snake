const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#e66916';

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const socket = io("ws://127.0.0.1:3000", {
    withCredentials: true
});


const handleUnknownGame = () => {
    reset();
    alert("Unknown game code");
}

const handleTooManyPlayers = () => {
    reset();
    alert("This game is already in process");
}

const reset = () => {
    playerNumber = null;
    gameCodeInput.value = "";
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

socket.on('gameState', (gameState) => {
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
})
socket.on('gameOver', (data) => {
    if(!gameActive){
        return;
    }
    data = JSON.parse(data);
    console.log(data);
    if(data.winner === playerNumber){
        alert('You Win!')
    }else{
        alert('You Lose!')
    }
    gameActive = false;
})
socket.on('gameCode', (gameCode) => {
    gameCodeDisplay.innerHTML = gameCode;
})
socket.on('init', (number) => {
    playerNumber = number;
})
socket.on('tooManyPlayers', handleTooManyPlayers)

newGameBtn.addEventListener('click', () => {
    socket.emit('newGame');
    init();
})
joinGameBtn.addEventListener('click', () => {
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
})

let canvas, ctx;
let playerNumber;
let gameActive = false;

const init = () => {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown', keydown);
    gameActive = true;
}

const handleInit = (number) => {
    playerNumber = number;
}

const keydown = (evt) => {
    socket.emit('keydown', evt.keyCode);
}

const paintGame = (state) => {
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const size = canvas.width / state.gridSize

    ctx.fillStyle = FOOD_COLOUR;
    ctx.fillRect(state.food.x * size, state.food.y * size, size, size);

    paintPlayer(state.players[0], size, 'green');
    paintPlayer(state.players[1], size, 'red');
}

const paintPlayer = (player, size, color) => {
    const {pos, snake} = player;
    ctx.fillStyle = color;
    snake.map(cell => {
        ctx.fillRect(cell.x*size, cell.y*size, size, size);
    })
}

// init();
// paintGame(gameState);