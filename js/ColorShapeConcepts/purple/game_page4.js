const fruits = document.querySelectorAll('.fruit-selection img');
const backgroundArea = document.getElementById('backgroundArea');
const scoreModal = document.getElementById('scoreModal');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const scoreDisplay = document.getElementById('scoreDisplay'); // ✅ ADDED
const scoreText = document.getElementById('scoreText'); // ✅ ADDED
const nextButtonContainer = document.querySelector('.next-button-container');
const nextButton = document.querySelector('.next-button');

// Track score
let score = 0;
let totalAttempts = 0;
let fruitCount = 0;
const maxDrags = 2; // ✅ MAXIMUM 2 drags only! (sama dengan jumlah buah betul)

// ✅ SHOW score display at start
if (scoreDisplay) {
  scoreDisplay.style.display = 'flex';
  updateScoreDisplay();
  console.log('✅ Score display shown!');
}

// Hide next button initially
if (nextButtonContainer) {
  nextButtonContainer.style.display = 'none';
}

// ✅ UPDATE SCORE DISPLAY FUNCTION
function updateScoreDisplay() {
  if (scoreText) {
    scoreText.textContent = `${score}/${totalAttempts}`;
    console.log("📊 Score updated:", `${score}/${totalAttempts}`);
  }
}

fruits.forEach(fruit => {
  fruit.addEventListener('dragstart', e => {
    e.dataTransfer.setData('color', fruit.dataset.color);
    e.dataTransfer.setData('src', fruit.src);
    e.dataTransfer.setData('fruit', fruit.dataset.fruit);
  });
});

backgroundArea.addEventListener('dragover', e => e.preventDefault());

backgroundArea.addEventListener('drop', e => {
  e.preventDefault();

  // ✅ Check if already reached max drags
  if (totalAttempts >= maxDrags) {
    console.log('❌ Maximum drags reached!');
    return; // Stop accepting more drags
  }

  const color = e.dataTransfer.getData('color');
  const src = e.dataTransfer.getData('src');
  const fruitId = e.dataTransfer.getData('fruit');

  // Check if fruit already used
  const usedFruit = document.querySelector(`.fruit-selection img[data-fruit="${fruitId}"]`);
  if (usedFruit && usedFruit.classList.contains('fruit-used')) {
    return; // Don't count twice
  }

  totalAttempts++; // Count every drop attempt
  updateScoreDisplay(); // ✅ Update score display

  // ✅ Mark fruit as used IMMEDIATELY (can only drag once)
  if (usedFruit) {
    usedFruit.classList.add('fruit-used');
  }

  // Check if the dragged fruit is yellow (CORRECT)
  if (color === 'purple') {
    score++; // Increment score for correct answer
    updateScoreDisplay(); // ✅ Update score immediately
    
    const dropped = document.createElement('img');
    dropped.src = src;
    dropped.classList.add('dropped-fruit');

    // Spacing for fruits
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
    // WRONG ANSWER - shake animation
    if (usedFruit) {
      usedFruit.classList.add('shake-error');
      
      // Remove shake animation after it finishes
      setTimeout(() => {
        usedFruit.classList.remove('shake-error');
      }, 600);
    }
  }

  // ✅ Check if reached max drags (game over)
  if (totalAttempts >= maxDrags) {
    console.log('🎉 Game over! Max drags reached.');
    setTimeout(showFinalScore, 1500);
  }
});

// Show final score modal
function showFinalScore() {
  console.log('🎉 Showing final score:', `${score}/${totalAttempts}`);
  
  if (scoreModal && finalScoreDisplay) {
    // Update score display
    finalScoreDisplay.textContent = `${score}/${totalAttempts}`;
    
    // Show modal
    scoreModal.style.display = 'flex';
    
    // Show next button after 1 second
    setTimeout(() => {
      if (nextButtonContainer && nextButton) {
        nextButtonContainer.style.display = 'block';
        nextButtonContainer.style.opacity = '0';
        
        setTimeout(() => {
          nextButtonContainer.style.opacity = '1';
          nextButton.style.animation = 'slideInButton 0.5s ease forwards';
        }, 100);
      }
    }, 1000);
  }
}

console.log('🎮 Drag & Drop Game loaded with scoring!');