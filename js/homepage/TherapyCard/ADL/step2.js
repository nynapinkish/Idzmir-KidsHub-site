document.addEventListener('DOMContentLoaded', () => {
  console.log("🎮 Step 2 Game loaded!");

  // Soalan + jawapan (dengan gambar untuk cards)
  const questions = [
    { 
      question: "Basuh Tangan", 
      correct: { name: "Sabun", image: "../../../../assets/images/soap.png" },
      wrong: { name: "Syampoo", image: "../../../../assets/images/cleanser.png" },
      image: "../../../../assets/images/washingHand.png"
    },
    { 
      question: "Basuh Gigi", 
      correct: { name: "Berus Gigi", image: "../../../../assets/images/brush.png" },
      wrong: { name: "Ubat Gigi", image: "../../../../assets/images/toothpaste.png" },
      image: "../../../../assets/images/brushingTeethBoy.png"
    },
    { 
      question: "Makan", 
      correct: { name: "Pinggan", image: "../../../../assets/images/plate.png" },
      wrong: { name: "Sudu", image: "../../../../assets/images/spoon.png" },
      image: "../../../../assets/images/eating.png"
    },
    { 
      question: "Mandi", 
      wrong: { name: "Sabun Mandi", image: "../../../../assets/images/syampoo.png" },
      correct: { name: "Bathtub", image: "../../../../assets/images/bathtub.png" },
      image: "../../../../assets/images/bathboy.png"
    },
    { 
      question: "Pakai Baju", 
      correct: { name: "Baju", image: "../../../../assets/images/shirts.png" },
      wrong: { name: "Cermin", image: "../../../../assets/images/mirror.png" },
      image: "../../../../assets/images/wearClothes.png"
    },
    { 
      question: "Tidur", 
      correct: { name: "Bantal", image: "../../../../assets/images/pillow.png" },
      wrong: { name: "Selimut", image: "../../../../assets/images/blanket.png" },
      image: "../../../../assets/images/sleepBoy.png"
    },
    { 
      question: "Guna Tandas", 
      wrong: { name: "Pancut Air", image: "../../../../assets/images/waterHost.png" },
      correct: { name: "Jamban", image: "../../../../assets/images/toilet1.png" },
      image: "../../../../assets/images/toilet.png"
    },
    { 
      question: "Sikat Rambut", 
      correct: { name: "Sikat", image: "../../../../assets/images/comb.png" },
      wrong: { name: "Pengering rambut", image: "../../../../assets/images/hairdryer.png" },
      image: "../../../../assets/images/combHair.png"
    },
    { 
      question: "Bersihkan Mainan", 
      wrong: { name: "Penyapu", image: "../../../../assets/images/broom.png" },
      correct: { name: "Bulu ayam", image: "../../../../assets/images/featherDuster.png" },
      image: "../../../../assets/images/cleanToys.png"
    }
  ];

  let currentIndex = 0;
  let score = 0;
  let attemptCount = 0;  // ✅ Track total attempts

  // Elemen penting
  const activityTitle = document.getElementById("activityTitle");
  const questionImage = document.getElementById("questionImage");
  const cardsContainer = document.getElementById("cardsContainer");
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreText = document.getElementById("scoreText");
  const scoreModal = document.getElementById("scoreModal");
  const finalScoreDisplay = document.getElementById("finalScoreDisplay");
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

  // Function untuk load soalan baru
  function loadQuestion() {
    const current = questions[currentIndex];
    
    // Update gambar dan activity title (banner tetap "Rutin Harian")
    activityTitle.textContent = current.question;
    questionImage.src = current.image;
    questionImage.alt = current.question;

    // Reset cards
    cardsContainer.innerHTML = "";

    // Shuffle jawapan
    const answers = [current.correct, current.wrong].sort(() => Math.random() - 0.5);
    
    answers.forEach(answer => {
      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <div class="card-body">
          <img src="${answer.image}" alt="${answer.name}">
        </div>
      `;
      
      cardsContainer.appendChild(card);

      // Event listener untuk klik
      card.addEventListener("click", () => checkAnswer(answer.name, card));
    });

    updateScoreDisplay();
  }

  function checkAnswer(selectedAnswer, cardElement) {
    const current = questions[currentIndex];
    attemptCount++;  // ✅ Increment attempt count setiap kali jawab
    
    if (selectedAnswer === current.correct.name) {
      // Jawapan betul
      cardElement.classList.add("correct-animation");
      score++;  // ✅ Only increment score bila betul
      console.log("✅ CORRECT! Score:", score);
    } else {
      // Jawapan salah
      cardElement.classList.add("wrong-animation");
      console.log("❌ WRONG! Score:", score);
    }

    updateScoreDisplay();  // ✅ Update score after each answer

    // Sama ada betul atau salah, terus ke soalan seterusnya selepas 800ms
    setTimeout(() => {
      currentIndex++;
      if (currentIndex < questions.length) {
        loadQuestion();
      } else {
        showFinalResult();
      }
    }, 800);
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