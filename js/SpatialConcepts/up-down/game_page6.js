// ===============================================
// UP/DOWN GAME - With Firebase Integration
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'naik / turun';
const TOTAL_QUESTIONS = 2;

// ================= GAME DATA =================
const questions = [
  {
    label: "naik",
    question: "Mana yang naik?",
    correctImg: "../../../assets/images/up.png",
    options: [
      { answer: "wrong", img: "../../../assets/images/down.png" },
      { answer: "correct", img: "../../../assets/images/up.png" },
    ]
  },
  {
    label: "turun",
    question: "Mana yang turun?",
    correctImg: "../../../assets/images/down.png",
    options: [
      { answer: "wrong", img: "../../../assets/images/up.png" },
      { answer: "correct", img: "../../../assets/images/down.png" },
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
        handleWrongAnswerClick(this, options, feedback);
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
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${correctAnswers}/${attemptCount}`;
    console.log(`📊 Score: ${correctAnswers}/${attemptCount}`);
  }
}

// ================= HANDLE CORRECT ANSWER =================
function handleCorrectAnswerClick(selectedCard, options, questionBox, answerImage, feedback) {
  console.log("✅ CORRECT!");
  
  answered = true;
  attemptCount++;
  correctAnswers++;
  console.log(`✅ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  handleCorrectAnswer(); // Firebase function
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
    setTimeout(() => showFinalScoreModal(), 2000);
  } else {
    setTimeout(() => changeQuestion(), 2000);
  }
}

// ================= HANDLE WRONG ANSWER =================
function handleWrongAnswerClick(selectedCard, options, feedback) {
  console.log("❌ WRONG!");
  
  answered = true;
  attemptCount++;
  console.log(`❌ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  handleWrongAnswer(); // Firebase function
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');
  
  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);
  
  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(() => showFinalScoreModal(), 2000);
  } else {
    setTimeout(() => changeQuestion(), 2000);
  }
}

// ================= CHANGE QUESTION =================
function changeQuestion() {
  console.log("Changing question...");
  
  answered = false;
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
  
  const currentQuestion = questions[currentQuestionIndex];
  
  document.querySelector('.question-label').textContent = currentQuestion.label;
  document.querySelector('.question-prompt').textContent = currentQuestion.question;
  document.querySelector('.question-icon').src = currentQuestion.correctImg;

  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach((option, index) => {
    const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
    optionImg.src = currentQuestion.options[index].img;
    option.dataset.answer = currentQuestion.options[index].answer;
    option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  document.getElementById('questionBox').classList.remove('reveal');
  document.getElementById('answerImage').src = "";
  
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.textContent = "";
    feedback.className = "feedback";
  }
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
    // Update score display
    finalScoreDisplay.textContent = `${correctAnswers}/${attemptCount}`;
    console.log("Score updated to:", `${correctAnswers}/${attemptCount}`);
    
    // Clear any previous inline styles
    scoreModal.style.cssText = '';
    
    // Show modal
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
    
    console.log("Modal displayed!");
    
    // ✅ Setup next button container and button
    if (nextButtonContainer && nextButton) {
      // Ensure container has higher z-index than modal
      nextButtonContainer.style.zIndex = '10001';
      nextButtonContainer.style.position = 'fixed';
      
      // Hide next button initially
      nextButton.style.opacity = '0';
      nextButton.style.display = 'block';
      nextButton.style.pointerEvents = 'none';
      
      // After 1 second, fade in and animate next button
      setTimeout(() => {
        nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
        
        // Add bounce animation using keyframes
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log("Next button faded in and animating!");
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
    } else {
      console.error("❌ gameSession not found");
    }
  }
}

console.log('✅ Game script loaded!');