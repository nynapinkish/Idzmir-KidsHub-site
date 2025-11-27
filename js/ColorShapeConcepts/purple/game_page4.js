// ===============================================
// COLOR & SHAPE - Hijau/Green Color
// With Firebase Integration (First Attempt Only)
// FIXED: Next Button Properly Shows After Modal
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Color & Shape';
const GAME_NAME = 'ungu';
const GAME_KEY = 'ungu';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let score = 0;
let totalAttempts = 0;
let fruitCount = 0;
const maxDrags = 2; // Maximum 2 correct answers

// ================= DOM ELEMENTS =================
const fruits = document.querySelectorAll('.fruit-selection img');
const backgroundArea = document.getElementById('backgroundArea');
const scoreModal = document.getElementById('scoreModal');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreText = document.getElementById('scoreText');

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
    
    // ✅ CRITICAL: Search ALL concepts for the game key
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

// ================= UPDATE STAR COLORS (based on current game only) =================
function updateStarColors(currentScore, maxScore) {
  const stars = document.querySelectorAll('.star-image');
  
  const percentage = (currentScore / maxScore) * 100;
  console.log('⭐ Updating star colors based on', percentage + '%');
  
  let filterStyle;
  
  if (percentage >= 80) {
    filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
    console.log('   ⭐ GOLD STARS - Excellent!');
  } else if (percentage >= 50) {
    filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
    console.log('   🟠 ORANGE STARS - Good!');
  } else {
    filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
    console.log('   🔴 RED STARS - Keep practicing!');
  }

  stars.forEach(star => {
    star.style.filter = filterStyle;
    star.style.transition = 'filter 0.5s ease-in-out';
  });
}

// ================= UPDATE SCORE DISPLAY =================
function updateScoreDisplay() {
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log("📊 Score updated:", `${score}/${totalAttempts}`);
  }
}

