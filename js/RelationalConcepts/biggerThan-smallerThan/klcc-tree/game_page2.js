// 🎮 Game Page 2 - Lebih Rendah (Tree) - WITH DYNAMIC STAR COLORS
console.log("🎮 Game Page 2 loaded!");

// Game state variables
let score = 0;
let totalAttempts = 4;
let attemptsUsed = 0;

// Game names
const GAME_NAMES = {
  page1: "KLCC vs Objects (Lebih Tinggi)",
  page2: "Tree vs Objects (Lebih Rendah)"
};

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded - Game 2 ready!");
  
  const scoreDisplay = document.getElementById('scoreDisplay');
  
  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
    console.log("📊 Score display initialized");
  }
  
  console.log(`🎯 Game 2 started! Total attempts: ${totalAttempts}`);
});

// Select option function
function selectOption(element, imageName, itemName) {
  console.log(`🎯 Clicked: ${itemName} (${imageName})`);
  
  // Prevent clicking same image twice
  if (element.classList.contains('clicked')) {
    console.log("⚠️ Already clicked!");
    return;
  }

  // Check if max attempts reached
  if (attemptsUsed >= totalAttempts) {
    console.log("⚠️ Max attempts reached!");
    return;
  }

  // Mark as clicked
  element.classList.add('clicked');
  attemptsUsed++;
  console.log(`📝 Attempt ${attemptsUsed}/${totalAttempts}`);

  const answer = element.getAttribute('data-answer');

  if (answer === 'correct') {
    // ✅ CORRECT - Highlight hijau je
    score++;
    element.classList.add('correct-glow');
    console.log(`✅ CORRECT! Score: ${score}/${totalAttempts}`);
    
    updateScoreDisplay();
    
    setTimeout(() => {
      element.style.pointerEvents = 'none';
      element.style.opacity = '1';
    }, 800);
    
  } else if (answer === 'wrong') {
    // ❌ WRONG - Shake merah je
    element.classList.add('wrong-shake');
    console.log(`❌ WRONG! Score remains: ${score}/${totalAttempts}`);
    
    setTimeout(() => {
      element.classList.remove('wrong-shake');
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
    }, 800);
  }

  // Check if game should end
  if (attemptsUsed >= totalAttempts) {
    console.log("🏁 Game 2 Over!");
    
    // Save current game score
    saveGameScore('page2', score, totalAttempts);
    
    // Disable all remaining images
    const allImages = document.querySelectorAll('.clickable-image');
    allImages.forEach(img => {
      img.style.pointerEvents = 'none';
    });
    
    // Show result with score list
    setTimeout(() => {
      showScoringPopup();
    }, 1000);
  }
}

// Update score display
function updateScoreDisplay() {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log(`📊 Score updated: ${score}/${totalAttempts}`);
  }
}

// Save game score to localStorage
function saveGameScore(gamePage, score, total) {
  const gameScores = JSON.parse(localStorage.getItem('gameScores') || '{}');
  gameScores[gamePage] = {
    score: score,
    total: total,
    name: GAME_NAMES[gamePage]
  };
  localStorage.setItem('gameScores', JSON.stringify(gameScores));
  console.log(`💾 Saved ${gamePage} score: ${score}/${total}`);
}

// Get all game scores from localStorage
function getAllGameScores() {
  return JSON.parse(localStorage.getItem('gameScores') || '{}');
}

// Calculate total percentage
function calculateTotalPercentage(gameScores) {
  let totalScore = 0;
  let totalPossible = 0;
  
  Object.values(gameScores).forEach(game => {
    totalScore += game.score;
    totalPossible += game.total;
  });
  
  if (totalPossible === 0) return 0;
  return Math.round((totalScore / totalPossible) * 100);
}

// ==================== DYNAMIC STAR COLORS ====================
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

// Populate games score list
function populateGamesList(gameScores) {
  const gamesList = document.getElementById('gamesScoreList');
  if (!gamesList) return;
  
  gamesList.innerHTML = '';
  
  Object.entries(gameScores).forEach(([key, game]) => {
    const row = document.createElement('div');
    row.className = 'game-score-row';
    row.innerHTML = `
      <div class="game-name">${game.name}</div>
      <div class="game-points">${game.score}/${game.total}</div>
    `;
    gamesList.appendChild(row);
  });
  
  console.log("📋 Games list populated with", Object.keys(gameScores).length, "games");
}

// Show scoring popup (final result)
function showScoringPopup() {
  console.log("🎉 Showing scoring popup!");
  
  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  
  if (!scoreModal) return;
  
  // Get all game scores
  const gameScores = getAllGameScores();
  console.log("📊 All game scores:", gameScores);
  
  // Populate games list
  populateGamesList(gameScores);
  
  // Calculate total score and percentage
  let totalScore = 0;
  let totalPossible = 0;
  
  Object.values(gameScores).forEach(game => {
    totalScore += game.score;
    totalPossible += game.total;
  });
  
  const percentage = calculateTotalPercentage(gameScores);
  
  // Update total percentage display
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${percentage}%`;
    console.log(`📊 Total percentage: ${percentage}%`);
  }
  
  // Update star colors based on TOTAL percentage
  updateStarColors(totalScore, totalPossible);
  
  // Show modal with animation
  scoreModal.style.display = 'flex';
  scoreModal.style.animation = 'fadeIn 0.3s ease';
  console.log("🎨 Score modal displayed!");
  
  // Setup continue button with fade-in
  if (continueBtn) {
    continueBtn.style.opacity = '0';
    continueBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
      continueBtn.style.transition = 'opacity 0.5s ease-in-out, transform 0.1s ease';
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
      continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
      console.log("➡️ Continue button activated!");
    }, 1000);
    
    continueBtn.onclick = () => {
      console.log("➡️ Continue to next section");
      // Navigate to next game/section
      window.location.href = '../html/homepage/socialEmoConcepts.html';
    };
  }
  
  // Setup finish button with fade-in
  if (finishBtn) {
    finishBtn.style.opacity = '0';
    finishBtn.style.pointerEvents = 'none';
    
    setTimeout(() => {
      finishBtn.style.transition = 'opacity 0.4s ease-in-out, transform 0.3s ease';
      finishBtn.style.opacity = '1';
      finishBtn.style.pointerEvents = 'auto';
      console.log("🏁 Finish button activated!");
    }, 1000);
    
    finishBtn.onclick = () => {
      console.log("🏁 Finish - Going to homepage");
      // Clear scores and go to homepage
      localStorage.removeItem('gameScores');
      window.location.href = '../../../homepage/homepage.html';
    };
  }
}

// Optional: Reset all games
function resetAllGames() {
  localStorage.removeItem('gameScores');
  console.log("🔄 All game scores reset!");
}