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

document.addEventListener("DOMContentLoaded", async () => {
  console.log('========================================');
  console.log('🍅 TOMATO SORTING GAME - FINAL VERSION');
  console.log('========================================');
  
  // Check sessionStorage
  console.log('📋 Session Data:');
  console.log('   - userName:', sessionStorage.getItem('userName'));
  console.log('   - studentId:', sessionStorage.getItem('studentId'));
  console.log('   - userRole:', sessionStorage.getItem('userRole'));
  console.log('   - userAge:', sessionStorage.getItem('userAge'));
  
  // Wait for gameSessionManager to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if gameSession is available (DON'T BLOCK if missing!)
  if (typeof gameSession === 'undefined') {
    console.error('❌ gameSessionManager not loaded!');
    console.error('⚠️ Game will continue without score tracking');
  } else {
    console.log('✅ gameSessionManager loaded');
  }
  
  console.log('✅ Firebase ready:', typeof firebase !== 'undefined');
  
  // Initialize game session for TOMATO game
  console.log('\n🍅 Initializing tomato game...');
  let gameStarted = true;
  
  if (typeof initializeGame === 'function') {
    gameStarted = await initializeGame('Relational Concepts', 'same / different / tomato', 4);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }
  
  // Initialize elements
  const fruits = document.querySelectorAll(".fruit-item");
  const dropZone = document.getElementById("dropZone");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreModal = document.getElementById("scoreModal");
  const gamesScoreList = document.getElementById("gamesScoreList");
  const totalScorePercentage = document.getElementById("totalScorePercentage");
  const continueBtn = document.getElementById("continueBtn");
  const finishBtn = document.getElementById("finishBtn");

  let score = 0;
  let totalAttempts = 0;
  const maxAttempts = 4;
  let draggedElement = null;

  if (!gameStarted && typeof gameSession !== 'undefined') {
    console.log('🔒 Game already played - showing summary');
    
    const existingScore = gameSession.existingScore;
    
    // Show score at top
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      updateLocalScoreDisplay(existingScore, maxAttempts);
    }
    
    // Show summary modal immediately
    setTimeout(() => showScoreModal(existingScore), 500);
    
    // Disable drag for all fruits
    fruits.forEach(fruit => {
      fruit.setAttribute('draggable', 'false');
      fruit.style.opacity = '0.5';
      fruit.style.cursor = 'not-allowed';
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

  // Create container for dropped fruits
  const fruitContainer = document.createElement("div");
  fruitContainer.style.position = "absolute";
  fruitContainer.style.top = "42%";
  fruitContainer.style.left = "45%";
  fruitContainer.style.transform = "translate(-50%, -50%)";
  fruitContainer.style.display = "grid";
  fruitContainer.style.gridTemplateColumns = "repeat(2, 110px)";
  fruitContainer.style.gridTemplateRows = "repeat(2, 110px)";
  fruitContainer.style.gap = "20px";
  fruitContainer.style.zIndex = "10";
  fruitContainer.style.pointerEvents = "none";
  dropZone.appendChild(fruitContainer);

  // Update initial score display
  updateLocalScoreDisplay(score, maxAttempts);

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    console.log('✅ Score display shown');
  }

  // Drag events
  fruits.forEach(fruit => {
    fruit.addEventListener("dragstart", (e) => {
      if (fruit.classList.contains("used")) {
        e.preventDefault();
        return;
      }
      draggedElement = fruit;
      fruit.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    fruit.addEventListener("dragend", () => {
      if (draggedElement) {
        draggedElement.classList.remove("dragging");
      }
    });
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");

    if (!draggedElement || draggedElement.classList.contains("used")) return;

    if (totalAttempts >= maxAttempts) {
      console.log('❌ Maximum attempts reached');
      return;
    }

    const fruitType = draggedElement.dataset.fruit;
    const isTomato = fruitType.toLowerCase().includes("tomato");

    totalAttempts++;
    console.log(`\n📊 DROP #${totalAttempts}/${maxAttempts}`);
    console.log('   Fruit:', fruitType);
    console.log('   Is Tomato?', isTomato);

    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "none";

    if (isTomato) {
      draggedElement.classList.add("used");
      
      const droppedImg = document.createElement("img");
      droppedImg.src = draggedElement.querySelector("img").src;
      droppedImg.style.width = "180px";
      droppedImg.style.height = "180px";
      droppedImg.style.objectFit = "contain";
      droppedImg.style.animation = "dropBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      fruitContainer.appendChild(droppedImg);

      score++;
      console.log('✅ CORRECT!');
      
      // Update gameSession score if available
      if (typeof handleCorrectAnswer === 'function') {
        handleCorrectAnswer();
        console.log('   ✅ handleCorrectAnswer() called');
        if (typeof gameSession !== 'undefined') {
          console.log('   📊 GameSession score:', gameSession.currentScore, '/', gameSession.maxScore);
        }
      }
      
      console.log('   📊 Local score:', score, '/', totalAttempts);
    } else {
      draggedElement.classList.add("wrong");
      
      setTimeout(() => {
        draggedElement.classList.remove("wrong");
      }, 600);
      
      console.log('❌ WRONG!');
      console.log('   📊 Local score:', score, '/', totalAttempts);
    }

    updateLocalScoreDisplay(score, maxAttempts);

    if (totalAttempts >= maxAttempts) {
      console.log('\n🎉 GAME FINISHED!');
      console.log('========================================');
      console.log('📊 FINAL SCORES:');
      console.log('   Local score:', score, '/', maxAttempts);
      if (typeof gameSession !== 'undefined') {
        console.log('   GameSession score:', gameSession.currentScore, '/', gameSession.maxScore);
        console.log('   Session active?', gameSession.isSessionActive);
      }
      console.log('========================================');
      
      setTimeout(() => showScoreModal(score), 800);
    }
  });

  // Show Score Modal with ALL games summary
  async function showScoreModal(finalScore) {
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
    
    // Get all games scores from Firebase
    console.log('\n📊 Loading all games scores...');
    const firebaseData = await getAllGamesScoreFromFirebase();
    
    if (scoreModal && gamesScoreList && totalScorePercentage) {
      if (!firebaseData) {
        console.error('❌ Cannot load Firebase data!');
        // Show at least current game score
        gamesScoreList.innerHTML = `
          <div class="game-score-row">
            <span class="game-name">Tomato</span>
            <span class="game-points">${finalScore}/${maxAttempts}</span>
          </div>
        `;
        totalScorePercentage.textContent = '0%';
      } else {
        // Build complete games score list from Firebase
        const gameNames = ['Epal', 'Lobak Merah', 'Anggur', 'Lemon', 'Tomato'];
        const gameKeys = [
          'same_/_different_/_apple',
          'same_/_different_/_carrot',
          'same_/_different_/_grapes',
          'same_/_different_/_lemon',
          'same_/_different_/_tomato'
        ];
        
        let listHTML = '';
        let totalScore = 0;
        let totalPossible = 0;
        
        gameKeys.forEach((key, index) => {
          const gameScore = firebaseData.gamesCompleted[key] || 0;
          const maxScore = 4;
          
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
          window.location.href = '../../match-mismatch/match-mismatch.html';
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

  console.log('\n✅ Tomato Sorting Game fully loaded!');
  console.log('========================================\n');
});