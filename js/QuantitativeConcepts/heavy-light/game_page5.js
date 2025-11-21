document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Heavy/Light Game loaded!");

  const bannerBlue = document.querySelector('.banner-blue');
  const imageItems = document.querySelectorAll('.image-item');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  if (!bannerBlue || imageItems.length === 0) {
    console.error("❌ ERROR: Elements not found!");
    alert("ERROR: Page elements not loaded properly!");
    return;
  }

  if (scoreDisplay) scoreDisplay.style.display = 'block';

  let answered = false;
  let correctAnswers = 0;
  let attemptCount = 0;

  // 2 Soalan
  const questions = [
    { question: "Yang manakah berat?", correctAnswer: "heavy.png" },
    { question: "Yang manakah ringan?", correctAnswer: "light.png" },
  ];

  let currentQuestionIndex = 0;
  const totalQuestions = questions.length;

  // ==================== DATABASE SCORE FUNCTIONS ====================
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
        { gameId: 'game1', gameName: 'More/Less', points: 0, maxPoints: 2 },
        { gameId: 'game2', gameName: 'All/None/Some', points: 0, maxPoints: 3 },
        { gameId: 'game3', gameName: 'Same/Different', points: 0, maxPoints: 2 },
        { gameId: 'game4', gameName: 'Full/Empty', points: 0, maxPoints: 2 },
        { gameId: 'game5', gameName: 'Heavy/Light', points: 0, maxPoints: 2 }
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
          gameId: 'game5-heavy-light',
          gameName: 'Heavy/Light',
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
  async function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    console.log("showScoringPopup triggered!");

    if (!scoreModal) {
      console.error("Score modal not found!");
      return;
    }

    // Save THIS game's score
    await saveGameScore(correctAnswers, attemptCount);

    // Fetch ALL game scores
    const totalScoreData = await calculateTotalScore();
    
    // Update THIS game's score with current attempt
    const updatedGames = totalScoreData.allGames.map(game => {
      if (game.gameId === 'game10-heavy-light') {
        return { ...game, points: correctAnswers, maxPoints: attemptCount };
      }
      return game;
    });

    // Populate games list
    await populateGamesList(updatedGames);
    
    // Update total score display (percentage only)
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    }
    
    // Update star colors
    updateStarColors(correctAnswers, attemptCount);
    
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
        console.log("Continue button faded in!");
      }, 1000);

      continueBtn.addEventListener('click', () => {
        console.log("Continue button clicked!");
        // Navigate to next game (change URL sesuai game seterusnya)
        window.location.href = '/html/homepage/qualitativeConcepts.html';
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
        console.log("Finish button faded in!");
      }, 1000);

      finishBtn.addEventListener('click', () => {
        console.log("Finish button clicked!");
        console.log("Total Score:", window.totalGameScore);
        // Navigate to homepage or results page
        window.location.href = '/html/homepage/homepage.html';
      });
    }
  }

  // ==================== LOAD QUESTION ====================
  function loadQuestion() {
    answered = false;
    const currentQuestion = questions[currentQuestionIndex];
    bannerBlue.textContent = currentQuestion.question;
    updateScoreDisplay();

    imageItems.forEach(img => {
      img.classList.remove('correct-glow', 'wrong-shake');
      img.style.pointerEvents = 'auto';
      img.style.opacity = '1';
    });
  }

  // ==================== UPDATE SCORE DISPLAY ====================
  function updateScoreDisplay() {
    if (scoreText) {
      scoreText.textContent = `${correctAnswers}/${attemptCount}`;
    }
  }

  // ==================== CHECK ANSWER ====================
  function checkAnswer(clickedImage) {
    if (answered) return;
    answered = true;
    attemptCount++;

    const currentQuestion = questions[currentQuestionIndex];
    const clickedFileName = clickedImage.src.split('/').pop();
    const isCorrect = clickedFileName === currentQuestion.correctAnswer;

    if (isCorrect) {
      correctAnswers++;
      clickedImage.classList.add('correct-glow');
      imageItems.forEach(img => {
        img.style.pointerEvents = 'none';
        if (img !== clickedImage) img.style.opacity = '0.5';
      });
      updateScoreDisplay();
      console.log("✅ CORRECT! Score:", correctAnswers, "/", attemptCount);
      setTimeout(nextQuestion, 1500);
    } else {
      clickedImage.classList.add('wrong-shake');
      updateScoreDisplay();
      console.log("❌ WRONG! Score:", correctAnswers, "/", attemptCount);
      imageItems.forEach(img => {
        const fileName = img.src.split('/').pop();
        if (fileName === currentQuestion.correctAnswer) {
          setTimeout(() => img.classList.add('correct-glow'), 600);
        }
        img.style.pointerEvents = 'none';
      });
      setTimeout(nextQuestion, 2000);
    }
  }

  // ==================== NEXT QUESTION ====================
  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      console.log("🎉 Game completed! Final score:", correctAnswers, "/", attemptCount);
      setTimeout(() => {
        showScoringPopup();
      }, 500);
    } else {
      loadQuestion();
    }
  }

  // ==================== EVENT LISTENERS ====================
  imageItems.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  // ==================== INITIALIZE GAME ====================
  console.log("🚀 Starting Heavy/Light game...");
  loadQuestion();
});