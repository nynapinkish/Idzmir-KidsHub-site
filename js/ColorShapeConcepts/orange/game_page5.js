const fruits = document.querySelectorAll('.fruit-selection img');
const backgroundArea = document.getElementById('backgroundArea');
const scoreModal = document.getElementById('scoreModal');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreText = document.getElementById('scoreText');

// Track score
let score = 0;
let totalAttempts = 0;
let fruitCount = 0;
const maxDrags = 2; // Maximum 2 correct answers

// Show score display at start
if (scoreDisplay) {
  scoreDisplay.style.display = 'flex';
  updateScoreDisplay();
  console.log('✅ Score display shown!');
}

// Update score display function
function updateScoreDisplay() {
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log("📊 Score updated:", `${score}/${totalAttempts}`);
  }
}

fruits.forEach(fruit => {
  fruit.addEventListener('dragstart', e => {
    e.dataTransfer.setData('color', fruit.dataset.color);
    e.dataTransfer.setData('src', fruit.src);
    e.dataTransfer.setData('fruit', fruit.dataset.fruit);
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

  // Check if fruit already used
  const usedFruit = document.querySelector(`.fruit-selection img[data-fruit="${fruitId}"]`);
  if (usedFruit && usedFruit.classList.contains('fruit-used')) {
    return;
  }

  totalAttempts++;
  updateScoreDisplay();

  // Mark fruit as used
  if (usedFruit) {
    usedFruit.classList.add('fruit-used');
  }

  // Check if correct answer (orange)
  if (color === 'orange') {
    score++;
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
  } else {
    // Wrong answer - shake animation
    if (usedFruit) {
      usedFruit.classList.add('shake-error');
      
      setTimeout(() => {
        usedFruit.classList.remove('shake-error');
      }, 600);
    }
  }

  // Check if reached max drags (game over)
  if (totalAttempts >= maxDrags) {
    console.log('🎉 Game over! Max drags reached.');
    setTimeout(showFinalScore, 1500);
  }
});

// ==================== DATABASE SCORE RETRIEVAL ====================
async function fetchAllGameScores() {
  try {
    const response = await fetch('/api/games/all-scores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch scores');
    
    const data = await response.json();
    console.log("All game scores fetched:", data);
    
    return data.games;
  } catch (error) {
    console.error("Error fetching game scores:", error);
    // Mock data for development
    return [
      { gameId: 'game1', gameName: 'Red Color', points: 2, maxPoints: 2 },
      { gameId: 'game2', gameName: 'Green Color', points: 2, maxPoints: 2 },
      { gameId: 'game3', gameName: 'Blue Color', points: 2, maxPoints: 2 },
      { gameId: 'game4', gameName: 'Yellow Color', points: 2, maxPoints: 2 },
      { gameId: 'game5', gameName: 'Orange Color', points: 0, maxPoints: 2 }
    ];
  }
}

async function calculateTotalScore() {
  const allGameScores = await fetchAllGameScores();
  
  if (!allGameScores) {
    console.warn("Could not retrieve game scores");
    return { totalPoints: 0, totalMaxPoints: 0, percentage: 0 };
  }

  let totalPoints = 0;
  let totalMaxPoints = 0;

  allGameScores.forEach(game => {
    totalPoints += game.points || 0;
    totalMaxPoints += game.maxPoints || 0;
  });

  const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

  return {
    totalPoints,
    totalMaxPoints,
    percentage: Math.round(percentage),
    allGames: allGameScores
  };
}

async function saveGameScore(points, maxPoints) {
  try {
    const response = await fetch('/api/games/save-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId: 'game5-orange-color',
        gameName: 'Orange Color',
        points: points,
        maxPoints: maxPoints,
        percentage: (points / maxPoints) * 100
      })
    });

    if (!response.ok) throw new Error('Failed to save score');
    
    const result = await response.json();
    console.log("Game score saved:", result);
    return result;
  } catch (error) {
    console.error("Error saving game score:", error);
    return null;
  }
}

// ==================== DYNAMIC STAR COLORS ====================
function updateStarColors(correctAnswers, totalQuestions) {
  const percentage = (correctAnswers / totalQuestions) * 100;
  const stars = document.querySelectorAll('.star-image');
  
  console.log("Updating star colors - Score:", correctAnswers, "/", totalQuestions, "=", percentage.toFixed(0) + "%");
  
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

// ==================== SCORING POPUP ====================
async function showFinalScore() {
  console.log('🎉 Showing final score:', `${score}/${totalAttempts}`);
  
  if (!scoreModal) return;

  // Save THIS game's score
  await saveGameScore(score, totalAttempts);

  // Fetch ALL game scores
  const totalScoreData = await calculateTotalScore();
  
  // Update THIS game's score with current attempt
  const updatedGames = totalScoreData.allGames.map(game => {
    if (game.gameId === 'game5-orange-color') {
      return { ...game, points: score, maxPoints: totalAttempts };
    }
    return game;
  });

  // Populate games list
  await populateGamesList(updatedGames);
  
  // Update total score display
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
  }
  
  // Update star colors
  updateStarColors(score, totalAttempts);
  
  // Show modal
  scoreModal.style.display = 'flex';
  scoreModal.style.animation = 'fadeIn 0.3s ease';
  
  console.log("Total Score Data:", totalScoreData);
  window.totalGameScore = totalScoreData;
  
  // Setup continue button
  const continueBtn = document.getElementById('continueBtn');
  if (continueBtn) {
    continueBtn.style.opacity = '0';
    continueBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
      continueBtn.style.transition = 'opacity 0.5s ease-in-out, transform 0.1s ease';
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
      continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
      console.log("Continue button faded in!");
    }, 1000);

    continueBtn.addEventListener('click', () => {
      console.log("Continue button clicked!");
      window.location.href = '/html/homepage/relationalConcepts.html';
    });
  }

  // Setup finish button
  const finishBtn = document.getElementById('finishBtn');
  if (finishBtn) {
    finishBtn.style.opacity = '0';
    finishBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
      finishBtn.style.transition = 'opacity 0.4s ease-in-out, transform 0.3s ease';
      finishBtn.style.opacity = '1';
      finishBtn.style.pointerEvents = 'auto';
      console.log("Finish button faded in!");
    }, 1000);

    finishBtn.addEventListener('click', () => {
      console.log("Finish button clicked!");
      window.location.href = '/html/homepage/homepage.html';
    });
  }
}

console.log('🎮 Drag & Drop Game loaded with scoring!');