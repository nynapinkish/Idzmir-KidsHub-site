// ===============================================
// SOCIAL/EMOTIONAL CONCEPTS - tolong / kongsi / tunggu
// FIXED: Uses "Social/Emotional" instead of "Social Concepts"
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Social/Emotional';
const GAME_NAME = 'tolong / kongsi / tunggu';
const GAME_KEY = 'tolong_/_kongsi_/_tunggu';
const TOTAL_QUESTIONS = 3;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let score = 0;
let attemptCount = 0;
let answered = false;

// ================= CHECK IF GAME ALREADY PLAYED =================
async function checkGameStatus() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('⚠️ No studentId in session - allowing first play');
      return false;
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('⚠️ Student not found in Firebase - allowing first play');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    console.log('🔍 Checking game status...');
    console.log('   Looking for game key:', GAME_KEY);
    
    const conceptProgress = studentData.conceptProgress || {};
    
    // Search ALL concepts for the game key
    for (const conceptType in conceptProgress) {
      const conceptData = conceptProgress[conceptType];
      const gamesCompleted = conceptData.gamesCompleted || {};
      
      console.log(`   Checking ${conceptType}:`, Object.keys(gamesCompleted));
      
      if (gamesCompleted[GAME_KEY] !== undefined && gamesCompleted[GAME_KEY] >= 0) {
        existingScore = gamesCompleted[GAME_KEY];
        gameAlreadyPlayed = true;
        console.log(`🔒 Game FOUND in ${conceptType}!`);
        console.log(`   Score: ${existingScore}/${TOTAL_QUESTIONS}`);
        return true;
      }
    }

    console.log('✅ Game not found in any concept - first time playing');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    return false;
  }
}

// ================= FETCH ALL SOCIAL/EMOTIONAL GAMES FROM FIREBASE =================
async function fetchAllGameScores() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('⚠️ No studentId for fetching scores');
      return [];
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('⚠️ Student not found in Firebase');
      return [];
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    const conceptProgress = studentData.conceptProgress || {};
    
    console.log('🎮 Fetching all Social/Emotional game scores...');
    
    let gamesCompleted = {};
    
    // ✅ FIXED: Look for "Social/Emotional" key in Firebase
    if (conceptProgress['Social/Emotional']) {
      gamesCompleted = conceptProgress['Social/Emotional'].gamesCompleted || {};
      console.log('✅ Found Social/Emotional in Firebase');
    } else {
      console.warn('⚠️ Social/Emotional not found in conceptProgress');
    }
    
    console.log('🎮 Games Completed from Firebase:', gamesCompleted);
    
    // List ALL Social/Emotional games
    const gamesList = [
      { key: 'gembira_/_sedih_/_marah_/_takut', name: 'gembira / sedih / marah / takut', maxScore: 4 },
      { key: 'bersama_/_bersendirian', name: 'bersama / bersendirian', maxScore: 2 },
      { key: 'mesra_/_jahat', name: 'mesra / jahat', maxScore: 2 },
      { key: 'tolong_/_kongsi_/_tunggu', name: 'tolong / kongsi / tunggu', maxScore: 3 }
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

    console.log('📋 All Social/Emotional Games Synced:', allGames);
    return allGames;

  } catch (error) {
    console.error('❌ Error fetching game scores:', error);
    return [];
  }
}

