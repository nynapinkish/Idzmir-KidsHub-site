let canvas, ctx;
let isDrawing = false;
let guideVisible = false;

const currentWord = 'KUNING';
const currentColor = '#FFD700';
let progressStage = 0;

// ====== PAGE LOAD ======
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('traceCanvas');
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  initCanvas();
  drawGuide();
});

// ====== CANVAS SETUP ======
function initCanvas() {
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  canvas.addEventListener('touchstart', handleTouch);
  canvas.addEventListener('touchmove', handleTouch);
  canvas.addEventListener('touchend', stopDrawing);
}

function handleTouch(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent(
    e.type === 'touchstart' ? 'mousedown' : 'mousemove',
    { clientX: touch.clientX, clientY: touch.clientY }
  );
  canvas.dispatchEvent(mouseEvent);
}

// ====== DRAWING ======
function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  ctx.beginPath();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ctx.strokeStyle = currentColor;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineTo(x, y);
  ctx.stroke();

  checkIfComplete(x);
}

function stopDrawing() {
  isDrawing = false;
  ctx.closePath();
}

// ====== GUIDE ======
function drawGuide() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.font = 'bold 150px Poppins, Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (guideVisible) {
    ctx.fillStyle = currentColor;
    ctx.fillText(currentWord, canvas.width / 2, canvas.height / 2);
  } else {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(currentWord, canvas.width / 2, canvas.height / 2);
    ctx.setLineDash([]);
  }
}

function toggleGuide() {
  guideVisible = !guideVisible;
  drawGuide();
  document.getElementById('successMsg').style.display = 'none';
}

// ====== BUTTONS ======
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuide();
  progressStage = 0; // RESET progress bila padam
  const msg = document.getElementById('successMsg');
  msg.style.display = 'none';
}

// ====== PROGRESS CHECK ======
function checkIfComplete(x) {
  const msg = document.getElementById('successMsg');

  // Bahagi ikut huruf (K, U, N, I, N, G)
  const letterZones = [
    canvas.width * 0.08,  // K
    canvas.width * 0.23,  // U
    canvas.width * 0.38,  // N
    canvas.width * 0.53,  // I
    canvas.width * 0.68,  // N
    canvas.width * 0.83   // G
  ];

  // Kalau x coordinate melepasi zone seterusnya → naikkan progress
  if (progressStage < letterZones.length && x > letterZones[progressStage]) {
    progressStage++;
    console.log(`Huruf ${currentWord[progressStage - 1]} siap!`);
  }

  // Bila sampai huruf G (semua huruf siap)
  if (progressStage >= letterZones.length) {
    msg.textContent = '⭐ Tahniah! Anda menjejak perkataan KUNING! ⭐';
    msg.style.display = 'block';
    msg.style.color = '#00c853';
  } 
  else if (progressStage >= 4) {
    msg.textContent = 'Sikit lagi, teruskan! 🔥';
    msg.style.display = 'block';
    msg.style.color = '#ffaa00';
  } 
  else if (progressStage >= 2) {
    msg.textContent = 'Bagus! Teruskan menjejak 💪';
    msg.style.display = 'block';
    msg.style.color = '#ffcc00';
  }
}
