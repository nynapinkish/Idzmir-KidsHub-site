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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('========================================');
  console.log('🐔 CHICKEN MATCHING GAME');
  console.log('========================================');
  
  // Check sessionStorage
  console.log('📋 Session Data:');
  console.log('   - userName:', sessionStorage.getItem('userName'));
  console.log('   - studentId:', sessionStorage.getItem('studentId'));
  console.log('   - userRole:', sessionStorage.getItem('userRole'));
  
  // Wait for gameSessionManager to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if gameSession is available
  if (typeof gameSession === 'undefined') {
    console.error('❌ gameSessionManager not loaded!');
    console.error('⚠️ Game will continue without score tracking');
  } else {
    console.log('✅ gameSessionManager loaded');
  }
  
  console.log('✅ Firebase ready:', typeof firebase !== 'undefined');
  
  // Initialize game session
  console.log('\n🐔 Initializing chicken matching game...');
  let gameStarted = true;
  
  if (typeof initializeGame === 'function') {
    gameStarted = await initializeGame('Relational Concepts', 'match mismatch / chicken', 2);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }

  // Initialize elements
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  const clickableImages = document.querySelectorAll('.clickable-image');

  // Game state
  let score = 0;
  const totalAttempts = 2; // User can click 2 times
  let attemptsUsed = 0;
  let clickedImages = new Set(); // Track clicked images

  // ✅ HANDLE GAME ALREADY PLAYED (After Refresh)
  if (!gameStarted && typeof gameSession !== 'undefined') {
    console.log('🔒 Game already played - showing previous score');
    
    const existingScore = gameSession.existingScore;
    console.log('   📊 Existing Score:', existingScore, '/', totalAttempts);
    
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
        addPulseToNextButton();
        console.log('   ✅ Next button shown and animated');
      }
    }
    
    // Disable all clickable images
    clickableImages.forEach(img => {
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.5';
      img.style.cursor = 'not-allowed';
    });
    
    console.log('✅ Previous score displayed - game locked');
    console.log('========================================\n');
    return; // Stop execution here
  }

  // ✅ NEW GAME - First time playing
  if (typeof gameSession !== 'undefined') {
    console.log('✅ Game session started successfully');
    console.log('   - Concept:', gameSession.conceptType);
    console.log('   - Game:', gameSession.gameName);
    console.log('   - Game Key:', gameSession.gameKey);
    console.log('   - Max Score:', gameSession.maxScore);
    console.log('   - Active:', gameSession.isSessionActive);
  }

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateLocalScoreDisplay(score, totalAttempts);
    console.log('✅ Score display shown');
  }

  // ✅ CHECK ANSWER
  function checkAnswer(clickedImage) {
    // Prevent clicking same image twice
    if (clickedImages.has(clickedImage)) {
      console.log("⚠️ Image already clicked!");
      return;
    }

    // Check if max attempts reached
    if (attemptsUsed >= totalAttempts) {
      console.log("⚠️ Max attempts reached!");
      return;
    }

    clickedImages.add(clickedImage);
    attemptsUsed++;
    console.log(`\n📊 CLICK #${attemptsUsed}/${totalAttempts}`);

    const answer = clickedImage.getAttribute('data-answer');

    if (answer === 'correct') {
      // ✅ CORRECT ANSWER
      score++;
      clickedImage.classList.add('correct-glow');
      console.log("✅ CORRECT! Score:", score);
      
      // Update gameSession score if available
      if (typeof handleCorrectAnswer === 'function') {
        handleCorrectAnswer();
        console.log('   ✅ handleCorrectAnswer() called');
        if (typeof gameSession !== 'undefined') {
          console.log('   📊 GameSession score:', gameSession.currentScore, '/', gameSession.maxScore);
        }
      }
      
      updateLocalScoreDisplay(score, totalAttempts);

      // ✅ FIX: Disable clicked image only, keep other correct images clickable
      clickedImage.style.pointerEvents = 'none';
      clickedImage.style.opacity = '1'; // Keep full opacity for correct answer

    } else if (answer === 'wrong') {
      // ❌ WRONG ANSWER
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score remains:", score);
      
      // Remove shake animation after it completes
      setTimeout(() => {
        clickedImage.classList.remove('wrong-shake');
        // Fade out wrong image
        clickedImage.style.opacity = '0.5';
        clickedImage.style.pointerEvents = 'none';
      }, 800);
      
      updateLocalScoreDisplay(score, totalAttempts);
    }

    // Check if game should end
    if (attemptsUsed >= totalAttempts) {
      console.log('\n🎉 GAME FINISHED!');
      console.log('========================================');
      console.log('📊 FINAL SCORES:');
      console.log('   Local score:', score, '/', totalAttempts);
      if (typeof gameSession !== 'undefined') {
        console.log('   GameSession score:', gameSession.currentScore, '/', gameSession.maxScore);
        console.log('   Session active?', gameSession.isSessionActive);
      }
      console.log('========================================');
      
      // Disable all remaining images
      clickableImages.forEach(img => {
        img.style.pointerEvents = 'none';
      });
      
      setTimeout(() => showFinalResult(), 1500);
    }
  }

  // 🎉 SHOW FINAL RESULT
  async function showFinalResult() {
    console.log('\n💾 ATTEMPTING TO SAVE TO FIREBASE...');
    
    // Save to Firebase if gameSession available
    if (typeof gameSession !== 'undefined' && gameSession.isSessionActive) {
      console.log('   Before save - gameSession.currentScore:', gameSession.currentScore);
      console.log('   Before save - gameSession.isSessionActive:', gameSession.isSessionActive);
      
      try {
        const saved = await gameSession.endSession();
        
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
      
      // Show next button after 1 second
      if (nextButton) {
        setTimeout(() => {
          nextButton.style.display = 'block';
          nextButton.style.opacity = '0';
          nextButton.style.pointerEvents = 'none';
          
          setTimeout(() => {
            nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'auto';
            nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
            addPulseToNextButton();
            console.log("⬆️ Next button activated!");
          }, 100);
        }, 1000);
      }
    }
  }

  // Add click event to all clickable images
  clickableImages.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("\n🚀 Game ready! You have 2 attempts!");
  console.log(`🎯 Click wisely - only ${totalAttempts} clicks allowed!`);
  console.log('========================================\n');
});