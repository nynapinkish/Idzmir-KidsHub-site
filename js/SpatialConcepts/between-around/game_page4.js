document.addEventListener('DOMContentLoaded', () => {
  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  let answered = false;

  // Set up questions - setiap soalan ada data sendiri
  const questions = [
    {
      label: "antara",
      question: "Mana yang antara?",
      correctImg: "../../../assets/images/between.png",
      options: [
        { answer: "correct", img: "../../../assets/images/between.png" },
        { answer: "wrong", img: "../../../assets/images/around.png" },
      ]
    },
    {
      label: "sekeliling",
      question: "Mana yang sekeliling?",
      correctImg: "../../../assets/images/around.png",
      options: [
        { answer: "correct", img: "../../../assets/images/around.png" },
        { answer: "wrong", img: "../../../assets/images/between.png" },
      ]
    }
  ];

  let currentQuestionIndex = 0;
  let correctAnswers = 0;
  let totalQuestions = questions.length;
  let attemptCount = 0; // Track berapa kali dah pilih (betul atau salah)

  // Function to show scoring popup (BESAR di tengah-tengah)
  function showScoringPopup() {
    const scoreModal = document.getElementById('scoreModal');
    const finalScoreDisplay = document.getElementById('finalScoreDisplay');
    const nextButtonContainer = document.querySelector('.next-button-container');
    const nextButton = document.querySelector('.next-button');
    
    console.log("showScoringPopup triggered!");
    console.log("scoreModal:", scoreModal);
    console.log("finalScoreDisplay:", finalScoreDisplay);
    console.log("nextButtonContainer:", nextButtonContainer);
    console.log("nextButton:", nextButton);
    
    if (scoreModal && finalScoreDisplay) {
      // Update score display
      finalScoreDisplay.textContent = `${correctAnswers}/${attemptCount}`;
      console.log("Score updated to:", `${correctAnswers}/${attemptCount}`);
      
      // Clear any previous inline styles
      scoreModal.style.cssText = '';
      
      // Show modal - BESAR DI TENGAH MACAM FRUIT GAME
      scoreModal.style.display = 'flex';
      scoreModal.style.position = 'fixed';
      scoreModal.style.top = '0';
      scoreModal.style.left = '0';
      scoreModal.style.width = '100%';
      scoreModal.style.height = '100%';
      scoreModal.style.zIndex = '10000';
      scoreModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
      scoreModal.style.backdropFilter = 'blur(5px)';
      scoreModal.style.alignItems = 'center';
      scoreModal.style.justifyContent = 'center';
      scoreModal.style.animation = 'modalBounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      
      console.log("Modal displayed!");
      
      // Setup next button container and button
      if (nextButtonContainer && nextButton) {
        // Ensure container has higher z-index than modal
        nextButtonContainer.style.zIndex = '10001';
        nextButtonContainer.style.position = 'fixed';
        
        // Hide next button initially
        nextButton.style.opacity = '0';
        nextButton.style.display = 'block';
        nextButton.style.pointerEvents = 'none';
        
        // After 1 second, fade in and animate next button
        setTimeout(() => {
          nextButton.style.transition = 'opacity 0.5s ease-in-out, transform 0.3s ease';
          nextButton.style.opacity = '1';
          nextButton.style.pointerEvents = 'auto';
          
          // Add bounce animation using keyframes
          nextButton.style.animation = 'bounceButton 1s ease-in-out infinite';
          console.log("Next button faded in and animating!");
        }, 1000);
      }
    }
  }

  // Update score display
  function updateScoreDisplay() {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      scoreDisplay.style.display = 'flex';
      document.getElementById('scoreText').textContent = `${correctAnswers}/${attemptCount}`;
    }
  }

  // Function to change question and options
  function changeQuestion() {
    console.log("Changing question...");
    
    // Reset answered flag
    answered = false;
    
    // Move to next question (cycle back to start if at end)
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    
    const currentQuestion = questions[currentQuestionIndex];

    // Update the question label (bawah/atas/dalam)
    questionLabel.textContent = currentQuestion.label;
    
    // Update the question text
    questionPrompt.textContent = currentQuestion.question;
    
    // Update question box icon
    questionIcon.src = currentQuestion.correctImg;

    // Change options with animation
    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach((option, index) => {
      const optionImg = option.querySelector("img:not(.arrow-indicator)") || option.querySelector("img");
      optionImg.src = currentQuestion.options[index].img;
      option.dataset.answer = currentQuestion.options[index].answer;
      
      // Remove any previous classes
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
      
      // Add animation to smoothly transition
      option.classList.add('change-animation');
      setTimeout(() => {
        option.classList.remove('change-animation');
      }, 500);
    });

    // Reset question box
    questionBox.classList.remove('reveal');
    answerImage.src = "";
    
    // Clear feedback
    feedback.textContent = "";
    feedback.className = "feedback";
  }

  // Attach event listeners to options
  options.forEach(option => {
    option.addEventListener('click', function() {
      console.log("Option clicked:", this);
      console.log("Answered flag:", answered);
      
      // Prevent multiple clicks after correct answer
      if (answered) return;

      const answer = this.getAttribute('data-answer');
      console.log("Answer selected:", answer);
      const currentQuestion = questions[currentQuestionIndex];
      
      if (answer === 'correct') {
        console.log("✅ CORRECT! Score before increment:", correctAnswers);
        // Correct answer behavior
        answered = true;
        attemptCount++; // INCREMENT attempt count
        correctAnswers++; // INCREMENT SCORE
        console.log("✅ Attempt:", attemptCount, "Correct:", correctAnswers);
        updateScoreDisplay(); // UPDATE DISPLAY
        
        // Remove wrong classes from all cards
        options.forEach(opt => opt.classList.remove('wrong-answer'));
        
        // Mark this card as correct
        this.classList.add('correct-answer');
        
        // Get the image from the correct card
        const correctImg = this.querySelector('img:not(.arrow-indicator)') || this.querySelector('img');
        answerImage.src = correctImg.src;
        
        // Add animation to move card to question box
        this.classList.add('correct-move');
        
        // After animation, reveal answer in question box
        setTimeout(() => {
          questionBox.classList.add('reveal');
        }, 800);
        
        // Check if dah 3 kali attempt
        console.log("Checking: attemptCount(" + attemptCount + ") >= totalQuestions(" + totalQuestions + ")");
        
        if (attemptCount >= totalQuestions) {
          console.log("🎉 3 ATTEMPTS COMPLETED! Showing popup...");
          // Dah 3 kali attempt - tunjuk scoring popup
          setTimeout(() => {
            console.log("⏱️ Timeout 2000ms - triggering showScoringPopup");
            showScoringPopup();
          }, 2000);
        } else {
          console.log("➡️ More attempts remaining, changing question...");
          // Masih ada attempt lagi - terus ke soalan berikutnya
          setTimeout(() => {
            changeQuestion();
          }, 2000);
        }
        
      } else {
        console.log("❌ WRONG!");
        // Incorrect answer behavior - shake animation
        answered = true;
        attemptCount++; // INCREMENT attempt count even for wrong answer
        console.log("❌ Attempt:", attemptCount, "Correct:", correctAnswers);
        updateScoreDisplay(); // UPDATE DISPLAY
        
        this.classList.add('wrong-answer');
        
        // Remove shake animation after it completes
        setTimeout(() => {
          this.classList.remove('wrong-answer');
        }, 600);
        
        // Check if dah 3 kali attempt
        console.log("Checking: attemptCount(" + attemptCount + ") >= totalQuestions(" + totalQuestions + ")");
        
        if (attemptCount >= totalQuestions) {
          console.log("🎉 3 ATTEMPTS COMPLETED! Showing popup...");
          // Dah 3 kali attempt - tunjuk scoring popup
          setTimeout(() => {
            console.log("⏱️ Timeout 2000ms - triggering showScoringPopup");
            showScoringPopup();
          }, 2000);
        } else {
          console.log("➡️ More attempts remaining, changing question...");
          // Masih ada attempt lagi - terus ke soalan berikutnya
          setTimeout(() => {
            changeQuestion();
          }, 2000);
        }
      }
    });
  });

  // Initialize score display on page load
  updateScoreDisplay();
});