// ===============================================
// LAST GAME: dalam / luar
// WITH LOCK SYSTEM + FULL MARKS DISPLAY
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'dalam / luar';
const GAME_KEY = 'dalam_/_luar';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME DATA =================
const questions = [
  {
    label: "dalam",
    question: "Mana yang di dalam?",
    correctImg: "../../../assets/images/inside.png",
    options: [
      { answer: "correct", img: "../../../assets/images/inside.png" },
      { answer: "wrong", img: "../../../assets/images/outside.png" }
    ]
  },
  {
    label: "luar",
    question: "Mana yang di luar?",
    correctImg: "../../../assets/images/outside.png",
    options: [
      { answer: "wrong", img: "../../../assets/images/inside.png" },
      { answer: "correct", img: "../../../assets/images/outside.png" }
    ]
  }
];

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let answered = false;
let correctAnswers = 0;
let attemptCount = 0;

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
    const spatialProgress = conceptProgress['Spatial Concepts'] || {};
    const gamesCompleted = spatialProgress.gamesCompleted || {};
    
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
    const spatialProgress = conceptProgress['Spatial Concepts'] || {};
    const gamesCompleted = spatialProgress.gamesCompleted || {};
    
    console.log('🎮 Games Completed from Firebase:', gamesCompleted);
    
    // List semua games dengan key yang betul + alternative keys
    const gamesList = [
      { key: 'dalam_/_atas_/_bawah', name: 'dalam / atas / bawah', maxScore: 3, altKeys: [] },
      { key: 'atas_/_bawah', name: 'atas / bawah', maxScore: 2, altKeys: [] },
      { key: 'belakang_/_depan', name: 'belakang / depan', maxScore: 2, altKeys: ['depan_/_belakang'] },
      { key: 'antara_/_sekeliling', name: 'antara / sekeliling', maxScore: 2, altKeys: ['sekeliling_/_antara'] },
      { key: 'melalui_/_melepasi', name: 'melalui / melepasi', maxScore: 2, altKeys: ['melepasi_/_melalui'] },
      { key: 'naik_/_turun', name: 'naik / turun', maxScore: 2, altKeys: ['turun_/_naik'] },
      { key: 'dekat_/_jauh', name: 'dekat / jauh', maxScore: 2, altKeys: ['jauh_/_dekat'] },
      { key: 'atas_/_bawah_/_tengah', name: 'atas / bawah / tengah', maxScore: 3, altKeys: [] },
      { key: 'dalam_/_luar', name: 'dalam / luar', maxScore: 2, altKeys: ['luar_/_dalam'] }
    ];

    const allGames = gamesList.map(game => {
      // Try main key first
      let firebaseScore = gamesCompleted[game.key] || 0;
      
      // If not found, try alternative keys
      if (firebaseScore === 0 && game.altKeys.length > 0) {
        for (const altKey of game.altKeys) {
          if (gamesCompleted[altKey]) {
            firebaseScore = gamesCompleted[altKey];
            console.log(`⚠️ Found score under alternative key "${altKey}": ${firebaseScore}`);
            break;
          }
        }
      }
      
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
    if (game.gameName === 'dalam / luar') {
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

  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) gameContainer.style.display = 'none';

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
      window.location.href = '/html/homepage/quantitativeConcepts.html';
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
  console.log('🎮 Last game page loaded');

  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    await showAlreadyPlayedScreen();
    return;
  }
  
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game');
    return;
  }

  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');

  showScoreDisplay();
  updateScoreDisplay();

  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;
      const answer = this.getAttribute('data-answer');
      
      if (answer === 'correct') {
        handleCorrectAnswerClick(this, options, questionBox, answerImage, feedback);
      } else {
        handleWrongAnswerClick(this, feedback);
      }
    });
  });

  console.log('✅ Last game initialized - First attempt only!');
});

// ================= SHOW SCORE DISPLAY =================
function showScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }
}

// ================= UPDATE SCORE DISPLAY =================
function updateScoreDisplay() {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${correctAnswers}/${attemptCount}`;
    console.log(`📊 Score: ${correctAnswers}/${attemptCount}`);
  }
}

// ================= HANDLE CORRECT ANSWER =================
function handleCorrectAnswerClick(selectedCard, options, questionBox, answerImage, feedback) {
  console.log('✅ CORRECT!');
  
  answered = true;
  attemptCount++;
  correctAnswers++;
  
  if (typeof gameSession !== 'undefined') {
    gameSession.currentScore = correctAnswers;
    console.log(`🎯 Updated gameSession.currentScore to: ${correctAnswers}`);
  }
  
  updateScoreDisplay();
  
  options.forEach(opt => opt.classList.remove('wrong-answer'));
  selectedCard.classList.add('correct-answer');

  const correctImg = selectedCard.querySelector('img:not(.arrow-indicator)') || selectedCard.querySelector('img');
  if (answerImage && correctImg) {
    answerImage.src = correctImg.src;
  }

  selectedCard.classList.add('correct-move');

  if (feedback) {
    feedback.textContent = '🎉 Betul! Hebat!';
    feedback.classList.add('correct');
  }

  setTimeout(() => {
    if (questionBox) questionBox.classList.add('reveal');
  }, 800);

  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
  }
}

// ================= HANDLE WRONG ANSWER =================
function handleWrongAnswerClick(selectedCard, feedback) {
  console.log('❌ WRONG!');
  
  answered = true;
  attemptCount++;

  handleWrongAnswer();
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');

  if (feedback) {
    feedback.textContent = '❌ Cuba lagi!';
    feedback.classList.add('incorrect');
  }

  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);

  if (attemptCount >= TOTAL_QUESTIONS) {
    console.log('🎉 All questions completed!');
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
  }
}

// ================= CHANGE QUESTION =================
function changeQuestion() {
  answered = false;
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

  const currentQuestion = questions[currentQuestionIndex];

  const questionLabel = document.querySelector('.question-label');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionIcon = document.querySelector('.question-icon');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const feedback = document.getElementById('feedback');

  if (questionLabel) questionLabel.textContent = currentQuestion.label;
  if (questionPrompt) questionPrompt.textContent = currentQuestion.question;
  if (questionIcon) questionIcon.src = currentQuestion.correctImg;

  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach((option, index) => {
    const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
    if (optionImg) optionImg.src = currentQuestion.options[index].img;
    option.dataset.answer = currentQuestion.options[index].answer;
    option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  if (questionBox) questionBox.classList.remove('reveal');
  if (answerImage) answerImage.src = "";
  if (feedback) {
    feedback.textContent = "";
    feedback.className = "feedback";
  }
}

// ================= SHOW FINAL SCORE MODAL =================
async function showFinalScoreModal() {
  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');

  console.log('🎉 Game completed!');
  console.log(`Final Score: ${correctAnswers}/${attemptCount}`);

  // Save score first
  console.log('💾 Saving score to Firebase...');
  if (typeof gameSession !== 'undefined' && gameSession.endSession) {
    const saved = await gameSession.endSession();
    if (saved) {
      console.log('✅ Score saved successfully!');
    } else {
      console.error('❌ Failed to save score');
    }
  }

  // Fetch all games and calculate total
  const totalScoreData = await calculateTotalScore(correctAnswers);
  
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
        window.location.href = '/html/homepage/quantitativeConcepts.html';
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

console.log('✅ Last game script with FULL MARKS display loaded!');