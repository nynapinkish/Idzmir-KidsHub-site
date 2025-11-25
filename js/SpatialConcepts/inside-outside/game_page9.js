document.addEventListener('DOMContentLoaded', async () => {
  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  let answered = false;

  // ==================== GET STUDENT DATA ====================
  const studentUsername = sessionStorage.getItem('userName');
  const studentId = sessionStorage.getItem('studentId');

  if (!studentUsername) {
    alert('Please login first!');
    window.location.href = '../../../index.html';
    return;
  }

  console.log('✅ Student:', studentUsername, 'ID:', studentId);

  // ==================== FETCH ALL GAMES FROM FIREBASE ====================
  async function fetchAllGameScores() {
    try {
      const db = firebase.firestore();
      
      // Find student document
      const studentQuery = await db.collection('students')
        .where('studentId', '==', studentId)
        .get();

      if (studentQuery.empty) {
        console.warn('Student not found in Firebase');
        return [];
      }

      const studentDoc = studentQuery.docs[0];
      const studentData = studentDoc.data();
      
      console.log('📊 Student Data:', studentData);
      
      // Get conceptProgress for Spatial Concepts
      const conceptProgress = studentData.conceptProgress || {};
      const spatialProgress = conceptProgress['Spatial Concepts'] || {};
      const gamesCompleted = spatialProgress.gamesCompleted || {};
      
      console.log('🎮 Games Completed:', gamesCompleted);
      
      // Map to game list with CORRECT Firebase keys (with underscores)
      const gamesList = [
        { key: 'dalam_/_atas_/_bawah', name: 'dalam / atas / bawah', maxScore: 3 },
        { key: 'atas_/_bawah', name: 'atas / bawah', maxScore: 2 },
        { key: 'belakang_/_depan', name: 'belakang / depan', maxScore: 2 },
        { key: 'antara_/_sekeliling', name: 'antara / sekeliling', maxScore: 2 },
        { key: 'melalui_/_melepasi', name: 'melalui / melepasi', maxScore: 2 },
        { key: 'naik_/_turun', name: 'naik / turun', maxScore: 2 },
        { key: 'dekat_/_jauh', name: 'dekat / jauh', maxScore: 2 },
        { key: 'atas_/_bawah_/_tengah', name: 'atas / bawah / tengah', maxScore: 3 },
        { key: 'dalam_/_luar', name: 'dalam / luar', maxScore: 2 }
      ];

      const allGames = gamesList.map(game => ({
        gameName: game.name,
        points: gamesCompleted[game.key] || 0,
        maxPoints: game.maxScore
      }));

      console.log('📋 All Games Fetched:', allGames);

      return allGames;

    } catch (error) {
      console.error('❌ Error fetching game scores:', error);
      return [];
    }
  }

  // ==================== CALCULATE TOTAL SCORE ====================
  async function calculateTotalScore(currentGameScore) {
    const allGameScores = await fetchAllGameScores();
    
    if (!allGameScores || allGameScores.length === 0) {
      console.warn('Could not retrieve game scores');
      return { totalPoints: 0, totalMaxPoints: 0, percentage: 0, allGames: [] };
    }

    // Update current game (dalam/luar) score
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

  // ==================== SAVE GAME SCORE TO FIREBASE ====================
  async function saveGameScore(points, maxPoints) {
    try {
      const db = firebase.firestore();
      
      // Find student document
      const studentQuery = await db.collection('students')
        .where('studentId', '==', studentId)
        .get();

      if (studentQuery.empty) {
        console.error('Student not found');
        return false;
      }

      const studentDoc = studentQuery.docs[0];
      const studentRef = studentDoc.ref;
      const studentData = studentDoc.data();

      // Get current conceptProgress
      let conceptProgress = studentData.conceptProgress || {};
      
      // Initialize Spatial Concepts if not exists
      if (!conceptProgress['Spatial Concepts']) {
        conceptProgress['Spatial Concepts'] = {
          totalScore: 0,
          maxPossibleScore: 19, // Total of all Spatial Concepts games
          gamesCompleted: {},
          lastPlayed: null
        };
      }

      // Update game score with CORRECT key format
      const gameKey = 'dalam_/_luar';
      const previousScore = conceptProgress['Spatial Concepts'].gamesCompleted[gameKey] || 0;
      
      // Only update if new score is better
      if (points > previousScore) {
        const scoreDiff = points - previousScore;
        conceptProgress['Spatial Concepts'].totalScore += scoreDiff;
        conceptProgress['Spatial Concepts'].gamesCompleted[gameKey] = points;
        
        console.log('✅ New best score saved:', points);
      } else {
        console.log('📊 Previous score was better:', previousScore);
      }

      conceptProgress['Spatial Concepts'].lastPlayed = firebase.firestore.FieldValue.serverTimestamp();

      // Calculate spider web data
      const spiderWebData = {};
      Object.keys(conceptProgress).forEach(conceptName => {
        const concept = conceptProgress[conceptName];
        spiderWebData[conceptName] = {
          score: concept.totalScore,
          maxScore: concept.maxPossibleScore,
          percentage: Math.round((concept.totalScore / concept.maxPossibleScore) * 100)
        };
      });

      // Calculate overall total score
      let overallTotalScore = 0;
      Object.values(conceptProgress).forEach(concept => {
        overallTotalScore += concept.totalScore;
      });

      // Update student document
      await studentRef.update({
        conceptProgress: conceptProgress,
        totalScore: overallTotalScore,
        spiderWebData: spiderWebData,
        lastGamePlayed: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('💾 Score saved to Firebase!');
      console.log('🕸️ Spider Web Data:', spiderWebData);
      return true;

    } catch (error) {
      console.error('❌ Error saving score:', error);
      return false;
    }
  }

  // ==================== DYNAMIC STAR COLORS ====================
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

  // ==================== GAME QUESTIONS ====================
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

  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  let totalQuestions = questions.length;

  // ==================== UPDATE SCORE DISPLAY ====================
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      document.getElementById('scoreText').textContent = `${correctAnswers}/${totalQuestions}`;
    }
  }

  // ==================== POPULATE GAMES LIST ====================
  function populateGamesList(allGames) {
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

  // ==================== SHOW FINAL SCORE MODAL ====================
  async function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    console.log('🎉 Showing final score modal...');

    if (!scoreModal) return;

    // Save THIS game's score to Firebase
    await saveGameScore(correctAnswers, totalQuestions);

    // Fetch ALL game scores and calculate total
    const totalScoreData = await calculateTotalScore(correctAnswers);
    
    console.log('📊 Total Score Data:', totalScoreData);

    // Populate games list
    populateGamesList(totalScoreData.allGames);
    
    // Update total percentage display
    totalScorePercentage.textContent = `${totalScoreData.percentage}%`;
    
    // Update star colors based on percentage
    updateStarColors(totalScoreData.percentage);
    
    // Show modal
    scoreModal.style.display = 'flex';
    scoreModal.style.animation = 'fadeIn 0.3s ease';
    
    // Setup Continue button
    if (continueBtn) {
      continueBtn.style.opacity = '0';
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

    // Setup Finish button
    if (finishBtn) {
      finishBtn.style.opacity = '0';
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

  // ==================== CHANGE QUESTION ====================
  function changeQuestion() {
    answered = false;
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= questions.length) {
      console.log('🎯 All questions completed!');
      setTimeout(() => {
        showScoringPopup();
      }, 1500);
      return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctImg;

    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach((option, index) => {
      const optionImg = option.querySelector('.card-image');
      if (optionImg) {
        optionImg.src = currentQuestion.options[index].img;
      }
      option.dataset.answer = currentQuestion.options[index].answer;
      
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
    });

    questionBox.classList.remove('reveal');
    answerImage.src = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
  }

  // ==================== INITIALIZE ====================
  updateScoreDisplay();

  // ==================== HANDLE OPTION CLICKS ====================
  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;

      const answer = this.getAttribute('data-answer');
      answered = true;
      
      if (answer === 'correct') {
        console.log('✅ CORRECT!');
        correctAnswers++;
        updateScoreDisplay();
        
        options.forEach(opt => opt.classList.remove('wrong-answer'));
        this.classList.add('correct-answer');
        
        const correctImg = this.querySelector('.card-image');
        if (correctImg && answerImage) {
          answerImage.src = correctImg.src;
        }
        
        this.classList.add('correct-move');
        
        setTimeout(() => {
          questionBox.classList.add('reveal');
        }, 800);
        
        setTimeout(() => {
          changeQuestion();
        }, 2000);
        
      } else {
        console.log('❌ WRONG!');
        this.classList.add('wrong-answer');
        
        setTimeout(() => {
          this.classList.remove('wrong-answer');
          changeQuestion();
        }, 1500);
      }
    });
  });

  console.log('🎮 Game initialized - Last game with Firebase integration!');
});