// ================= CALCULATE TOTAL SCORE =================
async function calculateTotalScore(currentGameScore) {
  console.log('🧮 Calculating Social/Emotional total score...');
  console.log('   Current game score:', currentGameScore);
  
  const allGameScores = await fetchAllGameScores();
  
  if (!allGameScores || allGameScores.length === 0) {
    console.warn('⚠️ Could not retrieve game scores');
    return { totalPoints: 0, totalMaxPoints: 0, percentage: 0, allGames: [] };
  }

  // Update current game score (tolong/kongsi/tunggu)
  const updatedGames = allGameScores.map(game => {
    if (game.gameName === 'tolong / kongsi / tunggu') {
      console.log(`   Updating ${game.gameName}: ${game.points} → ${currentGameScore}`);
      return { ...game, points: currentGameScore };
    }
    return game;
  });

  let totalPoints = 0;
  let totalMaxPoints = 0;

  updatedGames.forEach(game => {
    totalPoints += game.points || 0;
    totalMaxPoints += game.maxPoints || 0;
    console.log(`   ${game.gameName}: ${game.points}/${game.maxPoints}`);
  });

  const percentage = totalMaxPoints > 0 ? (totalPoints / totalMaxPoints) * 100 : 0;

  console.log('📊 SOCIAL/EMOTIONAL TOTAL:', totalPoints, '/', totalMaxPoints, '=', Math.round(percentage) + '%');

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
  
  console.log('⭐ Updating star colors based on', percentage + '%');
  
  let filterStyle;
  
  if (percentage >= 80) {
    filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
    console.log('   ⭐ GOLD STARS - Excellent!');
  } else if (percentage >= 50) {
    filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
    console.log('   🟠 ORANGE STARS - Good!');
  } else {
    filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
    console.log('   🔴 RED STARS - Keep practicing!');
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
  
  console.log('📝 Populating Social/Emotional games list...');
  gamesList.innerHTML = '';

  allGames.forEach(game => {
    console.log(`   Adding: ${game.gameName} - ${game.points}/${game.maxPoints}`);
    const row = document.createElement('div');
    row.className = 'game-score-row';
    row.innerHTML = `
      <div class="game-name">${game.gameName}</div>
      <div class="game-points">${game.points}/${game.maxPoints}</div>
    `;
    gamesList.appendChild(row);
  });
  
  console.log('✅ Games list populated with', allGames.length, 'Social/Emotional games');
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🔒 Showing LOCKED screen - score already saved');
  console.log(`   Existing score: ${existingScore}/${TOTAL_QUESTIONS}`);
  
  // Update score display
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // Hide game elements
  const questionBox = document.getElementById('questionBox');
  const optionsContainer = document.querySelector('.options-container');
  
  if (questionBox) questionBox.style.display = 'none';
  if (optionsContainer) optionsContainer.style.display = 'none';

  // Fetch all Social/Emotional games & calculate total
  const totalScoreData = await calculateTotalScore(existingScore);
  
  populateGamesList(totalScoreData.allGames);
  updateStarColors(totalScoreData.percentage);

  // Update modal content
  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
  }

  // Show modal
  if (scoreModal) {
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

  // Setup buttons
  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.display = 'block';
    continueBtn.style.pointerEvents = 'auto';
    continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
    
    continueBtn.addEventListener('click', () => {
      console.log('➡️ Continue to Spatial Concepts');
      window.location.href = '/html/homepage/spatialConcepts.html';
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

  console.log('✅ LOCKED screen fully displayed');
}

// ================= MAIN GAME LOGIC =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 tolong/kongsi/tunggu Game loading...");
  console.log("   Concept Type:", CONCEPT_TYPE);
  console.log("   Game Key:", GAME_KEY);

  // Wait for Firebase
  let attempts = 0;
  const maxAttempts = 15;
  
  while (attempts < maxAttempts) {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      console.log('✅ Firebase ready!');
      break;
    }
    console.log(`⏳ Waiting for Firebase... (${attempts + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 300));
    attempts++;
  }
  
  if (attempts >= maxAttempts) {
    console.error('❌ Firebase failed to load');
    alert('Firebase gagal dimuat. Sila refresh halaman.');
    return;
  }

  // Check if game already played
  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    console.log("🔒 Game WAS played before - showing existing score");
    await showAlreadyPlayedScreen();
    return;
  }

  console.log("✅ First time playing - initializing new game session...");

  // Initialize NEW game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game session');
    alert('Gagal memulakan game. Sila refresh halaman.');
    return;
  }

  // Get game elements
  const options = document.querySelectorAll('.option-card');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  const questionMark = document.querySelector('.question-mark');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const gamesScoreList = document.getElementById('gamesScoreList');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');

  const questions = [
    {
      label: "tolong",
      question: "Mana yang nampak tolong?",
      correctImg: "../../../assets/images/help.png",
      options: [
        { answer: "correct", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" },
      ]
    },
    {
      label: "kongsi",
      question: "Mana yang nampak kongsi?",
      correctImg: "../../../assets/images/share.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "correct", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" },
      ]
    },
    {
      label: "tunggu",
      question: "Mana yang nampak tunggu?",
      correctImg: "../../../assets/images/wait.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "correct", img: "../../../assets/images/wait.png" },
      ]
    }
  ];

  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
    }
  }

  function changeQuestion() {
    answered = false;
    if (currentQuestionIndex >= questions.length) {
      showScoringPopup();
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctImg;

    options.forEach((option, i) => {
      option.dataset.answer = currentQuestion.options[i].answer;
      option.querySelector('.card-image').src = currentQuestion.options[i].img;
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
    });

    answerImage.src = '';
    answerImage.style.display = 'none';
    if (questionIcon) questionIcon.style.display = 'block';
    if (questionMark) questionMark.style.display = 'block';
    questionBox.classList.remove('reveal');
  }

  options.forEach(option => {
    option.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      attemptCount++;

      const answer = this.dataset.answer;

      if (answer === 'correct') {
        score++;
        
        // Update gameSession score immediately
        if (typeof gameSession !== 'undefined') {
          gameSession.currentScore = score;
          console.log(`🎯 Updated gameSession.currentScore to: ${score}`);
        }
        
        updateScoreDisplay();
        this.classList.add('correct-answer');

        const correctImg = this.querySelector('.card-image');
        answerImage.src = correctImg.src;
        answerImage.style.display = 'block';

        if (questionMark) questionMark.style.display = 'none';
        if (questionIcon) questionIcon.style.display = 'none';
        this.classList.add('correct-move');

        setTimeout(() => questionBox.classList.add('reveal'), 800);
        setTimeout(() => {
          currentQuestionIndex++;
          changeQuestion();
        }, 2000);

      } else {
        this.classList.add('wrong-answer');
        updateScoreDisplay();
        setTimeout(() => {
          this.classList.remove('wrong-answer');
          currentQuestionIndex++;
          changeQuestion();
        }, 1200);
      }
    });
  });

  async function showScoringPopup() {
    console.log("🎉 All questions completed - showing Social/Emotional summary!");
    
    if (!scoreModal) return;

    // Force set gameSession.currentScore
    if (typeof gameSession !== 'undefined') {
      gameSession.currentScore = score;
      console.log(`🎯 FORCED gameSession.currentScore = ${score}`);
    }

    // Save score to Firebase
    console.log('💾 Saving final score to Firebase...');
    console.log(`   Final score: ${score}/${attemptCount}`);
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ Score saved successfully to Firebase!');
      } else {
        console.error('❌ Failed to save score to Firebase');
      }
    }

    // Fetch all Social/Emotional games and calculate total
    const totalScoreData = await calculateTotalScore(score);
    
    populateGamesList(totalScoreData.allGames);
    updateStarColors(totalScoreData.percentage);
    
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    }
    
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

    if (continueBtn) {
      setTimeout(() => {
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
        continueBtn.classList.add('bouncing');
      }, 1000);
      
      continueBtn.addEventListener('click', () => {
        console.log('➡️ Continue to Spatial Concepts');
        window.location.href = '/html/homepage/spatialConcepts.html';
      });
    }

    if (finishBtn) {
      setTimeout(() => {
        finishBtn.style.opacity = '1';
        finishBtn.style.pointerEvents = 'auto';
      }, 1000);
      
      finishBtn.addEventListener('click', () => {
        console.log('✅ Finish - Return to homepage');
        window.location.href = '/html/homepage/homepage.html';
      });
    }
  }

  // Start game
  updateScoreDisplay();
  changeQuestion();
});

console.log('✅ tolong/kongsi/tunggu with Firebase Integration loaded!');
console.log('🔒 Game lock system active - First attempt only');
console.log('📊 Shows Social/Emotional concept summary');