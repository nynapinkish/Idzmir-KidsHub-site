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
  let totalQuestions = 0;

  // Set up questions
  const questions = [
    {
      label: "tolong",
      question: "Mana yang nampak tolong?",
      correctImg: "../../../assets/images/help.png",
      options: [
        { answer: "correct", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" }
      ]
    },
    {
      label: "kongsi",
      question: "Mana yang nampak kongsi?",
      correctImg: "../../../assets/images/share.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "correct", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" }
      ]
    },
    {
      label: "tunggu",
      question: "Mana yang nampak tunggu?",
      correctImg: "../../../assets/images/wait.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "correct", img: "../../../assets/images/wait.png" }
      ]
    }
  ];

  totalQuestions = questions.length;

  // ==================== UPDATE SCORE DISPLAY ====================
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const scoreText = document.getElementById('scoreText');
    
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${totalQuestions}`;
    }
  }

  // ==================== SHOW SCORE MODAL - BESAR DI TENGAH ====================
  function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    const nextButton = document.querySelector('.next-button');
    
    console.log("🎉 Showing BIG MODAL in center!");
    
    if (scoreModal && finalScoreDisplay) {
      // Update score display
      finalScoreDisplay.textContent = `${correctAnswers}/${totalQuestions}`;
      console.log("Score updated to:", `${correctAnswers}/${totalQuestions}`);
      
      // Show modal - BESAR DI TENGAH
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
      
      console.log("Modal displayed BESAR DI TENGAH!");
      
      // Show next button after 1 second with animation
      if (nextButtonContainer && nextButton) {
        nextButtonContainer.style.zIndex = '10001';
        nextButton.style.opacity = '0';
        nextButton.style.display = 'block';
        nextButton.style.pointerEvents = 'none';
        
        setTimeout(() => {
          nextButton.style.transition = 'opacity 0.5s ease-in-out';
          nextButton.style.opacity = '1';
          nextButton.style.pointerEvents = 'auto';
          nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
          console.log("Next button faded in and bouncing!");
        }, 1000);
      }
    }
  }

  // ==================== CHANGE QUESTION ====================
  function changeQuestion() {
    answered = false;
    currentQuestionIndex++;
    
    console.log("Current question index:", currentQuestionIndex);
    console.log("Total questions:", questions.length);
    
    if (currentQuestionIndex >= questions.length) {
      // All questions answered - show BIG modal
      console.log("🎉 ALL QUESTIONS COMPLETED! Showing BIG popup...");
      setTimeout(() => {
        showScoringPopup();
      }, 1500);
      return;
    }
    
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
    });

    questionBox.classList.remove('reveal');
    if (answerImage) {
      answerImage.src = "";
      answerImage.style.display = 'none';
    }
    if (questionIcon) {
      questionIcon.style.display = 'block';
    }
  }

  // Attach event listeners
  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;

      const answer = this.getAttribute('data-answer');
      answered = true;
      
      if (answer === 'correct') {
        // ✅ CORRECT ANSWER
        correctAnswers++;
        console.log("✅ Correct! Score:", correctAnswers + "/" + totalQuestions);
        updateScoreDisplay();
        
        options.forEach(opt => opt.classList.remove('wrong-answer'));
        this.classList.add('correct-answer');
        
        const correctImg = this.querySelector('.card-image');
        if (answerImage && correctImg) {
          answerImage.src = correctImg.src;
          answerImage.style.display = 'block';
          if (questionIcon) {
            questionIcon.style.display = 'none';
          }
        }
        
        this.classList.add('correct-move');
        
        setTimeout(() => {
          questionBox.classList.add('reveal');
        }, 800);
        
        setTimeout(() => {
          changeQuestion();
        }, 2000);
        
      } else {
        // ❌ WRONG ANSWER
        console.log("❌ Wrong!");
        this.classList.add('wrong-answer');
        
        setTimeout(() => {
          this.classList.remove('wrong-answer');
          changeQuestion();
        }, 1500);
      }
    });
  });
});