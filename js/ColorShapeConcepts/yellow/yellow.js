const strokeImage = document.getElementById('strokeImage');
const fruitGrid = document.getElementById('fruitGrid');
const nextButton = document.querySelector('.next-button');

// Audio function
function playAudio(color) {
  const audio = new Audio(`../../../assets/audio/yellow.mp3`);
  audio.play();
}

// Function untuk tunjuk buah
function showFruits() {
  if (!fruitGrid.classList.contains('show')) {
    fruitGrid.classList.add('show');
    const fruits = fruitGrid.querySelectorAll('.fruit img');
    fruits.forEach((img, i) => {
      setTimeout(() => {
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      }, i * 100);
    });
  }
}

// Klik stroke → tunjuk buah
strokeImage.addEventListener('click', showFruits);

// Klik Next → check dulu buah dah muncul ke belum
nextButton.addEventListener('click', () => {
  if (fruitGrid.classList.contains('show')) {
    // Buah dah muncul → pergi ke green.html
    window.location.href = '../green/green.html'; /* ✅ TUKAR PATH */
  } else {
    // Buah belum muncul → tunjuk dulu
    showFruits();
  }
});