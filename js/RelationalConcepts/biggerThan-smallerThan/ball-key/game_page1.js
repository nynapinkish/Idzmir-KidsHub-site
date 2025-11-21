document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Bigger Than Game loaded!");

  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  const clickableImages = document.querySelectorAll('.clickable-image');

  // Game state
  let score = 0;
  let totalAttempts = 4; // User boleh click 4 kali je
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

  console.log("🚀 Game ready! You have 4 attempts!");
  console.log(`🎯 Click wisely - only ${totalAttempts} clicks allowed!`);
});

// 🎯 CHECK ANSWER (Called from onclick)
function selectOption(element, imageName, itemName) {
  // Get game state from DOM
  const scoreText = document.getElementById('scoreText');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const clickableImages = document.querySelectorAll('.clickable-image');
  
  // Parse current score from display
  let score = parseInt(scoreText.textContent.split('/')[0]);
  let attemptsUsed = 0;
  const totalAttempts = 4;
  
  // Count how many images already clicked
  clickableImages.forEach(img => {
    if (img.classList.contains('clicked')) {
      attemptsUsed++;
    }
  });

  // Prevent clicking same image twice
  if (element.classList.contains('clicked')) {
    console.log("⚠️ Image already clicked!");
    return;
  }

  // Check if max attempts reached
  if (attemptsUsed >= totalAttempts) {
    console.log("⚠️ Max attempts reached!");
    return;
  }

  // Mark as clicked
  element.classList.add('clicked');
  attemptsUsed++;
  console.log(`🎯 Attempt ${attemptsUsed}/${totalAttempts}`);

  const answer = element.getAttribute('data-answer');

  if (answer === 'correct') {
    // ✅ CORRECT ANSWER - GLOW HIJAU JE
    score++;
    element.classList.add('correct-glow');
    console.log("✅ CORRECT! Score:", score);
    updateScore(score, totalAttempts);

    // Disable this image
    element.style.pointerEvents = 'none';
    element.style.opacity = '1';

  } else if (answer === 'wrong') {
    // ❌ WRONG ANSWER - SHAKE MERAH JE, TAK MASUK QUESTION BOX
    element.classList.add('wrong-shake');
    console.log("❌ WRONG! Score remains:", score);
    
    // Remove shake animation after it completes and fade out
    setTimeout(() => {
      element.classList.remove('wrong-shake');
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
    }, 800);
  }

  // Check if game should end
  if (attemptsUsed >= totalAttempts) {
    console.log("🎮 Game Over! Used all attempts");
    // Disable all remaining images
    clickableImages.forEach(img => {
      img.style.pointerEvents = 'none';
    });
    // Show result FAST - 500ms after last click
    setTimeout(() => showFinalResult(score, totalAttempts), 500);
  }
}

// Update score display
function updateScore(score, total) {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${score}/${total}`;
    console.log("📊 Score updated:", `${score}/${total}`);
  }
}

// 🎉 SHOW FINAL RESULT
function showFinalResult(score, total) {
  console.log("🎉 Showing final result!");
  
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  
  if (scoreModal && finalScoreDisplay) {
    // Update final score
    finalScoreDisplay.textContent = `${score}/${total}`;
    console.log("✅ Final Score:", `${score}/${total}`);
    
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
    
    // Show next button IMMEDIATELY with modal (same time)
    if (nextButton) {
      nextButton.style.display = 'block';
      nextButton.style.opacity = '1';
      nextButton.style.pointerEvents = 'auto';
      nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
      nextButton.style.zIndex = '10001'; // Higher than modal
      console.log("⬆️ Next button activated!");
    }
  }
}