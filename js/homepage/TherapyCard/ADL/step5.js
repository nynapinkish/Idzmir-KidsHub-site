document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Step 5 Game Loaded");

  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  let draggedItem = null;
  let currentGame = 1;

  // Game tracking
  let game1Score = 0;
  let game1Attempts = 0;
  let game1Placed = 0;

  let game2Score = 0;
  let game2Attempts = 0;
  let game2Placed = 0;

  // Overall tracking
  let overallScore = 0;
  let overallAttempts = 0;

  const allGamesData = [
    { gameName: "Bersih vs Kotor", points: 0, maxPoints: 4 },
    { gameName: "Pagi vs Malam", points: 0, maxPoints: 4 }
  ];

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      
      if (currentGame === 1) {
        scoreText.textContent = `${game1Score}/${game1Attempts}`;
        console.log("📊 Game 1 Score updated:", `${game1Score}/${game1Attempts}`);
      } else if (currentGame === 2) {
        scoreText.textContent = `${game2Score}/${game2Attempts}`;
        console.log("📊 Game 2 Score updated:", `${game2Score}/${game2Attempts}`);
      }
    }
  }

  // ✅ ATTACH DRAG EVENTS
  function attachDragEvents(gameId) {
    const gameSection = document.getElementById(gameId);
    const draggables = gameSection.querySelectorAll('.draggable1, .draggable2');
    const dropBoxes = gameSection.querySelectorAll('.drop-box');

    draggables.forEach(item => {
      item.addEventListener('dragstart', dragStart);
      item.addEventListener('dragend', dragEnd);
    });

    dropBoxes.forEach(box => {
      box.addEventListener('dragover', dragOver);
      box.addEventListener('dragenter', dragEnter);
      box.addEventListener('dragleave', dragLeave);
      box.addEventListener('drop', (e) => dropItem(e, gameId));
    });

    console.log(`✅ Drag events attached for ${gameId}`);
  }

  function dragStart(e) {
    if (this.classList.contains('used')) {
      e.preventDefault();
      return;
    }
    draggedItem = this;
    this.classList.add('dragging');
    setTimeout(() => (this.style.opacity = '0.3'), 0);
  }

  function dragEnd() {
    this.classList.remove('dragging');
    this.style.opacity = '1';
  }

  function dragOver(e) {
    e.preventDefault();
  }

  function dragEnter(e) {
    e.preventDefault();
    if (!this.classList.contains('filled')) {
      this.classList.add('hovered');
    }
  }

  function dragLeave() {
    this.classList.remove('hovered');
  }

  // ✅ DROP ITEM HANDLER
  function dropItem(e, gameId) {
    const dropBox = e.currentTarget;
    dropBox.classList.remove('hovered');

    if (dropBox.classList.contains('filled') || !draggedItem) {
      return;
    }

    const itemType = draggedItem.getAttribute('data-type');
    const zoneType = dropBox.getAttribute('data-zone');
    
    // Clone the image
    const imgElement = draggedItem.querySelector('img');
    if (imgElement) {
      const clonedImg = imgElement.cloneNode(true);
      clonedImg.style.width = '160px';
      clonedImg.style.height = '160px';
      clonedImg.style.objectFit = 'contain';
      dropBox.innerHTML = '';
      dropBox.appendChild(clonedImg);
    } else {
      const emoji = draggedItem.getAttribute('data-emoji');
      dropBox.innerHTML = `<span class="item-emoji">${emoji}</span>`;
    }
    
    dropBox.classList.add('filled');
    draggedItem.classList.add('used');
    draggedItem.setAttribute('draggable', 'false');

    // Check if correct
    const isCorrect = (itemType === zoneType);

    if (gameId === 'game1') {
      game1Attempts++;
      overallAttempts++;
      
      if (isCorrect) {
        dropBox.style.borderColor = '#00c853';
        dropBox.style.backgroundColor = '#e8f5e9';
        game1Score++;
        overallScore++;
        console.log("✅ CORRECT! Game1 Score:", game1Score);
      } else {
        dropBox.style.borderColor = '#f44336';
        dropBox.style.backgroundColor = '#ffebee';
        console.log("❌ WRONG! Game1 Score:", game1Score);
      }
      
      game1Placed++;
      allGamesData[0].points = game1Score;
      allGamesData[0].maxPoints = game1Attempts;
      
      // Update score display
      updateScoreDisplay();
      
      if (game1Placed === 4) {
        setTimeout(() => {
          showBatchScoreModal();
        }, 800);
      }
    } 
    else if (gameId === 'game2') {
      game2Attempts++;
      overallAttempts++;
      
      if (isCorrect) {
        dropBox.style.borderColor = '#00c853';
        dropBox.style.backgroundColor = '#e8f5e9';
        game2Score++;
        overallScore++;
        console.log("✅ CORRECT! Game2 Score:", game2Score);
      } else {
        dropBox.style.borderColor = '#f44336';
        dropBox.style.backgroundColor = '#ffebee';
        console.log("❌ WRONG! Game2 Score:", game2Score);
      }
      
      game2Placed++;
      allGamesData[1].points = game2Score;
      allGamesData[1].maxPoints = game2Attempts;
      
      // Update score display
      updateScoreDisplay();
      
      if (game2Placed === 4) {
        setTimeout(() => {
          showOverallScoreModal();
        }, 800);
      }
    }
  }

  // ✅ SHOW BATCH SCORE MODAL (After Game 1)
  function showBatchScoreModal() {
    console.log("🎉 Showing batch score modal for Game 1!");
    
    const batchScoreModal = document.getElementById('batchScoreModal');
    const batchScoreDisplay = document.getElementById('batchScoreDisplay');
    
    if (batchScoreModal && batchScoreDisplay) {
      batchScoreDisplay.textContent = `${game1Score}/${game1Attempts}`;
      console.log("✅ Game 1 Score:", `${game1Score}/${game1Attempts}`);
      
      // Update star colors
      const percentage = game1Attempts > 0 ? Math.round((game1Score / game1Attempts) * 100) : 0;
      updateBatchStarColors(percentage);
      
      batchScoreModal.style.display = 'flex';
      
      // Show next button
      showNextButton();
    }
  }

  // ✅ UPDATE BATCH STAR COLORS
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

  // ✅ SHOW NEXT BUTTON
  function showNextButton() {
    console.log("➡️ Showing next button...");
    
    const nextBtn = document.getElementById('nextBtn1');
    
    if (nextBtn) {
      nextBtn.style.display = 'block';
      nextBtn.style.opacity = '1';
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.style.cursor = 'pointer';
      nextBtn.style.zIndex = '10001';
      
      console.log("✅ Next button activated!");
    }
  }

  // ✅ NEXT BUTTON CLICK (Move to Game 2)
  const game1NextBtn = document.getElementById('nextBtn1');
  if (game1NextBtn) {
    game1NextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("➡️ Moving to Game 2...");
      
      // Hide batch modal
      const batchScoreModal = document.getElementById('batchScoreModal');
      if (batchScoreModal) {
        batchScoreModal.style.display = 'none';
      }
      
      // Hide next button
      game1NextBtn.style.display = 'none';
      
      // Switch games
      document.getElementById('game1').classList.remove('active');
      document.getElementById('game2').classList.add('active');
      currentGame = 2;
      
      // Reset score display for game 2
      game2Score = 0;
      game2Attempts = 0;
      updateScoreDisplay();
      
      // Attach events for game 2
      attachDragEvents('game2');
      
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ✅ SHOW OVERALL SCORE MODAL (After Game 2)
  function showOverallScoreModal() {
    console.log("🎉 Showing OVERALL score modal!");
    
    const overallScoreModal = document.getElementById('scoreModal');
    const gamesScoreList = document.getElementById('gamesScoreList');
    const totalScorePercentage = document.getElementById('totalScorePercentage');
    const continueBtn = document.getElementById('continueBtn');
    const finishBtn = document.getElementById('finishBtn');
    
    if (!overallScoreModal) {
      console.error("❌ Overall score modal not found!");
      return;
    }
    
    // Populate games list
    if (gamesScoreList) {
      gamesScoreList.innerHTML = '';
      console.log("📋 Populating games score list...");
      
      allGamesData.forEach((game, index) => {
        console.log(`Game ${index + 1}: ${game.gameName} - ${game.points}/${game.maxPoints}`);
        
        const row = document.createElement('div');
        row.className = 'game-score-row';
        row.innerHTML = `
          <div class="game-name">${game.gameName}</div>
          <div class="game-points">${game.points}/${game.maxPoints}</div>
        `;
        gamesScoreList.appendChild(row);
      });
      
      console.log("✅ Games list populated!");
    }
    
    // Calculate and display total percentage
    if (totalScorePercentage) {
      const percentage = overallAttempts > 0 ? Math.round((overallScore / overallAttempts) * 100) : 0;
      totalScorePercentage.textContent = `${percentage}%`;
      console.log("📊 Overall Score:", `${overallScore}/${overallAttempts} = ${percentage}%`);
      
      // Update star colors
      updateOverallStarColors(percentage);
    }
    
    // Show modal
    overallScoreModal.style.display = 'flex';
    
    // Setup continue button
    if (continueBtn) {
      continueBtn.style.opacity = '1';
      continueBtn.style.pointerEvents = 'auto';
      continueBtn.style.animation = 'bounceButton 1s ease-in-out infinite';
      
      continueBtn.addEventListener('click', () => {
        console.log("Continue button clicked!");
        window.location.href = 'step6.html';
      }, { once: true });
    }

    // Setup finish button
    if (finishBtn) {
      finishBtn.style.opacity = '1';
      finishBtn.style.pointerEvents = 'auto';
      
      finishBtn.addEventListener('click', () => {
        console.log("Finish button clicked!");
        window.location.href = '../../../homepage/homepage.html';
      }, { once: true });
    }
  }

  // ✅ UPDATE OVERALL STAR COLORS
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

  // ✅ INITIALIZE GAME 1
  console.log("🚀 Initializing Game 1...");
  updateScoreDisplay();
  attachDragEvents('game1');
});