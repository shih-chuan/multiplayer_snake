const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#c2c2c2';
const FOOD_COLOUR = '#ffffff';
const GRID_SIZE = 30;
const CANVAS_WIDTH = 600;

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

const socket = io("ws://127.0.0.1:3000", { withCredentials: true });

let canvas, ctx;
let playerNumber;
let gameActive = false;

const reset = () => {
    playerNumber = null;
    gameCodeDisplay.innerText = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}

const handleGameStart = (gameCode) => {
    initialScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    paintBoard(CANVAS_WIDTH, GRID_SIZE);
    $("#gameCodeDisplay").html(gameCode);
    $("#alertModal").modal('hide');
    document.addEventListener('keydown', keydown);
    gameActive = true;
}

const handleUnknownGame = () => {
    reset();
    showAlertModal('無法加入遊戲', '無此房間代號');
}

const handleTooManyPlayers = () => {
    reset();
    showAlertModal('無法加入遊戲', '人數過多!!');
}

const handleInit = (number) => {
    playerNumber = number;
}

const handleGameCode = (gameCode) => {
    showAlertModal(`房間號碼: ${gameCode}`, `
        <div class="d-flex align-items-center">
            <div class="spinner-border m-2" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div>等待玩家加入遊戲(1/2)</div>
        </div>
    `);
}

const handleGameOver = (data) => {
    if(!gameActive){
        return;
    }
    data = JSON.parse(data);
    if(data.winner === playerNumber){
        showAlertModal('遊戲結束', '恭喜獲勝!', reset);
    }else{
        showAlertModal('遊戲結束', '你輸了!', reset);
    }
    gameActive = false;
}

const handleGameState = (gameState) => {
    if(!gameActive){
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

const keydown = (evt) => {
    socket.emit('keydown', evt.keyCode);
}

const paintGame = (state) => {
    paintBoard(CANVAS_WIDTH, GRID_SIZE);

    const size = canvas.width / state.gridSize

    ctx.fillStyle = FOOD_COLOUR;
    ctx.shadowColor = FOOD_COLOUR;
    ctx.shadowBlur = 5;
    ctx.fillRect(state.food.x * size, state.food.y * size, size, size);

    paintPlayer(state.players[0], size, '#FF5353');
    paintPlayer(state.players[1], size, '#FFC429');
}

const paintBoard = (size, grid) => {
    canvas.width = canvas.height = size;
    ctx.fillStyle = BG_COLOUR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath()
    for(let penPos=0; penPos<=size; penPos+=size/grid){
        ctx.moveTo(penPos, 0);
        ctx.lineTo(penPos, size);
        ctx.moveTo(0, penPos);
        ctx.lineTo(size, penPos);
    }
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.5;
    ctx.stroke();

}

const paintPlayer = (player, size, color) => {
    const { snake } = player;
    ctx.shadowColor = color;
    ctx.shadowBlur = 5;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2
    snake.map((cell, index) => {
        if(index == snake.length-1){
            ctx.strokeRect(cell.x*size, cell.y*size, size, size);
        }else{
            ctx.fillRect(cell.x*size, cell.y*size, size, size);
        }
    })
}

const showAlertModal = (title, content, action = ()=>{}) => {
    $("#alertModal .modal-title").html(title);
    $("#alertModal .modal-body").html(content);
    $('#alertModal .action-btn').off('click');
    if(action){
        console.log('in action')
        $('#alertModal .action-btn').on('click', action);
    }
    $("#alertModal").modal('show');
}

newGameBtn.addEventListener('click', () => {
    socket.emit('newGame');
})
joinGameBtn.addEventListener('click', () => {
    showAlertModal(`請輸入房間號碼`, `
        <div class="form-group">
            <input class="form-control" type="text" placeholder="Enter Game Code" id="gameCodeInput" />
        </div>
    `, () => {
        const gameCodeInput = document.getElementById('gameCodeInput');
        const code = gameCodeInput.value;
        console.log('code: ', code);
        socket.emit('joinGame', code);
    });
})

socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('gameStart', handleGameStart);
socket.on('init', handleInit);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('unknownGame', handleUnknownGame);