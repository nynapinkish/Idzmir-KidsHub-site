document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Game 4 loaded!");

  const options = document.querySelectorAll('.option-card');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');
  const questionPrompt = document.querySelector('.question-prompt');
  const questionLabel = document.querySelector('.question-label');
  const questionIcon = document.querySelector('.question-icon');
  const questionMark = document.querySelector('.question-mark');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  const scoreModal = document.getElementById('scoreModal');
  const totalScorePercentage = document.getElementById('totalScorePercentage');
  const gamesScoreList = document.getElementById('gamesScoreList');
  const continueBtn = document.getElementById('continueBtn');
  const finishBtn = document.getElementById('finishBtn');

  let currentQuestionIndex = 0;
  let score = 0;
  let attemptCount = 0;
  let answered = false;

  const questions = [
    {
      label: "tolong",
      question: "Mana yang nampak tolong?",
      correctImg: "../../../assets/images/help.png",
      options: [
        { answer: "correct", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" },
      ]
    },
    {
      label: "kongsi",
      question: "Mana yang nampak kongsi?",
      correctImg: "../../../assets/images/share.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "correct", img: "../../../assets/images/share.png" },
        { answer: "wrong", img: "../../../assets/images/wait.png" },
      ]
    },
    {
      label: "tunggu",
      question: "Mana yang nampak tunggu?",
      correctImg: "../../../assets/images/wait.png",
      options: [
        { answer: "wrong", img: "../../../assets/images/help.png" },
        { answer: "wrong", img: "../../../assets/images/share.png" },
        { answer: "correct", img: "../../../assets/images/wait.png" },
      ]
    }
  ];

  function updateScoreDisplay() {
    if (scoreDisplay && scoreText) {
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${score}/${attemptCount}`;
    }
  }

  function changeQuestion() {
    answered = false;
    if (currentQuestionIndex >= questions.length) {
      // Semua 3 attempts selesai
      showScoringPopup();
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    questionIcon.src = currentQuestion.correctImg;

    options.forEach((option, i) => {
      option.dataset.answer = currentQuestion.options[i].answer;
      option.querySelector('.card-image').src = currentQuestion.options[i].img;
      option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
    });

    // Reset
    answerImage.src = '';
    answerImage.style.display = 'none';
    if (questionIcon) questionIcon.style.display = 'block';
    if (questionMark) questionMark.style.display = 'block';
    questionBox.classList.remove('reveal');
  }

  options.forEach(option => {
    option.addEventListener('click', function () {
      if (answered) return;
      answered = true;
      attemptCount++;

      const answer = this.dataset.answer;

      if (answer === 'correct') {
        score++;
        updateScoreDisplay();
        this.classList.add('correct-answer');

        const correctImg = this.querySelector('.card-image');
        answerImage.src = correctImg.src;
        answerImage.style.display = 'block';

        if (questionMark) questionMark.style.display = 'none';
        if (questionIcon) questionIcon.style.display = 'none';
        this.classList.add('correct-move');

        setTimeout(() => questionBox.classList.add('reveal'), 800);
        setTimeout(() => {
          currentQuestionIndex++;
          changeQuestion();
        }, 2000);

      } else {
        this.classList.add('wrong-answer');
        updateScoreDisplay();
        setTimeout(() => {
          this.classList.remove('wrong-answer');
          currentQuestionIndex++;
          changeQuestion();
        }, 1200);
      }
    });
  });

  async function showScoringPopup() {
    if (!scoreModal) return;

    // Populate mock games list for example
    const mockGames = [
      { gameId: 'game1', gameName: 'Tolong/Kongsi/Tunggu 1', points: 2, maxPoints: 2 },
      { gameId: 'game2', gameName: 'Tolong/Kongsi/Tunggu 2', points: 2, maxPoints: 2 },
      { gameId: 'game8', gameName: 'Jom Pilih!', points: score, maxPoints: questions.length }
    ];

    if (gamesScoreList) {
      gamesScoreList.innerHTML = '';
      mockGames.forEach(game => {
        const row = document.createElement('div');
        row.className = 'game-score-row';
        row.innerHTML = `<div class="game-name">${game.gameName}</div><div class="game-points">${game.points}/${game.maxPoints}</div>`;
        gamesScoreList.appendChild(row);
      });
    }

    if (totalScorePercentage) {
      const totalPoints = mockGames.reduce((acc, g) => acc + g.points, 0);
      const totalMax = mockGames.reduce((acc, g) => acc + g.maxPoints, 0);
      totalScorePercentage.textContent = `${Math.round((totalPoints/totalMax)*100)}%`;
    }

    scoreModal.style.display = 'flex';

    if (continueBtn) continueBtn.addEventListener('click', () => { window.location.href = '/html/homepage/spatialConcepts.html'; });
    if (finishBtn) finishBtn.addEventListener('click', () => { window.location.href = '/html/homepage/homepage.html'; });
  }

  setTimeout(() => {
  continueBtn.style.opacity = '1';
  continueBtn.style.pointerEvents = 'auto';
  continueBtn.classList.add('bouncing');  // ✅ trigger animation
  console.log("Continue button faded in and bouncing!");
}, 1000);

  // Start game
  updateScoreDisplay();
  changeQuestion();
});
