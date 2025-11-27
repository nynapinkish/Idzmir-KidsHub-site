// ===============================================
// PROPERLY FIXED: berat / ringan 
// Uses gameSessionManager.checkGameStatus() - NO OVERRIDE!
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Quantitative Concepts';
const GAME_NAME = 'berat / ringan';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME DATA =================
const questions = [
  { question: "Yang manakah berat?", correctAnswer: "heavy.png" },
  { question: "Yang manakah ringan?", correctAnswer: "light.png" },
];

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let answered = false;
let correctAnswers = 0;
let attemptCount = 0;

// ⚠️ REMOVED checkGameStatus() - Use gameSessionManager's version instead!

// ================= FETCH ALL GAMES FROM FIREBASE =================
async function fetchAllGameScores() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    const db = firebase.firestore();
    
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('Student not found in Firebase');
      return [];
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    const conceptProgress = studentData.conceptProgress || {};
    const quantitativeProgress = conceptProgress['Quantitative Concepts'] || {};
    const gamesCompleted = quantitativeProgress.gamesCompleted || {};
    
    console.log('🎮 Fetching all game scores...');
    
    const gamesList = [
      { key: 'banyak_/_kurang', name: 'banyak / kurang', maxScore: 2, altKeys: ['kurang_/_banyak'] },
      { key: 'semua_/_tiada_/_sesetengah', name: 'semua / tiada / sesetengah', maxScore: 3, altKeys: [] },
      { key: 'sama_/_beza', name: 'sama / beza', maxScore: 2, altKeys: ['beza_/_sama'] },
      { key: 'penuh_/_kosong', name: 'penuh / kosong', maxScore: 2, altKeys: ['kosong_/_penuh'] },
      { key: 'berat_/_ringan', name: 'berat / ringan', maxScore: 2, altKeys: ['ringan_/_berat'] }
    ];

    const allGames = gamesList.map(game => {
      let firebaseScore = gamesCompleted[game.key] || 0;
      
      if (firebaseScore === 0 && game.altKeys.length > 0) {
        for (const altKey of game.altKeys) {
          if (gamesCompleted[altKey]) {
            firebaseScore = gamesCompleted[altKey];
            break;
          }
        }
      }
      
      return {
        gameName: game.name,
        points: firebaseScore,
        maxPoints: game.maxScore
      };
    });

    return allGames;

  } catch (error) {
    console.error('❌ Error fetching game scores:', error);
    return [];
  }
}

// ================= CALCULATE TOTAL SCORE =================
async function calculateTotalScore(currentGameScore) {
  const allGameScores = await fetchAllGameScores();
  
  if (!allGameScores || allGameScores.length === 0) {
    console.warn('Could not retrieve game scores');
    return { totalPoints: 0, totalMaxPoints: 0, percentage: 0, allGames: [] };
  }

  const updatedGames = allGameScores.map(game => {
    if (game.gameName === 'berat / ringan') {
      return { ...game, points: currentGameScore };
    }
    return game;
  });

  let totalPoints = 0;
  let totalMaxPoints = 0;

  updatedGames.forEach(game => {
    totalPoints += game.points || 0;
    totalMaxPoints += game.maxPoints || 0;
  });

  const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

  return {
    totalPoints,
    totalMaxPoints,
    percentage: Math.round(percentage),
    allGames: updatedGames
  };
}

// ================= UPDATE STAR COLORS =================
function updateStarColors(percentage) {
  const stars = document.querySelectorAll('.star-image');
  
  let filterStyle;
  
  if (percentage >= 80) {
    filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
  } else if (percentage >= 50) {
    filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
  } else {
    filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
  }

  stars.forEach(star => {
    star.style.filter = filterStyle;
    star.style.transition = 'filter 0.5s ease-in-out';
  });
}

