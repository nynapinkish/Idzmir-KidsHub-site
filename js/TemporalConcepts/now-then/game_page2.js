// ===============================================
// TEMPORAL CONCEPTS - sekarang/kemudian
// With Firebase Integration (First Attempt Only)
// FIXED: Proper score retrieval after refresh
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Temporal Concepts';
const GAME_NAME = 'sekarang / kemudian';
const GAME_KEY = 'sekarang_/_kemudian';
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
      console.warn('⚠️ No studentId in session - allowing first play');
      return false;
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('⚠️ Student not found in Firebase - allowing first play');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    console.log('🔍 Checking game status...');
    console.log('   Looking for game key:', GAME_KEY);
    
    const conceptProgress = studentData.conceptProgress || {};
    
    // ✅ CRITICAL FIX: Search ALL concepts for the game key
    for (const conceptType in conceptProgress) {
      const conceptData = conceptProgress[conceptType];
      const gamesCompleted = conceptData.gamesCompleted || {};
      
      console.log(`   Checking ${conceptType}:`, Object.keys(gamesCompleted));
      
      // Check if game exists (allow score of 0)
      if (gamesCompleted[GAME_KEY] !== undefined && gamesCompleted[GAME_KEY] >= 0) {
        existingScore = gamesCompleted[GAME_KEY];
        gameAlreadyPlayed = true;
        console.log(`🔒 Game FOUND in ${conceptType}!`);
        console.log(`   Score: ${existingScore}/${TOTAL_QUESTIONS}`);
        return true;
      }
    }

    console.log('✅ Game not found in any concept - first time playing');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    console.error('   Error details:', error.message);
    return false;
  }
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🔒 Showing LOCKED screen - score already saved');
  console.log(`   Existing score: ${existingScore}/${TOTAL_QUESTIONS}`);
  
  // 1️⃣ UPDATE SCORE BANNER (TOP RIGHT) FIRST
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner updated: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // 2️⃣ HIDE GAME ELEMENTS
  const imageContainer = document.querySelector('.image-container');
  const bannerContainer = document.querySelector('.banner-container');
  const answerBtnContainer = document.querySelector('.answer-btn-container');
  
  if (imageContainer) {
    imageContainer.style.display = 'none';
    console.log('✅ Hidden: .image-container');
  }
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
  }
  if (answerBtnContainer) {
    answerBtnContainer.style.display = 'none';
    console.log('✅ Hidden: .answer-btn-container');
  }

  // 3️⃣ SHOW MODAL WITH EXISTING SCORE
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');

  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`🏆 Modal score: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  if (scoreModal) {
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
    console.log('✅ Modal displayed');
  }

  // 4️⃣ SHOW NEXT BUTTON
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');

  if (nextButtonContainer && nextButton) {
    nextButtonContainer.style.zIndex = '10001';
    nextButtonContainer.style.position = 'fixed';
    nextButton.style.opacity = '1';
    nextButton.style.display = 'block';
    nextButton.style.pointerEvents = 'auto';
    nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
    console.log('✅ Next button shown');
  }

  console.log('✅ LOCKED screen fully displayed - Cannot replay game');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Sekarang/Kemudian Game loading...");
  console.log("   Game Key:", GAME_KEY);
  
  // ⚠️ CRITICAL: Wait for Firebase to be fully ready
  let attempts = 0;
  const maxAttempts = 15;
  
  while (attempts < maxAttempts) {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      console.log('✅ Firebase ready!');
      break;
    }
    console.log(`⏳ Waiting for Firebase... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 300));
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.error('❌ Firebase failed to load after 4.5 seconds');
    alert('Firebase gagal dimuat. Sila refresh halaman.');
    return;
  }

  console.log("🔍 Checking if game already played...");

  // ✅ Check if game already played
  const hasPlayed = await checkGameStatus();
  
  console.log("📊 Game Status Check Result:");
  console.log("   hasPlayed:", hasPlayed);
  console.log("   existingScore:", existingScore);
  console.log("   gameAlreadyPlayed:", gameAlreadyPlayed);
  
  if (hasPlayed) {
    console.log("🔒 Game WAS played before - showing existing score");
    await showAlreadyPlayedScreen();
    return; // ⚠️ STOP HERE - Don't initialize game
  }

  console.log("✅ First time playing - initializing new game session...");

  // Initialize NEW game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game session');
    alert('Gagal memulakan game. Sila refresh halaman.');
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

  console.log("🎮 Game elements loaded:");
  console.log("   Images found:", images.length);
  console.log("   Score modal:", scoreModal ? '✅' : '❌');
  console.log("   Next button:", nextButton ? '✅' : '❌');

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
      // Question 1: Mana Sekarang?
      bannerBlue.textContent = 'Mana sekarang?';
      answerText.textContent = 'sekarang';
      console.log("❓ Question 1: Mana sekarang?");
    } else if (currentQuestion === 2) {
      // Question 2: Mana Kemudian?
      bannerBlue.textContent = 'Mana kemudian?';
      answerText.textContent = 'kemudian';
      console.log("❓ Question 2: Mana kemudian?");
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
    console.log("🎉 All questions completed - showing modal!");
    
    if (!scoreModal || !finalScoreDisplay) {
      console.error("❌ Modal elements not found!");
      return;
    }

    // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
    if (typeof gameSession !== 'undefined') {
      gameSession.currentScore = correctAnswers;
      console.log(`🎯 FORCED gameSession.currentScore = ${correctAnswers}`);
    }

    // ✅ CRITICAL: Save score to Firebase FIRST
    console.log('💾 Saving score to Firebase...');
    console.log(`   Final score: ${correctAnswers}/${totalAttempts}`);
    console.log(`   gameSession.currentScore: ${gameSession?.currentScore}`);
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ Score saved successfully to Firebase!');
        console.log('🔒 Game is now LOCKED - Cannot replay');
      } else {
        console.error('❌ Failed to save score to Firebase');
      }
    } else {
      console.error('❌ gameSession not found or endSession missing');
    }

    // Update final score in modal
    finalScoreDisplay.textContent = `${correctAnswers}/${totalAttempts}`;
    console.log("🏆 Final score displayed:", finalScoreDisplay.textContent);
    
    // Show modal with full screen overlay
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

    // Animate next button after 1 second
    if (nextButton && nextButtonContainer) {
      nextButtonContainer.style.zIndex = '10001';
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
        // Question 1: Mana Sekarang? → Correct = "Sekarang"
        correctAnswer = this.alt === 'Sekarang' ? 'correct' : 'wrong';
      } else {
        // Question 2: Mana Kemudian? → Correct = "Kemudian"
        correctAnswer = this.alt === 'Kemudian' ? 'correct' : 'wrong';
      }
      
      console.log("📝 Answer:", correctAnswer);
      
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
        
        // Add green glow animation
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
        
        // Add red shake animation
        this.classList.add('wrong-shake');
        
        // Show correct answer with green glow
        images.forEach(img => {
          let isCorrect = false;
          if (currentQuestion === 1 && img.alt === 'Sekarang') isCorrect = true;
          if (currentQuestion === 2 && img.alt === 'Kemudian') isCorrect = true;
          
          if (isCorrect) {
            setTimeout(() => {
              img.classList.add('correct-glow');
            }, 600);
          }
        });
      }

      // Update score display
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
          console.log("🏁 All questions answered - showing completion modal...");
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
  console.log(`📋 Total questions: ${TOTAL_QUESTIONS}`);
});

console.log('✅ Temporal Concepts (sekarang/kemudian) game loaded!');
console.log('🔒 Game lock system active - First attempt only');