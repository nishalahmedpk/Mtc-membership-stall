const buttons = {
  green: document.getElementById('green'),
  red: document.getElementById('red'),
  yellow: document.getElementById('yellow'),
  blue: document.getElementById('blue'),
  purple: document.getElementById('purple'),
  orange: document.getElementById('orange'),
};
const levelNames = {
  1: "Beginner",
  2: "Novice",
  3: "Skilled",
  4: "Expert",
  5: "Master"
};

const levelDisplay = document.getElementById('level-display');
function updateLevelDisplay() {
  if (level >= 1 && level <= 5) {
    levelDisplay.textContent = `Level ${level} - ${levelNames[level]}`;
  } else {
    levelDisplay.textContent = '';
  }
}
const startBtn = document.getElementById('start-btn');
const message = document.getElementById('message');
const gameDiv = document.getElementById('game');

let sequence = [];
let playerSequence = [];
let level = 0;
let acceptingInput = false;

const allColors = ['green', 'red', 'yellow', 'blue', 'purple', 'orange'];

// Sounds for each color
const standardSound = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function highlightButton(color) {
  buttons[color].classList.add('active');
  await sleep(randomSpeed());
  buttons[color].classList.remove('active');
  await sleep(200);
}

// Random speed between 350ms and 600ms
function randomSpeed() {
  return Math.floor(Math.random() * 250) + 350;
}

function swapColors() {
  const colorsArray = [...allColors];
  for (let i = colorsArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [colorsArray[i], colorsArray[j]] = [colorsArray[j], colorsArray[i]];
  }

  while (gameDiv.firstChild) {
    gameDiv.removeChild(gameDiv.firstChild);
  }

  colorsArray.forEach(color => {
    gameDiv.appendChild(buttons[color]);
  });
}

// Show the sequence to player
async function playSequence() {
  acceptingInput = false;

  if (level > 5) {
    // Show congrats UI and end game
    showCongrats();
    return;
  }

  message.textContent = `Level ${level} - ${levelNames[level]}: Watch the sequence`;


  if (level >= 3) swapColors();

  // Progressive opacity fade
  const fadeAmount = Math.min(0.6, 1 - level * 0.05);
  Object.values(buttons).forEach(btn => {
    btn.style.opacity = fadeAmount;
  });

  if (level <= 7) {
    // Only flash the NEW step (last color)
    await highlightButton(sequence[sequence.length - 1]);
  } else {
    // (Optional fallback: flash full sequence — but we never reach here)
    for (let color of sequence) {
      await highlightButton(color);
    }
  }

  // Restore full opacity for player's turn
  Object.values(buttons).forEach(btn => {
    btn.style.opacity = 1;
  });

  message.textContent = `Your turn: Repeat the full sequence`;
  acceptingInput = true;
  playerSequence = [];
}

function nextStep() {
  const randomColor = allColors[Math.floor(Math.random() * allColors.length)];
  sequence.push(randomColor);
  level++;
  updateLevelDisplay();
  playSequence();
}

function checkInput(color) {
  if (!acceptingInput) return;

  playerSequence.push(color);
  const currentIndex = playerSequence.length - 1;

  if (playerSequence[currentIndex] !== sequence[currentIndex]) {
    gameOver();
    return;
  }

  highlightButton(color);

  if (playerSequence.length === sequence.length) {
    acceptingInput = false;
    message.textContent = 'Good! Get ready for next round...';
    setTimeout(nextStep, 800);
  }
}

function gameOver() {
  acceptingInput = false;
  message.textContent = `Game Over! You reached level ${level}. Press Start to try again.`;
  sequence = [];
  playerSequence = [];
  level = 0;

  // Reset buttons to original order and opacity
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
  allColors.forEach(color => {
    buttons[color].style.opacity = 0.7;
    gameDiv.appendChild(buttons[color]);
  });

  startBtn.style.display = 'inline-block';
}

// Show congratulations UI
// Show congratulations UI
function showCongrats() {
  acceptingInput = false;
  message.textContent = '';
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);

  const congratsDiv = document.createElement('div');
  congratsDiv.style.color = '#00ff00';
  congratsDiv.style.fontSize = '2rem';
  congratsDiv.style.fontWeight = 'bold';
  congratsDiv.style.padding = '40px';
  congratsDiv.style.border = '3px solid #00ff00';
  congratsDiv.style.borderRadius = '20px';
  congratsDiv.style.backgroundColor = '#003300';
  congratsDiv.style.textAlign = 'center';
  congratsDiv.style.display = 'inline-block';
  congratsDiv.style.whiteSpace = 'normal';
  congratsDiv.style.lineHeight = '1.2';
  congratsDiv.style.maxWidth = '400px';
  congratsDiv.style.margin = '0 auto';
  congratsDiv.textContent = '🎉 Congratulations! You mastered the game! 🎉';

  gameDiv.style.display = 'flex';
  gameDiv.style.justifyContent = 'center';
  gameDiv.style.alignItems = 'center';
  gameDiv.style.height = '200px';

  gameDiv.appendChild(congratsDiv);

  startBtn.style.display = 'inline-block';

  // ✅ Notify Maze Challenge that Memory Sequence is done
  if (!window.memoryReported) {
    window.memoryReported = true;
    window.parent.postMessage("memory-done", "*");

    // Optional: close game after short delay
    setTimeout(() => {
      window.parent.postMessage("close-game", "*");
    }, 1500);
  }
}


for (const color in buttons) {
  buttons[color].addEventListener('click', () => checkInput(color));
}

startBtn.addEventListener('click', () => {
  startBtn.style.display = 'none';  // Hide start button during game

  sequence = [];
  playerSequence = [];
  level = 0;
  updateLevelDisplay();
  message.textContent = 'Get ready!';
  // Reset buttons to original order and opacity on game start
  while (gameDiv.firstChild) gameDiv.removeChild(gameDiv.firstChild);
  allColors.forEach(color => {
    buttons[color].style.opacity = 0.7;
    gameDiv.appendChild(buttons[color]);
  });
  setTimeout(nextStep, 1000);
});
