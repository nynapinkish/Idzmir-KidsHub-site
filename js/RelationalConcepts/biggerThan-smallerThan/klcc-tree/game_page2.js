// ==================== GLOBAL VARIABLES ====================
let score = 0;
let attemptsUsed = 0;
const totalAttempts = 4;
let clickedImages = new Set();
let isGameLocked = false;

// ==================== UTILITY FUNCTIONS ====================
function addPulseToNextButton() {
  const nextButton = document.getElementById('nextButton');
  if (nextButton) {
    nextButton.classList.add('pulse');
  }
}

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

function updateStarColors(correctAnswers, totalQuestions) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const stars = document.querySelectorAll('.star-image');
  
  console.log("🌟 Updating star colors - Total Score:", correctAnswers, "/", totalQuestions, "=", percentage.toFixed(0) + "%");
  
  let filterStyle;
  
  if (percentage >= 80) {
    filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
    console.log("⭐ GOLD STARS - Excellent score!");
  } else if (percentage >= 50) {
    filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
    console.log("🟠 ORANGE STARS - Good score!");
  } else {
    filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
    console.log("🔴 RED STARS - Keep practicing!");
  }

  stars.forEach(star => {
    star.style.filter = filterStyle;
    star.style.transition = 'filter 0.5s ease-in-out';
  });
}

// ==================== GAME LOGIC - MUST BE GLOBAL ====================
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
    
    // Show result with concept summary
    setTimeout(() => showFinalResult(), 500);
  }
}

// ==================== FINAL RESULT & SUMMARY ====================
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
  
  // Show concept summary
  await showConceptSummary();
}

// Get all games score from Firebase for summary display
async function getAllGamesScoreFromFirebase() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return null;

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) return null;

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    const conceptProgress = studentData.conceptProgress || {};
    const relationalConcepts = conceptProgress['Relational Concepts'];

    if (!relationalConcepts) return null;

    console.log('✅ Firebase data retrieved:', relationalConcepts);
    return relationalConcepts;
  } catch (error) {
    console.error('❌ Error getting Firebase data:', error);
    return null;
  }
}

