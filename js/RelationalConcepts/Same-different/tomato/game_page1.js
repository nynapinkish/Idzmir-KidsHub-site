// Initialize persistent score storage for ALL games
async function initializeGameScore() {
  try {
    const existing = await window.storage.get('socialEmoAllGames', true);
    if (!existing) {
      await window.storage.set('socialEmoAllGames', JSON.stringify({ 
        game1: { score: 0, total: 4, questionsAnswered: [] }, // Apple
        game2: { score: 0, total: 4, questionsAnswered: [] }, // Carrot
        game3: { score: 0, total: 4, questionsAnswered: [] }, // Grapes
        game4: { score: 0, total: 4, questionsAnswered: [] }, // Lemon
        game5: { score: 0, total: 4, questionsAnswered: [] }  // Tomato
      }), true);
    }
  } catch (error) {
    console.log('Storage not available, using session only');
  }
}

// Get all games score
async function getAllGamesScore() {
  try {
    const data = await window.storage.get('socialEmoAllGames', true);
    if (data) {
      return JSON.parse(data.value);
    }
  } catch (error) {
    console.log('Error getting score');
  }
  return {
    game1: { score: 0, total: 4, questionsAnswered: [] },
    game2: { score: 0, total: 4, questionsAnswered: [] },
    game3: { score: 0, total: 4, questionsAnswered: [] },
    game4: { score: 0, total: 4, questionsAnswered: [] },
    game5: { score: 0, total: 4, questionsAnswered: [] }
  };
}

// Add score for Game 5 (Tomato Sorting)
async function addGame5Score() {
  try {
    const allData = await getAllGamesScore();
    allData.game5.score += 1;
    await window.storage.set('socialEmoAllGames', JSON.stringify(allData), true);
    return allData.game5.score;
  } catch (error) {
    console.log('Error adding score');
    return 0;
  }
}

// Update score display with animation
async function updateScoreDisplay(currentScore, maxAttempts) {
  const scoreText = document.getElementById('scoreText');
  const scoreDisplay = document.querySelector('.score-display');
  
  if (scoreText) {
    // ✅ Display format: currentScore/maxAttempts
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

// ==================== POPULATE GAMES LIST ====================
async function populateGamesList(allGames) {
  const gamesList = document.getElementById('gamesScoreList');
  if (!gamesList) return;
  
  gamesList.innerHTML = '';

  allGames.forEach(game => {
    const row = document.createElement('div');
    row.className = 'game-score-row';
    row.innerHTML = `
      <div class="game-name">${game.gameName}</div>
      <div class="game-points">${game.points}/${game.maxPoints}</div>
    `;
    gamesList.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize storage
  await initializeGameScore();

  // Initialize elements
  const fruits = document.querySelectorAll(".fruit-item");
  const dropZone = document.getElementById("dropZone");
  const scoreText = document.getElementById("scoreText");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreModal = document.getElementById("scoreModal");
  const gamesScoreList = document.getElementById("gamesScoreList");
  const totalScorePercentage = document.getElementById("totalScorePercentage");
  const finishButtonContainer = document.querySelector(".finish-button-container");

  let score = 0;
  let totalAttempts = 0;
  const maxAttempts = 4;
  let draggedElement = null;

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

  // ✅ Update initial score display (0/4)
  await updateScoreDisplay(score, maxAttempts);

  // Show score display at game start
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }

  // Hide finish button initially
  if (finishButtonContainer) {
    finishButtonContainer.style.display = 'none';
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
      console.log('❌ Maximum attempts reached!');
      return;
    }

    const fruitType = draggedElement.dataset.fruit;
    const isTomato = fruitType.toLowerCase().includes("tomato");

    totalAttempts++;
    console.log(`📊 Attempt ${totalAttempts}/${maxAttempts}`);

    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "none";

    if (isTomato) {
      // ✅ CORRECT - Add to tray and mark as used
      draggedElement.classList.add("used");
      
      const droppedImg = document.createElement("img");
      droppedImg.src = draggedElement.querySelector("img").src;
      droppedImg.style.width = "180px";
      droppedImg.style.height = "180px";
      droppedImg.style.objectFit = "contain";
      droppedImg.style.animation = "dropBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
      fruitContainer.appendChild(droppedImg);

      score++;
      await addGame5Score();
      
      console.log(`✅ Correct! Score: ${score}/${totalAttempts}`);
    } else {
      // ❌ WRONG - Only shake, DON'T mark as used
      draggedElement.classList.add("wrong");
      
      setTimeout(() => {
        draggedElement.classList.remove("wrong");
      }, 600);
      
      console.log(`❌ Wrong! Score: ${score}/${totalAttempts}`);
    }

    // ✅ Update score display after each drop
    await updateScoreDisplay(score, maxAttempts);

    // Check if game finished
    if (totalAttempts >= maxAttempts) {
      console.log('🎉 Game finished!');
      setTimeout(() => showScoreModal(), 800);
    }
  });

  // ✅ Show Score Modal with ALL games list
  async function showScoreModal() {
    console.log(`🎉 Final Score: ${score}/${maxAttempts}`);
    
    if (scoreModal && gamesScoreList && totalScorePercentage) {
      const allData = await getAllGamesScore();
      
      // Build games score list with CORRECT class names
      const gameNames = ['Epal', 'Lobak Merah', 'Anggur', 'Lemon', 'Tomato'];
      let listHTML = '';
      let totalScore = 0;
      let totalPossible = 0;
      
      Object.keys(allData).forEach((key, index) => {
        const game = allData[key];
        totalScore += game.score;
        totalPossible += game.total;
        
        listHTML += `
          <div class="game-score-row">
            <span class="game-name">${gameNames[index]}</span>
            <span class="game-points">${game.score}/${game.total}</span>
          </div>
        `;
      });
      
      gamesScoreList.innerHTML = listHTML;
      
      // Calculate percentage
      const percentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
      totalScorePercentage.textContent = `${percentage}%`;
      
      // Show modal
      scoreModal.style.display = 'flex';
      
      // Setup Continue button
      const continueBtn = document.getElementById('continueBtn');
      if (continueBtn) {
        continueBtn.onclick = () => {
          console.log('Continue button clicked!');
          // Navigate to next game/category
          window.location.href = '/html/RelationalConcepts/match-mismatch/match-mismatch.html'; // Tukar path ni
        };
      }
      
      // Setup Finish button
      const finishBtn = document.getElementById('finishBtn');
      if (finishBtn) {
        finishBtn.onclick = () => {
          console.log('Finish button clicked!');
          // Navigate to homepage
          window.location.href = '../../../homepage/homepage.html'; // Tukar path ni
        };
      }
    }
  }

  console.log('🎮 Tomato Sorting Game loaded! Max attempts:', maxAttempts);
});