// Update score display with animation
function updateScoreDisplay(currentScore, maxAttempts) {
  const scoreText = document.getElementById('scoreText');
  const scoreDisplay = document.querySelector('.score-display');
  
  if (scoreText) {
    scoreText.textContent = `${currentScore}/${maxAttempts}`;
  }
  
  // Add popup animation
  if (scoreDisplay) {
    scoreDisplay.classList.add('score-update');
    setTimeout(() => {
      scoreDisplay.classList.remove('score-update');
    }, 500);
  }
}

// Add pulse animation to Next button
function addPulseToNextButton() {
  const nextButtonContainer = document.querySelector(".next-button-container");
  if (nextButtonContainer) {
    nextButtonContainer.classList.add('pulse');
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for gameSessionManager to load
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Initialize game session with gameSessionManager
  const gameStarted = await initializeGame('Relational Concepts', 'same_different_apple', 4);
  
  if (!gameStarted) {
    console.log('🔒 Game already played - showing previous score');
    // Game was already played, you can show a message or redirect
  }

  // Initialize elements (IKUT HTML YANG BETUL)
  const fruits = document.querySelectorAll(".fruit-item");
  const dropZone = document.getElementById("dropZone");
  const scoreText = document.getElementById("scoreText");
  const scoreDisplay = document.getElementById("scoreDisplay"); // ✅ Score display atas (hidden awal)
  const scoreModal = document.getElementById("scoreModal"); // ✅ Score Modal
  const finalScoreDisplay = document.getElementById("finalScoreDisplay"); // ✅ Final Score Display dalam modal
  const nextButtonContainer = document.querySelector(".next-button-container");

  let score = 0;
  let totalAttempts = 0;
  const maxAttempts = 4; // ✅ TOTAL 4 DRAGS (based on HTML - ada 4 apples)
  let draggedElement = null;

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

  // ✅ Update initial score display (0/4)
  updateScoreDisplay(score, maxAttempts);

  // ✅ SHOW score display at game start
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    console.log('✅ Score display shown!');
  }

  // Hide next button initially
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

    // ✅ Check if max attempts reached
    if (totalAttempts >= maxAttempts) {
      console.log('❌ Maximum attempts reached!');
      return;
    }

    const fruitType = draggedElement.dataset.fruit;
    const isApple = fruitType.toLowerCase().includes("apple");

    // ✅ COUNT EVERY DROP (betul atau salah)
    totalAttempts++;
    console.log(`📊 Attempt ${totalAttempts}/${maxAttempts}`);

    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "none";

    if (isApple) {
      // ✅ CORRECT - Add to tray and mark as used
      draggedElement.classList.add("used");
      
      const droppedImg = document.createElement("img");
      droppedImg.src = draggedElement.querySelector("img").src;
      droppedImg.style.width = "180px";
      droppedImg.style.height = "180px";
      droppedImg.style.objectFit = "contain";
      droppedImg.style.animation = "dropBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      fruitContainer.appendChild(droppedImg);

      // Increment score using gameSessionManager
      score++;
      handleCorrectAnswer(); // This updates gameSession score
      
      console.log(`✅ Correct! Score: ${score}/${totalAttempts}`);
    } else {
      // ❌ WRONG - Only shake animation, DON'T mark as used
      draggedElement.classList.add("wrong");
      
      setTimeout(() => {
        draggedElement.classList.remove("wrong");
      }, 600);
      
      console.log(`❌ Wrong! Score: ${score}/${totalAttempts}`);
    }

    // ✅ Update score display after each drop
    updateScoreDisplay(score, maxAttempts);

    // ✅ Check if game finished (4 attempts done)
    if (totalAttempts >= maxAttempts) {
      console.log('🎉 Game finished!');
      setTimeout(() => showScoreModal(), 800);
    }
  });

  // ✅ Show Score Modal with Next Button
  async function showScoreModal() {
    console.log(`🎉 Final Score: ${score}/${maxAttempts}`);
    
    // Save score to Firebase through gameSessionManager
    await gameSession.endSession();
    
    if (scoreModal && finalScoreDisplay) {
      // Update final score display (format: "3/4")
      finalScoreDisplay.textContent = `${score}/${maxAttempts}`;
      
      // Show modal
      scoreModal.style.display = 'flex';
      
      // Show next button after 1 second with pulse
      setTimeout(() => {
        if (nextButtonContainer) {
          nextButtonContainer.style.display = 'block';
          nextButtonContainer.style.opacity = '0';
          
          setTimeout(() => {
            nextButtonContainer.style.opacity = '1';
            addPulseToNextButton(); // ✅ Add pulse animation
          }, 100);
        }
      }, 1000);
    }
  }

  // Optional: Restart game function
  window.restartGame = function() {
    score = 0;
    totalAttempts = 0;
    fruitContainer.innerHTML = "";
    fruits.forEach(fruit => {
      fruit.classList.remove("used", "correct", "wrong", "dragging");
      fruit.style.opacity = "1";
      fruit.style.pointerEvents = "auto";
    });
    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "block";
    
    if (scoreModal) scoreModal.style.display = "none";
    
    // Remove pulse from next button
    if (nextButtonContainer) {
      nextButtonContainer.classList.remove('pulse');
      nextButtonContainer.style.display = 'none';
    }
    
    updateScoreDisplay(0, maxAttempts);
  };

  console.log('🎮 Apple Sorting Game loaded! Max attempts:', maxAttempts);
});