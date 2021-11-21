const { GRID_SIZE } = require("./constants");

const initGame = () => {
    const state = createGameState();
    randomFood(state);
    return state;
}

const createGameState = () => {
    return {
        players: [{
            pos: {
                x: 4, y: 10
            },
            vel: {
                x: 1, y: 0
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10},
                {x: 4, y: 10}
            ]
        }, {
            pos: {
                x: 4, y: 1
            },
            vel: {
                x: 1, y: 0
            },
            snake: [
                {x: 1, y: 1},
                {x: 2, y: 1},
                {x: 3, y: 1},
                {x: 4, y: 1}
            ]
        }],
        food: {},
        gridSize: GRID_SIZE
    }
}

const gameLoop = (state) => {
    if(!state) return;
    const player1 = state.players[0];
    const player2 = state.players[1];

    player1.pos.x += player1.vel.x;
    player1.pos.y += player1.vel.y;
    player2.pos.x += player2.vel.x;
    player2.pos.y += player2.vel.y;

    if(player1.pos.x < 0){
        player1.pos.x = player1.pos.x + GRID_SIZE;
    }else if(player1.pos.x >= GRID_SIZE){
        player1.pos.x = 0;
    }
    if(player1.pos.y < 0){
        player1.pos.y = player1.pos.y + GRID_SIZE;
    }else if(player1.pos.y >= GRID_SIZE){
        player1.pos.y = 0;
    }
    if(player2.pos.x < 0){
        player2.pos.x = player2.pos.x + GRID_SIZE;
    }else if(player2.pos.x >= GRID_SIZE){
        player2.pos.x = 0;
    }
    if(player2.pos.y < 0){
        player2.pos.y = player2.pos.y + GRID_SIZE;
    }else if(player2.pos.y >= GRID_SIZE){
        player2.pos.y = 0;
    }

    if(state.food.x == player1.pos.x && state.food.y == player1.pos.y) {
        player1.snake.push({...player1.pos});
        player1.pos.x += player1.vel.x;
        player1.pos.y += player1.vel.y;
        randomFood(state);
    }
    if(state.food.x == player2.pos.x && state.food.y == player2.pos.y) {
        player2.snake.push({...player2.pos});
        player2.pos.x += player2.vel.x;
        player2.pos.y += player2.vel.y;
        randomFood(state);
    }

    //往前一步
    if(player1.vel.x || player1.vel.y) {
        //撞到自己 => 輸了
        for(let player of state.players){
            for(let cell of player.snake){
                if(cell.x == player1.pos.x && cell.y == player1.pos.y) {
                    return 2;
                }
            }
        }
        player1.snake.push({...player1.pos});
        player1.snake.shift()
    }

    //往前一步
    if(player2.vel.x || player2.vel.y) {
        //撞到自己 => 輸了
        for(let player of state.players){
            for(let cell of player.snake){
                if(cell.x == player2.pos.x && cell.y == player2.pos.y) {
                    return 1;
                }
            }
        }
        player2.snake.push({...player2.pos});
        player2.snake.shift()
    }

    //還沒有人贏
    return 0;
}

const randomFood = (state) => {
    let food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    };

    //確保食物不會生成在snake上面
    for(let cell of state.players[0].snake){
        if(cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
    //確保食物不會生成在snake上面
    for(let cell of state.players[1].snake){
        if(cell.x === food.x && cell.y === food.y) {
            return randomFood(state);
        }
    }
    state.food = food;
}

const getUpdatedVelocity = (keyCode) => {
    switch(keyCode){
        case 37: 
            return { x: -1, y: 0 };
        case 38: 
            return { x: 0, y: -1 };
        case 39:
            return { x: 1, y: 0 };
        case 40:
            return { x: 0, y: 1 };
    }
}

module.exports = {
    createGameState,
    gameLoop,
    getUpdatedVelocity,
    initGame
}