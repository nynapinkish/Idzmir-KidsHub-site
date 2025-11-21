let score = 0;
let currentRotation = 0;
let roundsCompleted = 0;
const maxRounds = 6; // 6 letters total

// Mapping items to letters
const itemLetters = {
  'iceCube': 'A',    // top-right
  'ball': 'B',       // bottom
  'key': 'K',        // bottom-left
  'newspaper': 'S',  // right
  'table': 'M',      // left
  'yoyo': 'Y'        // top
};

const letters = [
  { big: 'S', small: 's', items: ['newspaper'] },
  { big: 'A', small: 'a', items: ['iceCube'] },
  { big: 'B', small: 'b', items: ['ball'] },
  { big: 'K', small: 'k', items: ['key'] },
  { big: 'M', small: 'm', items: ['table'] },
  { big: 'Y', small: 'y', items: ['yoyo'] }
];

let currentLetterIndex = 0;

const wheelContainer = document.getElementById('wheelContainer');
const wheel = document.getElementById('wheel');
const letterBig = document.getElementById('letterBig');
const letterSmall = document.getElementById('letterSmall');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const scoreDisplay = document.getElementById('scoreDisplay');
const nextBtnContainer = document.getElementById('nextBtnContainer');

let isDragging = false;
let startAngle = 0;
let currentAngle = 0;
let hasChecked = false;

// Mouse events
wheelContainer.addEventListener('mousedown', (e) => {
  e.preventDefault();
  isDragging = true;
  hasChecked = false;
  
  const rect = wheelContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  currentAngle = currentRotation;
});

document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  
  const rect = wheelContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const mouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
  const deltaAngle = mouseAngle - startAngle;
  
  currentRotation = currentAngle + deltaAngle;
  wheel.style.transform = `rotate(${currentRotation}deg)`;
});

document.addEventListener('mouseup', () => {
  if (!isDragging) return;
  isDragging = false;
  
  if (!hasChecked) {
    setTimeout(() => {
      checkAnswer();
    }, 300);
    hasChecked = true;
  }
});

// Touch events
wheelContainer.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDragging = true;
  hasChecked = false;
  
  const rect = wheelContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const touch = e.touches[0];
  startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI);
  currentAngle = currentRotation;
});

document.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  e.preventDefault();
  
  const rect = wheelContainer.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  const touch = e.touches[0];
  const touchAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * (180 / Math.PI);
  const deltaAngle = touchAngle - startAngle;
  
  currentRotation = currentAngle + deltaAngle;
  wheel.style.transform = `rotate(${currentRotation}deg)`;
}, { passive: false });

document.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  
  if (!hasChecked) {
    setTimeout(() => {
      checkAnswer();
    }, 300);
    hasChecked = true;
  }
});

function getCurrentVisibleItem() {
  // Window is at bottom, so we check which item is at bottom position
  // Items are positioned: ball(bottom), key(bottom-left), table(left), yoyo(top), iceCube(top-right), newspaper(right)
  const normalizedAngle = ((-currentRotation % 360) + 360) % 360;
  
  let currentItem;
  // Expanded ranges - more forgiving detection (70° instead of 60° for each slice)
  if (normalizedAngle >= 325 || normalizedAngle < 35) {
    currentItem = 'ball'; // bottom slice - expanded range
  } else if (normalizedAngle >= 25 && normalizedAngle < 95) {
    currentItem = 'newspaper'; // bottom-right - expanded range (S)
  } else if (normalizedAngle >= 85 && normalizedAngle < 155) {
    currentItem = 'iceCube'; // right - expanded range (A)
  } else if (normalizedAngle >= 145 && normalizedAngle < 215) {
    currentItem = 'yoyo'; // top-right - expanded range (Y)
  } else if (normalizedAngle >= 205 && normalizedAngle < 275) {
    currentItem = 'table'; // top - expanded range (M)
  } else {
    currentItem = 'key'; // top-left - expanded range (K)
  }
  
  console.log(`Angle: ${normalizedAngle.toFixed(1)}°, Item: ${currentItem}`); // Debug
  return currentItem;
}

function checkAnswer() {
  const currentItem = getCurrentVisibleItem();
  const currentLetter = letters[currentLetterIndex];
  
  // Check if current visible item matches the current letter
  if (currentLetter.items.includes(currentItem)) {
    showMessage('🎉 Betul!', 'correct');
    updateScore(10);
    roundsCompleted++;
    
    setTimeout(() => {
      if (roundsCompleted >= maxRounds) {
        endGame();
      } else {
        nextLetter();
      }
    }, 1500);
  } else {
    showMessage('❌ Cuba lagi!', 'wrong');
  }
}

function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
}

function showMessage(text, type) {
  messageText.textContent = text;
  messageBox.className = 'message show ' + type;
  setTimeout(() => {
    messageBox.classList.remove('show');
  }, 1500);
}

function nextLetter() {
  currentLetterIndex = (currentLetterIndex + 1) % letters.length;
  const newLetter = letters[currentLetterIndex];
  letterBig.textContent = newLetter.big;
  letterSmall.textContent = newLetter.small;
}

function endGame() {
  showMessage(`🎊 Tamat! Markah: ${score}/${maxRounds * 10}`, 'correct');
  setTimeout(() => {
    nextBtnContainer.style.display = 'block';
  }, 2000);
}