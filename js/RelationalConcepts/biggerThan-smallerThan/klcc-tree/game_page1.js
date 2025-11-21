// 🎮 KLCC Game - Lebih Tinggi (Fixed Version)
console.log("🎮 KLCC Game loaded!");

// Game state variables
let score = 0;
let totalAttempts = 4;
let attemptsUsed = 0;

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ DOM loaded - Game ready!");
  
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  
  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
    updateScoreDisplay();
    console.log("📊 Score display initialized");
  }
  
  console.log(`🎯 Game started! Total attempts: ${totalAttempts}`);
});

// 🔧 FIX: Jawapan betul HANYA highlight je, TAK masuk question box
function selectOption(element, imageName, itemName) {
  console.log(`🎯 Clicked: ${itemName} (${imageName})`);
  
  // Prevent clicking same image twice
  if (element.classList.contains('clicked')) {
    console.log("⚠️ Already clicked!");
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
  console.log(`📝 Attempt ${attemptsUsed}/${totalAttempts}`);

  const answer = element.getAttribute('data-answer');

  if (answer === 'correct') {
    // ✅ CORRECT ANSWER - HIGHLIGHT HIJAU JE, TAK MASUK QUESTION BOX
    score++;
    element.classList.add('correct-glow');
    console.log(`✅ CORRECT! Score: ${score}/${totalAttempts}`);
    
    // Update score display
    updateScoreDisplay();
    
    // Disable this image permanently
    setTimeout(() => {
      element.style.pointerEvents = 'none';
      element.style.opacity = '1';
    }, 800);
    
  } else if (answer === 'wrong') {
    // ❌ WRONG ANSWER - SHAKE MERAH JE
    element.classList.add('wrong-shake');
    console.log(`❌ WRONG! Score remains: ${score}/${totalAttempts}`);
    
    // Remove shake and fade out
    setTimeout(() => {
      element.classList.remove('wrong-shake');
      element.style.opacity = '0.5';
      element.style.pointerEvents = 'none';
    }, 800);
  }

  // Check if game should end
  if (attemptsUsed >= totalAttempts) {
    console.log("🏁 Game Over!");
    
    // Disable all remaining images
    const allImages = document.querySelectorAll('.clickable-image');
    allImages.forEach(img => {
      img.style.pointerEvents = 'none';
    });
    
    // Show result after short delay
    setTimeout(() => {
      showFinalResult();
    }, 1000);
  }
}

// Update score display
function updateScoreDisplay() {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log(`📊 Score updated: ${score}/${totalAttempts}`);
  }
}

// Show final result modal
function showFinalResult() {
  console.log("🎉 Showing final result!");
  
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButton = document.getElementById('nextButton');
  
  if (scoreModal && finalScoreDisplay) {
    // Update final score
    finalScoreDisplay.textContent = `${score}/${totalAttempts}`;
    console.log(`✅ Final Score: ${score}/${totalAttempts}`);
    
    // Show modal with animation
    scoreModal.style.display = 'flex';
    console.log("🎨 Score modal displayed!");
    
    // Show next button
    if (nextButton) {
      nextButton.style.display = 'block';
      nextButton.style.opacity = '1';
      nextButton.style.pointerEvents = 'auto';
      nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
      console.log("➡️ Next button activated!");
    }
  }
}

// Optional: Reset game function
function resetGame() {
  score = 0;
  attemptsUsed = 0;
  
  const allImages = document.querySelectorAll('.clickable-image');
  allImages.forEach(img => {
    img.classList.remove('clicked', 'correct-glow', 'wrong-shake');
    img.style.pointerEvents = 'auto';
    img.style.opacity = '1';
  });
  
  const scoreModal = document.getElementById('scoreModal');
  scoreModal.style.display = 'none';
  
  const nextButton = document.getElementById('nextButton');
  nextButton.style.display = 'none';
  
  updateScoreDisplay();
  console.log("🔄 Game reset!");
}