// ===============================================
// COLOR & SHAPE CONCEPTS - Oren (Orange Color)
// With Firebase Integration (First Attempt Only)
// FIXED: Proper score retrieval + Full Score List
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Color & Shape';
const GAME_NAME = 'oren';
const GAME_KEY = 'oren';
const TOTAL_QUESTIONS = 2; // maxDrags

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let score = 0;
let totalAttempts = 0;
let fruitCount = 0;
const maxDrags = 2; // Maximum 2 correct answers

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
    
    // Search in Color & Shape concept
    if (conceptProgress[CONCEPT_TYPE]) {
      const gamesCompleted = conceptProgress[CONCEPT_TYPE].gamesCompleted || {};
      
      console.log('   Games in Color & Shape:', Object.keys(gamesCompleted));
      
      // Check if game exists (allow score of 0)
      if (gamesCompleted[GAME_KEY] !== undefined && gamesCompleted[GAME_KEY] >= 0) {
        existingScore = gamesCompleted[GAME_KEY];
        gameAlreadyPlayed = true;
        console.log('🔒 Game FOUND!');
        console.log(`   Score: ${existingScore}/${TOTAL_QUESTIONS}`);
        return true;
      }
    }

    console.log('✅ Game not found - first time playing');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    return false;
  }
}

// ================= FETCH ALL COLOR & SHAPE GAMES =================
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
    
    console.log('🎮 Fetching all Color & Shape game scores...');
    
    // Get Color & Shape games
    let gamesCompleted = {};
    
    if (conceptProgress[CONCEPT_TYPE]) {
      gamesCompleted = conceptProgress[CONCEPT_TYPE].gamesCompleted || {};
    }
    
    console.log('🎮 Games Completed from Firebase:', gamesCompleted);
    
    // List ALL Color & Shape games
    const gamesList = [
      { key: 'kuning', name: 'Kuning', maxScore: 2 },
      { key: 'hijau', name: 'Hijau', maxScore: 2 },
      { key: 'merah', name: 'Merah', maxScore: 2 },
      { key: 'ungu', name: 'Ungu', maxScore: 2 },
      { key: 'oren', name: 'Oren', maxScore: 2 }
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
  console.log('🧮 Calculating total score...');
  console.log('   Current game score:', currentGameScore);
  
  const allGameScores = await fetchAllGameScores();
  
  if (!allGameScores || allGameScores.length === 0) {
    console.warn('⚠️ Could not retrieve game scores');
    return { totalPoints: 0, totalMaxPoints: 0, percentage: 0, allGames: [] };
  }

  // Update current game score (oren)
  const updatedGames = allGameScores.map(game => {
    if (game.gameName === 'Oren') {
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
  
  // 1️⃣ UPDATE SCORE BANNER (TOP RIGHT)
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
    console.log(`📊 Score banner: ${existingScore}/${TOTAL_QUESTIONS}`);
  }

  // 2️⃣ HIDE GAME ELEMENTS
  const fruitSelection = document.querySelector('.fruit-selection');
  const backgroundArea = document.getElementById('backgroundArea');
  
  if (fruitSelection) {
    fruitSelection.style.display = 'none';
    console.log('✅ Hidden: .fruit-selection');
  }
  if (backgroundArea) {
    backgroundArea.style.pointerEvents = 'none';
    console.log('✅ Disabled: #backgroundArea');
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
      console.log('➡️ Continue to next concept');
      window.location.href = '/html/homepage/relationalConcepts.html';
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

// ================= SHOW FINAL SCORE (After completing game) =================
async function showFinalScore() {
  console.log('🎉 Showing final score:', `${score}/${totalAttempts}`);
  
  const scoreModal = document.getElementById('scoreModal');
  if (!scoreModal) return;

  // ⚠️ CRITICAL: Force set gameSession.currentScore BEFORE saving!
  if (typeof gameSession !== 'undefined') {
    gameSession.currentScore = score;
    console.log(`🎯 FORCED gameSession.currentScore = ${score}`);
  }

  // ✅ CRITICAL: Save score to Firebase FIRST
  console.log('💾 Saving final score to Firebase...');
  console.log(`   Final score: ${score}/${totalAttempts}`);
  
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
  const totalScoreData = await calculateTotalScore(score);
  
  populateGamesList(totalScoreData.allGames);
  updateStarColors(totalScoreData.percentage);
  
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  if (totalScorePercentage) {
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    console.log(`📊 Total percentage displayed: ${totalScoreData.percentage}%`);
  }
  
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

// ================= UPDATE SCORE DISPLAY =================
function updateScoreDisplay() {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log("📊 Score updated:", `${score}/${totalAttempts}`);
  }
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Orange Color Game loading...");
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

  console.log("🔍 Checking if game already played...");
  const hasPlayed = await checkGameStatus();
  
  console.log("📊 Game Status Check Result:");
  console.log("   hasPlayed:", hasPlayed);
  console.log("   existingScore:", existingScore);
  
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

  console.log("✅ Game session initialized successfully");

  // Get elements
  const fruits = document.querySelectorAll('.fruit-selection img');
  const backgroundArea = document.getElementById('backgroundArea');
  const scoreModal = document.getElementById('scoreModal');
  const scoreDisplay = document.getElementById('scoreDisplay');

  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
    console.log('✅ Score display shown!');
  }

  // Drag start
  fruits.forEach(fruit => {
    fruit.addEventListener('dragstart', e => {
      e.dataTransfer.setData('color', fruit.dataset.color);
      e.dataTransfer.setData('src', fruit.src);
      e.dataTransfer.setData('fruit', fruit.dataset.fruit);
    });
  });

  backgroundArea.addEventListener('dragover', e => e.preventDefault());

  // Drop handler
  backgroundArea.addEventListener('drop', e => {
    e.preventDefault();

    if (totalAttempts >= maxDrags) {
      console.log('❌ Maximum drags reached!');
      return;
    }

    const color = e.dataTransfer.getData('color');
    const src = e.dataTransfer.getData('src');
    const fruitId = e.dataTransfer.getData('fruit');

    const usedFruit = document.querySelector(`.fruit-selection img[data-fruit="${fruitId}"]`);
    if (usedFruit && usedFruit.classList.contains('fruit-used')) {
      return;
    }

    totalAttempts++;
    updateScoreDisplay();

    if (usedFruit) {
      usedFruit.classList.add('fruit-used');
    }

    // Check if correct (orange)
    if (color === 'orange') {
      score++;
      updateScoreDisplay();
      
      const dropped = document.createElement('img');
      dropped.src = src;
      dropped.classList.add('dropped-fruit');

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
      // Wrong answer
      if (usedFruit) {
        usedFruit.classList.add('shake-error');
        
        setTimeout(() => {
          usedFruit.classList.remove('shake-error');
        }, 600);
      }
    }

    // Check if game over
    if (totalAttempts >= maxDrags) {
      console.log('🎉 Game over! Max drags reached.');
      setTimeout(showFinalScore, 1500);
    }
  });

  console.log('🎮 Drag & Drop Game loaded with scoring!');
});

console.log('✅ Orange Color Game loaded with Firebase integration!');
console.log('🔒 Game lock system active - First attempt only');
console.log('📊 Full score list displayed');