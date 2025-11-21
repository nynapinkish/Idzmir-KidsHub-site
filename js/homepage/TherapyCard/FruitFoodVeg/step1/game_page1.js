// Game Questions Data
const questions = [
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana lobak merah?",
    leftImage: "../../../../../assets/images/carrot5.png",
    leftAlt: "lobak merah",
    answerText: "lobak merah",
    rightImages: [
      { src: "../../../../../assets/images/pumpkin1.png", alt: "labu", answer: "wrong" },
      { src: "../../../../../assets/images/carrot5.png", alt: "lobak merah", answer: "correct" },
      { src: "../../../../../assets/images/cabbage.png", alt: "kobis", answer: "wrong" },
      { src: "../../../../../assets/images/eggplant1.png", alt: "terung", answer: "wrong" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana manggis?",
    leftImage: "../../../../../assets/images/mangosteen1.png",
    leftAlt: "manggis",
    answerText: "manggis",
    rightImages: [
      { src: "../../../../../assets/images/pumpkin1.png", alt: "labu", answer: "wrong" },
      { src: "../../../../../assets/images/watermelon3.png", alt: "tembikai", answer: "wrong" },
      { src: "../../../../../assets/images/mangosteen1.png", alt: "manggis", answer: "correct" },
      { src: "../../../../../assets/images/mango2.png", alt: "mangga", answer: "wrong" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana apple?",
    leftImage: "../../../../../assets/images/apple6.png",
    leftAlt: "apple",
    answerText: "epal",
    rightImages: [
      { src: "../../../../../assets/images/cabbage.png", alt: "kobis", answer: "wrong" },
      { src: "../../../../../assets/images/apple6.png", alt: "apple", answer: "correct" },
      { src: "../../../../../assets/images/banana6.png", alt: "banana", answer: "wrong" },
      { src: "../../../../../assets/images/watermelon3.png", alt: "tembikai", answer: "wrong" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana durian?",
    leftImage: "../../../../../assets/images/durian.png",
    leftAlt: "durian",
    answerText: "durian",
    rightImages: [
      { src: "../../../../../assets/images/banana6.png", alt: "pisang", answer: "wrong" },
      { src: "../../../../../assets/images/brokoli1.png", alt: "brokoli", answer: "wrong" },
      { src: "../../../../../assets/images/durian.png", alt: "durian", answer: "correct" },
      { src: "../../../../../assets/images/watermelon3.png", alt: "tembikai", answer: "wrong" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana banana?",
    leftImage: "../../../../../assets/images/banana6.png",
    leftAlt: "banana",
    answerText: "pisang",
    rightImages: [
      { src: "../../../../../assets/images/pumpkin1.png", alt: "labu", answer: "wrong" },
      { src: "../../../../../assets/images/mango2.png", alt: "mangga", answer: "wrong" },
      { src: "../../../../../assets/images/watermelon3.png", alt: "tembikai", answer: "wrong" },
      { src: "../../../../../assets/images/banana6.png", alt: "banana", answer: "correct" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana watermelon?",
    leftImage: "../../../../../assets/images/watermelon3.png",
    leftAlt: "watermelon",
    answerText: "tembikai",
    rightImages: [
      { src: "../../../../../assets/images/pumpkin1.png", alt: "labu", answer: "wrong" },
      { src: "../../../../../assets/images/watermelon3.png", alt: "tembikai", answer: "correct" },
      { src: "../../../../../assets/images/brokoli1.png", alt: "brokoli", answer: "wrong" },
      { src: "../../../../../assets/images/cabbage.png", alt: "kobis", answer: "wrong" }
    ]
  },
  {
    title: "Pencarian Berkembar Tropika",
    question: "yang mana brocoli?",
    leftImage: "../../../../../assets/images/brokoli1.png",
    leftAlt: "brocoli",
    answerText: "brokoli",
    rightImages: [
      { src: "../../../../../assets/images/banana6.png", alt: "pisang", answer: "wrong" },
      { src: "../../../../../assets/images/brokoli1.png", alt: "brokoli", answer: "correct" },
      { src: "../../../../../assets/images/durian.png", alt: "durian", answer: "wrong" },
      { src: "../../../../../assets/images/mangosteen1.png", alt: "manggis", answer: "wrong" }
    ]
  }
];

let currentQuestion = 0;
let score = 0;
let correctCount = 0;
let wrongCount = 0;

// Initialize Game
function initGame() {
  loadQuestion(currentQuestion);
  updateScoreDisplay();
}

// Load Question
function loadQuestion(index) {
  const q = questions[index];
  
  // Update Banner
  document.querySelector('.banner-yellow .banner-text').textContent = q.title;
  document.querySelector('.banner-blue').textContent = q.question;
  
  // Update Left Image
  const leftImg = document.querySelector('.left-image img');
  leftImg.src = q.leftImage;
  leftImg.alt = q.leftAlt;
  leftImg.style.display = 'block';
  leftImg.style.visibility = 'visible';
  
  // Update Answer Text
  const answerText = document.querySelector('.answer-text');
  answerText.textContent = q.answerText;
  
  // Update Right Images
  const rightImagesContainer = document.querySelector('.right-images');
  rightImagesContainer.innerHTML = '';
  
  q.rightImages.forEach((img, idx) => {
    const imgElement = document.createElement('img');
    imgElement.src = img.src;
    imgElement.alt = img.alt;
    imgElement.dataset.answer = img.answer;
    imgElement.dataset.index = idx;
    rightImagesContainer.appendChild(imgElement);
  });
  
  // Setup click events for new images
  setupEventListeners();
}

// Setup Click Event Listeners
function setupEventListeners() {
  const rightImages = document.querySelectorAll('.right-images img');
  
  rightImages.forEach(img => {
    // Reset styles
    img.style.pointerEvents = 'auto';
    img.style.opacity = '1';
    img.style.filter = 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3))';
    img.style.transform = 'scale(1)';
    
    // Remove old event listeners by cloning
    const newImg = img.cloneNode(true);
    img.parentNode.replaceChild(newImg, img);
    
    // Add new event listener
    newImg.addEventListener('click', handleImageClick);
  });
}

// Handle Image Click
function handleImageClick(e) {
  const clickedImage = e.target;
  const answer = clickedImage.dataset.answer;
  const rightImages = document.querySelectorAll('.right-images img');
  
  // Disable all images
  rightImages.forEach(img => {
    img.style.pointerEvents = 'none';
    img.style.opacity = '0.5';
  });
  
  if (answer === 'correct') {
    // Correct answer - green glow
    clickedImage.style.filter = 'drop-shadow(0 0 25px #00CC00)';
    clickedImage.style.opacity = '1';
    clickedImage.style.transform = 'scale(1.1)';
    
    score += 10;
    correctCount++;
    updateScoreDisplay();
    
    // Move to next question
    setTimeout(() => {
      currentQuestion++;
      
      if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        showFinalScore();
      }
    }, 1200);
  } else {
    // Wrong answer - red glow
    clickedImage.style.filter = 'drop-shadow(0 0 20px #FF0000)';
    clickedImage.style.opacity = '1';
    
    wrongCount++;
    
    // Move to next question
    setTimeout(() => {
      currentQuestion++;
      
      if (currentQuestion < questions.length) {
        loadQuestion(currentQuestion);
      } else {
        showFinalScore();
      }
    }, 1200);
  }
}

// Update Score Display
function updateScoreDisplay() {
  const scoreDisplay = document.querySelector('.score-display');
  if (scoreDisplay) {
    scoreDisplay.textContent = 'Skor: ' + score;
  }
}

// Show Final Score
function showFinalScore() {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #003E8D 0%, #0052B4 100%);
    padding: 50px 80px;
    border-radius: 20px;
    text-align: center;
    z-index: 9999;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    font-family: 'Poppins', sans-serif;
  `;
  
  popup.innerHTML = `
    <div style="color: #FFD700; font-size: 48px; font-weight: bold; margin-bottom: 20px;">
      ${score}
    </div>
    <div style="color: white; font-size: 20px; margin-bottom: 15px;">
      Markah
    </div>
    <div style="color: #FFD700; font-size: 18px; margin-bottom: 10px;">
      ✓ Betul: ${correctCount}
    </div>
    <div style="color: #FFD700; font-size: 18px; margin-bottom: 30px;">
      ✗ Salah: ${wrongCount}
    </div>
    <button id="playAgain" style="
      background: linear-gradient(135deg, #FFD700 0%, #FFB400 100%);
      color: #003E8D;
      border: none;
      padding: 12px 30px;
      font-size: 18px;
      font-weight: bold;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      transition: transform 0.3s ease;
    ">Main Lagi</button>
  `;
  
  document.body.appendChild(popup);
  
  // Play again button
  const playAgainBtn = document.getElementById('playAgain');
  playAgainBtn.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
  });
  playAgainBtn.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
  });
  playAgainBtn.addEventListener('click', () => {
    currentQuestion = 0;
    score = 0;
    correctCount = 0;
    wrongCount = 0;
    updateScoreDisplay();
    popup.remove();
    loadQuestion(0);
  });
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  initGame();
});