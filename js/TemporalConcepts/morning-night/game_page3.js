document.addEventListener('DOMContentLoaded', () => {
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
  
  // Game state
  let currentQuestion = 1; // Start with question 1 (Pagi)
  let answered = false;
  let correctAnswers = 0;
  let totalAttempts = 0;
  const totalQuestions = 2; // ✅ 2 soalan dalam 1 page

  console.log("🎮 Game initialized!");
  console.log("📸 Images found:", images.length);
  console.log("📊 Score modal:", scoreModal);
  console.log("🎯 Current question:", currentQuestion);

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
  // Function: Load and calculate all game scores
  // ============================================
  function loadAllGameScores() {
    // Get scores from localStorage
    const page1Score = localStorage.getItem('page1_score') || '0/2';
    const page2Score = localStorage.getItem('page2_score') || '0/2';
    const page3Score = `${correctAnswers}/${totalAttempts}`;
    
    // Save page 3 score
    localStorage.setItem('page3_score', page3Score);
    
    // Calculate total
    const [p1Correct, p1Total] = page1Score.split('/').map(Number);
    const [p2Correct, p2Total] = page2Score.split('/').map(Number);
    const [p3Correct, p3Total] = page3Score.split('/').map(Number);
    
    const totalCorrect = p1Correct + p2Correct + p3Correct;
    const totalQuestions = p1Total + p2Total + p3Total;
    const percentage = Math.round((totalCorrect / totalQuestions) * 100);
    
    return {
      page1: page1Score,
      page2: page2Score,
      page3: page3Score,
      totalCorrect,
      totalQuestions,
      percentage
    };
  }

  // ============================================
  // Function: Show completion modal (Final Summary)
  // ============================================
  function showCompletionModal() {
    console.log("🎉 Showing completion modal!");
    
    if (!scoreModal) {
      console.error("❌ Modal elements not found!");
      return;
    }

    // Load all scores
    const scores = loadAllGameScores();
    console.log("📊 All scores:", scores);
    
    // Display individual game scores
    if (gamesScoreList) {
      gamesScoreList.innerHTML = `
        <div class="game-score-item">
          <span class="game-name">Sebelum / Selepas</span>
          <span class="game-score">${scores.page1}</span>
        </div>
        <div class="game-score-item">
          <span class="game-name">Sekarang / Kemudian</span>
          <span class="game-score">${scores.page2}</span>
        </div>
        <div class="game-score-item">
          <span class="game-name">Pagi / Malam</span>
          <span class="game-score">${scores.page3}</span>
        </div>
      `;
    }
    
    // Display total percentage
    if (totalScorePercentage) {
      totalScorePercentage.textContent = `${scores.percentage}%`;
    }
    
    // Show modal dengan full screen overlay
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
    
    console.log("✅ Modal displayed!");
  }

  // ============================================
  // Modal Button Handlers
  // ============================================
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      console.log("➡️ Continue to next section");
      // Navigate to next section (update URL as needed)
      window.location.href = '../../../../html/SpatialConcepts/top-bottom/game_page1.html';
    });
  }

  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      console.log("🏁 Finish and return to main");
      // Clear scores and return to main page
      localStorage.clear();
      window.location.href = '../../../../html/homepage/homepage.html';
    });
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
        // Question 1: Mana Pagi? → Correct = "Pagi" alt
        correctAnswer = clickedAlt === 'pagi' ? 'correct' : 'wrong';
        console.log(`❓ Q1: Is "${clickedAlt}" === "pagi"? → ${correctAnswer}`);
      } else {
        // Question 2: Mana Malam? → Correct = "Malam" alt
        correctAnswer = clickedAlt === 'malam' ? 'correct' : 'wrong';
        console.log(`❓ Q2: Is "${clickedAlt}" === "malam"? → ${correctAnswer}`);
      }
      
      console.log("📝 Answer type:", correctAnswer);
      
      // Mark as answered & increment attempt
      answered = true;
      totalAttempts++;

      // ============================================
      // CORRECT ANSWER
      // ============================================
      if (correctAnswer === 'correct') {
        console.log("✅ CORRECT ANSWER!");
        correctAnswers++;
        
        // Add green glow animation to correct image
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
        
        // Add red shake animation to wrong image
        this.classList.add('wrong-shake');
        
        // Show correct answer dengan green glow
        images.forEach(img => {
          let isCorrect = false;
          if (currentQuestion === 1 && img.alt.toLowerCase() === 'pagi') isCorrect = true;
          if (currentQuestion === 2 && img.alt.toLowerCase() === 'malam') isCorrect = true;
          
          if (isCorrect) {
            setTimeout(() => {
              img.classList.add('correct-glow');
            }, 600); // After shake animation ends
          }
        });
      }

      // Update score display di top right
      updateScoreDisplay();

      console.log(`📈 Progress: ${totalAttempts}/${totalQuestions} attempts`);
      console.log(`🎯 Score: ${correctAnswers}/${totalAttempts}`);
      
      // ============================================
      // Move to next question OR show modal
      // ============================================
      setTimeout(() => {
        if (currentQuestion < totalQuestions) {
          // Move to next question
          console.log("➡️ Moving to next question...");
          currentQuestion++;
          setupQuestion();
        } else {
          // All questions answered - show final summary modal
          console.log("⏱️ All questions answered - showing final summary...");
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
  console.log("📋 Total questions in this page:", totalQuestions);
});