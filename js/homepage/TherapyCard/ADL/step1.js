document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Game Rutin Harian Loaded");

  const questionText = document.getElementById('questionText');
  const dropZone = document.getElementById('dropZone');
  const cards = document.querySelectorAll('.card');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');

  let score = 0;
  let attemptCount = 0;  // ✅ Guna attemptCount macam reference
  let answered = false;
  let draggedCard = null;

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }

  // Game batches
  const batches = [
    {
      questions: [
        { text: "Yang mana berus gigi?", correct: "gosok-gigi", cards: [
          { answer: "mandi", image: "bathboy.png" },
          { answer: "basuh-tangan", image: "washingHand.png" },
          { answer: "gosok-gigi", image: "brushingTeethBoy.png" }
        ]},
        { text: "Yang mana basuh tangan?", correct: "basuh-tangan", cards: [
          { answer: "basuh-tangan", image: "washingHand.png" },
          { answer: "mandi", image: "bathboy.png" },
          { answer: "gosok-gigi", image: "brushingTeethBoy.png" }
        ]},
        { text: "Yang mana mandi?", correct: "mandi", cards: [
          { answer: "gosok-gigi", image: "brushingTeethBoy.png" },
          { answer: "basuh-tangan", image: "washingHand.png" },
          { answer: "mandi", image: "bathboy.png" }
        ]}
      ]
    },
    {
      questions: [
        { text: "Yang mana makan?", correct: "makan", cards: [
          { answer: "makan", image: "eating.png" },
          { answer: "pakai-baju", image: "wearClothes.png" },
          { answer: "sikat-rambut", image: "combHair.png" }
        ]},
        { text: "Yang mana memakai baju?", correct: "pakai-baju", cards: [
          { answer: "pakai-baju", image: "wearClothes.png" },
          { answer: "makan", image: "eating.png" },
          { answer: "sikat-rambut", image: "combHair.png" }
        ]},
        { text: "Yang mana sikat rambut?", correct: "sikat-rambut", cards: [
          { answer: "makan", image: "eating.png" },
          { answer: "sikat-rambut", image: "combHair.png" },
          { answer: "pakai-baju", image: "wearClothes.png" }
        ]}
      ]
    },
    {
      questions: [
        { text: "Yang mana tidur?", correct: "tidur", cards: [
          { answer: "tidur", image: "sleepBoy.png" },
          { answer: "bersihkan-mainan", image: "cleanToys.png" },
          { answer: "guna-tandas", image: "toilet.png" }
        ]},
        { text: "Yang mana bersihkan mainan?", correct: "bersihkan-mainan", cards: [
          { answer: "guna-tandas", image: "toilet.png" },
          { answer: "tidur", image: "sleepBoy.png" },
          { answer: "bersihkan-mainan", image: "cleanToys.png" }
        ]},
        { text: "Yang mana guna tandas?", correct: "guna-tandas", cards: [
          { answer: "bersihkan-mainan", image: "cleanToys.png" },
          { answer: "tidur", image: "sleepBoy.png" },
          { answer: "guna-tandas", image: "toilet.png" }
        ]}
      ]
    }
  ];

  let batchIndex = 0;
  let questionIndex = 0;

  // ✅ UPDATE SCORE DISPLAY - Ikut reference
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Score updated:", `${score}/${attemptCount}`);
    }
  }

  function loadQuestion() {
    answered = false;
    const currentBatch = batches[batchIndex];
    const currentQuestion = currentBatch.questions[questionIndex];

    questionText.textContent = currentQuestion.text;
    dropZone.innerHTML = '<p class="drop-zone-placeholder">Masukkan di sini</p>';

    cards.forEach((card, i) => {
      const cardData = currentQuestion.cards[i];
      const img = card.querySelector('.card-image');

      card.dataset.answer = cardData.answer;
      img.src = "../../../../assets/images/" + cardData.image;
      img.alt = cardData.answer;

      card.classList.remove('correct');
      card.style.opacity = '1';
      card.draggable = true;
      card.style.cursor = 'grab';
    });

    updateScoreDisplay();
  }

  cards.forEach(card => {
    card.addEventListener('dragstart', () => {
      if (answered) return;
      draggedCard = card;
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
    });
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    if (!answered) dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    if (answered || !draggedCard) return;
    checkAnswer(draggedCard);
  });

  function checkAnswer(card) {
    answered = true;
    attemptCount++;  // ✅ Tambah attemptCount setiap kali jawab

    const currentQ = batches[batchIndex].questions[questionIndex];
    const droppedAnswer = card.dataset.answer;
    const correct = droppedAnswer === currentQ.correct;

    const imgClone = card.querySelector('.card-image').cloneNode(true);
    dropZone.innerHTML = '';
    dropZone.appendChild(imgClone);

    if (correct) {
      score++;  // ✅ Tambah score bila betul sahaja
      dropZone.classList.add('correct-animation');
      card.classList.add('correct');

      console.log("✅ CORRECT! Score:", score);
      
      setTimeout(() => {
        dropZone.classList.remove('correct-animation');
        nextQuestion();
      }, 800);
    } else {
      dropZone.classList.add('wrong-animation');
      
      console.log("❌ WRONG! Score:", score);
      
      setTimeout(() => {
        dropZone.classList.remove('wrong-animation');
        nextQuestion();
      }, 800);
    }

    cards.forEach(c => {
      c.draggable = false;
      c.style.cursor = 'not-allowed';
    });

    updateScoreDisplay();  // ✅ Update display selepas jawab
  }

  function nextQuestion() {
    questionIndex++;

    if (questionIndex >= batches[batchIndex].questions.length) {
      batchIndex++;
      questionIndex = 0;
    }

    if (batchIndex >= batches.length) {
      setTimeout(showFinalResult, 500);
      return;
    }

    setTimeout(loadQuestion, 300);
  }

  // ✅ Show Final Result - Ikut reference dengan BUKIT modal
  function showFinalResult() {
    console.log("🎉 Showing final result!");
    
    if (scoreModal && finalScoreDisplay) {
      // Update final score
      finalScoreDisplay.textContent = `${score}/${attemptCount}`;
      console.log("✅ Final Score:", `${score}/${attemptCount}`);
      
      // Show modal dengan style yang betul
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
      
      // Show and animate next button after 1 second
      if (nextButtonContainer && nextButton) {
        nextButtonContainer.style.zIndex = '10001';
        nextButtonContainer.style.position = 'fixed';
        
        nextButton.style.opacity = '0';
        nextButton.style.display = 'block';
        nextButton.style.pointerEvents = 'none';
        
        setTimeout(() => {
          nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
          nextButton.style.opacity = '1';
          nextButton.style.pointerEvents = 'auto';
          nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
          console.log("⬆️ Next button activated!");
        }, 1000);
      }
    }
  }

  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  loadQuestion();
});