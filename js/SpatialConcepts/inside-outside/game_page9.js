document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  let answered = false;

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
        { gameId: 'game1', gameName: 'In/On/Under', points: 3, maxPoints: 3 },
        { gameId: 'game2', gameName: 'Above/Below', points: 3, maxPoints: 3 },
        { gameId: 'game3', gameName: 'Behind/In Front Of', points: 2, maxPoints: 3 },
        { gameId: 'game4', gameName: 'Between/Around', points: 3, maxPoints: 3 },
        { gameId: 'game5', gameName: 'Over/Through', points: 2, maxPoints: 3 },
        { gameId: 'game6', gameName: 'Up/Down', points: 3, maxPoints: 3 },
        { gameId: 'game7', gameName: 'Near/Far', points: 3, maxPoints: 3 },
        { gameId: 'game8', gameName: 'Top/Bottom/Middle', points: 2, maxPoints: 3 },
        { gameId: 'game9', gameName: 'Inside/Outside', points: 0, maxPoints: 3 }
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
          gameId: 'game9-inside-outside',
          gameName: 'Inside/Outside',
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

  // Set up questions - setiap soalan ada data sendiri
  const questions = [
    {
      label: "dalam",
      question: "Mana yang di dalam?",
      correctImg: "../../../assets/images/inside.png",
      options: [
        { answer: "correct", img: "../../../assets/images/inside.png" },
        { answer: "wrong", img: "../../../assets/images/outside.png" },
      ]
    },
    {
      label: "luar",
      question: "Mana yang di luar?",
      correctImg: "../../../assets/images/outside.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/inside.png" },
        { answer: "correct", img: "../../../assets/images/outside.png" },
      ]
    }
  ];

  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  let totalQuestions = questions.length;
  let attemptCount = 0;

  // ==================== UPDATE SCORE DISPLAY ====================
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      document.getElementById('scoreText').textContent = `${correctAnswers}/${attemptCount}`;
    }
  }

  // ==================== POPULATE GAMES LIST ====================
  async function populateGamesList(allGames) {
    const gamesList = document.getElementById('gamesScoreList');
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

    if (!scoreModal) return;

    // Save THIS game's score
    await saveGameScore(correctAnswers, attemptCount);

    // Fetch ALL game scores
    const totalScoreData = await calculateTotalScore();
    
    // Update THIS game's score with current attempt
    const updatedGames = totalScoreData.allGames.map(game => {
      if (game.gameId === 'game9-inside-outside') {
        return { ...game, points: correctAnswers, maxPoints: attemptCount };
      }
      return game;
    });

    // Populate games list
    await populateGamesList(updatedGames);
    
    // Update total score display (percentage only)
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    
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
        // Navigate to next game
        window.location.href = '/html/homepage/quantitativeConcepts.html'; // Change to your next game URL
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

  function changeQuestion() {
    console.log("Changing question...");
    
    answered = false;
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    
    const currentQuestion = questions[currentQuestionIndex];

    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctImg;

    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach((option, index) => {
      const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
      optionImg.src = currentQuestion.options[index].img;
      option.dataset.answer = currentQuestion.options[index].answer;
      
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
      option.classList.add('change-animation');
      setTimeout(() => {
        option.classList.remove('change-animation');
      }, 500);
    });

    questionBox.classList.remove('reveal');
    answerImage.src = "";
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  // Initialize score display
  updateScoreDisplay();

  // Attach event listeners
  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;

      const answer = this.getAttribute('data-answer');
      console.log("Answer selected:", answer);
      
      if (answer === 'correct') {
        console.log("✅ CORRECT!");
        answered = true;
        attemptCount++;
        correctAnswers++;
        updateScoreDisplay();
        
        options.forEach(opt => opt.classList.remove('wrong-answer'));
        this.classList.add('correct-answer');
        
        const correctImg = this.querySelector('img:not(.arrow-indicator)') || this.querySelector('img');
        answerImage.src = correctImg.src;
        this.classList.add('correct-move');
        
        setTimeout(() => {
          questionBox.classList.add('reveal');
        }, 800);
        
        if (attemptCount >= totalQuestions) {
          setTimeout(() => {
            showScoringPopup();
          }, 2000);
        } else {
          setTimeout(() => {
            changeQuestion();
          }, 2000);
        }
        
      } else {
        console.log("❌ WRONG!");
        answered = true;
        attemptCount++;
        updateScoreDisplay();
        
        this.classList.add('wrong-answer');
        
        setTimeout(() => {
          this.classList.remove('wrong-answer');
        }, 600);
        
        if (attemptCount >= totalQuestions) {
          setTimeout(() => {
            showScoringPopup();
          }, 2000);
        } else {
          setTimeout(() => {
            changeQuestion();
          }, 2000);
        }
      }
    });
  });
});