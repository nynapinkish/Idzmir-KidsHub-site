// ================== GAME LOGIC ==================
let selectedColor = '#FF6B6B';
let feedback = {};
let currentNumber = 0;
let isImageColored = false;
let currentCanvas = null;
let originalImageData = null;
let isAnimating = false;

// ================== COLORS ==================
const colorPalettes = [
  '../../../../assets/images/colorred.png',
  '../../../../assets/images/colororen.png',
  '../../../../assets/images/colorpurple.png',
  '../../../../assets/images/colorpink.png',
  '../../../../assets/images/colorgreen.png',
  '../../../../assets/images/colorblue.png',
  '../../../../assets/images/coloryellow.png',
  '../../../../assets/images/colormaroon.png'
];

const colorValues = ['#FF0000', '#FF8C00', '#800080', '#FF1493', '#008080', '#0000FF', '#FFFF00', '#8B0000'];

// ================== FLYING OPTIONS ==================
const flyingOptions = {
  0: [0, 3, 5, 4, 2, 1, 7, 8, 6, 9, 10],
  1: [1, 4, 2, 5, 3, 0, 8, 7, 9, 6, 10],
  2: [2, 5, 1, 6, 4, 3, 9, 0, 7, 8, 10],
  3: [3, 6, 4, 7, 5, 2, 0, 1, 8, 9, 10],
  4: [4, 7, 5, 8, 6, 3, 1, 2, 9, 0, 10],
  5: [5, 8, 6, 9, 7, 4, 2, 3, 0, 1, 10],
  6: [6, 9, 7, 0, 8, 5, 3, 4, 1, 2, 10],
  7: [7, 0, 8, 1, 9, 6, 4, 5, 2, 3, 10],
  8: [8, 1, 9, 2, 0, 7, 5, 6, 3, 4, 10],
  9: [9, 2, 0, 3, 1, 8, 6, 7, 4, 5, 10],
  10: [10, 3, 1, 4, 2, 9, 7, 8, 5, 6, 10]
};

// ================== CORRECT ANSWERS ==================
const correctAnswers = {
  0: 0, 1: 1, 2: 2, 3: 3, 4: 4,
  5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10
};

// ================== IMAGES ==================
const imagePaths = {
  0: '../../../../assets/images/zero.png',
  1: '../../../../assets/images/one.png',
  2: '../../../../assets/images/two.png',
  3: '../../../../assets/images/three.png',
  4: '../../../../assets/images/four.png',
  5: '../../../../assets/images/five.png',
  6: '../../../../assets/images/six.png',
  7: '../../../../assets/images/seven.png',
  8: '../../../../assets/images/eight.png',
  9: '../../../../assets/images/nine.png',
  10: '../../../../assets/images/ten.png'
};

const balloonPaths = {
  blue: '../../../../assets/images/baloonblue.png',
  yellow: '../../../../assets/images/baloonyellow.png'
};

