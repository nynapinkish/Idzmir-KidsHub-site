// ===============================================
// NEAR/FAR GAME - With Firebase Integration
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'dekat / jauh';
const GAME_KEY = 'dekat_/_jauh';    // ⚠️ UNIQUE KEY (with underscores)
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

  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) gameContainer.style.display = 'none';

  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
  }

  if (scoreModal) {
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
    scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

    // ❌ REMOVED: Yellow warning message
    // Just show the score modal cleanly without any extra messages
  }

  if (nextButtonContainer && nextButton) {
    nextButtonContainer.style.zIndex = '10001';
    nextButtonContainer.style.position = 'fixed';
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

  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    await showAlreadyPlayedScreen();
    return;
  }
  
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');

  showScoreDisplay();
  updateScoreDisplay();

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
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
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
  
  // ⚠️ FIX: Update gameSession score immediately!
  if (typeof gameSession !== 'undefined') {
    gameSession.currentScore = correctAnswers;
    console.log(`🎯 Updated gameSession.currentScore to: ${correctAnswers}`);
  }
  
  updateScoreDisplay();
  
  options.forEach(opt => opt.classList.remove('wrong-answer'));
  selectedCard.classList.add('correct-answer');

  const correctImg = selectedCard.querySelector('img:not(.arrow-indicator)') || selectedCard.querySelector('img');
  if (answerImage && correctImg) {
    answerImage.src = correctImg.src;
  }

  selectedCard.classList.add('correct-move');

  if (feedback) {
    feedback.textContent = '';
    feedback.classList.add('correct');
  }

  setTimeout(() => {
    if (questionBox) questionBox.classList.add('reveal');
  }, 800);

  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
  }
}

// ================= HANDLE WRONG ANSWER =================
function handleWrongAnswerClick(selectedCard, feedback) {
  console.log('❌ WRONG!');
  
  answered = true;
  attemptCount++;

  console.log(`❌ Attempt: ${attemptCount}, Correct: ${correctAnswers}`);

  handleWrongAnswer();
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');

  if (feedback) {
    feedback.textContent = '';
    feedback.classList.add('incorrect');
  }

  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);

  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
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
    scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

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

    // ✅ Save with already-updated currentScore
    console.log('💾 Saving score to Firebase...');
    console.log(`🎯 gameSession.currentScore = ${gameSession.currentScore}`);
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ Score saved successfully!');
      } else {
        console.error('❌ Failed to save score');
      }
    } else {
      console.error('❌ gameSession not found');
    }
  }
}

console.log('✅ Game script with lock system loaded!');