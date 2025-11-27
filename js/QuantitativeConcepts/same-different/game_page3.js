// ===============================================
// QUANTITATIVE CONCEPTS - semua / tiada / sesetengah
// With Firebase Integration (First Attempt Only)
// FIXED: Correct game key format
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Quantitative Concepts';
const GAME_NAME = 'sama / beza';
const GAME_KEY = 'sama_/_beza';   // ✅ FIXED! Must match gameSessionManager format
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= QUESTIONS DATA =================
const questions = [
  { question: "Yang manakah sama?", correctAnswer: "same.png" },
  { question: "Yang manakah beza?", correctAnswer: "different.png" },
];

// ================= GAME STATE =================
let answered = false;
let score = 0;
let totalQuestions = 0;
let attemptCount = 0;
let currentQuestionIndex = 0;

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
    const quantitativeProgress = conceptProgress['Quantitative Concepts'] || {};
    const gamesCompleted = quantitativeProgress.gamesCompleted || {};
    
    console.log('🔍 Looking for game key:', GAME_KEY);
    console.log('🔍 Available keys:', Object.keys(gamesCompleted));
    
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

  // ⚠️ HIDE GAME ELEMENTS (Quantitative-specific)
  const imageContainer = document.querySelector('.image-container');
  const bannerContainer = document.querySelector('.banner-container');
  const scoreDisplay = document.getElementById('scoreDisplay');
  
  if (imageContainer) {
    imageContainer.style.display = 'none';
    console.log('✅ Hidden: .image-container');
  }
  
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
  }
  
  if (scoreDisplay) {
    scoreDisplay.style.display = 'none';
    console.log('✅ Hidden: scoreDisplay');
  }

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
  }

  if (nextButtonContainer && nextButton) {
    nextButtonContainer.style.zIndex = '10001';
    nextButtonContainer.style.position = 'fixed';
    nextButton.style.opacity = '1';
    nextButton.style.display = 'block';
    nextButton.style.pointerEvents = 'auto';
    nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
  }

  console.log('✅ Existing score displayed - Game LOCKED');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Game loaded!");
  console.log("🔍 DEBUG: Checking game status...");

  // Check if game already played
  const hasPlayed = await checkGameStatus();
  
  console.log("🔍 DEBUG: hasPlayed =", hasPlayed);
  console.log("🔍 DEBUG: existingScore =", existingScore);
  console.log("🔍 DEBUG: gameAlreadyPlayed =", gameAlreadyPlayed);
  
  if (hasPlayed) {
    console.log("🔒 DEBUG: Game WAS played before - showing existing score");
    await showAlreadyPlayedScreen();
    return; // ⚠️ STOP HERE - Don't initialize game
  }

  console.log("✅ First time playing - initializing game...");

  // Initialize game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  // Get DOM elements
  const bannerBlue = document.querySelector('.banner-blue');
  const imageItems = document.querySelectorAll('.image-item');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  if (!bannerBlue || imageItems.length === 0) {
    console.error("❌ ERROR: Elements not found!");
    alert("ERROR: Page elements not loaded properly!");
    return;
  }

  if (scoreDisplay) scoreDisplay.style.display = 'block';

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Score updated:", `${score}/${attemptCount}`);
    }
  }

  // Function untuk load soalan
  function loadQuestion() {
    answered = false;
    const currentQuestion = questions[currentQuestionIndex];
    bannerBlue.textContent = currentQuestion.question;
    updateScoreDisplay();

    imageItems.forEach(img => {
      img.classList.remove('correct-glow', 'wrong-shake');
      img.style.pointerEvents = 'auto';
      img.style.opacity = '1';
    });
  }

  // Check jawapan
  function checkAnswer(clickedImage) {
    if (answered) return;
    answered = true;
    attemptCount++;
    totalQuestions = attemptCount;

    const currentQuestion = questions[currentQuestionIndex];
    const clickedFileName = clickedImage.src.split('/').pop();
    const isCorrect = clickedFileName === currentQuestion.correctAnswer;

    if (isCorrect) {
      score++;
      
      // ⚠️ FIX: Update gameSession score immediately!
      if (typeof gameSession !== 'undefined') {
        gameSession.currentScore = score;
        console.log(`🎯 Updated gameSession.currentScore to: ${score}`);
      }
      
      clickedImage.classList.add('correct-glow');
      imageItems.forEach(img => {
        img.style.pointerEvents = 'none';
        if (img !== clickedImage) img.style.opacity = '0.5';
      });
      console.log("✅ CORRECT! Score:", score);
      updateScoreDisplay();
      setTimeout(nextQuestion, 1500);
    } else {
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score:", score);
      updateScoreDisplay();
      imageItems.forEach(img => {
        const fileName = img.src.split('/').pop();
        if (fileName === currentQuestion.correctAnswer) {
          setTimeout(() => img.classList.add('correct-glow'), 600);
        }
        img.style.pointerEvents = 'none';
      });
      setTimeout(nextQuestion, 2000);
    }
  }

  // Next question
  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      showFinalResult();
    } else {
      loadQuestion();
    }
  }

  // 🎉 Show result akhir dengan SCORE MODAL design
  async function showFinalResult() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    const nextButtonContainer = document.querySelector('.next-button-container');
    const nextButton = document.querySelector('.next-button');
    
    console.log("🎉 Showing final result!");
    console.log(`Final Score: ${score}/${attemptCount}`);
    
    if (scoreModal && finalScoreDisplay) {
      // Update score display
      finalScoreDisplay.textContent = `${score}/${attemptCount}`;
      console.log("✅ Final Score:", `${score}/${attemptCount}`);
      
      // Show modal dengan style yang betul
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
      
      console.log("🎨 Score modal displayed!");
      
      // Show and animate next button after 1 second
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
          console.log("⬆️ Next button activated!");
        }, 1000);
      }

      // ✅ Save with already-updated currentScore
      console.log('💾 Saving score to Firebase...');
      console.log(`🎯 gameSession.currentScore = ${gameSession.currentScore}`);
      
      if (typeof gameSession !== 'undefined' && gameSession.endSession) {
        const saved = await gameSession.endSession();
        
        if (saved) {
          console.log('✅ Score saved successfully!');
          console.log('🔒 Game is now LOCKED - Cannot replay');
        } else {
          console.error('❌ Failed to save score');
        }
      } else {
        console.error('❌ gameSession not found');
      }
    }
  }

  // Add click event
  imageItems.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  loadQuestion();
});

console.log('✅ Quantitative Concepts game with Firebase integration loaded!');