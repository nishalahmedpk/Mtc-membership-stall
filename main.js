// ===== Supabase Configuration =====
const SUPABASE_URL = 'https://ufdcgppdlcqyjjyskkbj.supabase.co'; // Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZGNncHBkbGNxeWpqeXNra2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQyMTMsImV4cCI6MjA3MTUxMDIxM30.aaWBE-I52WSQLe-6X5GqG8XOp7ow4jncmVR62G8tHtM'; // Replace with your Supabase anon key

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== Game List =====
const allGames = [
  { id: 'bullseye', label: 'Play Bullseye', path: './bullseye/index.html', doneKey: 'bullseyeDone' },
  { id: 'card', label: 'Play Card Matching', path: './card-matching/index.html', doneKey: 'cardsDone' },
  { id: 'mole', label: 'Play Whack-a-Mole', path: './whack-a-mole/index.html', doneKey: 'moleDone' },
  { id: 'flappy', label: 'Play Flappy Bird', path: './flappy-bird/index.html', doneKey: 'flappyDone' },
  { id: 'memory', label: 'Play Memory Sequence', path: './memory-sequence/index.html', doneKey: 'memoryDone' }
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
  
  // Check if maze has been generated
  const mazeGenerated = localStorage.getItem('mazeGenerated') === 'true';
  
  const buttonsHtml = selectedGames.map(game => {
    const isCompleted = localStorage.getItem(game.doneKey) === "true";
    const disabled = !mazeGenerated ? 'disabled' : '';
    const buttonText = !mazeGenerated ? '❓ ???' : 
                     isCompleted ? `✅ ${game.label}` : game.label;
    
    return `
      <div class="game-item">
        <button id="${game.id}-btn" onclick="launchGame('${game.id}')" ${disabled}>${buttonText}</button>
      </div>
    `;
  }).join("");

  panel.innerHTML = `${buttonsHtml}
    <div class="game-item">
      <button onclick="localStorage.clear(); location.reload();" class="reset-btn">🔄 Reset</button>
    </div>`;
}

function resetProgress() {
  // Remove done flags for all games and maze generated flag
  localStorage.clear();
  pickRandomGames();
  location.reload();
}

// ===== Generate Maze Wrapper =====
function generateMaze() {
  // Check if maze is already generated
  if (localStorage.getItem('mazeGenerated') === 'true') {
    alert('Maze has already been generated!');
    return;
  }
  
  // Call the original initMaze function
  if (typeof initMaze === 'function') {
    initMaze();
  }
}

// ===== Launch Game =====
function launchGame(gameId) {
  console.log("Launching game:", gameId);
  
  // Check if maze has been generated
  if (localStorage.getItem('mazeGenerated') !== 'true') {
    alert('Please generate the maze first!');
    return;
  }
  
  // Check if game is already completed
  const game = selectedGames.find(g => g.id === gameId);
  if (!game) return;
  
  if (localStorage.getItem(game.doneKey) === "true") {
    alert('You have already completed this game!');
    return;
  }
  
  const frame = document.getElementById("game-frame");
  frame.src = game.path;
  frame.style.display = "block";
  document.getElementById("game-modal").classList.remove("hidden");
}

// ===== Exit Game =====
function exitGame() {
  const modal = document.getElementById("game-modal");
  const iframe = document.getElementById("game-frame");
  
  modal.classList.add("hidden");
  iframe.src = "";
  iframe.style.display = "none";
}

// ===== Keyboard Controls =====
document.addEventListener("keydown", function(event) {
  // ESC key to exit game
  if (event.key === "Escape" || event.keyCode === 27) {
    const modal = document.getElementById("game-modal");
    if (!modal.classList.contains("hidden")) {
      exitGame();
    }
  }
});

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
function updateButtonStates() {
  const mazeGenerated = localStorage.getItem('mazeGenerated') === 'true';
  
  selectedGames.forEach(game => {
    const button = document.getElementById(`${game.id}-btn`);
    if (!button) return;
    
    const isCompleted = localStorage.getItem(game.doneKey) === "true";
    
    if (!mazeGenerated) {
      button.disabled = true;
      button.textContent = '❓ ???';
    } else {
      button.disabled = isCompleted;
      button.textContent = isCompleted ? `✅ ${game.label}` : game.label;
    }
  });

  const completedCount = selectedGames.filter(g => localStorage.getItem(g.doneKey) === "true").length;
  updateProgressBar(completedCount);
}

// Keep updateTicks for backward compatibility but redirect to new function
function updateTicks() {
  updateButtonStates();
}

function updateProgressBar(completed) {
  const total = selectedGames.length;
  const percent = (completed / total) * 100;
  const fill = document.getElementById("progress-fill");
  if (fill) fill.style.width = percent + "%";
}

// ===== Restore Status =====
function restoreGameStatus() {
  updateButtonStates();
  checkAllGames();
}

// ===== Enable Games After Maze Generation =====
function enableGamesAfterMazeGeneration() {
  localStorage.setItem('mazeGenerated', 'true');
  updateButtonStates();
  updateGenerateButtonState();
}

// ===== Update Generate Button State =====
function updateGenerateButtonState() {
  const generateBtn = document.querySelector('.generate-btn');
  const mazeGenerated = localStorage.getItem('mazeGenerated') === 'true';
  
  if (generateBtn) {
    if (mazeGenerated) {
      generateBtn.disabled = true;
      generateBtn.textContent = '✅ Maze Generated';
      generateBtn.style.opacity = '0.5';
      generateBtn.style.cursor = 'not-allowed';
    } else {
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Maze';
      generateBtn.style.opacity = '1';
      generateBtn.style.cursor = 'pointer';
    }
  }
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
  updateButtonStates(); // Use the new function instead of updateTicks
  updateGenerateButtonState(); // Set initial generate button state
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

// ===== Score Submission to Supabase =====
async function submitScore() {
  const studentId = document.getElementById('student-id').value.trim();
  const timeTakenElement = document.getElementById('time-taken');
  const timeTakenMs = parseInt(timeTakenElement.dataset.milliseconds); // Get milliseconds from data attribute
  const errorDiv = document.getElementById('id-error');
  
  // Validate 13-character ID
  if (studentId.length !== 13) {
    errorDiv.classList.remove('hidden');
    return;
  }
  
  errorDiv.classList.add('hidden');
  
  try {
    // Get current timestamp with milliseconds
    const timestamp = new Date().toISOString();
    
    // Insert data into Supabase
    const { data, error } = await supabase
      .from('maze_completions') // Replace 'maze_completions' with your table name
      .insert([
        {
          student_id: studentId,
          completion_time: timeTakenMs, // Store time in milliseconds
          timestamp: timestamp
        }
      ]);

    if (error) {
      console.error('Error submitting score:', error);
      alert('Error submitting score. Please try again.');
      return;
    }

    console.log('Score submitted successfully:', data);
    
    // Close popup and reset
    onWinPopupClose();
    
  } catch (error) {
    console.error('Network error:', error);
    alert('Network error. Please check your connection and try again.');
  }
}

// ===== Modified Win Popup Close Function =====
function onWinPopupClose() {
  document.getElementById("win-popup").style.display = "none";
  localStorage.clear();
  location.reload();
}
