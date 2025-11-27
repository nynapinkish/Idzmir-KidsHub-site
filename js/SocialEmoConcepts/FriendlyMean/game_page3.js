// ===============================================
// SOCIAL/EMOTIONAL CONCEPTS - Mesra/Jahat
// FIXED: Score properly saves to Firebase
// ===============================================

// ================= GAME CONFIGURATION =================
const CONCEPT_TYPE = 'Social/Emotional';
const GAME_NAME = 'mesra / jahat';
const GAME_KEY = 'mesra_/_jahat';
const TOTAL_QUESTIONS = 2;

// ================= GAME LOCK STATE =================
let gameAlreadyPlayed = false;
let existingScore = 0;

// ================= GAME STATE =================
let answered = false;
let currentQuestionIndex = 0;
let correctAnswers = 0;
const maxAttempts = 2;

// ================= CHECK IF GAME ALREADY PLAYED =================
async function checkGameStatus() {
  try {
    const studentId = sessionStorage.getItem('studentId');
    if (!studentId) {
      console.warn('⚠️ No studentId in session - allowing first play');
      return false;
    }

    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();

    if (studentQuery.empty) {
      console.warn('⚠️ Student not found in Firebase - allowing first play');
      return false;
    }

    const studentDoc = studentQuery.docs[0];
    const studentData = studentDoc.data();
    
    console.log('🔍 Checking game status...');
    console.log('   Looking for game key:', GAME_KEY);
    
    const conceptProgress = studentData.conceptProgress || {};
    
    if (conceptProgress[CONCEPT_TYPE]) {
      const gamesCompleted = conceptProgress[CONCEPT_TYPE].gamesCompleted || {};
      
      console.log('   Games in Social/Emotional:', Object.keys(gamesCompleted));
      
      if (gamesCompleted[GAME_KEY] !== undefined && gamesCompleted[GAME_KEY] >= 0) {
        existingScore = gamesCompleted[GAME_KEY];
        gameAlreadyPlayed = true;
        console.log('🔒 Game FOUND!');
        console.log(`   Score: ${existingScore}/${TOTAL_QUESTIONS}`);
        return true;
      }
    }

    console.log('✅ Game not found - first time playing');
    return false;

  } catch (error) {
    console.error('❌ Error checking game status:', error);
    return false;
  }
}

// ================= SHOW "ALREADY PLAYED" SCREEN =================
async function showAlreadyPlayedScreen() {
  console.log('🔒 Showing LOCKED screen - score already saved');
  console.log(`   Existing score: ${existingScore}/${TOTAL_QUESTIONS}`);
  
  const scoreModal = document.getElementById('scoreModal');
  const finalScoreDisplay = document.getElementById('finalScoreDisplay');
  const nextButtonContainer = document.querySelector('.next-button-container');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const scoreText = document.getElementById('scoreText');

  // Update score banner
  if (scoreDisplay && scoreText) {
    scoreDisplay.style.display = 'flex';
    scoreText.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
  }

  // Hide game elements
  const questionBox = document.getElementById('questionBox');
  const optionsContainer = document.querySelector('.options-section');
  
  if (questionBox) questionBox.style.display = 'none';
  if (optionsContainer) optionsContainer.style.display = 'none';

  // Update modal
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = `${existingScore}/${TOTAL_QUESTIONS}`;
  }

  // Show modal
  if (scoreModal) {
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
  }

  // Show next button
  if (nextButtonContainer) {
    nextButtonContainer.classList.add('show');
    nextButtonContainer.style.zIndex = '10001';
    
    const nextButton = nextButtonContainer.querySelector('.next-button');
    if (nextButton) {
      nextButton.style.opacity = '1';
      nextButton.style.display = 'block';
      nextButton.style.pointerEvents = 'auto';
    }
  }
}

