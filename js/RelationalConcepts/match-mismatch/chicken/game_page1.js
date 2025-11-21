document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Cat Matching Game loaded!");

  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  const clickableImages = document.querySelectorAll('.clickable-image');

  // Game state
  let score = 0;
  let totalAttempts = 2; // User boleh click 2 kali je
  let attemptsUsed = 0;
  let clickedImages = new Set(); // Track images yang dah diklik

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
  }

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreText) {
      scoreText.textContent = `${score}/${totalAttempts}`;
      console.log("📊 Score updated:", `${score}/${totalAttempts}`);
    }
  }

  // 🎯 CHECK ANSWER
  function checkAnswer(clickedImage) {
    // Prevent clicking same image twice
    if (clickedImages.has(clickedImage)) {
      console.log("⚠️ Image already clicked!");
      return;
    }

    // Check if max attempts reached
    if (attemptsUsed >= totalAttempts) {
      console.log("⚠️ Max attempts reached!");
      return;
    }

    clickedImages.add(clickedImage);
    attemptsUsed++;
    console.log(`🎯 Attempt ${attemptsUsed}/${totalAttempts}`);

    const answer = clickedImage.getAttribute('data-answer');

    if (answer === 'correct') {
      // ✅ CORRECT ANSWER
      score++;
      clickedImage.classList.add('correct-glow');
      console.log("✅ CORRECT! Score:", score);
      updateScoreDisplay();

      // Keep the correct image highlighted but allow other clicks
      clickedImage.style.pointerEvents = 'none';

    } else if (answer === 'wrong') {
      // ❌ WRONG ANSWER
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score remains:", score);
      
      // Remove shake animation after it completes
      setTimeout(() => {
        clickedImage.classList.remove('wrong-shake');
        // Fade out wrong image
        clickedImage.style.opacity = '0.5';
        clickedImage.style.pointerEvents = 'none';
      }, 800);
    }

    // Check if game should end
    if (attemptsUsed >= totalAttempts) {
      console.log("🎮 Game Over! Used all attempts");
      // Disable all remaining images
      clickableImages.forEach(img => {
        img.style.pointerEvents = 'none';
      });
      setTimeout(showFinalResult, 1500);
    }
  }

  // 🎉 SHOW FINAL RESULT
  function showFinalResult() {
    console.log("🎉 Showing final result!");
    
    if (scoreModal && finalScoreDisplay) {
      // Update final score
      finalScoreDisplay.textContent = `${score}/${totalAttempts}`;
      console.log("✅ Final Score:", `${score}/${totalAttempts}`);
      
      // Show modal
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
      
      console.log("🎨 Score modal displayed!");
      
      // Show next button after 1 second
      if (nextButton) {
        setTimeout(() => {
          nextButton.style.display = 'block';
          nextButton.style.opacity = '0';
          nextButton.style.pointerEvents = 'none';
          
          setTimeout(() => {
            nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
            nextButton.style.opacity = '1';
            nextButton.style.pointerEvents = 'auto';
            nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
            console.log("⬆️ Next button activated!");
          }, 100);
        }, 1000);
      }
    }
  }

  // Add click event to all clickable images
  clickableImages.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Game ready! You have 2 attempts!");
  console.log(`🎯 Click wisely - only ${totalAttempts} clicks allowed!`);
});