// ================= POPULATE GAMES LIST =================
function populateGamesList(allGames) {
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

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🚫 Game already completed - showing existing score');
  
  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');

  // ✅ UPDATE SCORE BANNER FIRST before hiding!
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner updated: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // ⚠️ Hide Quantitative-specific elements AFTER updating score
  const bannerContainer = document.querySelector('.banner-container');
  const imageContainer = document.querySelector('.image-container');
  
  if (bannerContainer) bannerContainer.style.display = 'none';
  if (imageContainer) imageContainer.style.display = 'none';

  // Fetch all games and calculate total
  const totalScoreData = await calculateTotalScore(existingScore);
  
  // Populate games list
  populateGamesList(totalScoreData.allGames);
  
  // Update total percentage
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
  }
  
  // Update star colors
  updateStarColors(totalScoreData.percentage);

  if (scoreModal) {
    scoreModal.style.cssText = '';
    scoreModal.style.display = 'flex';
    scoreModal.style.position = 'fixed';
    scoreModal.style.top = '0';
    scoreModal.style.left = '0';
    scoreModal.style.width = '100%';
    scoreModal.style.height = '100%';
    scoreModal.style.zIndex = '10000';
    scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
    scoreModal.style.backdropFilter = 'blur(5px)';
    scoreModal.style.alignItems = 'center';
    scoreModal.style.justifyContent = 'center';
    scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
  }

  // Show buttons
  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.display = 'block';
    continueBtn.style.pointerEvents = 'auto';
    continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
    
    continueBtn.addEventListener('click', () => {
      window.location.href = '/html/homepage/qualitativeConcepts.html';
    });
  }

  if (finishBtn) {
    finishBtn.style.opacity = '1';
    finishBtn.style.display = 'block';
    finishBtn.style.pointerEvents = 'auto';
    
    finishBtn.addEventListener('click', () => {
      window.location.href = '/html/homepage/homepage.html';
    });
  }

  console.log('✅ Existing score displayed with full marks');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Heavy/Light Game loaded!");

  // ⚠️ CRITICAL: Use gameSessionManager's checkGameStatus()
  // Convert game name to key format (same as gameSessionManager does)
  const gameKey = GAME_NAME.replace(/\s*\/\s*/g, '_/_').replace(/\s+/g, '_');
  console.log('🔑 Checking lock status for:', gameKey);
  console.log('🔑 Expected Firebase key:', gameKey);
  
  const gameStatus = await gameSession.checkGameStatus(gameKey);
  
  console.log('📊 Lock check result:', gameStatus);
  
  if (gameStatus.played) {
    gameAlreadyPlayed = true;
    existingScore = gameStatus.score;
    console.log('🔒 Game is LOCKED! Existing score:', existingScore);
    await showAlreadyPlayedScreen();
    return; // STOP - Don't initialize game
  }
  
  console.log('✅ Game unlocked - First time playing');
  
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

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

  function updateScoreDisplay() {
    if (scoreText) {
      scoreText.textContent = `${correctAnswers}/${attemptCount}`;
    }
  }

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

  function checkAnswer(clickedImage) {
    if (answered) return;
    answered = true;
    attemptCount++;

    const currentQuestion = questions[currentQuestionIndex];
    const clickedFileName = clickedImage.src.split('/').pop();
    const isCorrect = clickedFileName === currentQuestion.correctAnswer;

    if (isCorrect) {
      correctAnswers++;
      
      // Update gameSession score
      if (typeof gameSession !== 'undefined') {
        gameSession.currentScore = correctAnswers;
      }
      
      clickedImage.classList.add('correct-glow');
      imageItems.forEach(img => {
        img.style.pointerEvents = 'none';
        if (img !== clickedImage) img.style.opacity = '0.5';
      });
      updateScoreDisplay();
      setTimeout(nextQuestion, 1500);
    } else {
      clickedImage.classList.add('wrong-shake');
      updateScoreDisplay();
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

  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      setTimeout(() => {
        showFinalScoreModal();
      }, 500);
    } else {
      loadQuestion();
    }
  }

  async function showFinalScoreModal() {
    const scoreModal = document.getElementById('scoreModal');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');

    console.log('🎉 Game completed!');
    console.log(`Final Score: ${correctAnswers}/${attemptCount}`);

    // ✅ Save score first
    console.log('💾 Saving score to Firebase...');
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      if (saved) {
        console.log('✅ Score saved successfully!');
        console.log('🔒 Game is now LOCKED');
      } else {
        console.error('❌ Failed to save score');
      }
    }

    // ✅ Fetch all games and calculate total
    const totalScoreData = await calculateTotalScore(correctAnswers);
    
    // Populate games list
    populateGamesList(totalScoreData.allGames);
    
    // Update total percentage
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    }
    
    // Update star colors
    updateStarColors(totalScoreData.percentage);

    // ✅ Show modal
    if (scoreModal) {
      scoreModal.style.cssText = '';
      scoreModal.style.display = 'flex';
      scoreModal.style.position = 'fixed';
      scoreModal.style.top = '0';
      scoreModal.style.left = '0';
      scoreModal.style.width = '100%';
      scoreModal.style.height = '100%';
      scoreModal.style.zIndex = '10000';
      scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      scoreModal.style.backdropFilter = 'blur(5px)';
      scoreModal.style.alignItems = 'center';
      scoreModal.style.justifyContent = 'center';
      scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';

      if (continueBtn) {
        continueBtn.style.opacity = '0';
        continueBtn.style.display = 'block';
        continueBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
          continueBtn.style.transition = 'opacity 0.5s ease-in-out';
          continueBtn.style.opacity = '1';
          continueBtn.style.pointerEvents = 'auto';
          continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
        }, 1000);

        continueBtn.addEventListener('click', () => {
          console.log('➡️ Continue to next concept...');
          window.location.href = '/html/homepage/qualitativeConcepts.html';
        });
      }

      if (finishBtn) {
        finishBtn.style.opacity = '0';
        finishBtn.style.display = 'block';
        finishBtn.style.pointerEvents = 'none';
        
        setTimeout(() => {
          finishBtn.style.transition = 'opacity 0.4s ease-in-out';
          finishBtn.style.opacity = '1';
          finishBtn.style.pointerEvents = 'auto';
        }, 1000);

        finishBtn.addEventListener('click', () => {
          console.log('✅ Finish - Return to homepage');
          window.location.href = '/html/homepage/homepage.html';
        });
      }
    }
  }

  imageItems.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Starting Heavy/Light game...");
  loadQuestion();
});

console.log('✅ game_page5.js loaded - Using gameSessionManager properly!');