// ================= INITIALIZE GAME =================
document.addEventListener('DOMContentLoaded', async () => {
  console.log("🎮 Friendly/Mean Game loading...");
  
  // Wait for Firebase
  let attempts = 0;
  while (attempts < 15) {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      console.log('✅ Firebase ready!');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 300));
    attempts++;
  }
  
  if (attempts >= 15) {
    console.error('❌ Firebase failed to load');
    alert('Firebase gagal dimuat. Sila refresh halaman.');
    return;
  }

  // Check if already played
  const hasPlayed = await checkGameStatus();
  
  if (hasPlayed) {
    console.log("🔒 Game already played - showing existing score");
    await showAlreadyPlayedScreen();
    return;
  }

  console.log("✅ First time playing - initializing game...");

  // Initialize game session
  const initialized = await initializeGame(CONCEPT_TYPE, GAME_NAME, TOTAL_QUESTIONS);
  if (!initialized) {
    console.error('❌ Failed to initialize game session');
    alert('Gagal memulakan game. Sila refresh halaman.');
    return;
  }

  console.log("✅ Game session initialized successfully");

  // ================= GET ELEMENTS =================
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

  // ================= QUESTIONS =================
  const questions = [
    {
      label: "Baik",
      question: "Mana yang nampak baik?",
      correctAnswer: "friendly",
      options: [
        { answer: "mean", img: "../../../assets/images/mean.png" },
        { answer: "friendly", img: "../../../assets/images/friendly.png" }
      ]
    },
    {
      label: "Jahat",
      question: "Mana yang nampak jahat?",
      correctAnswer: "mean",
      options: [
        { answer: "mean", img: "../../../assets/images/mean.png" },
        { answer: "friendly", img: "../../../assets/images/friendly.png" }
      ]
    }
  ];

  // ================= UPDATE SCORE =================
  function updateScoreDisplay() {
    if(scoreDisplay && scoreText){
      scoreDisplay.style.display = 'flex';
      scoreText.textContent = `${correctAnswers}/${maxAttempts}`;
      console.log("📊 Score display updated:", `${correctAnswers}/${maxAttempts}`);
      console.log("📊 gameSession.currentScore:", gameSession.currentScore);
    }
  }

  // ================= SHOW FINAL SCORE MODAL =================
  async function showScoringPopup() {
    console.log('🎉 ========== FINAL SCORE MODAL ==========');
    console.log('   correctAnswers:', correctAnswers);
    console.log('   gameSession.currentScore:', gameSession.currentScore);
    
    if (!scoreModal || !finalScoreDisplay) {
      console.error("❌ Modal elements not found!");
      return;
    }

    // ✅ VERIFY SCORE IS CORRECT
    console.log('🔍 Verifying score before save...');
    if (gameSession.currentScore !== correctAnswers) {
      console.warn('⚠️ Score mismatch detected! Fixing...');
      console.log(`   gameSession.currentScore: ${gameSession.currentScore}`);
      console.log(`   correctAnswers: ${correctAnswers}`);
      gameSession.currentScore = correctAnswers;
      console.log(`   ✅ Fixed: gameSession.currentScore = ${correctAnswers}`);
    }

    // ✅ SAVE TO FIREBASE
    console.log('💾 Saving score to Firebase...');
    console.log(`   Final score: ${gameSession.currentScore}/${maxAttempts}`);
    
    const saved = await gameSession.endSession();
    
    if (saved) {
      console.log('✅ Score saved successfully!');
      console.log('🔒 Game is now LOCKED');
    } else {
      console.error('❌ Failed to save score');
    }

    // Update display
    finalScoreDisplay.textContent = `${correctAnswers}/${maxAttempts}`;
    
    // Show modal
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

    // Show next button
    if(nextButtonContainer){
      setTimeout(()=>{
        nextButtonContainer.classList.add('show');
        nextButtonContainer.style.zIndex = '10001';
      }, 1000);
    }
    
    console.log('========================================');
  }

  // ================= LOAD QUESTION =================
  function loadQuestion(){
    if(currentQuestionIndex >= maxAttempts){
      showScoringPopup();
      return;
    }

    answered = false;
    const currentQuestion = questions[currentQuestionIndex];

    console.log(`❓ Question ${currentQuestionIndex + 1}: ${currentQuestion.question}`);

    questionLabel.textContent = currentQuestion.label;
    questionPrompt.textContent = currentQuestion.question;
    
    // Set question icon to correct answer image
    const correctOption = currentQuestion.options.find(opt => opt.answer === currentQuestion.correctAnswer);
    if (correctOption) {
      questionIcon.src = correctOption.img;
    }

    // Update options
    const optionCards = document.querySelectorAll(".option-card");
    optionCards.forEach((option, idx) => {
      const img = option.querySelector('.card-image');
      img.src = currentQuestion.options[idx].img;
      option.dataset.answer = currentQuestion.options[idx].answer;
      option.classList.remove('correct-answer','wrong-answer','correct-move');
      option.replaceWith(option.cloneNode(true));
    });

    const newOptionCards = document.querySelectorAll(".option-card");

    newOptionCards.forEach(option=>{
      option.addEventListener('click', () => {
        if(answered) return;
        answered = true;

        const answer = option.dataset.answer;
        console.log("🖱️ Clicked:", answer, "| Correct:", currentQuestion.correctAnswer);

        if(answer === currentQuestion.correctAnswer){
          console.log("✅ CORRECT ANSWER!");
          
          // 🔥 FIX: Update BOTH variables
          correctAnswers++;
          gameSession.addScore(1);  // ← CRITICAL FIX!
          
          console.log(`   correctAnswers: ${correctAnswers}`);
          console.log(`   gameSession.currentScore: ${gameSession.currentScore}`);
          
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

          setTimeout(()=>{
            currentQuestionIndex++;
            loadQuestion();
          }, 2000);

        } else {
          console.log("❌ WRONG!");
          option.classList.add('wrong-answer');
          setTimeout(()=>{
            option.classList.remove('wrong-answer');
            answered = false;
          }, 1500);
        }
      });
    });

    questionBox.classList.remove('reveal');
    if(answerImage) { answerImage.style.display = 'none'; answerImage.src = ''; }
    if(questionIcon) { questionIcon.style.display = 'block'; }
  }

  // ================= START GAME =================
  loadQuestion();
  updateScoreDisplay();
  
  console.log("🚀 Game ready!");
});

console.log('✅ Friendly/Mean game loaded with FIXED score saving!');