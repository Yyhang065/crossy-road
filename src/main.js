let gameStarted = false;

const homeScreen = document.getElementById('home-screen');
const startBtn = document.getElementById('start-btn');
const logBtn = document.getElementById('log-btn');
const logModal = document.getElementById('log-modal');
const closeLogBtn = document.getElementById('close-log-btn');

function startGame() {
  gameStarted = true;
  if (homeScreen) {
    homeScreen.classList.add('hidden');
  }
}

if (startBtn) {
  startBtn.addEventListener('click', startGame);
  startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startGame();
  });
}

// Log modal controls
if (logBtn && logModal && closeLogBtn) {
  const openModal = () => logModal.classList.remove('hidden');
  const closeModal = () => logModal.classList.add('hidden');

  logBtn.addEventListener('click', openModal);
  logBtn.addEventListener('touchstart', (e) => { e.preventDefault(); openModal(); });

  closeLogBtn.addEventListener('click', closeModal);
  closeLogBtn.addEventListener('touchstart', (e) => { e.preventDefault(); closeModal(); });
}
