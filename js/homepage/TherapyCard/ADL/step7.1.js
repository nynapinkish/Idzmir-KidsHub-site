let score = 0;
let correctAnswers = 0;
let currentLevel = 0;

const levels = [
  {
    letter: { big: 'S', small: 's' },
    theme: 'SELIMUT (Bilik Tidur)',
    objects: [
      { id: 'selimut', img: '../../../../assets/images/selimut.png', correct: true },
      { id: 'sarung bantal', img: '../../../../assets/images/sarung-bantal.png', correct: true },
      { id: 'seprai', img: '../../../../assets/images/seprai.png', correct: true },
      { id: 'slipper', img: '../../../../assets/images/slipper.png', correct: true },
      { id: 'sisir', img: '../../../../assets/images/sisir.png', correct: true },
      { id: 'sabun', img: '../../../../assets/images/sabun.png', correct: false },
      { id: 'sendal', img: '../../../../assets/images/sendal.png', correct: false },
      { id: 'mainan', img: '../../../../assets/images/mainan.png', correct: false }
    ]
  },
  {
    letter: { big: 'F', small: 'f' },
    theme: 'FURNITURE (Rumah)',
    objects: [
      { id: 'furnitur', img: '../../../../assets/images/furnitur.png', correct: true },
      { id: 'framework', img: '../../../../assets/images/framework.png', correct: true },
      { id: 'fail', img: '../../../../assets/images/fail.png', correct: true },
      { id: 'finish', img: '../../../../assets/images/finish.png', correct: true },
      { id: 'festoon', img: '../../../../assets/images/festoon.png', correct: true },
      { id: 'filter', img: '../../../../assets/images/filter.png', correct: false },
      { id: 'flat', img: '../../../../assets/images/flat.png', correct: false },
      { id: 'mainan', img: '../../../../assets/images/mainan.png', correct: false }
    ]
  },
  {
    letter: { big: 'C', small: 'c' },
    theme: 'CENDAWAN (Kebun)',
    objects: [
      { id: 'cendawan', img: '../../../../assets/images/cendawan.png', correct: true },
      { id: 'cili', img: '../../../../assets/images/cili.png', correct: true },
      { id: 'cabai', img: '../../../../assets/images/cabai.png', correct: true },
      { id: 'cacing', img: '../../../../assets/images/cacing.png', correct: true },
      { id: 'cicak', img: '../../../../assets/images/cicak.png', correct: true },
      { id: 'cawan', img: '../../../../assets/images/cawan.png', correct: false },
      { id: 'cermin', img: '../../../../assets/images/cermin.png', correct: false },
      { id: 'mainan', img: '../../../../assets/images/mainan.png', correct: false }
    ]
  },
  {
    letter: { big: 'B', small: 'b' },
    theme: 'BUNGA (Taman)',
    objects: [
      { id: 'bunga', img: '../../../../assets/images/bunga.png', correct: true },
      { id: 'buah', img: '../../../../assets/images/buah.png', correct: true },
      { id: 'benih', img: '../../../../assets/images/benih.png', correct: true },
      { id: 'batang', img: '../../../../assets/images/batang.png', correct: true },
      { id: 'bebatuan', img: '../../../../assets/images/bebatuan.png', correct: true },
      { id: 'buku', img: '../../../../assets/images/buku.png', correct: false },
      { id: 'balon', img: '../../../../assets/images/balon.png', correct: false },
      { id: 'mainan', img: '../../../../assets/images/mainan.png', correct: false }
    ]
  },
  {
    letter: { big: 'P', small: 'p' },
    theme: 'POKOK (Taman)',
    objects: [
      { id: 'pokok', img: '../../../../assets/images/pokok.png', correct: true },
      { id: 'pagar', img: '../../../../assets/images/pagar.png', correct: true },
      { id: 'pot', img: '../../../../assets/images/pot.png', correct: true },
      { id: 'penyiram', img: '../../../../assets/images/penyiram.png', correct: true },
      { id: 'pisau', img: '../../../../assets/images/pisau.png', correct: true },
      { id: 'paku', img: '../../../../assets/images/paku.png', correct: false },
      { id: 'pemalas', img: '../../../../assets/images/pemalas.png', correct: false },
      { id: 'mainan', img: '../../../../assets/images/mainan.png', correct: false }
    ]
  }
];

