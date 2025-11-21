// Initialize persistent score storage for ALL games
async function initializeGameScore() {
  try {
    const existing = await window.storage.get('socialEmoAllGames', true);
    if (!existing) {
      await window.storage.set('socialEmoAllGames', JSON.stringify({ 
        game1: { score: 0, total: 4, questionsAnswered: [] },
        game2: { score: 0, total: 2, questionsAnswered: [] },
        game3: { score: 0, total: 2, questionsAnswered: [] },
        game4: { score: 0, total: 3, questionsAnswered: [] }
      }), true);
    }
  } catch (error) {
    console.log('Storage not available, using session only');
  }
}

// Get all games score
async function getAllGamesScore() {
  try {
    const data = await window.storage.get('socialEmoAllGames', true);
    if (data) {
      return JSON.parse(data.value);
    }
  } catch (error) {
    console.log('Error getting score');
  }
  return {
    game1: { score: 0, total: 4, questionsAnswered: [] },
    game2: { score: 0, total: 2, questionsAnswered: [] },
    game3: { score: 0, total: 2, questionsAnswered: [] },
    game4: { score: 0, total: 3, questionsAnswered: [] }
  };
}

// Add score for Game 1
async function addGame1Score() {
  try {
    const allData = await getAllGamesScore();
    allData.game1.score += 1;
    await window.storage.set('socialEmoAllGames', JSON.stringify(allData), true);
    return allData.game1.score;
  } catch (error) {
    console.log('Error adding score');
    return 0;
  }
}

