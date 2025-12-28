let startTime = null;
let timerInterval = null;
const restartBtn = document.getElementById('restartBtn');

const symbols = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥝', '🍍'];
let cards = [...symbols, ...symbols];

let flippedCards = [];
let lockBoard = false;
let matchedCount = 0;

const board = document.getElementById('game-board');
const statusText = document.getElementById('status');

// 洗牌
cards.sort(() => Math.random() - 0.5);

// 建立卡片
cards.forEach(symbol => {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.symbol = symbol;

  card.innerHTML = `
    <div class="card-face front"></div>
    <div class="card-face back">${symbol}</div>
  `;

  card.addEventListener('click', () => flipCard(card));
  board.appendChild(card);
});

function flipCard(card) {
  if (lockBoard) return;
  if (card.classList.contains('flipped')) return;

  // ⭐ 第一次翻牌時開始計時
  startTimer();

  card.classList.add('flipped');
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    checkMatch();
  }
}


function checkMatch() {
  const [card1, card2] = flippedCards;
  const isMatch = card1.dataset.symbol === card2.dataset.symbol;

  if (isMatch) {
    // ⭐ 保持翻開 + 標記已完成
    card1.classList.add('matched');
    card2.classList.add('matched');

    matchedCount += 2;
    flippedCards = [];

    if (matchedCount === cards.length) {
      clearInterval(timerInterval);

      const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
      document.getElementById('timer').textContent =
        `🎉 完成時間：${totalSeconds} 秒`;

      statusText.textContent = '🎉 恭喜完成所有配對！';
      restartBtn.style.display = 'inline-block'; // ⭐ 顯示按鈕
    }
  } else {
    lockBoard = true;
    statusText.textContent = '❌ 配對失敗，再試一次';

    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      flippedCards = [];
      lockBoard = false;
      statusText.textContent = '繼續配對吧';
    }, 900);
  }
  if (matchedCount === cards.length) {
    clearInterval(timerInterval);
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent =
      `🎉 完成時間：${totalSeconds} 秒`;
    statusText.textContent = '🎉 恭喜完成所有配對！';
  }

}

function startTimer() {
  if (timerInterval) return; // 避免重複啟動

  startTime = Date.now();
  timerInterval = setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('timer').textContent = `⏱ ${seconds} 秒`;
  }, 500);
}

function resetGame() {
  // 停止計時
  clearInterval(timerInterval);
  timerInterval = null;
  startTime = null;
  document.getElementById('timer').textContent = '⏱ 0 秒';

  // 清空狀態
  board.innerHTML = '';
  flippedCards = [];
  matchedCount = 0;
  lockBoard = false;

  // 重新洗牌
  cards.sort(() => Math.random() - 0.5);

  // 重新產生卡片
  cards.forEach(symbol => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.symbol = symbol;

    card.innerHTML = `
      <div class="card-face front"></div>
      <div class="card-face back">${symbol}</div>
    `;

    card.addEventListener('click', () => flipCard(card));
    board.appendChild(card);
  });

  statusText.textContent = '點擊兩張卡片開始遊戲';
  restartBtn.style.display = 'none';
}
restartBtn.addEventListener('click', resetGame);