const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const scoreDisplay = document.getElementById('scoreDisplay');
const nextBtnContainer = document.getElementById('nextBtnContainer');
const objectsContainer = document.getElementById('objectsContainer');
const gameTitle = document.getElementById('gameTitle');
const letterBig = document.getElementById('letterBig');
const letterSmall = document.getElementById('letterSmall');

let selectedItems = [];

function initGame() {
  const gameData = levels[currentLevel];
  correctAnswers = 0;
  selectedItems = [];
  
  gameTitle.textContent = gameData.theme;
  letterBig.textContent = gameData.letter.big;
  letterSmall.textContent = gameData.letter.small;

  objectsContainer.innerHTML = '';

  // Ambil 5 object yang betul dan 3 yang salah, kemudian randomkan
  const correctObjects = gameData.objects.filter(o => o.correct);
  const wrongObjects = gameData.objects.filter(o => !o.correct);
  
  // Shuffle correct objects
  const shuffledCorrect = correctObjects.sort(() => Math.random() - 0.5);
  // Shuffle wrong objects
  const shuffledWrong = wrongObjects.sort(() => Math.random() - 0.5);
  
  // Combine dan randomkan semuanya
  const allObjects = [...shuffledCorrect, ...shuffledWrong].sort(() => Math.random() - 0.5);

  allObjects.forEach((obj, index) => {
    const div = document.createElement('div');
    div.className = `object-item pos-${index}`;
    div.dataset.id = obj.id;
    div.dataset.correct = obj.correct;

    const img = document.createElement('img');
    img.src = obj.img;
    img.alt = obj.id;

    div.appendChild(img);
    div.addEventListener('click', () => selectObject(div, obj));

    objectsContainer.appendChild(div);
  });

  nextBtnContainer.style.display = 'none';
}

function selectObject(element, obj) {
  if (element.classList.contains('selected') || element.classList.contains('wrong')) {
    return;
  }

  const gameData = levels[currentLevel];

  if (obj.correct) {
    element.classList.add('selected');
    selectedItems.push(obj.id);
    correctAnswers++;
    updateScore(10);
    showMessage('🎉 Betul!', 'correct');

    const totalCorrect = gameData.objects.filter(o => o.correct).length;
    if (correctAnswers >= totalCorrect) {
      setTimeout(() => {
        endGame();
      }, 1500);
    }
  } else {
    element.classList.add('wrong');
    showMessage('❌ Cuba lagi!', 'wrong');

    setTimeout(() => {
      element.classList.remove('wrong');
    }, 1000);
  }
}

function updateScore(points) {
  score += points;
  scoreDisplay.textContent = score;
}

function showMessage(text, type) {
  messageText.textContent = text;
  messageBox.className = 'message show ' + type;
  setTimeout(() => {
    messageBox.classList.remove('show');
  }, 1500);
}

function endGame() {
  const gameData = levels[currentLevel];
  const totalCorrect = gameData.objects.filter(o => o.correct).length;
  
  if (currentLevel < levels.length - 1) {
    showMessage(`🎊 Tamat! Markah: ${score}`, 'correct');
    nextBtnContainer.style.display = 'block';
  } else {
    showMessage(`🎊 Semua Level Selesai! Markah Akhir: ${score}`, 'correct');
    setTimeout(() => {
      if (confirm('Main semula?')) {
        currentLevel = 0;
        score = 0;
        scoreDisplay.textContent = score;
        initGame();
      }
    }, 2000);
  }
}

function nextLevel() {
  currentLevel++;
  if (currentLevel < levels.length) {
    initGame();
  }
}

initGame();