// Update score display with animation
async function updateScoreDisplay() {
  const allData = await getAllGamesScore();
  const scoreText = document.getElementById('scoreText');
  const scoreDisplay = document.querySelector('.score-display');
  
  if (scoreText) {
    scoreText.textContent = allData.game1.score;
  }
  
  // Add popup animation
  if (scoreDisplay) {
    scoreDisplay.classList.add('score-update');
    setTimeout(() => {
      scoreDisplay.classList.remove('score-update');
    }, 500);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize storage
  await initializeGameScore();

  // Add CSS animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes pulseButton {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg) scale(1); }
      50% { transform: rotate(180deg) scale(1.3); }
      100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-15px); }
    }
    
    @keyframes confettiRain {
      0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
    }
    
    @keyframes dropBounce {
      0% { transform: scale(0.3); opacity: 0; }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); opacity: 1; }
    }

    .completion-card {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      padding: 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 
        0 15px 40px rgba(0, 0, 0, 0.3),
        inset 0 2px 5px rgba(255, 255, 255, 0.3),
        0 0 0 5px #003E8D;
      animation: popIn 0.4s ease-out;
      position: relative;
      overflow: visible;
      width: 400px;
      height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .stars-container {
      position: absolute;
      top: -25px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 20px;
      z-index: 10;
    }

    .star {
      font-size: 35px;
      animation: spin 2s ease-in-out infinite;
      display: inline-block;
    }

    .star-1 { animation-delay: 0s; }
    .star-2 { animation-delay: 0.3s; }
    .star-3 { animation-delay: 0.6s; }

    .trophy {
      font-size: 50px;
      animation: bounce 1s ease-in-out infinite;
      margin-bottom: 10px;
      display: block;
    }

    .completion-title {
      font-family: 'Poppins', sans-serif;
      font-size: 28px;
      font-weight: 800;
      color: #003E8D;
      margin: 0 0 5px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    }

    .completion-subtitle {
      font-family: 'Poppins', sans-serif;
      font-size: 18px;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0 0 15px 0;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
    }

    .score-badge {
      background: #003E8D;
      padding: 12px 25px;
      border-radius: 15px;
      display: inline-block;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
      margin-top: 5px;
      border: 3px solid #FFFFFF;
    }

    .score-label {
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #FFD700;
      display: block;
      margin-bottom: 2px;
    }

    .score-value {
      font-family: 'Poppins', sans-serif;
      font-size: 32px;
      font-weight: 800;
      color: #FFFFFF;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
    }

    .confetti {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      overflow: hidden;
    }

    .confetti span {
      position: absolute;
      font-size: 25px;
      animation: confettiRain 3s linear infinite;
    }

    .confetti span:nth-child(1) { left: 10%; animation-delay: 0s; }
    .confetti span:nth-child(2) { left: 25%; animation-delay: 0.3s; }
    .confetti span:nth-child(3) { left: 40%; animation-delay: 0.6s; }
    .confetti span:nth-child(4) { left: 55%; animation-delay: 0.9s; }
    .confetti span:nth-child(5) { left: 70%; animation-delay: 1.2s; }
    .confetti span:nth-child(6) { left: 85%; animation-delay: 1.5s; }
    .confetti span:nth-child(7) { left: 15%; animation-delay: 1.8s; }
    .confetti span:nth-child(8) { left: 90%; animation-delay: 2.1s; }
  `;
  document.head.appendChild(style);

  // Initialize elements
  const fruits = document.querySelectorAll(".fruit-item");
  const dropZone = document.getElementById("dropZone");
  const scoreText = document.getElementById("scoreText");
  const modal = document.getElementById("completionModal");
  const finalScore = document.getElementById("finalScore");

  let score = 0;
  let maxFruits = 4;
  let droppedFruits = 0;
  let draggedElement = null;

  // Create container for dropped fruits
  const fruitContainer = document.createElement("div");
  fruitContainer.style.position = "absolute";
  fruitContainer.style.top = "42%";
  fruitContainer.style.left = "45%";
  fruitContainer.style.right = "auto";
  fruitContainer.style.transform = "translate(-50%, -50%)";
  fruitContainer.style.display = "grid";
  fruitContainer.style.gridTemplateColumns = "repeat(2, 110px)";
  fruitContainer.style.gridTemplateRows = "repeat(2, 110px)";
  fruitContainer.style.gap = "20px";
  fruitContainer.style.zIndex = "10";
  fruitContainer.style.pointerEvents = "none";
  dropZone.appendChild(fruitContainer);

  // Update score display
  await updateScoreDisplay();

  function updateScore() {
    scoreText.textContent = score;
  }

  // Drag events
  fruits.forEach(fruit => {
    fruit.addEventListener("dragstart", (e) => {
      if (fruit.classList.contains("used")) {
        e.preventDefault();
        return;
      }
      draggedElement = fruit;
      fruit.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });

    fruit.addEventListener("dragend", () => {
      if (draggedElement) {
        draggedElement.classList.remove("dragging");
      }
    });
  });

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", async (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-over");

    if (!draggedElement || draggedElement.classList.contains("used")) return;

    const fruitType = draggedElement.dataset.fruit;
    const isApple = fruitType.toLowerCase().includes("apple");

    if (!isApple) {
      draggedElement.classList.remove("dragging");
      return;
    }

    if (droppedFruits >= maxFruits) return;

    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "none";

    // Add fruit to tray
    const droppedImg = document.createElement("img");
    droppedImg.src = draggedElement.querySelector("img").src;
    droppedImg.style.width = "180px";
    droppedImg.style.height = "180px";
    droppedImg.style.objectFit = "contain";
    droppedImg.style.animation = "dropBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    fruitContainer.appendChild(droppedImg);

    // Mark as used
    draggedElement.classList.add("used");

    // Increment score and save to storage
    droppedFruits++;
    score++;
    updateScore();
    await addGame1Score();

    if (droppedFruits === maxFruits) {
      setTimeout(() => showCompletionModal(), 500);
    }
  });

  function showCompletionModal() {
    finalScore.textContent = score;
    modal.style.display = "flex";
    createFireworks();

    // Auto close modal and add pulse to next button after 3 seconds
    setTimeout(() => {
      modal.style.display = "none";
      addPulseToNextButton();
    }, 3000);
  }

  function createFireworks() {
    const colors = ['#FFD700', '#FF1493', '#00FF00', '#00BFFF', '#FF4500'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'firework';
        firework.style.left = Math.random() * window.innerWidth + 'px';
        firework.style.top = Math.random() * 300 + 'px';
        firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 2000);
      }, i * 100);
    }
  }

  window.restartGame = function() {
    score = 0;
    droppedFruits = 0;
    updateScore();
    fruitContainer.innerHTML = "";
    fruits.forEach(fruit => {
      fruit.classList.remove("used", "correct", "wrong");
      fruit.style.opacity = "1";
      fruit.style.pointerEvents = "auto";
    });
    const placeholder = dropZone.querySelector(".drop-placeholder");
    if (placeholder) placeholder.style.display = "block";
    modal.style.display = "none";

    // Remove pulse animation from next button
    const nextButtonContainer = document.querySelector(".next-button-container");
    if (nextButtonContainer) {
      nextButtonContainer.classList.remove('pulse');
    }
  };

  // Add pulse animation to Next button (lepas 3s modal tutup)
  function addPulseToNextButton() {
    const nextButtonContainer = document.querySelector(".next-button-container");
    if (nextButtonContainer) {
      nextButtonContainer.classList.add('pulse');
    }
  }
});