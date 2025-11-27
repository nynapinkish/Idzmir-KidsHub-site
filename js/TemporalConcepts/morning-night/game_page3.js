// ===============================================
// TEMPORAL CONCEPTS - Pagi / Malam (LAST GAME)
// With Firebase Integration (First Attempt Only)
// FIXED: Proper score retrieval after refresh + FULL MARKS
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Temporal Concepts';
const GAME_NAME = 'pagi / malam';
const GAME_KEY = 'pagi_/_malam';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let currentQuestion = 1;
let answered = false;
let correctAnswers = 0;
let totalAttempts = 0;

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
    
    // ✅ CRITICAL FIX: Search ALL concepts for the game key
    for (const conceptType in conceptProgress) {
      const conceptData = conceptProgress[conceptType];
      const gamesCompleted = conceptData.gamesCompleted || {};
      
      console.log(`   Checking ${conceptType}:`, Object.keys(gamesCompleted));
      
      // Check if game exists (allow score of 0)
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
    console.error('   Error details:', error.message);
    return false;
  }
}

// ================= FETCH ALL GAMES FROM FIREBASE =================
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
    
    console.log('🎮 Fetching all Temporal Concepts game scores...');
    
    // ✅ FIXED: Search in conceptProgress for Temporal Concepts
    let gamesCompleted = {};
    
    if (conceptProgress['Temporal Concepts']) {
      gamesCompleted = conceptProgress['Temporal Concepts'].gamesCompleted || {};
    }
    
    console.log('🎮 Games Completed from Firebase:', gamesCompleted);
    
    // List ALL Temporal Concepts games
    const gamesList = [
      { key: 'sebelum_/_selepas', name: 'sebelum / selepas', maxScore: 2 },
      { key: 'sekarang_/_kemudian', name: 'sekarang / kemudian', maxScore: 2 },
      { key: 'pagi_/_malam', name: 'pagi / malam', maxScore: 2 }
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
    console.error('   Error details:', error.message);
    return [];
  }
}

