document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.option-card');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  const nextButtonContainer = document.querySelector('.next-button-container');
  
  let answered = false;
  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  const maxAttempts = 2; // ✅ Maximum attempts

  // ==================== QUESTIONS ====================
  const questions = [
    {
      label: "Baik",
      question: "Mana yang nampak baik?",
      correctImg: "../../../assets/images/friendly.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/mean.png" },
        { answer: "correct", img: "../../../assets/images/friendly.png" },
      ]
    },
    {
      label: "Jahat",
      question: "Mana yang nampak jahat?",
      correctImg: "../../../assets/images/mean.png",
      options: [
        { answer: "correct", img: "../../../assets/images/mean.png" },
        { answer: "wrong", img: "../../../assets/images/friendly.png" },
      ]
    }
  ];

  // ==================== UPDATE SCORE ====================
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreText = document.getElementById('scoreText');
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${maxAttempts}`;
    }
  }

  // ==================== SHOW SCORE MODAL ====================
  function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');

    if (scoreModal && finalScoreDisplay) {
      finalScoreDisplay.textContent = `${correctAnswers}/${maxAttempts}`;
      scoreModal.style.display = 'flex';
      scoreModal.style.position = 'fixed';
      scoreModal.style.top = '0';
      scoreModal.style.left = '0';
      scoreModal.style.width = '100%';
      scoreModal.style.height = '100%';
      scoreModal.style.zIndex = '10000';
      scoreModal.style.backgroundColor = 'rgba(0,0,0,0.8)';
      scoreModal.style.backdropFilter = 'blur(5px)';
      scoreModal.style.display = 'flex';
      scoreModal.style.alignItems = 'center';
      scoreModal.style.justifyContent = 'center';

      if (nextButtonContainer) {
        setTimeout(() => nextButtonContainer.classList.add('show'), 1000);
      }
    }
  }

  // ==================== LOAD QUESTION ====================
  function loadQuestion() {
    if (currentQuestionIndex >= maxAttempts) {
      showScoringPopup();
      return;
    }

    answered = false;
    const currentQuestion = questions[currentQuestionIndex];

    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctImg;

    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach((option, index) => {
      const optionImg = option.querySelector(".card-image");
      if (optionImg) optionImg.src = currentQuestion.options[index].img;

      option.dataset.answer = currentQuestion.options[index].answer;
      option.classList.remove('correct-answer','wrong-answer','correct-move');
    });

    // Attach click events
    optionCards.forEach(option => {
      option.onclick = () => {
        if (answered) return;
        answered = true;

        const answer = option.dataset.answer;

        if (answer === 'correct') {
          correctAnswers++;
          option.classList.add('correct-answer');
          if (answerImage) {
            answerImage.src = option.querySelector('.card-image').src;
            answerImage.style.display = 'block';
            questionIcon.style.display = 'none';
          }
        } else {
          option.classList.add('wrong-answer');
          setTimeout(() => option.classList.remove('wrong-answer'), 1000);
        }

        setTimeout(() => {
          currentQuestionIndex++;
          loadQuestion();
        }, 1500);
      };
    });

    questionBox.classList.remove('reveal');
    if (answerImage) { answerImage.style.display = 'none'; answerImage.src = ''; }
    if (questionIcon) { questionIcon.style.display = 'block'; }
  }

  // ==================== INIT ====================
  loadQuestion();
  updateScoreDisplay();
});
