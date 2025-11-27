// ===============================================
// QUALITATIVE CONCEPTS - kuat / lemah (LAST GAME)
// With Firebase Integration (First Attempt Only)
// FIXED: Proper score display + LOCK system + FULL MARKS
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Qualitative Concepts';
const GAME_NAME = 'kuat / lemah';
const GAME_KEY = 'kuat_/_lemah';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= QUESTIONS DATA =================
const questions = [
  { question: "Mana lebih kuat?", correctAnswer: "strong.png" },
  { question: "Mana lebih lemah?", correctAnswer: "weak.png" }
];

// ================= GAME STATE =================
let answered = false;
let score = 0;
let totalQuestions = 0;
let attemptCount = 0;
let currentQuestionIndex = 0;

// ================= CHECK IF GAME ALREADY PLAYED =================
async function checkGameStatus() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('No studentId in session');
      return false;
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('Student not found in Firebase');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    const conceptProgress = studentData.conceptProgress || {};
    const qualitativeProgress = conceptProgress['Qualitative Concepts'] || {};
    const gamesCompleted = qualitativeProgress.gamesCompleted || {};
    
    console.log('🔍 Looking for game key:', GAME_KEY);
    console.log('🔍 Available keys:', Object.keys(gamesCompleted));
    
    if (gamesCompleted[GAME_KEY] && gamesCompleted[GAME_KEY] > 0) {
      existingScore = gamesCompleted[GAME_KEY];
      gameAlreadyPlayed = true;
      console.log('🔒 Game already played! Score:', existingScore);
      return true;
    }

    console.log('✅ First time playing this game');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    return false;
  }
}

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
    const qualitativeProgress = conceptProgress['Qualitative Concepts'] || {};
    const gamesCompleted = qualitativeProgress.gamesCompleted || {};
    
    console.log('🎮 Fetching all game scores...');
    console.log('🎮 Games Completed from Firebase:', gamesCompleted);
    
    // List ALL Qualitative Concepts games
    const gamesList = [
      { key: 'besar_/_kecil', name: 'besar / kecil', maxScore: 2 },
      { key: 'panjang_/_pendek', name: 'panjang / pendek', maxScore: 2 },
      { key: 'sejuk_/_panas', name: 'sejuk / panas', maxScore: 2 },
      { key: 'basah_/_kering', name: 'basah / kering', maxScore: 2 },
      { key: 'keras_/_lembut', name: 'keras / lembut', maxScore: 2 },
      { key: 'kasar_/_licin', name: 'kasar / licin', maxScore: 2 },
      { key: 'laju_/_perlahan', name: 'laju / perlahan', maxScore: 2 },
      { key: 'bersih_/_kotor', name: 'bersih / kotor', maxScore: 2 },
      { key: 'bising_/_senyap', name: 'bising / senyap', maxScore: 2 },
      { key: 'kuat_/_lemah', name: 'kuat / lemah', maxScore: 2 }
    ];

    const allGames = gamesList.map(game => {
      const firebaseScore = gamesCompleted[game.key] || 0;
      
      console.log(`📊 ${game.name}: ${firebaseScore}/${game.maxScore}`);
      
      return {
        gameName: game.name,
        points: firebaseScore,
        maxPoints: game.maxScore
      };
    });

    console.log('📋 All Games Synced:', allGames);
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

  // Update current game score
  const updatedGames = allGameScores.map(game => {
    if (game.gameName === 'kuat / lemah') {
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

  console.log('📊 Total Score:', totalPoints, '/', totalMaxPoints, '=', Math.round(percentage) + '%');

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
  
  console.log('⭐ Updating star colors - Percentage:', percentage + '%');
  
  let filterStyle;
  
  if (percentage >= 80) {
    filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
    console.log('⭐ GOLD STARS - Excellent!');
  } else if (percentage >= 50) {
    filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
    console.log('🟠 ORANGE STARS - Good!');
  } else {
    filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
    console.log('🔴 RED STARS - Keep practicing!');
  }

  stars.forEach(star => {
    star.style.filter = filterStyle;
    star.style.transition = 'filter 0.5s ease-in-out';
  });
}

// ================= POPULATE GAMES LIST =================
function populateGamesList(allGames) {
  const gamesList = document.getElementById('gamesScoreList');
  if (!gamesList) {
    console.warn('⚠️ gamesScoreList element not found');
    return;
  }
  
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
  
  console.log('✅ Games list populated with', allGames.length, 'games');
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

  // ⚠️ HIDE GAME ELEMENTS AFTER updating score
  const imageContainer = document.querySelector('.image-container');
  const bannerContainer = document.querySelector('.banner-container');
  
  if (imageContainer) {
    imageContainer.style.display = 'none';
    console.log('✅ Hidden: .image-container');
  }
  
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
  }

  // Fetch all games and calculate total
  const totalScoreData = await calculateTotalScore(existingScore);
  
  populateGamesList(totalScoreData.allGames);
  updateStarColors(totalScoreData.percentage);
  
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    console.log(`📊 Total percentage: ${totalScoreData.percentage}%`);
  }

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

  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.display = 'block';
    continueBtn.style.pointerEvents = 'auto';
    continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
    
    continueBtn.addEventListener('click', () => {
      console.log('➡️ Continue to Temporal Concepts');
      window.location.href = '/html/homepage/temporalConcepts.html';
    });
  }

  if (finishBtn) {
    finishBtn.style.opacity = '1';
    finishBtn.style.display = 'block';
    finishBtn.style.pointerEvents = 'auto';
    
    finishBtn.addEventListener('click', () => {
      console.log('✅ Finish - Return to homepage');
      window.location.href = '/html/homepage/homepage.html';
    });
  }

  console.log('✅ Existing score displayed - Game LOCKED');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 kuat/lemah Game (LAST GAME) loaded!");
  console.log("🔍 DEBUG: Checking game status...");

  // ⚠️ WAIT for Firebase to be ready
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log("✅ Firebase ready, checking game status...");

  // Check if game already played
  const hasPlayed = await checkGameStatus();
  
  console.log("🔍 DEBUG: hasPlayed =", hasPlayed);
  console.log("🔍 DEBUG: existingScore =", existingScore);
  console.log("🔍 DEBUG: gameAlreadyPlayed =", gameAlreadyPlayed);
  
  if (hasPlayed) {
    console.log("🔒 DEBUG: Game WAS played before - showing existing score");
    await showAlreadyPlayedScreen();
    return; // ⚠️ STOP HERE - Don't initialize game
  }

  console.log("✅ First time playing - initializing game...");

  // Initialize game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    alert('Game initialization failed. Please refresh the page.');
    return;
  }

  console.log("✅ Game session initialized successfully");

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

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Score updated:", `${score}/${attemptCount}`);
    }
  }

  // Function untuk load soalan
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

  // Check jawapan
  async function checkAnswer(clickedImage) {
    if (answered) return;
    answered = true;
    attemptCount++;
    totalQuestions = attemptCount;

    const currentQuestion = questions[currentQuestionIndex];
    const clickedFileName = clickedImage.src.split('/').pop();
    const isCorrect = clickedFileName === currentQuestion.correctAnswer;

    if (isCorrect) {
      score++;
      
      // ⚠️ Update gameSession score immediately!
      if (typeof gameSession !== 'undefined') {
        gameSession.currentScore = score;
        console.log(`🎯 Updated gameSession.currentScore to: ${score}`);
      }
      
      clickedImage.classList.add('correct-glow');
      imageItems.forEach(img => {
        img.style.pointerEvents = 'none';
        if (img !== clickedImage) img.style.opacity = '0.5';
      });
      console.log("✅ CORRECT! Score:", score);
      updateScoreDisplay();
      setTimeout(nextQuestion, 1500);
    } else {
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score:", score);
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

  // Next question
  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      showScoringPopup();
    } else {
      loadQuestion();
    }
  }

  // 🎉 Show scoring popup dengan FULL MARKS
  async function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    console.log("🎉 Showing scoring popup!");
    console.log(`Final Score: ${score}/${attemptCount}`);
    
    // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
    if (typeof gameSession !== 'undefined') {
      gameSession.currentScore = score;
      console.log(`🎯 FORCED gameSession.currentScore = ${score} (before save)`);
    }
    
    // ✅ CRITICAL: Save score to Firebase FIRST
    console.log('💾 Saving score to Firebase...');
    console.log(`   Local score: ${score}/${attemptCount}`);
    console.log(`   gameSession.currentScore: ${gameSession?.currentScore}`);
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ Score saved successfully!');
        console.log('🔒 Game is now LOCKED - Cannot replay');
      } else {
        console.error('❌ Failed to save score');
      }
    } else {
      console.error('❌ gameSession not found');
    }
    
    // Fetch all games and calculate total
    const totalScoreData = await calculateTotalScore(score);
    
    populateGamesList(totalScoreData.allGames);
    updateStarColors(totalScoreData.percentage);
    
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
      console.log(`📊 Total percentage: ${totalScoreData.percentage}%`);
    }
    
    if (scoreModal) {
      scoreModal.style.cssText = '';
      scoreModal.style.display = 'flex';
      scoreModal.style.position = 'fixed';
      scoreModal.style.top = '0';
      scoreModal.style.left = '0';
      scoreModal.style.width = '100%';
      scoreModal.style.height = '100%';
      scoreModal.style.zIndex = '10000';
      scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      scoreModal.style.alignItems = 'center';
      scoreModal.style.justifyContent = 'center';
      scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    }
    
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
        console.log('➡️ Continue to Temporal Concepts');
        window.location.href = '/html/homepage/temporalConcepts.html';
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

  // Add click event
  imageItems.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  loadQuestion();
});

console.log('✅ Qualitative Concepts (kuat/lemah) LAST GAME with FULL MARKS display loaded!');