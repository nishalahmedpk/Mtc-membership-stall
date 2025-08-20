// Global variables
let mazeNodes = {};
let player = { x: 1, y: 1 };
let finish = { x: 0, y: 0 };
let mazeMatrix = [];
let lastPlayerPos = { x: null, y: null };
let keyHandlerAttached = false;
let solver = null;

let startTime = null;
let timerInterval = null;

if (typeof maxMaze === 'undefined') maxMaze = 0;
if (typeof maxSolve === 'undefined') maxSolve = 0;
if (typeof maxCanvas === 'undefined') maxCanvas = 0;
if (typeof maxCanvasDimension === 'undefined') maxCanvasDimension = 0;
if (typeof maxWallsRemove === 'undefined') maxWallsRemove = 300;

const removeMaxWallsText = document.querySelector('.desc span');
if (removeMaxWallsText) removeMaxWallsText.innerHTML = maxWallsRemove;

// ===== Initialize Maze =====
function initMaze() {
  const settings = {
    width:  15, // increase for larger mazes
    height: 15,
    wallSize: 20,
    entryType: 'vertical',
    bias: '',
    color: '#000000',
    backgroundColor: '#FFFFFF',
    solveColor: '#A52A2A',
    removeWalls: 0,
    maxMaze: maxMaze,
    maxCanvas: maxCanvas,
    maxCanvasDimension: maxCanvasDimension,
    maxSolve: maxSolve,
    maxWallsRemove: maxWallsRemove,
  };

  const maze = new Maze(settings);
  maze.generate();
  maze.draw();
  mazeNodes = maze;

  // Setup player and maze state
  player.x = maze.entryNodes.start.x;
  player.y = maze.entryNodes.start.y;
  finish.x = maze.entryNodes.end.x;
  finish.y = maze.entryNodes.end.y;
  mazeMatrix = maze.matrix;

  drawPlayer();

  // Start timer
  startTime = Date.now();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = `Time: ${elapsed}s`;

    // Fail if more than 60 seconds
    if (elapsed >= 70) { // to change the fail time, change this value
      clearInterval(timerInterval);
      showFailPopup();
    }
  }, 1000);

  // Attach movement key handler once
  if (!keyHandlerAttached) {
    window.addEventListener('keydown', handleMovement);
    keyHandlerAttached = true;
  }
}

// ===== Solve Maze =====
function initSolve() {
  if (!mazeNodes || !mazeNodes.matrix.length) return;

  solver = new Solver(mazeNodes);
  solver.solve();

  if (mazeNodes.wallsRemoved) {
    solver.drawAstarSolve();
  } else {
    solver.draw();
  }

  drawPlayer();
}

// ===== Draw Player & Maze Fog =====
function drawPlayer() {
  const canvas = document.getElementById('maze');
  const ctx = canvas.getContext('2d');
  if (!mazeNodes) return;

  const size = mazeNodes.wallSize;
  const visionRadius = 2;
  const fadeRadius = visionRadius + 2;

  const centerX = player.x * size + size / 2;
  const centerY = player.y * size + size / 2;

  // Offscreen maze
  const offCanvas = document.createElement('canvas');
  offCanvas.width = canvas.width;
  offCanvas.height = canvas.height;
  const offCtx = offCanvas.getContext('2d');

  // Draw walls
  offCtx.fillStyle = mazeNodes.color;
  const matrix = mazeNodes.matrix;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (parseInt(matrix[y][x]) === 1) {
        offCtx.fillRect(x * size, y * size, size, size);
      }
    }
  }

  // Draw path
  offCtx.fillStyle = '#FFFFFF';
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (parseInt(matrix[y][x]) === 0) {
        offCtx.fillRect(x * size, y * size, size, size);
      }
    }
  }

  // Draw maze to main canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(offCanvas, 0, 0);

  // Fog effect
  const gradient = ctx.createRadialGradient(
    centerX, centerY, size * visionRadius,
    centerX, centerY, size * fadeRadius
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Solution path above fog
  if (solver) {
    if (mazeNodes.wallsRemoved) {
      solver.drawAstarSolve();
    } else {
      solver.draw();
    }
  }

  // Draw player
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2.5, 0, Math.PI * 2);
  ctx.fill();
}

// ===== Handle Movement =====
function handleMovement(e) {
  const key = e.key.toLowerCase();
  const dir = {
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 },
    arrowup: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
  };

  if (!dir[key]) return;

  const dx = dir[key].x;
  const dy = dir[key].y;
  const newX = player.x + dx;
  const newY = player.y + dy;

  if (
    mazeMatrix[newY] &&
    mazeMatrix[newY][newX] !== undefined &&
    mazeMatrix[newY][newX] === '0'
  ) {
    player.x = newX;
    player.y = newY;
    drawPlayer();

    // Check win
    if (player.x === finish.x && player.y === finish.y) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      clearInterval(timerInterval);
      setTimeout(() => showWinPopup(timeTaken), 100);
    }
  }
}

// ===== Win Popup =====
function showWinPopup(seconds) {
  document.getElementById("time-taken").textContent = seconds;
  document.getElementById("win-popup").style.display = "grid";
}

function onWinPopupClose() {
  document.getElementById("win-popup").style.display = "none";
  localStorage.clear();
  location.reload();
}

// ===== Fail Popup =====
function showFailPopup() {
  document.getElementById("fail-popup").style.display = "grid";
}

function onFailPopupClose() {
  document.getElementById("fail-popup").style.display = "none";
  localStorage.clear();
  location.reload();
}
