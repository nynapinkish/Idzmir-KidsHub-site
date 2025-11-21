// Game Questions Data
const questions = [
  {
    title: "Perlawanan Bayangan Buah",
    question: "Bolehkah anda memadankan setiap buah dengan bayang-bayang?",
    silhouettes: [
      { src: "../../../../../assets/images/anggur.png", alt: "anggur", id: "item1" },
      { src: "../../../../../assets/images/tomato4.png", alt: "tomato", id: "item2" },
      { src: "../../../../../assets/images/garlic.png", alt: "bawang", id: "item3" },
      { src: "../../../../../assets/images/kobis.png", alt: "kobis", id: "item4" },
      { src: "../../../../../assets/images/mangosteen.png", alt: "manggis", id: "item5" }
    ],
    options: [
      { src: "../../../../../assets/images/anggur.png", alt: "anggur", correctId: "item1" },
      { src: "../../../../../assets/images/tomato4.png", alt: "tomato", correctId: "item2" },
      { src: "../../../../../assets/images/garlic.png", alt: "bawang", correctId: "item3" },
      { src: "../../../../../assets/images/kobis.png", alt: "kobis", correctId: "item4" },
      { src: "../../../../../assets/images/mangosteen.png", alt: "manggis", correctId: "item5" }
    ]
  },
  {
    title: "Perlawanan Bayangan Buah",
    question: "Bolehkah anda memadankan setiap buah dengan bayang-bayang?",
    silhouettes: [
      { src: "../../../../../assets/images/timun.png", alt: "timun", id: "item1" },
      { src: "../../../../../assets/images/betik.png", alt: "betik", id: "item2" },
      { src: "../../../../../assets/images/oren.png", alt: "oren", id: "item3" },
      { src: "../../../../../assets/images/naga.png", alt: "naga", id: "item4" },
      { src: "../../../../../assets/images/labu.png", alt: "labu", id: "item5" }
    ],
    options: [
      { src: "../../../../../assets/images/timun.png", alt: "timun", correctId: "item1" },
      { src: "../../../../../assets/images/betik.png", alt: "betik", correctId: "item2" },
      { src: "../../../../../assets/images/oren.png", alt: "oren", correctId: "item3" },
      { src: "../../../../../assets/images/naga.png", alt: "naga", correctId: "item4" },
      { src: "../../../../../assets/images/labu.png", alt: "labu", correctId: "item5" }
    ]
  }
];

let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;
let matchedPairs = {};
let filledDropZones = new Set(); // Track which drop zones are filled

// Initialize Game
function initGame() {
  loadQuestion(currentQuestion);
}

// Load Question
function loadQuestion(index) {
  const q = questions[index];
  
  // Update Banner
  document.querySelector('.banner-yellow .banner-text').textContent = q.title;
  document.querySelector('.banner-blue').textContent = q.question;
  
  // Clear matched pairs and filled zones
  matchedPairs = {};
  filledDropZones.clear();
  
  // Load Silhouettes (Top - Drop Zones)
  const silhouetteRow = document.querySelector('.silhouette-row');
  silhouetteRow.innerHTML = '';
  
  q.silhouettes.forEach((silhouette) => {
    const container = document.createElement('div');
    container.className = 'silhouette-container';
    container.dataset.id = silhouette.id;
    
    const imgElement = document.createElement('img');
    imgElement.src = silhouette.src;
    imgElement.alt = silhouette.alt;
    imgElement.className = 'silhouette-img';
    
    container.appendChild(imgElement);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('dragleave', handleDragLeave);
    container.addEventListener('drop', handleDrop);
    
    silhouetteRow.appendChild(container);
  });
  
  // Load Options (Bottom - Draggable)
  const optionsRow = document.querySelector('.options-row');
  optionsRow.innerHTML = '';
  
  const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
  
  shuffledOptions.forEach((option) => {
    const imgElement = document.createElement('img');
    imgElement.src = option.src;
    imgElement.alt = option.alt;
    imgElement.className = 'option-img';
    imgElement.dataset.correctId = option.correctId;
    imgElement.draggable = true;
    
    imgElement.addEventListener('dragstart', handleDragStart);
    imgElement.addEventListener('dragend', handleDragEnd);
    
    optionsRow.appendChild(imgElement);
  });
}

let draggedElement = null;

// Handle Drag Start
function handleDragStart(e) {
  draggedElement = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
  this.style.opacity = '0.5';
}

// Handle Drag End
function handleDragEnd(e) {
  this.style.opacity = '1';
}

// Handle Drag Over
function handleDragOver(e) {
  if (e.preventDefault) {
    e.preventDefault();
  }
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
  return false;
}

// Handle Drag Leave
function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

// Handle Drop
function handleDrop(e) {
  if (e.stopPropagation) {
    e.stopPropagation();
  }
  
  this.classList.remove('drag-over');
  
  const dropZoneId = this.dataset.id;
  
  // PREVENT DROP if zone already filled
  if (filledDropZones.has(dropZoneId)) {
    return false;
  }
  
  const draggedCorrectId = draggedElement.dataset.correctId;
  
  // Create matched image
  const matchedImg = document.createElement('img');
  matchedImg.src = draggedElement.src;
  matchedImg.alt = draggedElement.alt;
  matchedImg.className = 'matched-image';
  this.appendChild(matchedImg);
  
  // Mark option as used
  draggedElement.classList.add('used');
  draggedElement.draggable = false;
  
  // Mark drop zone as filled
  filledDropZones.add(dropZoneId);
  
      if (dropZoneId === draggedCorrectId) {
    // Correct match!
    this.classList.add('correct');
    matchedPairs[dropZoneId] = draggedCorrectId;
    score += 10;
    correctCount++;
    
    // Update score display
    document.querySelector('.score-display').textContent = `Skor: ${score}`;
  } else {
    // Wrong match - keep the image but show red
    this.classList.add('wrong');
    wrongCount++;
  }
  
  // Check if all silhouettes are filled (correct or wrong)
  const q = questions[currentQuestion];
  if (filledDropZones.size === q.silhouettes.length) {
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        showFinalScore();
      }
    }, 1500);
  }
  
  return false;
}

// Show Final Score
function showFinalScore() {
  const popup = document.createElement('div');
  popup.className = 'popup-overlay';
  
  popup.innerHTML = `
    <div class="popup-content">
      <div class="popup-score">${score}</div>
      <div class="popup-label">Markah</div>
      <div class="popup-stats">✓ Betul: ${correctCount}</div>
      <div class="popup-stats">✗ Salah: ${wrongCount}</div>
      <button class="popup-button" id="playAgain">Main Lagi</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  document.getElementById('playAgain').addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    matchedPairs = {};
    filledDropZones.clear();
    popup.remove();
    loadQuestion(0);
    document.querySelector('.score-display').textContent = `Skor: 0`;
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', initGame);