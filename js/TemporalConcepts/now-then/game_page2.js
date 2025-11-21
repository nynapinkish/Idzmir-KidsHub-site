document.addEventListener('DOMContentLoaded', () => {
  // ✅ Get all elements from HTML
  const images = document.querySelectorAll('.image-item');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const nextButton = document.querySelector('.next-button');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const bannerBlue = document.querySelector('.banner-blue');
  const answerText = document.querySelector('.answer-text');
  
  // Game state
  let currentQuestion = 1; // Start with question 1 (Sekarang)
  let answered = false;
  let correctAnswers = 0;
  let totalAttempts = 0;
  const totalQuestions = 2; // ✅ 2 soalan dalam 1 page

  console.log("🎮 Game initialized!");
  console.log("📸 Images found:", images.length);
  console.log("📊 Score modal:", scoreModal);
  console.log("⏭️ Next button:", nextButton);
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
      // Question 1: Mana Sekarang?
      bannerBlue.textContent = 'Mana sekarang?';
      answerText.textContent = 'sekarang';
      console.log("❓ Question 1: Mana sekarang?");
    } else if (currentQuestion === 2) {
      // Question 2: Mana Kemudian?
      bannerBlue.textContent = 'Mana kemudian?';
      answerText.textContent = 'kemudian';
      console.log("❓ Question 2: Mana kemudian?");
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
  // Function: Show completion modal
  // ============================================
  function showCompletionModal() {
    console.log("🎉 Showing completion modal!");
    
    if (!scoreModal || !finalScoreDisplay) {
      console.error("❌ Modal elements not found!");
      return;
    }

    // Update final score in modal
    finalScoreDisplay.textContent = `${correctAnswers}/${totalAttempts}`;
    console.log("🏆 Final score:", finalScoreDisplay.textContent);
    
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

    // Animate next button selepas 1 saat
    if (nextButton && nextButtonContainer) {
      nextButtonContainer.style.zIndex = '10001'; // Above modal
      nextButton.style.opacity = '0';
      nextButton.style.display = 'block';
      nextButton.style.pointerEvents = 'none';
      
      setTimeout(() => {
        nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
        nextButton.style.opacity = '1';
        nextButton.style.pointerEvents = 'auto';
        nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
        console.log("➡️ Next button revealed and animating!");
      }, 1000);
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
        // Question 1: Mana Sekarang? → Correct = "Sekarang" alt
        correctAnswer = clickedAlt === 'sekarang' ? 'correct' : 'wrong';
        console.log(`❓ Q1: Is "${clickedAlt}" === "sekarang"? → ${correctAnswer}`);
      } else {
        // Question 2: Mana Kemudian? → Correct = "Kemudian" alt
        correctAnswer = clickedAlt === 'kemudian' ? 'correct' : 'wrong';
        console.log(`❓ Q2: Is "${clickedAlt}" === "kemudian"? → ${correctAnswer}`);
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
          if (currentQuestion === 1 && img.alt.toLowerCase() === 'sekarang') isCorrect = true;
          if (currentQuestion === 2 && img.alt.toLowerCase() === 'kemudian') isCorrect = true;
          
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
          // All questions answered - show modal
          console.log("⏱️ All questions answered - showing modal...");
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