// Game state
let score = 0;
let draggedElement = null;

// Update score display
function updateScore(points) {
  score += points;
  document.querySelector('.score-display').textContent = `Skor: ${score}`;
}

// Initialize drag and drop
function initDragAndDrop() {
  const draggableItems = document.querySelectorAll('.icon-item');
  const dropzones = document.querySelectorAll('.dropzone-circle');

  // Drag start
  draggableItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedElement = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.target.innerHTML);
    });

    item.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
    });
  });

  // Drop zones
  dropzones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');

      if (!zone.classList.contains('filled') && draggedElement) {
        const itemType = draggedElement.getAttribute('data-type');
        const jarType = zone.closest('.dropzone-container').getAttribute('data-jar-type');

        // Check if correct jar
        if (itemType === jarType) {
          // Correct placement
          const imgClone = draggedElement.querySelector('img').cloneNode(true);
          zone.appendChild(imgClone);
          zone.classList.add('filled');
          
          // Remove original item
          draggedElement.remove();
          
          // Update score
          updateScore(10);
          
          // Play success sound (optional)
          playSuccessSound();
          
          // Check if game completed
          checkGameCompletion();
        } else {
          // Wrong placement
          showWrongMessage();
        }
      }
      
      draggedElement = null;
    });
  });
}

// Play success sound
function playSuccessSound() {
  // Add success sound if you have audio file
  // const audio = new Audio('../../../../../assets/sounds/success.mp3');
  // audio.play();
  console.log('Success!');
}

// Show wrong message
function showWrongMessage() {
  // You can add a visual feedback here
  console.log('Wrong placement!');
  
  // Optional: Show temporary message
  const message = document.createElement('div');
  message.textContent = 'Cuba lagi!';
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 0, 0, 0.8);
    color: white;
    padding: 20px 40px;
    border-radius: 10px;
    font-size: 24px;
    font-weight: bold;
    z-index: 9999;
  `;
  document.body.appendChild(message);
  
  setTimeout(() => {
    message.remove();
  }, 1000);
}

// Check if game is completed
function checkGameCompletion() {
  const totalDropzones = document.querySelectorAll('.dropzone-circle').length;
  const filledDropzones = document.querySelectorAll('.dropzone-circle.filled').length;
  
  if (filledDropzones === totalDropzones) {
    setTimeout(() => {
      showCompletionMessage();
    }, 500);
  }
}

// Show completion message
function showCompletionMessage() {
  const message = document.createElement('div');
  message.innerHTML = `
    <div style="text-align: center;">
      <h2 style="font-size: 36px; margin-bottom: 20px;">🎉 Tahniah! 🎉</h2>
      <p style="font-size: 24px;">Anda telah berjaya!</p>
      <p style="font-size: 20px; margin-top: 10px;">Skor: ${score}</p>
    </div>
  `;
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #FFD700 0%, #FFB400 100%);
    color: #003E8D;
    padding: 40px 60px;
    border-radius: 20px;
    font-family: 'Poppins', sans-serif;
    font-weight: bold;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  `;
  document.body.appendChild(message);
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
  console.log('Jar game initialized!');
});