// ================== MAIN POP ANIMATION ==================
function createBalloonPopAnimation(button) {
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  
  console.log('💥 BALLOON POPPING at:', centerX, centerY);
  
  // Get balloon image URL
  const computedStyle = window.getComputedStyle(button);
  const bgImage = computedStyle.backgroundImage;
  
  let balloonImageUrl = null;
  if (bgImage && bgImage !== 'none') {
    const matches = bgImage.match(/url\(['"]?(.*?)['"]?\)/);
    if (matches && matches[1]) {
      balloonImageUrl = matches[1];
      console.log('✅ Balloon image:', balloonImageUrl);
    }
  }
  
  // PHASE 1: INFLATE BALLOON (kecil ke besar)
  button.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
  button.style.transform = 'scale(1.5)';
  
  setTimeout(() => {
    // PHASE 2: POP & EXPLODE
    button.classList.add('popping');
    
    // SCREEN SHAKE
    document.body.style.animation = 'screenShake 0.3s ease';
    setTimeout(() => {
      document.body.style.animation = '';
    }, 300);
    
    // CREATE ALL EFFECTS
    if (balloonImageUrl) {
      createImageFragments(centerX, centerY, balloonImageUrl);
    }
    
    createExplosionParticles(centerX, centerY);
    createShockwave(centerX, centerY);
    createConfetti(centerX, centerY);
    createPopFlash(centerX, centerY);
    playPopSound();
    
  }, 600);
}

// ================== IMAGE FRAGMENTS ==================
function createImageFragments(x, y, imageUrl) {
  console.log('🎨 Creating fragments with:', imageUrl);
  
  const count = 10;
  
  for (let i = 0; i < count; i++) {
    const fragment = document.createElement('div');
    fragment.className = 'balloon-fragment';
    
    fragment.style.backgroundImage = `url('${imageUrl}')`;
    fragment.style.backgroundSize = 'cover';
    fragment.style.backgroundPosition = 'center';
    
    fragment.style.left = x + 'px';
    fragment.style.top = y + 'px';
    
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const distance = 100 + Math.random() * 120;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 60 + Math.random() * 60;
    const rot = Math.random() * 720 - 360;
    
    fragment.style.setProperty('--tx', tx + 'px');
    fragment.style.setProperty('--ty', ty + 'px');
    fragment.style.setProperty('--rot', rot + 'deg');
    
    document.body.appendChild(fragment);
    
    requestAnimationFrame(() => {
      fragment.classList.add('exploding');
    });
    
    setTimeout(() => fragment.remove(), 1500);
  }
}

// ================== EXPLOSION PARTICLES ==================
function createExplosionParticles(x, y) {
  for (let i = 0; i < 35; i++) {
    const particle = document.createElement('div');
    particle.className = 'explosion-particle';
    
    const size = 4 + Math.random() * 10;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.backgroundColor = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECB71', '#2563EB', '#A78BFA'][Math.floor(Math.random() * 6)];
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const velocity = 70 + Math.random() * 110;
    const px = Math.cos(angle) * velocity;
    const py = Math.sin(angle) * velocity - 40;
    
    particle.style.setProperty('--px', px + 'px');
    particle.style.setProperty('--py', py + 'px');
    
    document.body.appendChild(particle);
    
    requestAnimationFrame(() => {
      particle.classList.add('bursting');
    });
    
    setTimeout(() => particle.remove(), 1200);
  }
}

// ================== SHOCKWAVE ==================
function createShockwave(x, y) {
  const shockwave = document.createElement('div');
  shockwave.className = 'shockwave';
  shockwave.style.left = (x - 100) + 'px';
  shockwave.style.top = (y - 100) + 'px';
  
  document.body.appendChild(shockwave);
  setTimeout(() => shockwave.remove(), 800);
}

// ================== CONFETTI ==================
function createConfetti(x, y) {
  const colors = ['#FF6B6B', '#FFA500', '#FFD700', '#4ECB71', '#2563EB', '#A78BFA', '#EC4899', '#14B8A6'];
  
  for (let i = 0; i < 25; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = x + 'px';
    confetti.style.top = y + 'px';
    
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 130;
    const cx = Math.cos(angle) * dist;
    const cy = Math.sin(angle) * dist - 90 + Math.random() * 50;
    const rotation = Math.random() * 720;
    
    confetti.style.setProperty('--cx', cx + 'px');
    confetti.style.setProperty('--cy', cy + 'px');
    confetti.style.setProperty('--rotation', rotation + 'deg');
    
    document.body.appendChild(confetti);
    
    requestAnimationFrame(() => {
      confetti.classList.add('falling');
    });
    
    setTimeout(() => confetti.remove(), 1600);
  }
}

// ================== POP FLASH ==================
function createPopFlash(x, y) {
  const flash = document.createElement('div');
  flash.className = 'pop-flash';
  flash.style.left = (x - 100) + 'px';
  flash.style.top = (y - 100) + 'px';
  
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
}

// ================== SOUND EFFECT ==================
function playPopSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(850, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, audioContext.currentTime + 0.12);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.12);
  } catch (e) {
    console.log('🔇 Audio not available');
  }
}

// ================== INIT ==================
function init() {
  console.log('🎮 Initializing game...');
  renderColorGrid();
  renderAnswerButtons();
  updateCenterImage();
}

// ================== RENDER COLORS ==================
function renderColorGrid() {
  const container = document.getElementById('colorGrid');
  if (!container) return;
  
  container.innerHTML = '';
  colorPalettes.forEach((path, idx) => {
    const btn = document.createElement('button');
    btn.className = `color-btn ${selectedColor === colorValues[idx] ? 'active' : ''}`;
    btn.style.backgroundImage = `url('${path}')`;
    btn.onclick = () => {
      selectedColor = colorValues[idx];
      console.log('🎨 Color selected:', selectedColor);
      renderColorGrid();
      if (isImageColored && currentCanvas) {
        applyColorToCanvas(currentCanvas);
      }
    };
    container.appendChild(btn);
  });
}

