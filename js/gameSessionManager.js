// ===============================================
// UNIVERSAL GAME TEMPLATE WITH LOCK SYSTEM
// Copy this for ALL games - just change the 3 variables below!
// ===============================================

// ================= ⚠️ CHANGE THESE 3 LINES FOR EACH GAME ⚠️ =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'atas / bawah';      // Example: 'dalam / luar', 'depan / belakang'
const GAME_KEY = 'atas_/_bawah';        // Example: 'dalam_/_luar', 'belakang_/_depan'
const TOTAL_QUESTIONS = 2;              // Total number of questions

// ================= GAME DATA - REPLACE WITH YOUR QUESTIONS =================
const questions = [
  {
    label: "bawah",
    question: "Mana yang di bawah?",
    correctImg: "../../../assets/images/below.png",
    options: [
      { answer: "wrong", img: "../../../assets/images/above.png" },
      { answer: "correct", img: "../../../assets/images/below.png" }
    ]
  },
  {
    label: "atas",
    question: "Mana yang di atas?",
    correctImg: "../../../assets/images/above.png",
    options: [
      { answer: "correct", img: "../../../assets/images/above.png" },
      { answer: "wrong", img: "../../../assets/images/below.png" }
    ]
  }
];

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let answered = false;
let correctAnswers = 0;
let attemptCount = 0;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= CHECK IF GAME ALREADY PLAYED =================
async function checkGameStatus() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('No studentId in session');
      return false;
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('Student not found in Firebase');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    const conceptProgress = studentData.conceptProgress || {};
    const spatialProgress = conceptProgress['Spatial Concepts'] || {};
    const gamesCompleted = spatialProgress.gamesCompleted || {};
    
    // Check if THIS game already has a score
    if (gamesCompleted[GAME_KEY] && gamesCompleted[GAME_KEY] > 0) {
      existingScore = gamesCompleted[GAME_KEY];
      gameAlreadyPlayed = true;
      console.log('🔒 Game already played! Score:', existingScore);
      return true;
    }

    console.log('✅ First time playing this game');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    return false;
  }
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🚫 Game already completed - showing existing score');
  
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');
  
  if (!scoreModal || !finalScoreDisplay) {
    console.error('❌ Modal elements not found');
    return;
  }

  // Hide game interface
  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) {
    gameContainer.style.display = 'none';
  }

  // Show existing score
  finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
  
  // Style modal
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
  
  // Add "Already Completed" banner
  const modalContent = scoreModal.querySelector('.modal-content') || scoreModal.querySelector('.score-modal-content');
  if (modalContent && !document.getElementById('alreadyPlayedMsg')) {
    const msg = document.createElement('div');
    msg.id = 'alreadyPlayedMsg';
    msg.style.cssText = 'background: #ffc107; color: #000; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.2);';
    msg.textContent = '🔒 Anda sudah main game ini! Ini markah anda.';
    modalContent.insertBefore(msg, modalContent.firstChild);
  }
  
  // Setup Next button
  if (nextButtonContainer && nextButton) {
    nextButtonContainer.style.zIndex = '10001';
    nextButton.style.opacity = '1';
    nextButton.style.display = 'block';
    nextButton.style.pointerEvents = 'auto';
    nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
  }
  
  console.log('✅ Existing score displayed');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎮 Game page loaded');
  
  // ⚠️ STEP 1: CHECK IF GAME ALREADY PLAYED - CRITICAL!
  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    // Game already played - show existing score and STOP
    await showAlreadyPlayedScreen();
    return; // 🛑 EXIT - Don't initialize gameplay
  }
  
  // ✅ STEP 2: First time playing - initialize with gameSessionManager
  const initialized = initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  // STEP 3: Get DOM elements
  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');

  // STEP 4: Show score display
  showScoreDisplay();
  updateScoreDisplay();

  // STEP 5: Attach event listeners to options
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

  console.log('✅ Game initialized - First attempt only!');
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
    console.log(`📊 Score: ${correctAnswers}/${attemptCount}`);
  }
}

// ================= HANDLE CORRECT ANSWER =================
function handleCorrectAnswerClick(selectedCard, options, questionBox, answerImage, feedback) {
  console.log('✅ CORRECT!');
  
  answered = true;
  attemptCount++;
  correctAnswers++;
  console.log(`✅ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  // Update Firebase via gameSessionManager
  handleCorrectAnswer(); 
  updateScoreDisplay();
  
  // Visual feedback
  options.forEach(opt => opt.classList.remove('wrong-answer'));
  selectedCard.classList.add('correct-answer');
  
  const correctImg = selectedCard.querySelector('img:not(.arrow-indicator)') || selectedCard.querySelector('img');
  if (answerImage && correctImg) {
    answerImage.src = correctImg.src;
  }
  selectedCard.classList.add('correct-move');
  
  if (feedback) {
    feedback.textContent = '🎉 Betul! Hebat!';
    feedback.classList.add('correct');
  }
  
  setTimeout(() => {
    if (questionBox) questionBox.classList.add('reveal');
  }, 800);
  
  // Check if game complete
  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
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
  console.log('❌ WRONG!');
  
  answered = true;
  attemptCount++;
  console.log(`❌ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);
  
  // Update Firebase via gameSessionManager
  handleWrongAnswer();
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');
  
  if (feedback) {
    feedback.textContent = '❌ Cuba lagi!';
    feedback.classList.add('incorrect');
  }
  
  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);
  
  // Check if game complete
  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
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

  if (questionLabel) questionLabel.textContent = currentQuestion.label;
  if (questionPrompt) questionPrompt.textContent = currentQuestion.question;
  if (questionIcon) questionIcon.src = currentQuestion.correctImg;

  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach((option, index) => {
    const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
    if (optionImg) optionImg.src = currentQuestion.options[index].img;
    option.dataset.answer = currentQuestion.options[index].answer;
    option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  if (questionBox) questionBox.classList.remove('reveal');
  if (answerImage) answerImage.src = "";
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
  
  console.log('🎉 Game completed!');
  console.log(`Final Score: ${correctAnswers}/${attemptCount}`);
  
  if (scoreModal && finalScoreDisplay) {
    finalScoreDisplay.textContent = `${correctAnswers}/${attemptCount}`;
    
    // Clear previous styles
    scoreModal.style.cssText = '';
    
    // Show modal - centered
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
    scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    
    // Setup next button
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
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
      }, 1000);
    }
    
    // 🔥 SAVE TO FIREBASE (First attempt only via gameSessionManager)
    console.log('💾 Saving first attempt score to Firebase...');
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      // Ensure currentScore is set correctly
      gameSession.currentScore = correctAnswers;
      console.log(`🎯 Setting gameSession score: ${correctAnswers}/${TOTAL_QUESTIONS}`);
      
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ First attempt score saved to Firebase!');
      } else {
        console.error('❌ Failed to save score to Firebase');
      }
    } else {
      console.error('❌ gameSession not found - check if gameSessionManager.js is loaded');
    }
  }
}

console.log(`✅ Game script loaded: ${GAME_NAME} with lock system!`);