document.addEventListener('DOMContentLoaded', () => {
  console.log("🦷 Step 4 Game Loaded");

  const cardsContainer = document.getElementById('cardsContainer');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const batchScoreModal = document.getElementById('batchScoreModal');
  const batchScoreDisplay = document.getElementById('batchScoreDisplay');
  const overallScoreModal = document.getElementById('scoreModal');
  const nextButtonContainer = document.getElementById('nextButtonContainer');
  const nextButton = document.getElementById('nextButton');
  const activityTitle = document.getElementById('activityTitle');

  let score = 0;
  let attemptCount = 0;
  let overallScore = 0;
  let overallAttempts = 0;
  let draggedCard = null;
  let placedCards = 0;
  let currentBatch = 0;

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }

  // ALL BATCHES DATA
  const batches = [
    {
      title: "Memberus Gigi",
      steps: [
        { step: 1, image: "../../../../assets/images/toothbrush.png", answer: "pick-toothbrush", label: "Ambil berus gigi" },
        { step: 2, image: "../../../../assets/images/toothpaste.png", answer: "put-toothpaste", label: "Sapukan ubat gigi" },
        { step: 3, image: "../../../../assets/images/brushteeth.png", answer: "brush-teeth", label: "Berus gigi" },
        { step: 4, image: "../../../../assets/images/rinsemouth.png", answer: "rinse-mouth", label: "Bilas mulut" }
      ]
    },
    {
      title: "Membasuh Tangan",
      steps: [
        { step: 1, image: "../../../../assets/images/turnontap.png", answer: "turn-tap", label: "Buka paip" },
        { step: 2, image: "../../../../assets/images/applysoap.png", answer: "apply-soap", label: "Sapukan sabun" },
        { step: 3, image: "../../../../assets/images/rubhands.png", answer: "rub-hands", label: "Gosok tangan" },
        { step: 4, image: "../../../../assets/images/rinsedry.png", answer: "rinse-dry", label: "Bilas & keringkan" }
      ]
    },
    {
      title: "Buang Sampah",
      steps: [
        { step: 1, image: "../../../../assets/images/pickuprubbish.png", answer: "pick-rubbish", label: "Ambil sampah" },
        { step: 2, image: "../../../../assets/images/putrubbish.png", answer: "put-bin", label: "Masukkan ke tong" },
        { step: 3, image: "../../../../assets/images/washhands.png", answer: "wash-hands", label: "Basuh tangan" }
      ]
    }
  ];

  // Game data tracking
  const allGamesData = [
    { gameName: "Memberus Gigi", points: 0, maxPoints: 4 },
    { gameName: "Membasuh Tangan", points: 0, maxPoints: 4 },
    { gameName: "Buang Sampah", points: 0, maxPoints: 3 }
  ];

  // Shuffle cards
  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Batch Score updated:", `${score}/${attemptCount}`);
    }
  }

  function initGame() {
    const batch = batches[currentBatch];
    const shuffledSteps = shuffleArray(batch.steps);
    const totalSteps = batch.steps.length;
    
    // Update titles
    activityTitle.textContent = batch.title;
    
    // Clear and rebuild drop zones row
    const dropZonesRow = document.querySelector('.drop-zones-row');
    dropZonesRow.innerHTML = '';
    
    // Create drop zones based on batch steps
    for (let i = 0; i < totalSteps; i++) {
      const stepNum = i + 1;
      
      const zone = document.createElement('div');
      zone.className = 'drop-zone';
      zone.dataset.step = stepNum;
      zone.innerHTML = `
        <span class="step-number">${stepNum}</span>
        <p class="drop-zone-placeholder">Drop here</p>
      `;
      
      zone.addEventListener('dragover', handleDragOver);
      zone.addEventListener('dragleave', handleDragLeave);
      zone.addEventListener('drop', handleDrop);
      
      dropZonesRow.appendChild(zone);
      
      if (i < totalSteps - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        dropZonesRow.appendChild(arrow);
      }
    }
    
    // Reset cards
    cardsContainer.innerHTML = '';
    shuffledSteps.forEach(step => {
      const card = document.createElement('div');
      card.className = 'card';
      card.draggable = true;
      card.dataset.answer = step.answer;
      card.dataset.step = step.step;
      
      card.innerHTML = `
        <div class="card-circle">
          <img src="${step.image}" alt="${step.label}" class="card-image" onerror="this.style.display='none'">
          <div class="card-text-inside">${step.label}</div>
        </div>
      `;
      
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragend', handleDragEnd);
      
      cardsContainer.appendChild(card);
    });

    // Reset batch counters (NOT overall)
    score = 0;
    attemptCount = 0;
    placedCards = 0;
    updateScoreDisplay();
  }

  function handleDragStart(e) {
    draggedCard = e.currentTarget;
    e.currentTarget.classList.add('dragging');
  }

  function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!e.currentTarget.classList.contains('filled')) {
      e.currentTarget.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    const zone = e.currentTarget;
    zone.classList.remove('drag-over');
    
    if (!draggedCard || zone.classList.contains('filled')) return;
    
    attemptCount++;
    overallAttempts++;
    
    const batch = batches[currentBatch];
    const stepNumber = parseInt(zone.dataset.step);
    const cardAnswer = draggedCard.dataset.answer;
    const correctAnswer = batch.steps[stepNumber - 1].answer;
    
    const img = draggedCard.querySelector('.card-image');
    const imgClone = img ? img.cloneNode(true) : null;
    const textClone = draggedCard.querySelector('.card-text-inside').cloneNode(true);
    
    zone.innerHTML = `<span class="step-number">${stepNumber}</span>`;
    if (imgClone) zone.appendChild(imgClone);
    zone.appendChild(textClone);
    zone.classList.add('filled');
    
    if (cardAnswer === correctAnswer) {
      zone.classList.add('correct', 'correct-animation');
      score++;
      overallScore++;
      console.log("✅ CORRECT! Batch Score:", score, "Overall:", overallScore);
    } else {
      zone.classList.add('wrong', 'wrong-animation');
      console.log("❌ WRONG! Batch Score:", score, "Overall:", overallScore);
    }
    
    setTimeout(() => {
      zone.classList.remove('correct-animation', 'wrong-animation');
    }, 600);
    
    draggedCard.classList.add('used');
    draggedCard.draggable = false;
    
    placedCards++;
    
    // Update game data
    allGamesData[currentBatch].points = score;
    allGamesData[currentBatch].maxPoints = attemptCount;
    
    updateScoreDisplay();
    
    const totalCardsInBatch = batch.steps.length;
    
    if (placedCards === totalCardsInBatch) {
      setTimeout(() => {
        // Batch 0 & 1: Show batch score modal + next button
        if (currentBatch < batches.length - 1) {
          showBatchScoreModal();
        } 
        // Last batch: Show overall score modal
        else {
          showOverallScoreModal();
        }
      }, 800);
    }
  }

  // ✅ Show Batch Score Modal (for Batch 1 & 2)
  function showBatchScoreModal() {
    console.log("🎉 Showing batch score modal!");
    console.log("Current batch:", currentBatch);
    
    if (batchScoreModal && batchScoreDisplay) {
      // Update batch score
      batchScoreDisplay.textContent = `${score}/${attemptCount}`;
      console.log("✅ Batch Score:", `${score}/${attemptCount}`);
      
      // Update star colors based on batch performance
      const batchPercentage = attemptCount > 0 ? Math.round((score / attemptCount) * 100) : 0;
      updateBatchStarColors(batchPercentage);
      
      // Show batch modal
      batchScoreModal.style.display = 'flex';
      console.log("✅ Batch modal displayed");
      
      // Show next button immediately (no delay)
      showNextButton();
    }
  }

  // ✅ Update star colors for batch modal
  function updateBatchStarColors(percentage) {
    const batchModal = document.getElementById('batchScoreModal');
    const stars = batchModal.querySelectorAll('.star-image');
    
    console.log("Updating batch star colors - Percentage:", percentage + "%");
    
    let filterStyle;
    
    if (percentage >= 80) {
      filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
      console.log("⭐ GOLD STARS - Excellent!");
    } else if (percentage >= 50) {
      filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
      console.log("🟠 ORANGE STARS - Good!");
    } else {
      filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
      console.log("🔴 RED STARS - Keep practicing!");
    }

    stars.forEach(star => {
      star.style.filter = filterStyle;
      star.style.transition = 'filter 0.5s ease-in-out';
    });
  }

  // ✅ Show Next Button - FIXED VERSION
  function showNextButton() {
    console.log("➡️ Attempting to show next button...");
    console.log("nextButtonContainer exists?", !!nextButtonContainer);
    
    if (!nextButtonContainer) {
      console.error("❌ nextButtonContainer not found!");
      return;
    }
    
    // Reset all styles first
    nextButtonContainer.style.display = 'block';
    nextButtonContainer.style.opacity = '1';
    nextButtonContainer.style.pointerEvents = 'auto';
    nextButtonContainer.style.transition = 'opacity 0.3s ease-in-out';
    
    console.log("✅ Next button should now be visible!");
    console.log("Display:", nextButtonContainer.style.display);
    console.log("Opacity:", nextButtonContainer.style.opacity);
    console.log("Pointer events:", nextButtonContainer.style.pointerEvents);
  }

  // ✅ Next Button Click Handler
  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("➡️ Next button clicked!");
      
      // Hide batch modal and next button
      if (batchScoreModal) {
        batchScoreModal.style.display = 'none';
      }
      if (nextButtonContainer) {
        nextButtonContainer.style.display = 'none';
        nextButtonContainer.style.opacity = '0';
      }
      
      currentBatch++;
      console.log("Moving to batch:", currentBatch);
      
      // If reached end, show OVERALL SCORE modal
      if (currentBatch >= batches.length) {
        console.log("All batches complete! Showing overall score...");
        showOverallScoreModal();
        return;
      }
      
      // Load next batch
      console.log("Loading next batch...");
      initGame();
    });
  } else {
    console.error("❌ Next button element not found!");
  }

  // ✅ Show OVERALL SCORE Modal (with games list)
  function showOverallScoreModal() {
    console.log("🎉 Showing OVERALL score modal!");
    
    const gamesScoreList = document.getElementById('gamesScoreList');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    if (!overallScoreModal) return;
    
    // Populate games list
    if (gamesScoreList) {
      gamesScoreList.innerHTML = '';
      allGamesData.forEach(game => {
        const row = document.createElement('div');
        row.className = 'game-score-row';
        row.innerHTML = `
          <div class="game-name">${game.gameName}</div>
          <div class="game-points">${game.points}/${game.maxPoints}</div>
        `;
        gamesScoreList.appendChild(row);
      });
    }
    
    // Calculate and display total percentage
    if (totalScorePercentage) {
      const percentage = overallAttempts > 0 ? Math.round((overallScore / overallAttempts) * 100) : 0;
      totalScorePercentage.textContent = `${percentage}%`;
      console.log("📊 Overall Score:", `${overallScore}/${overallAttempts} = ${percentage}%`);
      
      // Update star colors based on percentage
      updateOverallStarColors(percentage);
    }
    
    // Show modal
    overallScoreModal.style.display = 'flex';
    
    // Setup continue button with bounce animation
    if (continueBtn) {
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
      continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
      
      continueBtn.addEventListener('click', () => {
        console.log("Continue button clicked!");
        // Navigate to next category
        window.location.href = 'step5.html';
      }, { once: true });
    }

    // Setup finish button
    if (finishBtn) {
      finishBtn.style.opacity = '1';
      finishBtn.style.pointerEvents = 'auto';
      
      finishBtn.addEventListener('click', () => {
        console.log("Finish button clicked!");
        // Navigate to homepage
        window.location.href = '../../../homepage/homepage.html';
      }, { once: true });
    }
  }

  // ✅ Update star colors for overall modal
  function updateOverallStarColors(percentage) {
    const overallModal = document.getElementById('scoreModal');
    const stars = overallModal.querySelectorAll('.star-image');
    
    console.log("Updating overall star colors - Percentage:", percentage + "%");
    
    let filterStyle;
    
    if (percentage >= 80) {
      filterStyle = 'brightness(1.2) saturate(1.3) hue-rotate(0deg)';
      console.log("⭐ GOLD STARS - Excellent!");
    } else if (percentage >= 50) {
      filterStyle = 'brightness(0.7) saturate(1.2) hue-rotate(15deg)';
      console.log("🟠 ORANGE STARS - Good!");
    } else {
      filterStyle = 'brightness(0.4) saturate(1.3) hue-rotate(-25deg)';
      console.log("🔴 RED STARS - Keep practicing!");
    }

    stars.forEach(star => {
      star.style.filter = filterStyle;
      star.style.transition = 'filter 0.5s ease-in-out';
    });
  }

  // Start game
  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  initGame();
});