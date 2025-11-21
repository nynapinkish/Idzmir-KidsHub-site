document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Cow Matching Game loaded!");

  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  const clickableImages = document.querySelectorAll('.clickable-image');

  // Game state
  let score = 0;
  let totalAttempts = 2; // User boleh click 2 kali je
  let attemptsUsed = 0;
  let clickedImages = new Set(); // Track images yang dah diklik

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
  }

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
      // Return mock data for development
      return [
        { gameId: 'game1', gameName: 'Cat', points: 2, maxPoints: 2 },
        { gameId: 'game2', gameName: 'Cow', points: 0, maxPoints: 2 },
        { gameId: 'game3', gameName: 'Chicken', points: 2, maxPoints: 2 }
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
          gameId: 'game2-cow',
          gameName: 'Cow',
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

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreText) {
      scoreText.textContent = `${score}/${totalAttempts}`;
      console.log("📊 Score updated:", `${score}/${totalAttempts}`);
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

  // 🎯 CHECK ANSWER
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
    console.log(`🎯 Attempt ${attemptsUsed}/${totalAttempts}`);

    const answer = clickedImage.getAttribute('data-answer');

    if (answer === 'correct') {
      // ✅ CORRECT ANSWER
      score++;
      clickedImage.classList.add('correct-glow');
      console.log("✅ CORRECT! Score:", score);
      updateScoreDisplay();

      // Keep the correct image highlighted but allow other clicks
      clickedImage.style.pointerEvents = 'none';

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
    }

    // Check if game should end
    if (attemptsUsed >= totalAttempts) {
      console.log("🎮 Game Over! Used all attempts");
      // Disable all remaining images
      clickableImages.forEach(img => {
        img.style.pointerEvents = 'none';
      });
      setTimeout(showFinalResult, 1500);
    }
  }

  // 🎉 SHOW FINAL RESULT WITH GAME LIST
  async function showFinalResult() {
    console.log("🎉 Showing final result with game list!");
    
    if (!scoreModal) return;

    // Save THIS game's score
    await saveGameScore(score, totalAttempts);

    // Fetch ALL game scores
    const totalScoreData = await calculateTotalScore();
    
    // Update THIS game's score with current attempt
    const updatedGames = totalScoreData.allGames.map(game => {
      if (game.gameId === 'game2-cow') {
        return { ...game, points: score, maxPoints: totalAttempts };
      }
      return game;
    });

    // Populate games list
    await populateGamesList(updatedGames);
    
    // Update total score percentage
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    }
    
    // Update star colors based on THIS game's score
    updateStarColors(score, totalAttempts);
    
    // Show modal
    scoreModal.style.display = 'flex';
    scoreModal.style.animation = 'fadeIn 0.3s ease';
    
    console.log("Total Score Data:", totalScoreData);
    
    // Store in window for next page
    window.totalGameScore = totalScoreData;
    
    // Setup continue button
    if (continueBtn) {
      continueBtn.style.opacity = '0';
      continueBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        continueBtn.style.transition = 'opacity 0.5s ease-in-out, transform 0.1s ease';
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
        continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log("Continue button activated!");
      }, 1000);

      continueBtn.addEventListener('click', () => {
        console.log("Continue button clicked!");
        // Navigate to next game (chicken)
        window.location.href = '../../../../html/RelationalConcepts/biggerThan-smallerThan/biggerThan-smallerThan.html';
      });
    }

    // Setup finish button
    if (finishBtn) {
      finishBtn.style.opacity = '0';
      finishBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        finishBtn.style.transition = 'opacity 0.4s ease-in-out, transform 0.3s ease';
        finishBtn.style.opacity = '1';
        finishBtn.style.pointerEvents = 'auto';
        console.log("Finish button activated!");
      }, 1000);

      finishBtn.addEventListener('click', () => {
        console.log("Finish button clicked!");
        console.log("Total Score:", window.totalGameScore);
        // Navigate to homepage
        window.location.href = '../../../../html/homepage/homepage.html';
      });
    }
  }

  // Add click event to all clickable images
  clickableImages.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Game ready! You have 2 attempts!");
  console.log(`🎯 Click wisely - only ${totalAttempts} clicks allowed!`);
});