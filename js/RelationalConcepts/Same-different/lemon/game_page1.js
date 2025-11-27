// Add pulse animation to Next button
function addPulseToNextButton() {
  const nextButtonContainer = document.querySelector(".next-button-container");
  if (nextButtonContainer) {
    nextButtonContainer.classList.add('pulse');
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

document.addEventListener("DOMContentLoaded", async () => {
  console.log('========================================');
  console.log('🍋 LEMON SORTING GAME');
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
    // DON'T return - let game continue
  } else {
    console.log('✅ gameSessionManager loaded');
  }
  
  console.log('✅ Firebase ready:', typeof firebase !== 'undefined');
  
  // Initialize game session for LEMON game
  console.log('\n🍋 Initializing lemon game...');
  let gameStarted = true; // Default to true if no gameSession
  
  if (typeof initializeGame === 'function') {
    gameStarted = await initializeGame('Relational Concepts', 'same / different / lemon', 4);
  } else {
    console.warn('⚠️ initializeGame not available - running without tracking');
  }
  
  // Initialize elements
  const fruits = document.querySelectorAll(".fruit-item");
  const dropZone = document.getElementById("dropZone");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreModal = document.getElementById("scoreModal");
  const finalScoreDisplay = document.getElementById("finalScoreDisplay");
  const nextButtonContainer = document.querySelector(".next-button-container");

  let score = 0;
  let totalAttempts = 0;
  const maxAttempts = 4;
  let draggedElement = null;

  if (!gameStarted && typeof gameSession !== 'undefined') {
    console.log('🔒 Game already played - showing previous score');
    
    const existingScore = gameSession.existingScore;
    
    // Show score at top
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      updateLocalScoreDisplay(existingScore, maxAttempts);
    }
    
    // Show final score modal (stays visible on refresh)
    if (scoreModal && finalScoreDisplay) {
      finalScoreDisplay.textContent = `${existingScore}/${maxAttempts}`;
      scoreModal.style.display = 'flex';
      scoreModal.style.opacity = '1';
      scoreModal.style.visibility = 'visible';
      
      if (nextButtonContainer) {
        nextButtonContainer.style.display = 'block';
        nextButtonContainer.style.opacity = '1';
        nextButtonContainer.style.visibility = 'visible';
        addPulseToNextButton();
      }
    }
    
    // Disable drag for all fruits
    fruits.forEach(fruit => {
      fruit.setAttribute('draggable', 'false');
      fruit.style.opacity = '0.5';
      fruit.style.cursor = 'not-allowed';
    });
    
    console.log('✅ Previous score displayed');
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
  fruitContainer.style.right = "auto";
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

  // Hide next button
  if (nextButtonContainer) {
    nextButtonContainer.style.display = 'none';
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
    const isLemon = fruitType.toLowerCase().includes("lemon");

    totalAttempts++;
    console.log(`\n📊 DROP #${totalAttempts}/${maxAttempts}`);
    console.log('   Fruit:', fruitType);
    console.log('   Is Lemon?', isLemon);

    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "none";

    if (isLemon) {
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
      
      setTimeout(() => showScoreModal(), 800);
    }
  });

  // Show Score Modal and save to Firebase
  async function showScoreModal() {
    console.log('\n💾 ATTEMPTING TO SAVE TO FIREBASE...');
    
    if (typeof gameSession !== 'undefined') {
      console.log('   Before save - gameSession.currentScore:', gameSession.currentScore);
      console.log('   Before save - gameSession.isSessionActive:', gameSession.isSessionActive);
      
      try {
        const saved = await gameSession.endSession();
        
        console.log('\n📊 SAVE RESULT:', saved ? '✅ SUCCESS' : '❌ FAILED');
        
        if (!saved) {
          console.error('❌ FIREBASE SAVE FAILED!');
          console.error('   Check the error messages above for details');
        }
      } catch (error) {
        console.error('❌ EXCEPTION during save:', error);
      }
    } else {
      console.warn('⚠️ No gameSession available - score not saved');
    }
    
    if (scoreModal && finalScoreDisplay) {
      finalScoreDisplay.textContent = `${score}/${maxAttempts}`;
      scoreModal.style.display = 'flex';
      
      setTimeout(() => {
        if (nextButtonContainer) {
          nextButtonContainer.style.display = 'block';
          nextButtonContainer.style.opacity = '0';
          
          setTimeout(() => {
            nextButtonContainer.style.opacity = '1';
            addPulseToNextButton();
          }, 100);
        }
      }, 1000);
    }
  }

  console.log('\n✅ Lemon Sorting Game fully loaded!');
  console.log('========================================\n');
});