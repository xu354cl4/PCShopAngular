document.addEventListener('DOMContentLoaded', () => {

  let startTime = null;
  let timerInterval = null;
  let gridSize = 2;

  const allSymbols = ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🥝', '🍍'];

  let cards = [];
  let flippedCards = [];
  let lockBoard = false;
  let matchedCount = 0;

  const board = document.getElementById('game-board');
  const statusText = document.getElementById('status');
  const timer = document.getElementById('timer');
  const restartBtn = document.getElementById('restartBtn');

  document.getElementById('btn2').addEventListener('click', () => startGame(2));
  document.getElementById('btn4').addEventListener('click', () => startGame(4));
  restartBtn.addEventListener('click', () => startGame(gridSize));

  function startGame(size) {
    gridSize = size;
    resetState();
    setupGrid();
    generateCards();
    statusText.textContent = '點擊兩張卡片開始';
  }

  function setupGrid() {
    board.style.gridTemplateColumns = `repeat(${gridSize}, 120px)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 120px)`;
  }

  function generateCards() {
    board.innerHTML = '';

    const pairCount = (gridSize * gridSize) / 2;
    const symbols = allSymbols.slice(0, pairCount);

    cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

    cards.forEach(symbol => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.symbol = symbol;

      card.innerHTML = `
        <div class="card-face front"></div>
        <div class="card-face back">${symbol}</div>
      `;

      card.addEventListener('click', () => flipCard(card));
      board.appendChild(card);
    });
  }

  function flipCard(card) {
    if (lockBoard) return;
    if (card.classList.contains('flipped')) return;

    startTimer();

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    const [c1, c2] = flippedCards;
    const isMatch = c1.dataset.symbol === c2.dataset.symbol;

    if (isMatch) {
      matchedCount += 2;
      flippedCards = [];

      if (matchedCount === cards.length) {
        endGame();
      }
    } else {
      lockBoard = true;
      statusText.textContent = '❌ 配對失敗';

      setTimeout(() => {
        c1.classList.remove('flipped');
        c2.classList.remove('flipped');
        flippedCards = [];
        lockBoard = false;
        statusText.textContent = '繼續配對';
      }, 700);
    }
  }

  function startTimer() {
    if (timerInterval) return;

    startTime = Date.now();
    timerInterval = setInterval(() => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      timer.textContent = `⏱ ${sec} 秒`;
    }, 500);
  }

  function endGame() {
    clearInterval(timerInterval);

    const sec = Math.floor((Date.now() - startTime) / 1000);
    timer.textContent = `🎉 完成時間：${sec} 秒`;
    statusText.textContent = '🎉 完成！';

    restartBtn.style.display = 'inline-block';
  }

  function resetState() {
    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;

    flippedCards = [];
    matchedCount = 0;
    lockBoard = false;

    timer.textContent = '⏱ 0 秒';
    restartBtn.style.display = 'none';
  }

});