// ================= FORCE SHOW NEXT BUTTON =================
function forceShowNextButton() {
  console.log('🔍 Attempting to show Next button...');
  
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');
  const parentLink = document.querySelector('.next-button-container a');
  
  console.log('🔍 Container found:', !!nextButtonContainer);
  console.log('🔍 Button found:', !!nextButton);
  console.log('🔍 Link found:', !!parentLink);
  
  // 🔥 CRITICAL: Show container FIRST!
  if (nextButtonContainer) {
    nextButtonContainer.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      z-index: 99999 !important;
      pointer-events: auto !important;
    `;
    console.log('✅ Container forced visible!');
  }
  
  // Then show the link
  if (parentLink) {
    parentLink.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
    `;
    console.log('✅ Link forced visible!');
  }
  
  // Finally show the button with CORRECT SIZE
  if (nextButton) {
    nextButton.style.cssText = `
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      width: 130px !important;
      max-width: 130px !important;
      height: auto !important;
      cursor: pointer !important;
      transform-origin: center !important;
      animation: bounceButton 1s ease-in-out infinite !important;
    `;
    console.log('✅ Button forced visible with correct size (130px)!');
  } else {
    console.error('❌ Button NOT FOUND!');
  }
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🔒 Showing LOCKED screen - score already saved');
  console.log(`   Existing score: ${existingScore}/${TOTAL_QUESTIONS}`);
  
  // 1️⃣ UPDATE SCORE BANNER (TOP RIGHT)
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // 2️⃣ HIDE GAME ELEMENTS
  const fruitSelection = document.querySelector('.fruit-selection');
  const bannerContainer = document.querySelector('.banner-container');
  
  if (fruitSelection) {
    fruitSelection.style.display = 'none';
    console.log('✅ Hidden: .fruit-selection');
  }
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
  }
  if (backgroundArea) {
    backgroundArea.style.pointerEvents = 'none';
    console.log('✅ Disabled: background area');
  }

  // 3️⃣ UPDATE STAR COLORS (based on THIS game only)
  updateStarColors(existingScore, TOTAL_QUESTIONS);

  // 4️⃣ UPDATE MODAL - Show final score for THIS game
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`🏆 Final score: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // 5️⃣ SHOW MODAL
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

  // 6️⃣ SHOW NEXT BUTTON - IMPROVED VERSION
  setTimeout(() => {
    forceShowNextButton();
  }, 500);

  console.log('✅ LOCKED screen fully displayed - Cannot replay');
}

// ================= SHOW COMPLETION MODAL =================
async function showFinalScore() {
  console.log('🎉 All drags completed - showing final score!');
  console.log(`   Final score: ${score}/${totalAttempts}`);
  
  if (!scoreModal) {
    console.error('❌ Score modal not found');
    return;
  }

  // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
  if (typeof gameSession !== 'undefined') {
    gameSession.currentScore = score;
    console.log(`🎯 FORCED gameSession.currentScore = ${score}`);
  }

  // ✅ CRITICAL: Save score to Firebase FIRST
  console.log('💾 Saving final score to Firebase...');
  console.log(`   Score: ${score}/${totalAttempts}`);
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

  // Update star colors (based on THIS game only)
  updateStarColors(score, totalAttempts);
  
  // Update final score display
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${score}/${totalAttempts}`;
    console.log(`🏆 Final score displayed: ${score}/${totalAttempts}`);
  }
  
  // Show modal with full screen overlay
  scoreModal.style.display = 'flex';
  scoreModal.style.position = 'fixed';
  scoreModal.style.top = '0';
  scoreModal.style.left = '0';
  scoreModal.style.width = '100%';
  scoreModal.style.height = '100%';
  scoreModal.style.zIndex = '10000';
  scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  scoreModal.style.alignItems = 'center';
  scoreModal.style.justifyContent = 'center';
  scoreModal.style.animation = 'fadeIn 0.3s ease';
  
  console.log("✅ Modal displayed!");

  // 🔥 SHOW NEXT BUTTON - NEW IMPROVED VERSION
  setTimeout(() => {
    forceShowNextButton();
  }, 1000);
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Green Color (Hijau) Drag & Drop Game loading...");
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

  // Show score display at start
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
    console.log('✅ Score display shown!');
  }

  // ============================================
  // DRAG AND DROP LOGIC
  // ============================================
  fruits.forEach(fruit => {
    fruit.addEventListener('dragstart', e => {
      const color = fruit.dataset.color;
      const src = fruit.src;
      const fruitId = fruit.dataset.fruit;
      
      e.dataTransfer.setData('color', color);
      e.dataTransfer.setData('src', src);
      e.dataTransfer.setData('fruit', fruitId);
      
      console.log(`🖐️ Dragging fruit: ${fruitId} (${color})`);
    });
  });

  backgroundArea.addEventListener('dragover', e => e.preventDefault());

  backgroundArea.addEventListener('drop', e => {
    e.preventDefault();

    // Check if already reached max drags
    if (totalAttempts >= maxDrags) {
      console.log('❌ Maximum drags reached!');
      return;
    }

    const color = e.dataTransfer.getData('color');
    const src = e.dataTransfer.getData('src');
    const fruitId = e.dataTransfer.getData('fruit');

    console.log(`📦 Dropped: ${fruitId} (${color})`);

    // Check if fruit already used
    const usedFruit = document.querySelector(`.fruit-selection img[data-fruit="${fruitId}"]`);
    if (usedFruit && usedFruit.classList.contains('fruit-used')) {
      console.log('⚠️ Fruit already used');
      return;
    }

    totalAttempts++;
    console.log(`📈 Attempt ${totalAttempts}/${maxDrags}`);

    // Mark fruit as used
    if (usedFruit) {
      usedFruit.classList.add('fruit-used');
    }

    // ============================================
    // CORRECT ANSWER (Green/Hijau)
    // ============================================
    if (color === 'purple') {
      score++;
      console.log(`✅ CORRECT! Score: ${score}/${totalAttempts}`);
      
      // ⚠️ Update gameSession score immediately
      if (typeof gameSession !== 'undefined') {
        gameSession.currentScore = score;
        console.log(`🎯 Updated gameSession.currentScore to: ${score}`);
      }
      
      updateScoreDisplay();
      
      const dropped = document.createElement('img');
      dropped.src = src;
      dropped.classList.add('dropped-fruit');

      // Spacing for fruits
      const spacing = 200;
      const maxPerRow = 3;
      const row = Math.floor(fruitCount / maxPerRow);
      const col = fruitCount % maxPerRow;

      const offsetX = col * spacing - (spacing * (maxPerRow - 1)) / 2;
      const offsetY = row * 120;

      dropped.style.left = `calc(50% + ${offsetX}px)`;
      dropped.style.bottom = `${160 + offsetY}px`;

      backgroundArea.appendChild(dropped);
      fruitCount++;
      
    // ============================================
    // WRONG ANSWER
    // ============================================
    } else {
      console.log(`❌ WRONG! Expected purple, got ${color}`);
      updateScoreDisplay();
      
      // Shake animation for wrong answer
      if (usedFruit) {
        usedFruit.classList.add('shake-error');
        
        setTimeout(() => {
          usedFruit.classList.remove('shake-error');
        }, 600);
      }
    }

    // ============================================
    // Check if game over
    // ============================================
    if (totalAttempts >= maxDrags) {
      console.log('🏁 Game over! Max drags reached.');
      setTimeout(showFinalScore, 1500);
    }
  });

  console.log("🚀 Game ready! Drag purple fruits to the background.");
  console.log(`📋 Max drags allowed: ${maxDrags}`);
});

console.log('✅ Green Color (Hijau) Drag & Drop game loaded!');
console.log('🔒 Game lock system active - First attempt only');

// ⚠️ HIDE ALL NEXT BUTTONS AT START
document.addEventListener('DOMContentLoaded', () => {
  const nextButtons = document.querySelectorAll('.next-button');
  nextButtons.forEach((btn, index) => {
    btn.style.display = 'none';
    console.log(`🔒 Next button ${index + 1} hidden at start`);
  });
});

// 🔥 EMERGENCY FIX - Force show button on window click (for debugging)
window.addEventListener('click', function emergencyButtonFix() {
  const nextButton = document.querySelector('.next-button');
  const nextContainer = document.querySelector('.next-button-container');
  
  if (nextButton && scoreModal.style.display === 'flex') {
    console.log('🚨 EMERGENCY: Forcing button to show on click');
    
    // Nuclear option - remove ALL conflicting styles
    nextButton.style.cssText = '';
    if (nextContainer) nextContainer.style.cssText = '';
    
    // Apply clean styles
    if (nextContainer) {
      nextContainer.style.cssText = `
        position: fixed !important;
        bottom: 40px !important;
        right: 40px !important;
        z-index: 99999 !important;
        display: block !important;
      `;
    }
    
    nextButton.style.cssText = `
      display: block !important;
      width: 120px !important;
      height: auto !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
      position: relative !important;
      z-index: 99999 !important;
      animation: bounceButton 1s ease-in-out infinite !important;
      cursor: pointer !important;
      border: 3px solid red !important;
      background: yellow !important;
    `;
    
    console.log('✅ Button forced with RED BORDER for testing');
  }
}, { once: false });