async function showConceptSummary() {
  console.log("🎉 Showing concept summary from Firebase!");
  
  const scoreModal = document.getElementById('scoreModal');
  const gamesScoreList = document.getElementById('gamesScoreList');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  
  if (!scoreModal || !gamesScoreList) {
    console.error('❌ Modal elements not found!');
    return;
  }
  
  // Get student ID
  const studentId = sessionStorage.getItem('studentId');
  
  if (!studentId) {
    console.error('❌ No studentId found!');
    return;
  }
  
  try {
    console.log('📡 Fetching Relational Concepts data from Firebase...');
    console.log('👤 Student ID:', studentId);
    
    // ✅ Use the helper function to get Firebase data
    const firebaseData = await getAllGamesScoreFromFirebase();
    
    // ✅ FALLBACK: If no data found, show current game score only
    if (!firebaseData || !firebaseData.gamesCompleted) {
      console.warn('⚠️ No games found in Firebase - showing current game only!');
      
      // Use current game score
      const gamesHTML = `
        <div class="game-score-item">
          <span class="game-name">biggerThan / smallerThan / tree</span>
          <span class="game-score">${score}/${totalAttempts}</span>
        </div>
      `;
      
      const percentage = Math.round((score / totalAttempts) * 100);
      
      gamesScoreList.innerHTML = gamesHTML;
      if (totalScorePercentage) {
        totalScorePercentage.textContent = `${percentage}%`;
      }
      
      updateStarColors(score, totalAttempts);
      
      console.log('✅ Using fallback - Current game score only');
      console.log('   Score:', score, '/', totalAttempts, '=', percentage + '%');
      
    } else {
      // ✅ NORMAL FLOW: Build complete games list from Firebase
      console.log('\n📋 GAMES FOUND IN FIREBASE:');
      console.log('========================================');
      
      const gamesCompleted = firebaseData.gamesCompleted;
      
      // Define game display names and their max scores
      const GAME_CONFIG = [
        { key: 'biggerthan_/_smallerthan_/_ball', name: 'Bigger Than - Ball', max: 4 },
        { key: 'biggerthan_/_smallerthan_/_key', name: 'Smaller Than - Key', max: 4 },
        { key: 'biggerthan_/_smallerthan_/_elephant', name: 'Bigger Than - Elephant', max: 4 },
        { key: 'biggerthan_/_smallerthan_/_chicken', name: 'Smaller Than - Chicken', max: 4 },
        { key: 'biggerthan_/_smallerthan_/_klcc', name: 'Bigger Than - KLCC', max: 4 },
        { key: 'biggerthan_/_smallerthan_/_tree', name: 'Smaller Than - Tree', max: 4 }
      ];
      
      let totalScore = 0;
      let totalMaxScore = 0;
      let gamesHTML = '';
      
      // Build list from games that have been completed
      GAME_CONFIG.forEach(game => {
        const gameScore = gamesCompleted[game.key];
        
        // Only show games that have been completed
        if (gameScore !== undefined) {
          totalScore += gameScore;
          totalMaxScore += game.max;
          
          console.log(`   ${game.name}: ${gameScore}/${game.max}`);
          
          gamesHTML += `
            <div class="game-score-item">
              <span class="game-name">${game.name}</span>
              <span class="game-score">${gameScore}/${game.max}</span>
            </div>
          `;
        }
      });
      
      console.log('========================================');
      console.log('📊 TOTALS:');
      console.log('   Total Score:', totalScore);
      console.log('   Max Score:', totalMaxScore);
      
      // Calculate percentage
      const percentage = totalMaxScore > 0 
        ? Math.round((totalScore / totalMaxScore) * 100) 
        : 0;
      
      console.log('   Percentage:', percentage + '%');
      console.log('========================================\n');
      
      // Update modal content
      gamesScoreList.innerHTML = gamesHTML;
      
      if (totalScorePercentage) {
        totalScorePercentage.textContent = `${percentage}%`;
      }
      
      // Update star colors based on total percentage
      updateStarColors(totalScore, totalMaxScore);
    }
    
    // ✅ SHOW MODAL (Same for both paths)
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
    
    console.log("🎨 Concept summary modal displayed!");
    
    // Setup button handlers with fade-in
    if (continueBtn) {
      continueBtn.style.opacity = '0';
      continueBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        continueBtn.style.transition = 'opacity 0.5s ease-in-out';
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
        continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log("➡️ Continue button activated!");
      }, 1000);
      
      continueBtn.onclick = () => {
        console.log("➡️ Continue to next concept");
        window.location.href = '../../../../html/RelationalConcepts/relationalConcepts.html';
      };
    }
    
    if (finishBtn) {
      finishBtn.style.opacity = '0';
      finishBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        finishBtn.style.transition = 'opacity 0.5s ease-in-out';
        finishBtn.style.opacity = '1';
        finishBtn.style.pointerEvents = 'auto';
        console.log("🏁 Finish button activated!");
      }, 1000);
      
      finishBtn.onclick = () => {
        console.log("🏁 Finish - Going to homepage");
        window.location.href = '../../../../html/homepage/homepage.html';
      };
    }
    
  } catch (error) {
    console.error('❌ Error fetching concept summary:', error);
    console.error('Error details:', error.message);
    
    // ✅ EMERGENCY FALLBACK
    console.log('🆘 Using emergency fallback!');
    
    const gamesHTML = `
      <div class="game-score-item">
        <span class="game-name">Current Game</span>
        <span class="game-score">${score}/${totalAttempts}</span>
      </div>
    `;
    
    const percentage = Math.round((score / totalAttempts) * 100);
    
    gamesScoreList.innerHTML = gamesHTML;
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${percentage}%`;
    }
    
    updateStarColors(score, totalAttempts);
    
    // Show modal anyway
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
  }
}

// ==================== DOM INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('========================================');
  console.log('🌳 TREE Game (Lebih Rendah) - LAST GAME');
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
  console.log('\n🌳 Initializing tree game...');
  let gameStarted = true;
  
  if (typeof initializeGame === 'function') {
    // ✅ Use exact game key from gameSessionManager
    gameStarted = await initializeGame('Relational Concepts', 'biggerThan / smallerThan / tree', 4);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }

  // Initialize elements
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const clickableImagesElements = document.querySelectorAll('.clickable-image');

  // ✅ HANDLE GAME ALREADY PLAYED (After Refresh)
  if (!gameStarted && window.gameSession) {
    console.log('🔒 Game already played - showing concept summary');
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
    
    // Disable all clickable images
    clickableImagesElements.forEach(img => {
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.5';
      img.style.cursor = 'not-allowed';
    });
    
    // Show concept summary directly
    await showConceptSummary();
    
    console.log('✅ Concept summary displayed - game locked');
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