// Add pulse animation to buttons
function addPulseToButton(selector) {
  const button = document.querySelector(selector);
  if (button) {
    button.classList.add('pulse');
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

// Get all Match-Mismatch games score from Firebase for summary
async function getAllMatchMismatchGamesFromFirebase() {
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

document.addEventListener('DOMContentLoaded', async () => {
  console.log('========================================');
  console.log('🕷️ SPIDER MATCHING GAME - LAST GAME');
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
  console.log('\n🕷️ Initializing spider matching game...');
  let gameStarted = true;
  
  if (typeof initializeGame === 'function') {
    gameStarted = await initializeGame('Relational Concepts', 'match mismatch / spider', 2);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }

  // Initialize elements
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const gamesScoreList = document.getElementById('gamesScoreList');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  const clickableImages = document.querySelectorAll('.clickable-image');

  // Game state
  let score = 0;
  const totalAttempts = 2;
  let attemptsUsed = 0;
  let clickedImages = new Set();

  if (!gameStarted && typeof gameSession !== 'undefined') {
    console.log('🔒 Game already played - showing summary');
    
    const existingScore = gameSession.existingScore;
    
    // Show score at top
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      updateLocalScoreDisplay(existingScore, totalAttempts);
    }
    
    // Show summary modal immediately
    setTimeout(() => showFinalResult(existingScore), 500);
    
    // Disable all clickable images
    clickableImages.forEach(img => {
      img.style.pointerEvents = 'none';
      img.style.opacity = '0.5';
      img.style.cursor = 'not-allowed';
    });
    
    console.log('✅ Previous score displayed - showing summary');
    return;
  }

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
      clickedImage.style.pointerEvents = 'none';

    } else if (answer === 'wrong') {
      // ❌ WRONG ANSWER
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score remains:", score);
      
      setTimeout(() => {
        clickedImage.classList.remove('wrong-shake');
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
      
      setTimeout(() => showFinalResult(score), 1500);
    }
  }

  // 🎉 SHOW FINAL RESULT WITH ALL MATCH-MISMATCH GAMES SUMMARY
  async function showFinalResult(finalScore) {
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
    
    // Get all Match-Mismatch games scores from Firebase
    console.log('\n📊 Loading all Match-Mismatch games scores...');
    const firebaseData = await getAllMatchMismatchGamesFromFirebase();
    
    if (scoreModal && gamesScoreList && totalScorePercentage) {
      if (!firebaseData) {
        console.error('❌ Cannot load Firebase data!');
        // Show at least current game score
        gamesScoreList.innerHTML = `
          <div class="game-score-row">
            <span class="game-name">Labah-labah</span>
            <span class="game-points">${finalScore}/${totalAttempts}</span>
          </div>
        `;
        totalScorePercentage.textContent = '0%';
      } else {
        // Build complete Match-Mismatch games score list from Firebase
        const gameNames = ['Kucing', 'Lembu', 'Ular', 'Anjing', 'Labah-labah'];
        const gameKeys = [
          'match_mismatch_/_cat',
          'match_mismatch_/_cow',
          'match_mismatch_/_snake',
          'match_mismatch_/_dog',
          'match_mismatch_/_spider'
        ];
        
        let listHTML = '';
        let totalScore = 0;
        let totalPossible = 0;
        
        gameKeys.forEach((key, index) => {
          const gameScore = firebaseData.gamesCompleted[key] || 0;
          const maxScore = 2; // Each game max 2
          
          totalScore += gameScore;
          totalPossible += maxScore;
          
          listHTML += `
            <div class="game-score-row">
              <span class="game-name">${gameNames[index]}</span>
              <span class="game-points">${gameScore}/${maxScore}</span>
            </div>
          `;
        });
        
        gamesScoreList.innerHTML = listHTML;
        
        // Calculate percentage
        const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        totalScorePercentage.textContent = `${percentage}%`;
        
        console.log(`📊 Total Score: ${totalScore}/${totalPossible} (${percentage}%)`);
      }
      
      // Show modal
      scoreModal.style.display = 'flex';
      
      // Setup Continue button
      if (continueBtn) {
        continueBtn.onclick = () => {
          console.log('Continue button clicked!');
          window.location.href = '../../biggerThan-smallerThan/biggerThan-smallerThan.html';
        };
      }
      
      // Setup Finish button
      if (finishBtn) {
        finishBtn.onclick = () => {
          console.log('Finish button clicked!');
          window.location.href = '../../../homepage/homepage.html';
        };
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