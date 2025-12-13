/*
Create by Learn Web Developement
Rewritten & Debugged for Angular iframe communication
*/

const cvs = document.getElementById("snake");
const ctx = cvs.getContext("2d");

const box = 32;

// Background
const ground = new Image();
ground.src = "img/ground.png";

// Food image
const foodImg = new Image();
foodImg.src = "img/food.png";

// Sounds
let dead = new Audio();
let eat = new Audio();
let up = new Audio();
let right = new Audio();
let left = new Audio();
let down = new Audio();

dead.src = "audio/dead.mp3";
eat.src = "audio/eat.mp3";
up.src = "audio/up.mp3";
right.src = "audio/right.mp3";
left.src = "audio/left.mp3";
down.src = "audio/down.mp3";

// Snake Array
let snake = [{ x: 9 * box, y: 10 * box }];

// Food
let food = generateFood();

function generateFood() {
  let newFood;
  let overlap = true;

  while (overlap) {
    newFood = {
      x: Math.floor(Math.random() * 17 + 1) * box,
      y: Math.floor(Math.random() * 15 + 3) * box
    };

    // 檢查是否與蛇身重疊
    overlap = snake.some(part => part.x === newFood.x && part.y === newFood.y);
  }

  return newFood;
}

// Score + Direction
let score = 0;
let d;

// Key Listener
document.addEventListener("keydown", direction);

function direction(event) {
  let key = event.keyCode;
  if (key == 37 && d != "RIGHT") { left.play(); d = "LEFT"; }
  else if (key == 38 && d != "DOWN") { up.play(); d = "UP"; }
  else if (key == 39 && d != "LEFT") { right.play(); d = "RIGHT"; }
  else if (key == 40 && d != "UP") { down.play(); d = "DOWN"; }
}

// Collision detection
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) return true;
  }
  return false;
}

// Draw Snake with rounded head
function drawSnakeHead(x, y, dir) {
  ctx.fillStyle = "#4CAF50";
  ctx.beginPath();
  ctx.roundRect(x, y, box, box, 8);
  ctx.fill();

  let eye1 = {}, eye2 = {};
  if (dir === "LEFT") {
    eye1 = { x: x + 8, y: y + 10 };
    eye2 = { x: x + 8, y: y + 20 };
  } else if (dir === "RIGHT") {
    eye1 = { x: x + box - 12, y: y + 10 };
    eye2 = { x: x + box - 12, y: y + 20 };
  } else if (dir === "UP") {
    eye1 = { x: x + 10, y: y + 8 };
    eye2 = { x: x + 22, y: y + 8 };
  } else {
    eye1 = { x: x + 10, y: y + box - 12 };
    eye2 = { x: x + 22, y: y + box - 12 };
  }

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, 4, 0, Math.PI * 2);
  ctx.arc(eye2.x, eye2.y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, 2, 0, Math.PI * 2);
  ctx.arc(eye2.x, eye2.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Snake body
function drawSnakeBody(x, y) {
  ctx.fillStyle = "#66BB6A";
  ctx.beginPath();
  ctx.roundRect(x, y, box, box, 6);
  ctx.fill();
}

// Main Draw function
function draw() {
  ctx.drawImage(ground, 0, 0);

  // Draw Snake
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) drawSnakeHead(snake[i].x, snake[i].y, d);
    else drawSnakeBody(snake[i].x, snake[i].y);
  }

  ctx.drawImage(foodImg, food.x, food.y);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (d === "LEFT") snakeX -= box;
  else if (d === "UP") snakeY -= box;
  else if (d === "RIGHT") snakeX += box;
  else if (d === "DOWN") snakeY += box;

  // let ateFood = snakeX === food.x && snakeY === food.y;

  // if (ateFood) {
  //   score++;
  //   eat.play();
  //   food = {
  //     x: Math.floor(Math.random() * 17 + 1) * box,
  //     y: Math.floor(Math.random() * 15 + 3) * box
  //   };
  // } else {
  //   snake.pop();
  // }


  if (snakeX == food.x && snakeY == food.y) {
    score++;
    eat.play();
    food = generateFood();
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  // Game Over Check
  if (
    snakeX < box || snakeX > 17 * box ||
    snakeY < 3 * box || snakeY > 17 * box ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    dead.play();

    window.parent.postMessage({ type: "gameScore", score }, "*");
    showRestartButton();
    return;
  }

  snake.unshift(newHead);

  ctx.fillStyle = "white";
  ctx.font = "45px Changa one";
  ctx.fillText(score, 2 * box, 1.6 * box);
}

let game = setInterval(draw, 100);

// Game Over Overlay
function showRestartButton() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  ctx.fillStyle = "white";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", cvs.width / 2, cvs.height / 2 - 40);

  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(cvs.width / 2 - 100, cvs.height / 2, 200, 60);

  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Restart", cvs.width / 2, cvs.height / 2 + 40);

  cvs.addEventListener("click", restartClickHandler);
}

function restartClickHandler(event) {
  let rect = cvs.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;

  if (
    x >= cvs.width / 2 - 100 && x <= cvs.width / 2 + 100 &&
    y >= cvs.height / 2 && y <= cvs.height / 2 + 60
  ) {
    cvs.removeEventListener("click", restartClickHandler);
    restartGame();
  }
}

function restartGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  score = 0;
  d = undefined;

  food = {
    x: Math.floor(Math.random() * 17 + 1) * box,
    y: Math.floor(Math.random() * 15 + 3) * box
  };

  game = setInterval(draw, 100);
}