// ================= CALCULATE TOTAL SCORE =================
async function calculateTotalScore(currentGameScore) {
  console.log('🧮 Calculating total score...');
  console.log('   Current game score:', currentGameScore);
  
  const allGameScores = await fetchAllGameScores();
  
  if (!allGameScores || allGameScores.length === 0) {
    console.warn('⚠️ Could not retrieve game scores');
    return { totalPoints: 0, totalMaxPoints: 0, percentage: 0, allGames: [] };
  }

  // Update current game score (pagi/malam)
  const updatedGames = allGameScores.map(game => {
    if (game.gameName === 'pagi / malam') {
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

  console.log('📊 TOTAL SCORE:', totalPoints, '/', totalMaxPoints, '=', Math.round(percentage) + '%');

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
  
  console.log('📝 Populating games list...');
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
  
  console.log('✅ Games list populated with', allGames.length, 'games');
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🔒 Showing LOCKED screen - score already saved');
  console.log(`   Existing score: ${existingScore}/${TOTAL_QUESTIONS}`);
  
  // 1️⃣ UPDATE SCORE BANNER (TOP RIGHT) FIRST
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // 2️⃣ HIDE GAME ELEMENTS
  const imageContainer = document.querySelector('.image-container');
  const bannerContainer = document.querySelector('.banner-container');
  const answerBtnContainer = document.querySelector('.answer-btn-container');
  
  if (imageContainer) {
    imageContainer.style.display = 'none';
    console.log('✅ Hidden: .image-container');
  }
  if (bannerContainer) {
    bannerContainer.style.display = 'none';
    console.log('✅ Hidden: .banner-container');
  }
  if (answerBtnContainer) {
    answerBtnContainer.style.display = 'none';
    console.log('✅ Hidden: .answer-btn-container');
  }

  // 3️⃣ FETCH ALL GAMES & CALCULATE TOTAL
  console.log('📊 Fetching all games for summary...');
  const totalScoreData = await calculateTotalScore(existingScore);
  
  populateGamesList(totalScoreData.allGames);
  updateStarColors(totalScoreData.percentage);

  // 4️⃣ UPDATE MODAL CONTENT
  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');
  
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    console.log(`📊 Total percentage: ${totalScoreData.percentage}%`);
  }

  // 5️⃣ SHOW MODAL
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
    console.log('✅ Modal displayed');
  }

  // 6️⃣ SETUP BUTTONS
  if (continueBtn) {
    continueBtn.style.opacity = '1';
    continueBtn.style.display = 'block';
    continueBtn.style.pointerEvents = 'auto';
    continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
    
    continueBtn.addEventListener('click', () => {
      console.log('➡️ Continue to Color Shape Concepts');
      window.location.href = '/html/homepage/colorShapeConcepts.html';
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

  console.log('✅ LOCKED screen fully displayed - Cannot replay');
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Pagi/Malam Game (LAST GAME) loading...");
  console.log("   Game Key:", GAME_KEY);
  
  // ⚠️ CRITICAL: Wait for Firebase to be fully ready
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
    console.error('❌ Firebase failed to load after 4.5 seconds');
    alert('Firebase gagal dimuat. Sila refresh halaman.');
    return;
  }

  console.log("🔍 Checking if game already played...");

  // ✅ Check if game already played
  const hasPlayed = await checkGameStatus();
  
  console.log("📊 Game Status Check Result:");
  console.log("   hasPlayed:", hasPlayed);
  console.log("   existingScore:", existingScore);
  console.log("   gameAlreadyPlayed:", gameAlreadyPlayed);
  
  if (hasPlayed) {
    console.log("🔒 Game WAS played before - showing existing score");
    await showAlreadyPlayedScreen();
    return; // ⚠️ STOP HERE - Don't initialize game
  }

  console.log("✅ First time playing - initializing new game session...");

  // Initialize NEW game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game session');
    alert('Gagal memulakan game. Sila refresh halaman.');
    return;
  }

  console.log("✅ Game session initialized successfully");

  // ✅ Get all elements from HTML
  const images = document.querySelectorAll('.image-item');
  const scoreModal = document.getElementById('scoreModal');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const bannerBlue = document.querySelector('.banner-blue');
  const answerText = document.querySelector('.answer-text');
  
  // Modal elements for final summary
  const gamesScoreList = document.getElementById('gamesScoreList');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');

  console.log("🎮 Game elements loaded:");
  console.log("   Images found:", images.length);
  console.log("   Score modal:", scoreModal ? '✅' : '❌');
  console.log("   Games list:", gamesScoreList ? '✅' : '❌');

  if (scoreDisplay) scoreDisplay.style.display = 'block';

  // ============================================
  // Function: Setup question display
  // ============================================
  function setupQuestion() {
    // Reset images
    images.forEach(img => {
      img.classList.remove('correct-glow', 'wrong-shake', 'wrong-fade');
      img.style.opacity = '1';
      img.style.pointerEvents = 'auto';
    });

    answered = false;

    if (currentQuestion === 1) {
      // Question 1: Mana Pagi?
      bannerBlue.textContent = 'Mana pagi?';
      answerText.textContent = 'pagi';
      console.log("❓ Question 1: Mana pagi?");
    } else if (currentQuestion === 2) {
      // Question 2: Mana Malam?
      bannerBlue.textContent = 'Mana malam?';
      answerText.textContent = 'malam';
      console.log("❓ Question 2: Mana malam?");
    }
  }

  // ============================================
  // Function: Update score display (top right)
  // ============================================
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${totalAttempts}`;
      console.log("📊 Score updated:", scoreText.textContent);
    }
  }

  // ============================================
  // Function: Show completion modal (Final Summary)
  // ============================================
  async function showCompletionModal() {
    console.log("🎉 All questions completed - showing final summary!");
    
    if (!scoreModal) {
      console.error("❌ Modal element not found!");
      return;
    }

    // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
    if (typeof gameSession !== 'undefined') {
      gameSession.currentScore = correctAnswers;
      console.log(`🎯 FORCED gameSession.currentScore = ${correctAnswers}`);
    }

    // ✅ CRITICAL: Save score to Firebase FIRST
    console.log('💾 Saving final score to Firebase...');
    console.log(`   Final score: ${correctAnswers}/${totalAttempts}`);
    console.log(`   gameSession.currentScore: ${gameSession?.currentScore}`);
    
    if (typeof gameSession !== 'undefined' && gameSession.endSession) {
      const saved = await gameSession.endSession();
      
      if (saved) {
        console.log('✅ Score saved successfully to Firebase!');
        console.log('🔒 Game is now LOCKED - Cannot replay');
      } else {
        console.error('❌ Failed to save score to Firebase');
      }
    } else {
      console.error('❌ gameSession not found or endSession missing');
    }

    // Fetch all games and calculate total
    console.log('📊 Calculating final summary...');
    const totalScoreData = await calculateTotalScore(correctAnswers);
    
    populateGamesList(totalScoreData.allGames);
    updateStarColors(totalScoreData.percentage);
    
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
      console.log(`📊 Total percentage displayed: ${totalScoreData.percentage}%`);
    }
    
    // Show modal with full screen overlay
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
    
    console.log("✅ Modal displayed!");

    // Setup Continue button
    if (continueBtn) {
      continueBtn.style.opacity = '0';
      continueBtn.style.display = 'block';
      continueBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        continueBtn.style.transition = 'opacity 0.5s ease-in-out';
        continueBtn.style.opacity = '1';
        continueBtn.style.pointerEvents = 'auto';
        continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log('➡️ Continue button activated');
      }, 1000);
      
      continueBtn.addEventListener('click', () => {
        console.log('➡️ Navigating to Spatial Concepts');
        window.location.href = '/html/homepage/spatialConcepts.html';
      });
    }

    // Setup Finish button
    if (finishBtn) {
      finishBtn.style.opacity = '0';
      finishBtn.style.display = 'block';
      finishBtn.style.pointerEvents = 'none';
      
      setTimeout(() => {
        finishBtn.style.transition = 'opacity 0.4s ease-in-out';
        finishBtn.style.opacity = '1';
        finishBtn.style.pointerEvents = 'auto';
        console.log('✅ Finish button activated');
      }, 1000);
      
      finishBtn.addEventListener('click', () => {
        console.log('✅ Returning to homepage');
        window.location.href = '/html/homepage/homepage.html';
      });
    }
  }

  // ============================================
  // Main Event: Handle image clicks
  // ============================================
  images.forEach(image => {
    image.addEventListener('click', function() {
      const clickedAlt = this.alt.toLowerCase();
      console.log("🖱️ Image clicked:", this.alt, "→ Lowercase:", clickedAlt);
      
      // ⛔ Prevent multiple clicks
      if (answered) {
        console.log("⚠️ Already answered, ignoring click");
        return;
      }

      // Determine correct answer based on current question
      let correctAnswer;
      
      if (currentQuestion === 1) {
        // Question 1: Mana Pagi? → Correct = "pagi"
        correctAnswer = clickedAlt === 'pagi' ? 'correct' : 'wrong';
        console.log(`❓ Q1: Is "${clickedAlt}" === "pagi"? → ${correctAnswer}`);
      } else {
        // Question 2: Mana Malam? → Correct = "malam"
        correctAnswer = clickedAlt === 'malam' ? 'correct' : 'wrong';
        console.log(`❓ Q2: Is "${clickedAlt}" === "malam"? → ${correctAnswer}`);
      }
      
      console.log("📝 Answer:", correctAnswer);
      
      // Mark as answered & increment attempt
      answered = true;
      totalAttempts++;

      // ============================================
      // CORRECT ANSWER
      // ============================================
      if (correctAnswer === 'correct') {
        console.log("✅ CORRECT ANSWER!");
        correctAnswers++;
        
        // ⚠️ Update gameSession score immediately!
        if (typeof gameSession !== 'undefined') {
          gameSession.currentScore = correctAnswers;
          console.log(`🎯 Updated gameSession.currentScore to: ${correctAnswers}`);
        }
        
        // Add green glow animation
        this.classList.add('correct-glow');
        
        // Fade out wrong answer
        images.forEach(img => {
          if (img !== this) {
            img.classList.add('wrong-fade');
          }
        });
        
      // ============================================
      // WRONG ANSWER
      // ============================================
      } else {
        console.log("❌ WRONG ANSWER!");
        
        // Add red shake animation
        this.classList.add('wrong-shake');
        
        // Show correct answer with green glow
        images.forEach(img => {
          let isCorrect = false;
          if (currentQuestion === 1 && img.alt.toLowerCase() === 'pagi') isCorrect = true;
          if (currentQuestion === 2 && img.alt.toLowerCase() === 'malam') isCorrect = true;
          
          if (isCorrect) {
            setTimeout(() => {
              img.classList.add('correct-glow');
            }, 600);
          }
        });
      }

      // Update score display
      updateScoreDisplay();

      console.log(`📈 Progress: ${totalAttempts}/${TOTAL_QUESTIONS} attempts`);
      console.log(`🎯 Score: ${correctAnswers}/${totalAttempts}`);
      
      // ============================================
      // Move to next question OR show modal
      // ============================================
      setTimeout(() => {
        if (currentQuestion < TOTAL_QUESTIONS) {
          // Move to next question
          console.log("➡️ Moving to next question...");
          currentQuestion++;
          setupQuestion();
        } else {
          // All questions answered - show final summary
          console.log("🏁 All questions completed - showing final summary...");
          showCompletionModal();
        }
      }, 2000);
    });
  });

  // ============================================
  // Initialize first question
  // ============================================
  setupQuestion();
  updateScoreDisplay();
  
  console.log("🚀 Game ready! Click an image to start.");
  console.log(`📋 Total questions: ${TOTAL_QUESTIONS}`);
});

console.log('✅ Temporal Concepts (pagi/malam) LAST GAME loaded!');
console.log('🔒 Game lock system active - First attempt only');
console.log('📊 Full marks summary with all games displayed');