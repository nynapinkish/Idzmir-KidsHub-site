document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Step 3 Game loaded!");

  const questions = [
    {
      question: "Kotor",
      correctAnswer: "kotor",
      cards: [
        { answer: "bersih", img: "../../../../assets/images/clean.png" },
        { answer: "kotor", img: "../../../../assets/images/dirty.png" }
      ]
    },
    {
      question: "Bersih",
      correctAnswer: "bersih",
      cards: [
        { answer: "bersih", img: "../../../../assets/images/clean2.png" },
        { answer: "kotor", img: "../../../../assets/images/dirty2.png" }
      ]
    },
    {
      question: "Aktiviti dalam",
      correctAnswer: "aktiviti dalam",
      cards: [
        { answer: "aktiviti luar", img: "../../../../assets/images/outdoor3.png" },
        { answer: "aktiviti dalam", img: "../../../../assets/images/indoor1.png" }
      ]
    },
    {
      question: "Aktiviti luar",
      correctAnswer: "aktiviti luar",
      cards: [
        { answer: "aktiviti luar", img: "../../../../assets/images/outdoor1.png" },
        { answer: "aktiviti dalam", img: "../../../../assets/images/indoor2.png" }
      ]
    },
    {
      question: "Basah",
      correctAnswer: "basah",
      cards: [
        { answer: "kering", img: "../../../../assets/images/dry3.png" },
        { answer: "basah", img: "../../../../assets/images/soap.png" }
      ]
    },
    {
      question: "Kering",
      correctAnswer: "kering",
      cards: [
        { answer: "kering", img: "../../../../assets/images/pillow.png" },
        { answer: "basah", img: "../../../../assets/images/syampoo.png" }
      ]
    },
    {
      question: "Peralatan dewasa",
      correctAnswer: "peralatan dewasa",
      cards: [
        { answer: "peralatan dewasa", img: "../../../../assets/images/grownTools1.png" },
        { answer: "peralatan kanak-kanak", img: "../../../../assets/images/childTools1.png" }
      ]
    },
    {
      question: "Peralatan Kanak-kanak",
      correctAnswer: "peralatan kanak-kanak",
      cards: [
        { answer: "peralatan kanak-kanak", img: "../../../../assets/images/childTools2.png" },
        { answer: "peralatan dewasa", img: "../../../../assets/images/grownTools2.png" }
      ]
    },
    {
      question: "berus gigi",
      correctAnswer: "berus gigi",
      cards: [
        { answer: "berus gigi", img: "../../../../assets/images/brushingTeethBoy.png" },
        { answer: "pengering rambut", img: "../../../../assets/images/hairdryer.png" }
      ]
    },
    {
      question: "basuh tangan",
      correctAnswer: "basuh tangan",
      cards: [
        { answer: "basuh tangan", img: "../../../../assets/images/washingHand.png" },
        { answer: "sabun", img: "../../../../assets/images/soap.png" }
      ]
    },
    {
      question: "Pagi",
      correctAnswer: "pagi",
      cards: [
        { answer: "pagi", img: "../../../../assets/images/morning1.png" },
        { answer: "malam", img: "../../../../assets/images/night1.png" }
      ]
    },
    {
      question: "Panas",
      correctAnswer: "panas",
      cards: [
        { answer: "sejuk", img: "../../../../assets/images/iceCube.png" },
        { answer: "panas", img: "../../../../assets/images/tea.png" }
      ]
    },  
    {
      question: "Sejuk",
      correctAnswer: "sejuk",
      cards: [
        { answer: "sejuk", img: "../../../../assets/images/aircond.png" },
        { answer: "panas", img: "../../../../assets/images/soup.png" }
      ]
    },
    {
      question: "Malam",
      correctAnswer: "malam",
      cards: [
        { answer: "malam", img: "../../../../assets/images/night2.png" },
        { answer: "pagi", img: "../../../../assets/images/morning2.png" }
      ]
    }
  ];

  let currentQuestionIndex = 0;
  let score = 0;
  let attemptCount = 0;  // ✅ Track total attempts
  let answered = false;

  const questionText = document.getElementById('questionText');
  const dropZone = document.getElementById('dropZone');
  const answerImage = document.getElementById('answerImage');
  const cardsContainer = document.getElementById('cardsContainer');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');

  // Show score display
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Score updated:", `${score}/${attemptCount}`);
    }
  }

  function loadQuestion() {
    answered = false;
    const currentQuestion = questions[currentQuestionIndex];
    
    questionText.textContent = currentQuestion.question;
    dropZone.classList.remove('reveal');
    answerImage.src = "";
    
    cardsContainer.innerHTML = '';
    currentQuestion.cards.forEach(card => {
      const cardDiv = document.createElement('div');
      cardDiv.className = 'card';
      cardDiv.dataset.answer = card.answer;
      cardDiv.innerHTML = `
        <div class="card-body">
          <img src="${card.img}" alt="${card.answer}" class="card-image">
        </div>
      `;
      cardDiv.addEventListener('click', handleCardClick);
      cardsContainer.appendChild(cardDiv);
    });
    
    updateScoreDisplay();
  }

  function handleCardClick(e) {
    if (answered) return;
    
    const clickedCard = e.currentTarget;
    const answer = clickedCard.dataset.answer;
    const currentQuestion = questions[currentQuestionIndex];
    const cardImg = clickedCard.querySelector('.card-image');
    
    attemptCount++;  // ✅ Increment attempt count setiap kali jawab
    
    document.querySelectorAll('.card').forEach(c => c.classList.add('disabled'));
    
    if (answer === currentQuestion.correctAnswer) {
      answered = true;
      score++;  // ✅ Only increment score bila betul
      clickedCard.classList.add('correct-answer');
      answerImage.src = cardImg.src;

      console.log("✅ CORRECT! Score:", score);

      setTimeout(() => {
        dropZone.classList.add('reveal');
      }, 400);

      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          loadQuestion();
        } else {
          showFinalResult();
        }
      }, 2000);

    } else {
      clickedCard.classList.add('wrong-answer');
      
      console.log("❌ WRONG! Score:", score);
      
      setTimeout(() => {
        clickedCard.classList.remove('wrong-answer');
        if (currentQuestionIndex < questions.length - 1) {
          currentQuestionIndex++;
          loadQuestion();
        } else {
          showFinalResult();
        }
      }, 1000);
    }

    updateScoreDisplay();  // ✅ Update score after each answer
  }

  // ✅ Show Final Result dengan BUKIT modal
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

  // Start game
  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  loadQuestion();
});