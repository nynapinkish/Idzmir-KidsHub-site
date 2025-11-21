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
      label: "bersama-sama",
      question: "Mana yang nampak bersama-sama?",
      correctImg: "../../../assets/images/together.png",
      options: [
        { answer: "correct", img: "../../../assets/images/together.png" },
        { answer: "wrong", img: "../../../assets/images/alone.png" },
      ]
    },
    {
      label: "sendiri",
      question: "Mana yang nampak sendiri?",
      correctImg: "../../../assets/images/alone.png",
      options: [
        { answer: "correct", img: "../../../assets/images/alone.png" },
        { answer: "wrong", img: "../../../assets/images/together.png" },
      ]
    }
  ];

  const totalQuestions = maxAttempts;

  // ==================== UPDATE SCORE ====================
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreText = document.getElementById('scoreText');
    
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${totalQuestions}`;
    }
  }

  // ==================== SHOW SCORE MODAL ====================
  function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    
    if (scoreModal && finalScoreDisplay) {
      finalScoreDisplay.textContent = `${correctAnswers}/${totalQuestions}`;
      scoreModal.style.display = 'flex';
      scoreModal.style.position = 'fixed';
      scoreModal.style.top = '0';
      scoreModal.style.left = '0';
      scoreModal.style.width = '100%';
      scoreModal.style.height = '100%';
      scoreModal.style.zIndex = '10000';
      scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      scoreModal.style.backdropFilter = 'blur(5px)';
      scoreModal.style.alignItems = 'center';
      scoreModal.style.justifyContent = 'center';

      if (nextButtonContainer) {
        setTimeout(() => {
          nextButtonContainer.classList.add('show');
        }, 1000);
      }
    }
  }

  // ==================== LOAD QUESTION ====================
  function loadQuestion() {
    if(currentQuestionIndex >= maxAttempts){
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
      if (optionImg) {
        optionImg.src = currentQuestion.options[index].img;
      }
      option.dataset.answer = currentQuestion.options[index].answer;
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');

      // Remove previous click handlers
      option.replaceWith(option.cloneNode(true));
    });

    // Re-select cloned options and attach click
    const newOptionCards = document.querySelectorAll(".option-card");
    newOptionCards.forEach(option => {
      option.addEventListener('click', function() {
        if(answered) return;
        answered = true;

        const answer = this.dataset.answer;

        if(answer === 'correct'){
          correctAnswers++;
          updateScoreDisplay();
          this.classList.add('correct-answer');

          const correctImg = this.querySelector('.card-image');
          if(answerImage && correctImg){
            answerImage.src = correctImg.src;
            answerImage.style.display = 'block';
            questionIcon.style.display = 'none';
          }

          this.classList.add('correct-move');
          questionBox.classList.add('reveal');

        } else {
          this.classList.add('wrong-answer');
          setTimeout(()=>{
            this.classList.remove('wrong-answer');
            answered = false;
          }, 1500);
        }

        setTimeout(()=>{
          currentQuestionIndex++;
          loadQuestion();
        }, 2000);
      });
    });

    questionBox.classList.remove('reveal');
    if(answerImage) { answerImage.style.display = 'none'; answerImage.src = ''; }
    if(questionIcon) { questionIcon.style.display = 'block'; }
  }

  // ==================== INIT ====================
  loadQuestion();
  updateScoreDisplay();
});
