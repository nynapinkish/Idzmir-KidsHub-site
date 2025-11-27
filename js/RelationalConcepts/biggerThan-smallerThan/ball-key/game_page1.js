// Add pulse animation to Next button
function addPulseToNextButton() {
  const nextButton = document.getElementById('nextButton');
  if (nextButton) {
    nextButton.classList.add('pulse');
  }
}

// Local score display update (visual only)
function updateLocalScoreDisplay(currentScore, maxAttempts) {
  const scoreText = document.getElementById('scoreText');
  const scoreDisplay = document.querySelector('.score-display');
  
  if (scoreText) {
    scoreText.textContent = `${currentScore}/${maxAttempts}`;
  }
  
  if (scoreDisplay) {
    scoreDisplay.classList.add('score-update');
    setTimeout(() => {
      scoreDisplay.classList.remove('score-update');
    }, 500);
  }
}

// Global variables for onclick function
let score = 0;
let attemptsUsed = 0;
const totalAttempts = 4;
let clickedImages = new Set();
let isGameLocked = false;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('========================================');
  console.log('⚽ BALL vs KEY GAME (Bigger/Smaller)');
  console.log('========================================');
  
  // Check sessionStorage
  console.log('📋 Session Data:');
  console.log('   - userName:', sessionStorage.getItem('userName'));
  console.log('   - studentId:', sessionStorage.getItem('studentId'));
  console.log('   - userRole:', sessionStorage.getItem('userRole'));
  
  // Wait for gameSessionManager to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if gameSession is available
  if (typeof window.gameSession === 'undefined') {
    console.error('❌ gameSessionManager not loaded!');
    console.error('⚠️ Game will continue without score tracking');
  } else {
    console.log('✅ gameSessionManager loaded');
  }
  
  console.log('✅ Firebase ready:', typeof firebase !== 'undefined');
  
  // Initialize game session
  console.log('\n⚽ Initializing ball/key game...');
  let gameStarted = true;
  
  if (typeof initializeGame === 'function') {
    // ✅ FIXED: Use exact game key from gameSessionManager
    gameStarted = await initializeGame('Relational Concepts', 'biggerThan / smallerThan / ball', 4);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }

  // Initialize elements
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  const clickableImagesElements = document.querySelectorAll('.clickable-image');

  // ✅ HANDLE GAME ALREADY PLAYED (After Refresh)
  if (!gameStarted && window.gameSession) {
    console.log('🔒 Game already played - showing previous score');
    isGameLocked = true;
    
    const existingScore = window.gameSession.existingScore;
    console.log('   📊 Existing Score:', existingScore, '/', totalAttempts);
    
    // Update global score variable
    score = existingScore;
    attemptsUsed = totalAttempts;
    
    // Show score at top
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      updateLocalScoreDisplay(existingScore, totalAttempts);
      console.log('   ✅ Top score display shown');
    }
    
    // Show final score modal with COMPLETE styling
    if (scoreModal && finalScoreDisplay) {
      finalScoreDisplay.textContent = `${existingScore}/${totalAttempts}`;
      
      // Apply ALL modal styles
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
      scoreModal.style.opacity = '1';
      scoreModal.style.visibility = 'visible';
      
      console.log('   ✅ Score modal displayed with full styling');
      
      // Show and animate next button
      if (nextButton) {
        nextButton.style.display = 'block';
        nextButton.style.opacity = '1';
        nextButton.style.visibility = 'visible';
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
        nextButton.style.zIndex = '10001';
        addPulseToNextButton();
        console.log('   ✅ Next button shown and animated');
      }
    }
    
    // Disable all clickable images
    clickableImagesElements.forEach(img => {
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.5';
      img.style.cursor = 'not-allowed';
    });
    
    console.log('✅ Previous score displayed - game locked');
    console.log('========================================\n');
    return; // Stop execution here
  }

  // ✅ NEW GAME - First time playing
  if (window.gameSession) {
    console.log('✅ Game session started successfully');
    console.log('   - Concept:', window.gameSession.conceptType);
    console.log('   - Game:', window.gameSession.gameName);
    console.log('   - Game Key:', window.gameSession.gameKey);
    console.log('   - Max Score:', window.gameSession.maxScore);
    console.log('   - Active:', window.gameSession.isSessionActive);
  }

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateLocalScoreDisplay(score, totalAttempts);
    console.log('✅ Score display shown');
  }

  console.log("\n🚀 Game ready! You have 4 attempts!");
  console.log(`🎯 Click wisely - only ${totalAttempts} clicks allowed!`);
  console.log('========================================\n');
});

