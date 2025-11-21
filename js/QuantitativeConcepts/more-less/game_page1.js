document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Game loaded!");

  const bannerBlue = document.querySelector('.banner-blue');
  const imageItems = document.querySelectorAll('.image-item');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');

  if (!bannerBlue || imageItems.length === 0) {
    console.error("❌ ERROR: Elements not found!");
    alert("ERROR: Page elements not loaded properly!");
    return;
  }

  if (scoreDisplay) scoreDisplay.style.display = 'block';

  let answered = false;
  let score = 0;
  let totalQuestions = 0;
  let attemptCount = 0;

  // 2 Soalan
  const questions = [
    { question: "Yang manakah banyak?", correctAnswer: "more.png" },
    { question: "Yang manakah kurang?", correctAnswer: "less.png" },
  ];

  let currentQuestionIndex = 0;

  // 🎯 MESSAGES BASED ON PERFORMANCE
  const messages = {
    perfect: [
      "SEMPURNA! Anda GENIUS! 🌟",
      "LUAR BIASA! Semua betul! Hebat sangat!",
      "AMAZING! 100% betul! Terbaik!",
      "FANTASTIC! Anda memang pandai!"
    ],
    good: [
      "BAGUS! Anda hebat! Teruskan! 😊",
      "TAHNIAH! Jauh lebih baik! Keep it up!",
      "SYABAS! Prestasi yang bagus!",
      "WELL DONE! Anda dah pandai!"
    ],
    okay: [
      "CUBA LAGI! Jangan give up! You can do it! 💪",
      "HAMPIR! Sila cuba lagi ya!",
      "KEEP TRYING! Practice makes perfect!",
      "JANGAN PUTUS ASA! Main lagi, pasti boleh!"
    ],
    tryAgain: [
      "CUBA LAGI! Jangan give up, main lagi ya! 🚀",
      "JANGAN GIVE UP! Practice sikit lagi!",
      "ALMOST! Cuba sekali lagi, pasti boleh!",
      "KEEP GOING! Anda boleh buat lebih baik!"
    ]
  };

  // ✅ UPDATE SCORE DISPLAY
  function updateScoreDisplay() {
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
      console.log("📊 Score updated:", `${score}/${attemptCount}`);
    }
  }

  // Function untuk load soalan
  function loadQuestion() {
    answered = false;
    const currentQuestion = questions[currentQuestionIndex];
    bannerBlue.textContent = currentQuestion.question;
    updateScoreDisplay();

    imageItems.forEach(img => {
      img.classList.remove('correct-glow', 'wrong-shake');
      img.style.pointerEvents = 'auto';
      img.style.opacity = '1';
    });
  }

  // Check jawapan
  function checkAnswer(clickedImage) {
    if (answered) return;
    answered = true;
    attemptCount++;
    totalQuestions = attemptCount;

    const currentQuestion = questions[currentQuestionIndex];
    const clickedFileName = clickedImage.src.split('/').pop();
    const isCorrect = clickedFileName === currentQuestion.correctAnswer;

    if (isCorrect) {
      score++;
      clickedImage.classList.add('correct-glow');
      imageItems.forEach(img => {
        img.style.pointerEvents = 'none';
        if (img !== clickedImage) img.style.opacity = '0.5';
      });
      console.log("✅ CORRECT! Score:", score);
      updateScoreDisplay();
      setTimeout(nextQuestion, 1500);
    } else {
      clickedImage.classList.add('wrong-shake');
      console.log("❌ WRONG! Score:", score);
      updateScoreDisplay();
      imageItems.forEach(img => {
        const fileName = img.src.split('/').pop();
        if (fileName === currentQuestion.correctAnswer) {
          setTimeout(() => img.classList.add('correct-glow'), 600);
        }
        img.style.pointerEvents = 'none';
      });
      setTimeout(nextQuestion, 2000);
    }
  }

  // Next question
  function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
      showFinalResult();
    } else {
      loadQuestion();
    }
  }

  // 🎉 Show result akhir dengan SCORE MODAL design
  function showFinalResult() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    
    console.log("🎉 Showing final result!");
    
    if (scoreModal && finalScoreDisplay) {
      // Update score display
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

  function getRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // Add click event
  imageItems.forEach(img => {
    img.addEventListener('click', function() {
      checkAnswer(this);
    });
  });

  console.log("🚀 Starting game...");
  console.log("📊 Initialize score display...");
  updateScoreDisplay();
  loadQuestion();
});