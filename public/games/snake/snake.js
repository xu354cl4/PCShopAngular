/*
Create by Learn Web Developement
Merged + Stabilized
- Click to Start
- Pause / Resume
- Speed Increase
- Rounded snake + eyes
- iframe safe
*/

const cvs = document.getElementById("snake");
const ctx = cvs.getContext("2d");

const box = 32;
const PLAY_MIN_X = 1 * box;
const PLAY_MAX_X = 17 * box;
const PLAY_MIN_Y = 3 * box;
const PLAY_MAX_Y = 17 * box;
// ================= ASSETS =================
const ground = new Image();
ground.src = "img/ground.png";

const foodImg = new Image();
foodImg.src = "img/food.png";

// Sounds
const dead = new Audio("audio/dead.mp3");
const eat = new Audio("audio/eat.mp3");
const up = new Audio("audio/up.mp3");
const right = new Audio("audio/right.mp3");
const left = new Audio("audio/left.mp3");
const down = new Audio("audio/down.mp3");

// ================= GAME STATE =================
let snake;
let food;
let score;
let d = "RIGHT";          // ⭐ 預設方向
let game = null;
let speed = 120;
const MIN_SPEED = 50;
let isPaused = false;
let isRunning = false;

// ================= INIT =================
showStartScreen();

// ================= INPUT =================
document.addEventListener("keydown", e => {
  if (!isRunning) return;

  const key = e.keyCode;
  if (key === 37 && d !== "RIGHT") { left.play(); d = "LEFT"; }
  else if (key === 38 && d !== "DOWN") { up.play(); d = "UP"; }
  else if (key === 39 && d !== "LEFT") { right.play(); d = "RIGHT"; }
  else if (key === 40 && d !== "UP") { down.play(); d = "DOWN"; }
  else if (key === 32) togglePause(); // Space
});

// ================= GAME FLOW =================
function startGame() {
  clearInterval(game);

  snake = [{ x: 9 * box, y: 10 * box }];
  score = 0;
  d = "RIGHT";
  speed = 120;
  isPaused = false;
  isRunning = true;

  food = generateFood();
  game = setInterval(draw, speed);
}

function togglePause() {
  isPaused = !isPaused;
}

function endGame() {
  clearInterval(game);
  isRunning = false;
  dead.play();

  try {
    window.parent.postMessage({
      type: "gameScore",
      gameCode: "SNAKE",
      gameId: 2,
      score: score
    }, "*");
  } catch { }

  showRestartButton();
}

// ================= FOOD =================
function generateFood() {
  let pos;
  do {
    pos = {
      x: (Math.floor(Math.random() * (PLAY_MAX_X / box - PLAY_MIN_X / box + 1)) + (PLAY_MIN_X / box)) * box,
      y: (Math.floor(Math.random() * (PLAY_MAX_Y / box - PLAY_MIN_Y / box + 1)) + (PLAY_MIN_Y / box)) * box
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}


// ================= DRAW =================
function draw() {
  if (isPaused) {
    drawPauseOverlay();
    return;
  }

  ctx.drawImage(ground, 0, 0);

  // Draw snake
  snake.forEach((s, i) => {
    if (i === 0) drawSnakeHead(s.x, s.y, d);
    else drawSnakeBody(s.x, s.y);
  });

  ctx.drawImage(foodImg, food.x, food.y);

  let head = { ...snake[0] };

  if (d === "LEFT") head.x -= box;
  else if (d === "UP") head.y -= box;
  else if (d === "RIGHT") head.x += box;
  else if (d === "DOWN") head.y += box;

  if (isWallCollision(head) || isSelfCollision(head)) {
    endGame();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    eat.play();
    food = generateFood();
    increaseSpeed();
  } else {
    snake.pop();
  }

  snake.unshift(head);

  drawScore();
}

// ================= COLLISION =================
function isWallCollision(h) {
  return (
    h.x < PLAY_MIN_X || h.x > PLAY_MAX_X ||
    h.y < PLAY_MIN_Y || h.y > PLAY_MAX_Y
  );
}


function isSelfCollision(h) {
  return snake.slice(1).some(p => p.x === h.x && p.y === h.y);
}

// ================= SPEED =================
function increaseSpeed() {
  if (speed > MIN_SPEED) {
    speed -= 5;
    clearInterval(game);
    game = setInterval(draw, speed);
  }
}

// ================= UI =================
function drawScore() {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.font = "28px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`Score: ${score}`, cvs.width - box, 1.6 * box); // 右上角
  ctx.restore();
}


function drawPauseOverlay() {
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("PAUSED", cvs.width / 2, cvs.height / 2);
}

function showStartScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Click to Start", cvs.width / 2, cvs.height / 2);
  cvs.addEventListener("click", startClickHandler);
}

function showRestartButton() {
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);

  ctx.fillStyle = "white";
  ctx.font = "36px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", cvs.width / 2, cvs.height / 2 - 30);
  ctx.fillText("Click to Restart", cvs.width / 2, cvs.height / 2 + 30);

  cvs.addEventListener("click", startClickHandler);
}

function startClickHandler() {
  cvs.removeEventListener("click", startClickHandler);
  startGame();
}

// ================= SNAKE DRAW =================
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

function drawSnakeBody(x, y) {
  ctx.fillStyle = "#66BB6A";
  ctx.beginPath();
  ctx.roundRect(x, y, box, box, 6);
  ctx.fill();
}
