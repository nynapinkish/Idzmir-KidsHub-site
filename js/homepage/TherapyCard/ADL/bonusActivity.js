// Sample data untuk demo (gantikan dengan images sebenar anda)
const questions = [
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/basketball.png", 
    items: [
      { name: "clock", image: "../../../../assets/images/clock.png", isCorrect: false },
      { name: "cone", image: "../../../../assets/images/cone.png", isCorrect: false },
      { name: "basketball", image: "../../../../assets/images/basketball.png", isCorrect: true },
      { name: "pizza", image: "../../../../assets/images/pizza.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/sandwich.png", 
    items: [
      { name: "biscuit", image: "../../../../assets/images/biscuit.png", isCorrect: false },
      { name: "sandwich", image: "../../../../assets/images/sandwich.png", isCorrect: true },
      { name: "chocolate", image: "../../../../assets/images/chocolate.png", isCorrect: false },
      { name: "clock2", image: "../../../../assets/images/clock1.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/cone.png", 
    items: [
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: false },
      { name: "sandwich", image: "../../../../assets/images/sandwich.png", isCorrect: false },
      { name: "cone", image: "../../../../assets/images/cone.png", isCorrect: true },
      { name: "biscuit", image: "../../../../assets/images/biscuit.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/clock1.png", 
    items: [
      { name: "fork", image: "../../../../assets/images/fork.png", isCorrect: false },
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: false },
      { name: "sandwich", image: "../../../../assets/images/sandwich.png", isCorrect: false },
      { name: "clock1", image: "../../../../assets/images/clock1.png", isCorrect: true },
    ]
  },
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/fan.png", 
    items: [
      { name: "mug", image: "../../../../assets/images/mug.png", isCorrect: false },
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: true },
      { name: "fork", image: "../../../../assets/images/fork.png", isCorrect: false },
      { name: "clock2", image: "../../../../assets/images/clock1.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/table.png", 
    items: [
      { name: "table", image: "../../../../assets/images/table.png", isCorrect: true },
      { name: "umbrella", image: "../../../../assets/images/umbrella.png", isCorrect: false },
      { name: "mug", image: "../../../../assets/images/mug.png", isCorrect: false },
      { name: "sandwich", image: "../../../../assets/images/sandwich.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang tidak sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/clock1.png", 
    items: [
      { name: "clock1", image: "../../../../assets/images/clock1.png", isCorrect: false },
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: true },
      { name: "clock1", image: "../../../../assets/images/clock1.png", isCorrect: false },
      { name: "clock1", image: "../../../../assets/images/clock1.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang tidak sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/fan.png", 
    items: [
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: false },
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: false },
      { name: "fork", image: "../../../../assets/images/fork.png", isCorrect: true },
      { name: "fan", image: "../../../../assets/images/fan.png", isCorrect: false },
    ]
  },
  {
    question: "Cari item yang tidak sama dengan yang di dalam kotak",
    reference: "../../../../assets/images/table.png", 
    items: [
      { name: "table", image: "../../../../assets/images/table.png", isCorrect: false },
      { name: "table", image: "../../../../assets/images/table.png", isCorrect: false },
      { name: "mug", image: "../../../../assets/images/mug.png", isCorrect: true },
      { name: "table", image: "../../../../assets/images/table.png", isCorrect: false },
    ]
  },
];

let currentIndex = 0;
let score = 0;
let answered = false;

// Get HTML elements
const questionTitle = document.querySelector(".banner-yellow-right");
const referenceImage = document.getElementById("referenceImage");
const optionsGrid = document.querySelector(".options-grid");
const questionBox = document.getElementById("questionBox");

function loadQuestion() {
  const current = questions[currentIndex];
  answered = false;
  
  // Update question title
  questionTitle.textContent = current.question;
  
  // Update reference image
  referenceImage.src = current.reference;
  
  // Clear old options
  optionsGrid.innerHTML = "";
  
  // Shuffle items
  const shuffledItems = [...current.items].sort(() => Math.random() - 0.5);
  
  // Create option items
  shuffledItems.forEach((item, index) => {
    const optionDiv = document.createElement("div");
    optionDiv.className = "option-item";
    
    const img = document.createElement("img");
    img.src = item.image;
    img.alt = item.name;
    img.loading = "lazy";
    
    optionDiv.appendChild(img);
    optionsGrid.appendChild(optionDiv);
    
    // Add click event listener
    optionDiv.addEventListener("click", () => {
      if (!answered) {
        answered = true;
        checkAnswer(item.isCorrect, img);
      }
    });
  });
}

function checkAnswer(isCorrect, imgElement) {
  // Disable all options
  const allOptions = document.querySelectorAll(".option-item");
  allOptions.forEach(option => {
    option.style.pointerEvents = "none";
  });
  
  if (isCorrect) {
    // Highlight hijau - belakang image
    imgElement.style.filter = "drop-shadow(0 0 30px #4CAF50) drop-shadow(0 0 15px #4CAF50)";
    score++;
    updateScore();
  } else {
    // Highlight merah - belakang image
    imgElement.style.filter = "drop-shadow(0 0 30px #F44336) drop-shadow(0 0 15px #F44336)";
  }
  
  // Move to next question after 1 second
  setTimeout(() => {
    currentIndex++;
    if (currentIndex < questions.length) {
      loadQuestion();
    } else {
      showCompletionModal();
    }
  }, 1000);
}

function updateScore() {
  // Create score display if doesn't exist
  let scoreContainer = document.querySelector(".score-container");
  if (!scoreContainer) {
    scoreContainer = document.createElement("div");
    scoreContainer.className = "score-container";
    scoreContainer.innerHTML = 'Skor: <span id="scoreText">0</span>';
    scoreContainer.style.cssText = `
      position: fixed;
      top: 100px;
      right: 40px;
      background: white;
      padding: 20px 30px;
      border-radius: 20px;
      font-size: 24px;
      font-weight: bold;
      color: #003d82;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
      z-index: 500;
    `;
    document.body.appendChild(scoreContainer);
  }
  
  document.getElementById("scoreText").textContent = score;
}

function showCompletionModal() {
  const modal = document.createElement("div");
  modal.className = "completion-modal";
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  const modalContent = document.createElement("div");
  modalContent.style.cssText = `
    background: white;
    padding: 50px;
    border-radius: 30px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  `;
  
  modalContent.innerHTML = `
    <p style="font-size: 28px; font-weight: bold; color: #003d82; margin: 15px 0;">🎉 Tahniah! Semua soalan selesai! 🎉</p>
    <p style="font-size: 24px; color: #003d82; margin: 15px 0;">Skor akhir: <strong>${score}/${questions.length}</strong></p>
    <button onclick="location.reload()" style="
      background: linear-gradient(135deg, #ffd032 0%, #ffb800 100%);
      color: #003d82;
      border: none;
      padding: 15px 40px;
      font-size: 20px;
      font-weight: bold;
      border-radius: 20px;
      cursor: pointer;
      margin-top: 20px;
      transition: transform 0.2s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">🔄 Main Lagi</button>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

// Start the game
loadQuestion();