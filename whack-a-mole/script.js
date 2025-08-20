const holes = document.querySelectorAll('.hole');
const scoreBoard = document.querySelector('.score');
const moles = document.querySelectorAll('.mole');
const button = document.querySelector('#start');
let lastHole;
let timeUp = false;
let score = 0;

function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function randomHole(holes) {
  const idx = Math.floor(Math.random() * holes.length);
  const hole = holes[idx];

  if(hole === lastHole) {
    console.log('Same one');
    return randomHole(holes);
  }

  lastHole = hole;
  return hole;
}

function peep() {
  const time = randomTime(200, 1000);
  const hole = randomHole(holes);
  hole.classList.add('up');
  setTimeout(() => {
    hole.classList.remove('up');
    if(!timeUp) peep();
  }, time);
}

function startGame() {
  scoreBoard.textContent = 0;
  timeUp = false;
  score = 0;
  button.style.visibility = 'hidden';
  peep();
  setTimeout(() => {
    timeUp = true;
    button.innerHTML = 'Try again?'
    button.style.visibility = 'visible';
  }, 10000);
}

// function bonk(e) {
//   if(!e.isTrusted) return;
//   score++;
//   this.classList.remove('up');
//   scoreBoard.textContent = score;
// }
const modal = document.getElementById('congratsModal');
const closeModal = document.getElementById('closeModal');
const playAgainBtn = document.getElementById('playAgain');

function bonk(e) {
  if (!e.isTrusted) return;
  score++;
  this.classList.remove('up');
  scoreBoard.textContent = score;

  if (score === 8) {// to change the target score
    timeUp = true;            // stop game early
    button.innerHTML = 'Try again?';
    button.style.visibility = 'visible';
    modal.style.display = 'flex'; // show modal
    window.parent.postMessage("mole-done", "*");
  }
  
}

// Close modal when clicking the X
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Close modal and restart game when clicking Play Again
playAgainBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  startGame();
});

// Also optionally close modal if user clicks outside modal content




moles.forEach(mole => mole.addEventListener('click', bonk));