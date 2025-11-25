// ===============================================
// GAME TEMPLATE WITH LOCK SYSTEM (First Try Only)
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Spatial Concepts';
const GAME_NAME = 'atas / bawah'; // ⚠️ CHANGED
const GAME_KEY = 'atas_/_bawah';   // ⚠️ CHANGED
const TOTAL_QUESTIONS = 2;          // ⚠️ CHANGED

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME DATA =================
const questions = [
    // ⚠️ REPLACED WITH USER QUESTIONS
    {
        label: "bawah",
        question: "Mana yang di bawah?",
        correctImg: "../../../assets/images/below.png",
        options: [
            { answer: "wrong", img: "../../../assets/images/above.png" },
            { answer: "correct", img: "../../../assets/images/below.png" }
        ]
    },
    {
        label: "atas",
        question: "Mana yang di atas?",
        correctImg: "../../../assets/images/above.png",
        options: [
            { answer: "correct", img: "../../../assets/images/above.png" },
            { answer: "wrong", img: "../../../assets/images/below.png" }
        ]
    }
];

// ================= GAME STATE =================
let currentQuestionIndex = 0;
let answered = false;
let correctAnswers = 0;
let attemptCount = 0;

// ================= CHECK IF GAME ALREADY PLAYED =================
async function checkGameStatus() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) return false;

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('Student not found in Firebase');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    const conceptProgress = studentData.conceptProgress || {};
    const spatialProgress = conceptProgress['Spatial Concepts'] || {};
    const gamesCompleted = spatialProgress.gamesCompleted || {};
    
    if (gamesCompleted[GAME_KEY] && gamesCompleted[GAME_KEY] > 0) {
      existingScore = gamesCompleted[GAME_KEY];
      gameAlreadyPlayed = true;
      return true;
    }

    return false;

  } catch (error) {
    console.error('Error checking game status:', error);
    return false;
  }
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const nextButton = document.querySelector('.next-button');

  const gameContainer = document.querySelector('.game-container');
  if (gameContainer) gameContainer.style.display = 'none';

  finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;

  scoreModal.style.cssText = '';
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

  const modalContent = scoreModal.querySelector('.modal-content');
  if (modalContent && !document.getElementById('alreadyPlayedMsg')) {
    const msg = document.createElement('div');
    msg.id = 'alreadyPlayedMsg';
    msg.style.cssText =
      'background: #ffc107; color: #000; padding: 12px 20px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-weight: bold;';
    msg.textContent = '🔒 Anda sudah main game ini! Ini markah anda.';
    modalContent.insertBefore(msg, modalContent.firstChild);
  }

  if (nextButtonContainer && nextButton) {
    nextButtonContainer.style.zIndex = '10001';
    nextButton.style.opacity = '1';
    nextButton.style.display = 'block';
    nextButton.style.pointerEvents = 'auto';
  }
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {

  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    await showAlreadyPlayedScreen();
    return;
  }
  
  const initialized = initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) return;

  const options = document.querySelectorAll('.option-card');
  const feedback = document.getElementById('feedback');
  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');

  showScoreDisplay();
  updateScoreDisplay();

  options.forEach(option => {
    option.addEventListener('click', function() {
      if (answered) return;
      const answer = this.getAttribute('data-answer');
      
      if (answer === 'correct') {
        handleCorrectAnswerClick(this, options, questionBox, answerImage, feedback);
      } else {
        handleWrongAnswerClick(this, feedback);
      }
    });
  });
});

// ================= SHOW SCORE DISPLAY =================
function showScoreDisplay() {
  const scoreDisplay = document.getElementById('scoreDisplay');
  if (scoreDisplay) {
    scoreDisplay.style.display = 'flex';
  }
}

// ================= UPDATE SCORE DISPLAY =================
function updateScoreDisplay() {
  const scoreText = document.getElementById('scoreText');
  if (scoreText) {
    scoreText.textContent = `${correctAnswers}/${attemptCount}`;
  }
}

// ================= HANDLE CORRECT ANSWER =================
function handleCorrectAnswerClick(selectedCard, options, questionBox, answerImage, feedback) {
  answered = true;
  attemptCount++;
  correctAnswers++;
  
  handleCorrectAnswer();
  updateScoreDisplay();
  
  options.forEach(opt => opt.classList.remove('wrong-answer'));
  selectedCard.classList.add('correct-answer');

  const correctImg = selectedCard.querySelector('img:not(.arrow-indicator)');
  if (answerImage && correctImg) {
    answerImage.src = correctImg.src;
  }

  selectedCard.classList.add('correct-move');

  setTimeout(() => {
    if (questionBox) questionBox.classList.add('reveal');
  }, 800);

  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
  }
}

// ================= HANDLE WRONG ANSWER =================
function handleWrongAnswerClick(selectedCard, feedback) {
  answered = true;
  attemptCount++;

  handleWrongAnswer();
  updateScoreDisplay();
  
  selectedCard.classList.add('wrong-answer');

  setTimeout(() => {
    selectedCard.classList.remove('wrong-answer');
  }, 600);

  if (attemptCount >= TOTAL_QUESTIONS) {
    setTimeout(showFinalScoreModal, 2000);
  } else {
    setTimeout(changeQuestion, 2000);
  }
}

// ================= CHANGE QUESTION =================
function changeQuestion() {
  answered = false;
  currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;

  const currentQuestion = questions[currentQuestionIndex];

  document.querySelector('.question-label').textContent = currentQuestion.label;
  document.querySelector('.question-prompt').textContent = currentQuestion.question;
  document.querySelector('.question-icon').src = currentQuestion.correctImg;

  const optionCards = document.querySelectorAll(".option-card");
  optionCards.forEach((option, index) => {
    option.querySelector("img:not(.arrow-indicator)").src =
      currentQuestion.options[index].img;
    option.dataset.answer = currentQuestion.options[index].answer;
    option.classList.remove('correct-answer', 'wrong-answer', 'correct-move');
  });

  const questionBox = document.getElementById('questionBox');
  const answerImage = document.getElementById('answerImage');

  questionBox.classList.remove('reveal');
  answerImage.src = "";
  document.getElementById('feedback').textContent = "";
}

// ================= SHOW FINAL SCORE MODAL =================
async function showFinalScoreModal() {
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');

  finalScoreDisplay.textContent = `${correctAnswers}/${attemptCount}`;

  scoreModal.style.cssText = '';
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

  if (typeof gameSession !== 'undefined' && gameSession.endSession) {
    await gameSession.endSession();
  }
}

console.log('✅ Game script with lock system loaded!');