// 🎯 CHECK ANSWER (Called from onclick in HTML)
function selectOption(element, imageName, itemName) {
  console.log(`🎯 Clicked: ${itemName} (${imageName})`);
  
  // Check if game is locked
  if (isGameLocked) {
    console.log("🔒 Game is locked - cannot play!");
    return;
  }
  
  // Prevent clicking same image twice
  if (clickedImages.has(element)) {
    console.log("⚠️ Image already clicked!");
    return;
  }

  // Check if max attempts reached
  if (attemptsUsed >= totalAttempts) {
    console.log("⚠️ Max attempts reached!");
    return;
  }

  clickedImages.add(element);
  attemptsUsed++;
  console.log(`\n📊 CLICK #${attemptsUsed}/${totalAttempts}`);

  const answer = element.getAttribute('data-answer');

  if (answer === 'correct') {
    // ✅ CORRECT ANSWER - GLOW HIJAU JE
    score++;
    element.classList.add('correct-glow');
    console.log("✅ CORRECT! Score:", score);
    
    // Update gameSession score if available
    if (typeof handleCorrectAnswer === 'function' && window.gameSession) {
      handleCorrectAnswer();
      console.log('   ✅ handleCorrectAnswer() called');
      console.log('   📊 GameSession score:', window.gameSession.currentScore, '/', window.gameSession.maxScore);
    }
    
    updateLocalScoreDisplay(score, totalAttempts);

    // Disable this image
    element.style.pointerEvents = 'none';
    element.style.opacity = '1';

  } else if (answer === 'wrong') {
    // ❌ WRONG ANSWER - SHAKE MERAH JE
    element.classList.add('wrong-shake');
    console.log("❌ WRONG! Score remains:", score);
    
    // Remove shake animation after it completes and fade out
    setTimeout(() => {
      element.classList.remove('wrong-shake');
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
    }, 800);
    
    updateLocalScoreDisplay(score, totalAttempts);
  }

  // Check if game should end
  if (attemptsUsed >= totalAttempts) {
    console.log('\n🎉 GAME FINISHED!');
    console.log('========================================');
    console.log('📊 FINAL SCORES:');
    console.log('   Local score:', score, '/', totalAttempts);
    if (window.gameSession) {
      console.log('   GameSession score:', window.gameSession.currentScore, '/', window.gameSession.maxScore);
      console.log('   Session active?', window.gameSession.isSessionActive);
    }
    console.log('========================================');
    
    // Disable all remaining images
    const clickableImagesAll = document.querySelectorAll('.clickable-image');
    clickableImagesAll.forEach(img => {
      img.style.pointerEvents = 'none';
    });
    
    // Show result FAST - 500ms after last click
    setTimeout(() => showFinalResult(), 500);
  }
}

// 🎉 SHOW FINAL RESULT
async function showFinalResult() {
  console.log('\n💾 ATTEMPTING TO SAVE TO FIREBASE...');
  
  // Save to Firebase if gameSession available
  if (window.gameSession && window.gameSession.isSessionActive) {
    console.log('   Before save - gameSession.currentScore:', window.gameSession.currentScore);
    console.log('   Before save - gameSession.isSessionActive:', window.gameSession.isSessionActive);
    
    try {
      const saved = await window.gameSession.endSession();
      
      console.log('\n📊 SAVE RESULT:', saved ? '✅ SUCCESS' : '❌ FAILED');
      
      if (!saved) {
        console.error('❌ FIREBASE SAVE FAILED!');
      }
    } catch (error) {
      console.error('❌ EXCEPTION during save:', error);
    }
  } else {
    console.warn('⚠️ No active gameSession - score not saved');
  }
  
  console.log("🎉 Showing final result!");
  
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  
  if (scoreModal && finalScoreDisplay) {
    // Update final score
    finalScoreDisplay.textContent = `${score}/${totalAttempts}`;
    console.log("✅ Final Score:", `${score}/${totalAttempts}`);
    
    // Show modal
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
    
    console.log("🎨 Score modal displayed!");
    
    // Show next button IMMEDIATELY with modal (same time)
    if (nextButton) {
      nextButton.style.display = 'block';
      nextButton.style.opacity = '1';
      nextButton.style.pointerEvents = 'auto';
      nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
      nextButton.style.zIndex = '10001'; // Higher than modal
      addPulseToNextButton();
      console.log("⬆️ Next button activated!");
    }
  }
}