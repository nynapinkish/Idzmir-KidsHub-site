document.addEventListener('DOMContentLoaded', () => {
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');

  let answered = false;
  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  const maxAttempts = 4; // ✅ maximum attempts

  // ==================== QUESTIONS ====================
  const questions = [
    {
      label: "gembira",
      question: "Mana yang gembira?",
      correctAnswer: "happy",
      options: [
        { answer: "happy", img: "../../../assets/images/happy.png" },
        { answer: "sad", img: "../../../assets/images/sad.png" },
        { answer: "angry", img: "../../../assets/images/angry.png" },
        { answer: "scary", img: "../../../assets/images/scary.png" }
      ]
    },
    {
      label: "sedih",
      question: "Mana yang sedih?",
      correctAnswer: "sad",
      options: [
        { answer: "happy", img: "../../../assets/images/happy.png" },
        { answer: "sad", img: "../../../assets/images/sad.png" },
        { answer: "angry", img: "../../../assets/images/angry.png" },
        { answer: "scary", img: "../../../assets/images/scary.png" }
      ]
    },
    {
      label: "marah",
      question: "Mana yang marah?",
      correctAnswer: "angry",
      options: [
        { answer: "happy", img: "../../../assets/images/happy.png" },
        { answer: "sad", img: "../../../assets/images/sad.png" },
        { answer: "angry", img: "../../../assets/images/angry.png" },
        { answer: "scary", img: "../../../assets/images/scary.png" }
      ]
    },
    {
      label: "takut",
      question: "Mana yang takut?",
      correctAnswer: "scary",
      options: [
        { answer: "happy", img: "../../../assets/images/happy.png" },
        { answer: "sad", img: "../../../assets/images/sad.png" },
        { answer: "angry", img: "../../../assets/images/angry.png" },
        { answer: "scary", img: "../../../assets/images/scary.png" }
      ]
    }
  ];

  // ==================== UPDATE SCORE ====================
  function updateScoreDisplay() {
    if(scoreDisplay && scoreText){
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${maxAttempts}`;
    }
  }

  // ==================== SHOW SCORE MODAL ====================
  function showScoringPopup() {
    if(scoreModal && finalScoreDisplay){
      finalScoreDisplay.textContent = `${correctAnswers}/${maxAttempts}`;
      scoreModal.style.display = 'flex';
      if(nextButtonContainer){
        setTimeout(()=>{
          nextButtonContainer.classList.add('show');
        }, 1000);
      }
    }
  }

  // ==================== LOAD QUESTION ====================
  function loadQuestion(){
    if(currentQuestionIndex >= maxAttempts){
      showScoringPopup();
      return;
    }

    answered = false;
    const currentQuestion = questions[currentQuestionIndex];

    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctAnswer === "happy" ? "../../../assets/images/happy.png" :
                        currentQuestion.correctAnswer === "sad" ? "../../../assets/images/sad.png" :
                        currentQuestion.correctAnswer === "angry" ? "../../../assets/images/angry.png" :
                        "../../../assets/images/scary.png";

    // Update option cards dynamically
    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach((option, idx) => {
      const img = option.querySelector('.card-image');
      img.src = currentQuestion.options[idx].img;
      option.dataset.answer = currentQuestion.options[idx].answer;
      option.classList.remove('correct-answer','wrong-answer','correct-move');

      // Remove previous click handler
      option.replaceWith(option.cloneNode(true));
    });

    // Re-select cloned options
    const newOptionCards = document.querySelectorAll(".option-card");

    newOptionCards.forEach(option=>{
      option.addEventListener('click', () => {
        if(answered) return;
        answered = true;

        const answer = option.dataset.answer;

        if(answer === currentQuestion.correctAnswer){
          correctAnswers++;
          updateScoreDisplay();
          option.classList.add('correct-answer');

          const correctImg = option.querySelector('.card-image');
          if(answerImage && correctImg){
            answerImage.src = correctImg.src;
            answerImage.style.display = 'block';
            questionIcon.style.display = 'none';
          }

          option.classList.add('correct-move');
          questionBox.classList.add('reveal');

        } else {
          option.classList.add('wrong-answer');
          setTimeout(()=>{
            option.classList.remove('wrong-answer');
            answered = false;
          }, 1500);
        }

        // Move to next question after delay
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
