// ===============================================
// BETWEEN & AROUND GAME - With Firebase Integration
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'antara / sekeliling';
const TOTAL_QUESTIONS = 2;

// ================= GAME DATA =================
const questions = [
  {
    label: "antara",
    question: "Mana yang antara?",
    correctImg: "../../../assets/images/between.png",
    options: [
      { answer: "correct", img: "../../../assets/images/between.png" },
      { answer: "wrong", img: "../../../assets/images/around.png" },
    ]
  },
  {
    label: "sekeliling",
    question: "Mana yang sekeliling?",
    correctImg: "../../../assets/images/around.png",
    options: [
      { answer: "correct", img: "../../../assets/images/around.png" },
      { answer: "wrong", img: "../../../assets/images/between.png" },
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
  
  // Initialize game session with Firebase
  const initialized = initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  // Get DOM elements
  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');

  // Show score display
  showScoreDisplay();
  updateScoreDisplay();

  // Attach event listeners to options
  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;

      const answer = this.getAttribute('data-answer');
      
      if (answer === 'correct') {
        handleCorrectAnswerClick(this, options, questionBox, answerImage, feedback);
      } else {
        handleWrongAnswerClick(this, feedback);
      }
    });
  });

  console.log('✅ Game initialized successfully');
});

// ================= SHOW SCORE DISPLAY =================
function showScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }
}

// ================= UPDATE SCORE DISPLAY =================
function updateScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${correctAnswers}/${attemptCount}`;
    console.log(`📊 Score display updated: ${correctAnswers}/${attemptCount}`);
  }
}

// ================= HANDLE CORRECT ANSWER =================
function handleCorrectAnswerClick(selectedCard, options, questionBox, answerImage, feedback) {
  console.log("✅ CORRECT!");
  
  answered = true;
  attemptCount++;
  correctAnswers++;
  console.log(`✅ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  handleCorrectAnswer(); // Firebase
  updateScoreDisplay();
  
  options.forEach(opt => opt.classList.remove('wrong-answer'));
  selectedCard.classList.add('correct-answer');
  
  const correctImg = selectedCard.querySelector('img:not(.arrow-indicator)') || selectedCard.querySelector('img');
  answerImage.src = correctImg.src;
  selectedCard.classList.add('correct-move');
  
  setTimeout(() => {
    questionBox.classList.add('reveal');
  }, 800);
  
  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(() => {
      showFinalScoreModal();
    }, 2000);
  } else {
    setTimeout(() => {
      changeQuestion();
    }, 2000);
  }
}

// ================= HANDLE WRONG ANSWER =================
function handleWrongAnswerClick(selectedCard, feedback) {
  console.log("❌ WRONG!");
  
  answered = true;
  attemptCount++;
  console.log(`❌ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  handleWrongAnswer(); // Firebase
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');
  
  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);
  
  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(() => {
      showFinalScoreModal();
    }, 2000);
  } else {
    setTimeout(() => {
      changeQuestion();
    }, 2000);
  }
}

// ================= CHANGE QUESTION =================
function changeQuestion() {
  answered = false;
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  
  const currentQuestion = questions[currentQuestionIndex];
  const questionLabel = document.querySelector('.question-label');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionIcon = document.querySelector('.question-icon');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const feedback = document.getElementById('feedback');

  questionLabel.textContent = currentQuestion.label;
  questionPrompt.textContent = currentQuestion.question;
  questionIcon.src = currentQuestion.correctImg;

  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach((option, index) => {
    const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
    optionImg.src = currentQuestion.options[index].img;
    option.dataset.answer = currentQuestion.options[index].answer;
    option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  questionBox.classList.remove('reveal');
  answerImage.src = "";
  feedback.textContent = "";
  feedback.className = "feedback";
}

// ================= SHOW FINAL SCORE MODAL =================
async function showFinalScoreModal() {
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');
  
  console.log("🎉 showFinalScoreModal triggered!");
  console.log(`Final Score: ${correctAnswers}/${attemptCount}`);
  
  if (scoreModal && finalScoreDisplay) {
    finalScoreDisplay.textContent = `${correctAnswers}/${attemptCount}`;
    
    scoreModal.style.cssText = '';
    scoreModal.style.display = 'flex';
    scoreModal.style.position = 'fixed';
    scoreModal.style.top = '0';
    scoreModal.style.left = '0';
    scoreModal.style.width = '100%';
    scoreModal.style.height = '100%';
    scoreModal.style.zIndex = '10000';
    scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    scoreModal.style.backdropFilter = 'blur(5px)';
    scoreModal.style.alignItems = 'center';
    scoreModal.style.justifyContent = 'center';
    
    if (nextButtonContainer && nextButton) {
      nextButtonContainer.style.zIndex = '10001';
      nextButton.style.opacity = '0';
      nextButton.style.display = 'block';
      
      setTimeout(() => {
        nextButton.style.transition = 'opacity 0.5s ease-in-out';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
      }, 1000);
    }
    
    // 🔥 SAVE TO FIREBASE
    console.log("💾 Attempting to save score to Firebase...");
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      if (saved) {
        console.log("✅ Score successfully saved to Firebase!");
      } else {
        console.error("❌ Failed to save score to Firebase");
      }
    }
  }
}

console.log('✅ Game script loaded!');