// ================== RENDER ANSWER BUTTONS ==================
function renderAnswerButtons() {
  const container = document.getElementById('answerGrid');
  if (!container) return;
  
  container.innerHTML = '';
  const answers = flyingOptions[currentNumber];
  
  answers.forEach((answer, idx) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = answer;
    btn.dataset.answer = answer;
    
    const balloonImg = idx % 2 === 0 ? balloonPaths.blue : balloonPaths.yellow;
    btn.style.backgroundImage = `url('${balloonImg}')`;
    btn.style.backgroundSize = 'contain';
    btn.style.backgroundRepeat = 'no-repeat';
    btn.style.backgroundPosition = 'center';
    
    // EVERY BALLOON RESPONSIVE - Check if correct answer
    btn.addEventListener('click', handleBalloonClick);
    
    container.appendChild(btn);
  });
}

// ================== HANDLE BALLOON CLICK ==================
function handleBalloonClick(e) {
  const btn = e.target.closest('.answer-btn');
  if (!btn) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  if (isAnimating) return;
  
  isAnimating = true;
  
  const clickedNumber = parseInt(btn.dataset.answer);
  
  console.log('🎈 Balloon clicked:', clickedNumber, '| Current image:', currentNumber);
  
  // TRIGGER POP ANIMATION
  createBalloonPopAnimation(btn);
  
  // Move to next number after animation (regardless of which balloon clicked)
  setTimeout(() => {
    handleNextLevel();
    isAnimating = false;
  }, 800);
}

// ================== UPDATE CENTER IMAGE ==================
function updateCenterImage() {
  const container = document.getElementById('customSvgContainer');
  if (!container) return;
  
  container.innerHTML = '';
  const imagePath = imagePaths[currentNumber];
  const img = new Image();
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = 3800;
    canvas.height = 2400;
    
    currentCanvas = canvas;
    originalImageData = img;
    isImageColored = false;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    container.appendChild(canvas);
    
    // ONLY COLOR when USER CLICKS the NUMBER IMAGE
    canvas.addEventListener('click', () => {
      console.log('🎨 User clicked NUMBER image - Applying color!');
      isImageColored = true;
      applyColorToCanvas(canvas);
    });
  };
  
  img.src = imagePath;
}

// ================== APPLY COLOR ==================
function applyColorToCanvas(canvas) {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(originalImageData, 0, 0, canvas.width, canvas.height);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const rgb = hexToRgb(selectedColor);
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      data[i] = Math.round((data[i] * rgb.r) / 255);
      data[i + 1] = Math.round((data[i + 1] * rgb.g) / 255);
      data[i + 2] = Math.round((data[i + 2] * rgb.b) / 255);
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 255, g: 107, b: 107 };
}

// ================== REGENERATE BALLOON NUMBERS ==================
function regenerateBalloonNumbers() {
  const answers = flyingOptions[currentNumber];
  const buttons = document.querySelectorAll('.answer-btn');
  
  // Shuffle the answers array
  const shuffled = [...answers].sort(() => Math.random() - 0.5);
  
  // Update button numbers and dataset
  buttons.forEach((btn, idx) => {
    if (idx < shuffled.length) {
      btn.textContent = shuffled[idx];
      btn.dataset.answer = shuffled[idx];
    }
  });
  
  console.log('🔄 Balloon numbers reshuffled:', shuffled);
}

// ================== NEXT LEVEL ==================
function handleNextLevel() {
  currentNumber++;
  if (currentNumber > 10) currentNumber = 0;
  currentCanvas = null;
  originalImageData = null;
  isImageColored = false;
  feedback = {};
  isAnimating = false;
  updateCenterImage();
  renderAnswerButtons();
}

// ================== RESET ==================
function resetGame() {
  feedback = {};
  currentNumber = 0;
  currentCanvas = null;
  originalImageData = null;
  isImageColored = false;
  isAnimating = false;
  updateCenterImage();
  renderAnswerButtons();
}

// ================== START ==================
window.addEventListener('DOMContentLoaded', init);