// ===============================================
// TEMPORAL CONCEPTS - Sebelum / Selepas
// With Firebase Integration (First Attempt Only)
// FIXED: Proper score display + LOCK system
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Temporal Concepts';
const GAME_NAME = 'sebelum / selepas';
const GAME_KEY = 'sebelum_/_selepas';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let currentQuestion = 1;
let answered = false;
let correctAnswers = 0;
let totalAttempts = 0;

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
    const temporalProgress = conceptProgress['Temporal Concepts'] || {};
    const gamesCompleted = temporalProgress.gamesCompleted || {};
    
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

  // ✅ UPDATE SCORE BANNER FIRST before hiding!
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner updated: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // ⚠️ HIDE GAME ELEMENTS AFTER updating score
  const imageContainer = document.querySelector('.image-container');
  const bannerContainer = document.querySelector('.banner-container');
  
  if (imageContainer) {
    imageContainer.style.display = 'none';
    console.log('✅ Hidden: .image-container');
  }
  
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
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
  console.log("🎮 Sebelum/Selepas Game loaded!");
  console.log("🔍 DEBUG: Checking game status...");

  // ⚠️ WAIT for Firebase to be ready
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log("✅ Firebase ready, checking game status...");

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
    alert('Game initialization failed. Please refresh the page.');
    return;
  }

  console.log("✅ Game session initialized successfully");

  // ✅ Get all elements from HTML
  const images = document.querySelectorAll('.image-item');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const nextButton = document.querySelector('.next-button');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const bannerBlue = document.querySelector('.banner-blue');
  const answerText = document.querySelector('.answer-text');

  console.log("🎮 Game initialized!");
  console.log("📸 Images found:", images.length);
  console.log("📊 Score modal:", scoreModal);
  console.log("⏭️ Next button:", nextButton);
  console.log("🎯 Current question:", currentQuestion);

  if (scoreDisplay) scoreDisplay.style.display = 'block';

  // ============================================
  // Function: Setup question display
  // ============================================
  function setupQuestion() {
    // Reset images
    images.forEach(img => {
      img.classList.remove('correct-glow', 'wrong-shake', 'wrong-fade');
      img.style.opacity = '1';
      img.style.pointerEvents = 'auto';
    });

    answered = false;

    if (currentQuestion === 1) {
      // Question 1: Mana Sebelum?
      bannerBlue.textContent = 'Mana Sebelum?';
      answerText.textContent = 'sebelum';
      console.log("❓ Question 1: Mana Sebelum?");
    } else if (currentQuestion === 2) {
      // Question 2: Mana Selepas?
      bannerBlue.textContent = 'Mana Selepas?';
      answerText.textContent = 'selepas';
      console.log("❓ Question 2: Mana Selepas?");
    }
  }

  // ============================================
  // Function: Update score display (top right)
  // ============================================
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${totalAttempts}`;
      console.log("📊 Score updated:", scoreText.textContent);
    }
  }

  // ============================================
  // Function: Show completion modal
  // ============================================
  async function showCompletionModal() {
    console.log("🎉 Showing completion modal!");
    
    if (!scoreModal || !finalScoreDisplay) {
      console.error("❌ Modal elements not found!");
      return;
    }

    // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
    if (typeof gameSession !== 'undefined') {
      gameSession.currentScore = correctAnswers;
      console.log(`🎯 FORCED gameSession.currentScore = ${correctAnswers} (before save)`);
    }

    // ✅ CRITICAL: Save score to Firebase FIRST
    console.log('💾 Saving score to Firebase...');
    console.log(`   Local score: ${correctAnswers}/${totalAttempts}`);
    console.log(`   gameSession.currentScore: ${gameSession?.currentScore}`);
    
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

    // Update final score in modal
    finalScoreDisplay.textContent = `${correctAnswers}/${totalAttempts}`;
    console.log("🏆 Final score:", finalScoreDisplay.textContent);
    
    // Show modal dengan full screen overlay
    scoreModal.style.display = 'flex';
    scoreModal.style.position = 'fixed';
    scoreModal.style.top = '0';
    scoreModal.style.left = '0';
    scoreModal.style.width = '100%';
    scoreModal.style.height = '100%';
    scoreModal.style.zIndex = '10000';
    scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    scoreModal.style.backdropFilter = 'blur(5px)';
    scoreModal.style.alignItems = 'center';
    scoreModal.style.justifyContent = 'center';
    
    console.log("✅ Modal displayed!");

    // Animate next button selepas 1 saat
    if (nextButton && nextButtonContainer) {
      nextButtonContainer.style.zIndex = '10001'; // Above modal
      nextButton.style.opacity = '0';
      nextButton.style.display = 'block';
      nextButton.style.pointerEvents = 'none';
      
      setTimeout(() => {
        nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log("➡️ Next button revealed and animating!");
      }, 1000);
    }
  }

  // ============================================
  // Main Event: Handle image clicks
  // ============================================
  images.forEach(image => {
    image.addEventListener('click', function() {
      console.log("🖱️ Image clicked:", this.alt);
      
      // ⛔ Prevent multiple clicks
      if (answered) {
        console.log("⚠️ Already answered, ignoring click");
        return;
      }

      // Determine correct answer based on current question
      let correctAnswer;
      if (currentQuestion === 1) {
        // Question 1: Mana Sebelum? → Correct = "Sebelum"
        correctAnswer = this.alt === 'Sebelum' ? 'correct' : 'wrong';
      } else {
        // Question 2: Mana Selepas? → Correct = "Selepas"
        correctAnswer = this.alt === 'Selepas' ? 'correct' : 'wrong';
      }
      
      console.log("📝 Answer type:", correctAnswer);
      
      // Mark as answered & increment attempt
      answered = true;
      totalAttempts++;

      // ============================================
      // CORRECT ANSWER
      // ============================================
      if (correctAnswer === 'correct') {
        console.log("✅ CORRECT ANSWER!");
        correctAnswers++;
        
        // ⚠️ Update gameSession score immediately!
        if (typeof gameSession !== 'undefined') {
          gameSession.currentScore = correctAnswers;
          console.log(`🎯 Updated gameSession.currentScore to: ${correctAnswers}`);
        }
        
        // Add green glow animation to correct image
        this.classList.add('correct-glow');
        
        // Fade out wrong answer
        images.forEach(img => {
          if (img !== this) {
            img.classList.add('wrong-fade');
          }
        });
        
      // ============================================
      // WRONG ANSWER
      // ============================================
      } else {
        console.log("❌ WRONG ANSWER!");
        
        // Add red shake animation to wrong image
        this.classList.add('wrong-shake');
        
        // Show correct answer dengan green glow
        images.forEach(img => {
          let isCorrect = false;
          if (currentQuestion === 1 && img.alt === 'Sebelum') isCorrect = true;
          if (currentQuestion === 2 && img.alt === 'Selepas') isCorrect = true;
          
          if (isCorrect) {
            setTimeout(() => {
              img.classList.add('correct-glow');
            }, 600); // After shake animation ends
          }
        });
      }

      // Update score display di top right
      updateScoreDisplay();

      console.log(`📈 Progress: ${totalAttempts}/${TOTAL_QUESTIONS} attempts`);
      console.log(`🎯 Score: ${correctAnswers}/${totalAttempts}`);
      
      // ============================================
      // Move to next question OR show modal
      // ============================================
      setTimeout(() => {
        if (currentQuestion < TOTAL_QUESTIONS) {
          // Move to next question
          console.log("➡️ Moving to next question...");
          currentQuestion++;
          setupQuestion();
        } else {
          // All questions answered - show modal
          console.log("⏱️ All questions answered - showing modal...");
          showCompletionModal();
        }
      }, 2000);
    });
  });

  // ============================================
  // Initialize first question
  // ============================================
  setupQuestion();
  updateScoreDisplay();
  
  console.log("🚀 Game ready! Click an image to start.");
  console.log("📋 Total questions in this page:", TOTAL_QUESTIONS);
});

console.log('✅ Temporal Concepts (sebelum/selepas) game with LOCKED score system loaded!');