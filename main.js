// ===== Game List =====
const allGames = [
  { id: 'bullseye', label: 'Play Bullseye', path: '/bullseye/index.html', doneKey: 'bullseyeDone' },
  { id: 'card', label: 'Play Card Matching', path: '/card-matching/index.html', doneKey: 'cardsDone' },
  { id: 'mole', label: 'Play Whack-a-Mole', path: '/whack-a-mole/index.html', doneKey: 'moleDone' },
  { id: 'flappy', label: 'Play Flappy Bird', path: '/flappy-bird/index.html', doneKey: 'flappyDone' },
  { id: 'memory', label: 'Play Memory Sequence', path: '/memory-sequence/index.html', doneKey: 'memoryDone' }
];

let selectedGames = [];

// ===== Pick & Load Random Games =====
function pickRandomGames() {
  // Always include Card Matching
  const cardGame = allGames.find(g => g.id === 'card');
  // const bullseyeGame = allGames.find(g => g.id === 'bullseye'); //comment
  // const moleGame = allGames.find(g => g.id === 'mole'); //coment 
  // Pick 2 others at random from the remaining games
  const others = allGames.filter(g => g.id !== 'card');
  const shuffledOthers = others.sort(() => 0.5 - Math.random());
  const randomTwo = shuffledOthers.slice(0, 2);

  // Final selection
  selectedGames = [cardGame, ...randomTwo]; //uncomment
  // selectedGames = [cardGame, bullseyeGame, moleGame]; // comment

  // Save to localStorage
  localStorage.setItem("selectedGames", JSON.stringify(selectedGames));
}

function loadSelectedGames() {
  const saved = localStorage.getItem("selectedGames");
  if (saved) {
    selectedGames = JSON.parse(saved);
  } else {
    pickRandomGames();
  }
}

// ===== Render Mini-Game Buttons =====
function renderGamePanel() {
  const panel = document.querySelector(".game-panel");
  const buttonsHtml = selectedGames.map(game => `
    <div>
      <span id="${game.id}-tick" class="tick hidden">✅</span>
      <button onclick="launchGame('${game.id}')">${game.label}</button>
    </div>
  `).join("");

  panel.innerHTML = `<h3>🎮 Mini Games</h3>${buttonsHtml}
    <button onclick="resetProgress()" class="reset-btn">🔄 Reset Progress</button>`;
}

function resetProgress() {
  // Remove done flags for all games
  localStorage.clear();
  pickRandomGames();
  location.reload()

}


// ===== Launch Game =====
function launchGame(gameId) {
  console.log("Launching game:", gameId);
  const frame = document.getElementById("game-frame");
  const game = selectedGames.find(g => g.id === gameId);
  if (!game) return;

  frame.src = game.path;
  frame.style.display = "block";
  document.getElementById("game-modal").classList.remove("hidden");
}

// ===== Listen for Game Completion =====
window.addEventListener("message", function (event) {
  const modal = document.getElementById("game-modal");
  const iframe = document.getElementById("game-frame");

  const game = selectedGames.find(g => event.data === `${g.id}-done`);
  if (game) localStorage.setItem(game.doneKey, "true");

  if (event.data?.type === "resize-iframe") {
    const { width, height } = event.data;
    const maxWidth = window.innerWidth * 0.95;
    const maxHeight = window.innerHeight * 0.95;
    iframe.style.width = Math.min(width, maxWidth) + "px";
    iframe.style.height = Math.min(height, maxHeight) + "px";
    return;
  }

  modal.classList.add("hidden");
  iframe.src = "";
  iframe.style.display = "none";

  updateTicks();
  checkAllGames();
});

// ===== Update Progress UI =====
function updateTicks() {
  selectedGames.forEach(game => {
    if (localStorage.getItem(game.doneKey) === "true") {
      document.getElementById(`${game.id}-tick`).classList.remove("hidden");
    }else {
      document.getElementById(`${game.id}-tick`).classList.add("hidden");
    }
  });

  const completedCount = selectedGames.filter(g => localStorage.getItem(g.doneKey) === "true").length;
  updateProgressBar(completedCount);
}

function updateProgressBar(completed) {
  const total = selectedGames.length;
  const percent = (completed / total) * 100;
  const fill = document.getElementById("progress-fill");
  if (fill) fill.style.width = percent + "%";
}

// ===== Restore Status =====
function restoreGameStatus() {
  updateTicks();
  checkAllGames();
}

// ===== Check If All Selected Games Done =====
function checkAllGames() {
  if (selectedGames.length === 0) return;
  const allDone = selectedGames.every(g => localStorage.getItem(g.doneKey) === "true");
  
  if (allDone) {
    document.getElementById("unlock-popup").classList.remove("hidden");
    initSolve(); // ✅ Auto-show maze path
  }
}

function closeUnlockPopup() {
  document.getElementById("unlock-popup").classList.add("hidden");
}

// ===== On Load =====
window.onload = function () {
  loadSelectedGames();
  renderGamePanel();
  updateTicks();
  checkAllGames();
};

window.addEventListener("resize", () => {
  const iframe = document.getElementById("game-frame");
  if (!iframe.style.width || !iframe.style.height) return;
  const maxWidth = window.innerWidth * 0.95;
  const maxHeight = window.innerHeight * 0.95;
  iframe.style.width = Math.min(parseInt(iframe.style.width), maxWidth) + "px";
  iframe.style.height = Math.min(parseInt(iframe.style.height), maxHeight) + "px";
});
