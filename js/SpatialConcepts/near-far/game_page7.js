// ===============================================
// NEAR/FAR GAME - With Firebase Integration
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'dekat / jauh';
const TOTAL_QUESTIONS = 2;

// ================= GAME DATA =================
const questions = [
  {
    label: "dekat",
    question: "Mana yang kedudukannya dekat?",
    correctImg: "../../../assets/images/near.png",
    options: [
      { answer: "correct", img: "../../../assets/images/near.png" },
      { answer: "wrong", img: "../../../assets/images/far.png" },
    ]
  },
  {
    label: "jauh",
    question: "Mana yang kedudukannya jauh?",
    correctImg: "../../../assets/images/far.png",
    options: [
      { answer: "correct", img: "../../../assets/images/far.png" },
      { answer: "wrong", img: "../../../assets/images/near.png" },
    ]
  }
];

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let answered = false;
let correctAnswers = 0;
let attemptCount = 0;

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Game page loaded');
  
  const initialized = initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  const options = document.querySelectorAll('.option-card');
  showScoreDisplay();
  updateScoreDisplay();

  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;
      const answer = this.getAttribute('data-answer');
      
      if (answer === 'correct') {
        handleCorrect(this);
      } else {
        handleWrong(this);
      }
    });
  });

  console.log('✅ Game initialized');
});

function showScoreDisplay() {
  const el = document.getElementById('scoreDisplay');
  if (el) el.style.display = 'flex';
}

function updateScoreDisplay() {
  const el = document.getElementById('scoreText');
  if (el) el.textContent = `${correctAnswers}/${attemptCount}`;
}

function handleCorrect(card) {
  console.log("✅ CORRECT!");
  answered = true;
  attemptCount++;
  correctAnswers++;
  
  handleCorrectAnswer();
  updateScoreDisplay();
  
  card.classList.add('correct-answer', 'correct-move');
  
  const img = card.querySelector('img');
  document.getElementById('answerImage').src = img.src;
  
  setTimeout(() => document.getElementById('questionBox').classList.add('reveal'), 800);
  
  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(() => showFinalScoreModal(), 2000);
  } else {
    setTimeout(() => changeQuestion(), 2000);
  }
}

function handleWrong(card) {
  console.log("❌ WRONG!");
  answered = true;
  attemptCount++;
  
  handleWrongAnswer();
  updateScoreDisplay();
  
  card.classList.add('wrong-answer');
  setTimeout(() => card.classList.remove('wrong-answer'), 600);
  
  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(() => showFinalScoreModal(), 2000);
  } else {
    setTimeout(() => changeQuestion(), 2000);
  }
}

function changeQuestion() {
  answered = false;
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  const q = questions[currentQuestionIndex];
  
  document.querySelector('.question-label').textContent = q.label;
  document.querySelector('.question-prompt').textContent = q.question;
  document.querySelector('.question-icon').src = q.correctImg;

  const cards = document.querySelectorAll(".option-card");
  cards.forEach((card, i) => {
    const img = card.querySelector("img:not(.arrow-indicator)") || card.querySelector("img");
    img.src = q.options[i].img;
    card.dataset.answer = q.options[i].answer;
    card.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  document.getElementById('questionBox').classList.remove('reveal');
  document.getElementById('answerImage').src = "";
  document.getElementById('feedback').textContent = "";
}

async function showFinalScoreModal() {
  const modal = document.getElementById('scoreModal');
  const display = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');
  
  console.log(`🎉 Final: ${correctAnswers}/${attemptCount}`);
  
  if (modal && display) {
    display.textContent = `${correctAnswers}/${attemptCount}`;
    
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.zIndex = '10000';
    modal.style.backgroundColor = 'rgba(0,0,0,0.6)';
    modal.style.backdropFilter = 'blur(5px)';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    // ✅ Next button setup
    if (nextButtonContainer && nextButton) {
      nextButtonContainer.style.zIndex = '10001';
      nextButtonContainer.style.position = 'fixed';
      
      nextButton.style.opacity = '0';
      nextButton.style.display = 'block';
      nextButton.style.pointerEvents = 'none';
      
      setTimeout(() => {
        nextButton.style.transition = 'opacity 0.5s ease-in-out';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.animation = 'bounceButton 1s infinite';
        console.log("Next button animated!");
      }, 1000);
    }
    
    // 🔥 FIREBASE SAVE
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      await gameSession.endSession();
      console.log("✅ Saved!");
    }
  }
}