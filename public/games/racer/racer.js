window.addEventListener('load', () => {
  document.body.focus();
});
document.addEventListener('click', () => {
  document.body.focus();
});
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const speedEl = document.getElementById('speed');
const tipEl = document.getElementById('tip');

const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const restartBtn = document.getElementById('restartBtn');

const W = canvas.width;
const H = canvas.height;

// ===== 賽道設定（上下三條）=====
const lanes = 3;
const roadPadding = 24;
const roadH = H - roadPadding * 2;
const laneH = roadH / lanes;
const roadY = roadPadding;

// ===== 車子（樣子不變，只換位置）=====
const car = {
  lane: 1,
  w: 86,
  h: laneH * 0.55,
  x: 120   // 固定在左側
};

// ===== 狀態 =====
let obstacles = [];
let running = true;
let score = 0;
let speed = 7.5;
let speedMul = 1.0;
let lastSpawn = 0;
let spawnEvery = 800;
let lastFrame = performance.now();
let accTime = 0;

let best = Number(localStorage.getItem('racer_best') || 0);
bestEl.textContent = `Best: ${best}`;

// ===== 工具 =====
function laneCenterY(lane) {
  return roadY + laneH * lane + laneH / 2;
}

function carRect() {
  return {
    x: car.x - car.w / 2,
    y: laneCenterY(car.lane) - car.h / 2,
    w: car.w,
    h: car.h
  };
}

function rectHit(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}

// ===== 控制（完全保留左右）=====
function moveUp() { if (running) car.lane = Math.max(0, car.lane - 1); }
function moveDown() { if (running) car.lane = Math.min(lanes - 1, car.lane + 1); }

upBtn.onclick = moveUp;
downBtn.onclick = moveDown;

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') moveUp();
  if (e.key === 'ArrowDown') moveDown();
});

// ===== 重置 =====
restartBtn.onclick = reset;

function reset() {
  running = true;
  score = 0;
  speedMul = 1.0;
  accTime = 0;
  obstacles = [];
  car.lane = 1;
  tipEl.textContent = '▲ ▼ 切換賽道，躲避障礙物';
}

// ===== 產生障礙物（從右邊來）=====
function spawnObstacle() {
  obstacles.push({
    lane: Math.floor(Math.random() * lanes),
    x: W + 80,
    w: 52,
    h: 52,
    type: Math.random() < 0.5 ? 'cone' : 'block'
  });
}

// ===== 繪製 =====
function drawRoad() {
  ctx.fillStyle = '#0b122b';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(229,231,235,0.2)';
  ctx.lineWidth = 2;
  for (let i = 1; i < lanes; i++) {
    const y = roadY + laneH * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawCar() {
  const r = carRect();

  // 車身
  ctx.fillStyle = running ? '#22c55e' : '#64748b';
  roundRect(r.x, r.y, r.w, r.h, 16);
  ctx.fill();

  // 車窗
  ctx.fillStyle = 'rgba(2,6,23,0.65)';
  roundRect(
    r.x + r.w * 0.35,
    r.y + r.h * 0.18,
    r.w * 0.45,
    r.h * 0.35,
    10
  );
  ctx.fill();

  // 車頭燈（右邊）
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(
    r.x + r.w - 6,
    r.y + r.h * 0.22,
    4,
    r.h * 0.18
  );
  ctx.fillRect(
    r.x + r.w - 6,
    r.y + r.h * 0.60,
    4,
    r.h * 0.18
  );

  // 輪胎
  ctx.fillStyle = '#020617';
  const wheelW = 6;
  const wheelH = r.h * 0.28;
  ctx.fillRect(r.x + 8, r.y + 4, wheelW, wheelH);
  ctx.fillRect(r.x + 8, r.y + r.h - wheelH - 4, wheelW, wheelH);
  ctx.fillRect(r.x + r.w - 14, r.y + 4, wheelW, wheelH);
  ctx.fillRect(r.x + r.w - 14, r.y + r.h - wheelH - 4, wheelW, wheelH);
}

function drawObstacles() {
  obstacles.forEach(o => {
    o.x -= speed * speedMul;
    const y = laneCenterY(o.lane) - o.h / 2;

    if (o.type === 'cone') {
      // 🟧 三角錐
      ctx.fillStyle = '#f97316';
      roundRect(o.x - o.w / 2, y, o.w, o.h, 10);
      ctx.fill();

      ctx.fillStyle = 'rgba(2,6,23,0.4)';
      ctx.fillRect(
        o.x - o.w / 2 + o.w * 0.15,
        y + o.h * 0.45,
        o.w * 0.7,
        6
      );
    } else {
      // 🟥 路障
      ctx.fillStyle = '#ef4444';
      roundRect(o.x - o.w / 2, y, o.w, o.h, 12);
      ctx.fill();

      ctx.fillStyle = 'rgba(2,6,23,0.45)';
      roundRect(
        o.x - o.w / 2 + o.w * 0.15,
        y + o.h * 0.2,
        o.w * 0.7,
        o.h * 0.25,
        8
      );
      ctx.fill();
    }

    // 碰撞判斷（完全不變）
    if (running) {
      const hit = rectHit(
        carRect(),
        { x: o.x - o.w / 2, y, w: o.w, h: o.h }
      );
      if (hit) {
        running = false;
        tipEl.textContent = '💥 撞到了！點「再玩一次」';
        if (Math.floor(score) > best) {
          best = Math.floor(score);
          localStorage.setItem('racer_best', best);
        }
      }
    }
  });

  obstacles = obstacles.filter(o => o.x + o.w > 0);
}

// ===== 主迴圈 =====
function loop(now) {
  const dt = Math.min(40, now - lastFrame);
  lastFrame = now;

  if (running) {
    accTime += dt;
    score += dt * 0.02;
    speedMul = Math.min(3, 1 + accTime / 40000);
    spawnEvery = Math.max(420, 800 - accTime / 120);

    lastSpawn += dt;
    if (lastSpawn > spawnEvery) {
      lastSpawn = 0;
      spawnObstacle();
    }
  }

  drawRoad();
  drawObstacles();
  drawCar();

  scoreEl.textContent = `Score: ${Math.floor(score)}`;
  speedEl.textContent = `Speed: ${speedMul.toFixed(1)}x`;

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
