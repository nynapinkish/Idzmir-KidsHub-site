// script.js - common for site
function initAlphabetPage() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  const grid = document.getElementById('alphaGrid');
  if (!grid) return;

  // Clear if already populated
  grid.innerHTML = '';

  letters.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'alpha-tile';
    btn.setAttribute('data-letter', letter);
    btn.innerHTML = `<div class="tile-emoji">🔤</div><div class="tile-letter">${letter}</div>`;
    btn.onclick = () => openAlphaModal(letter);
    grid.appendChild(btn);
  });
}

function openAlphaModal(letter) {
  const modal = document.getElementById('alphaModal');
  const modalLetter = document.getElementById('modalLetter');
  const modalWord = document.getElementById('modalWord');
  const modalAudio = document.getElementById('modalAudio');

  modalLetter.textContent = letter;
  // Replace this mapping with real words later or load from JSON
  modalWord.textContent = `${letter} is for ${wordFor(letter)}`;
  // audio path (optional). Place mp3 files in assets/audio/a.mp3 etc.
  modalAudio.src = `../assets/audio/${letter.toLowerCase()}.mp3`;
  modalAudio.pause();
  modalAudio.currentTime = 0;

  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');

  // try autoplay (will be blocked if user didn't interact before)
  modalAudio.play().catch(()=>{ /* ignore */ });
}

function closeAlphaModal() {
  const modal = document.getElementById('alphaModal');
  const modalAudio = document.getElementById('modalAudio');
  if (!modal) return;
  if (modalAudio) {
    modalAudio.pause();
    modalAudio.currentTime = 0;
  }
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

function wordFor(letter) {
  // simple placeholder mapping (customize later)
  const map = {
    A: 'Apple', B: 'Ball', C: 'Cat', D: 'Dog', E: 'Egg',
    F: 'Fish', G: 'Goat', H: 'Hat', I: 'Igloo', J: 'Jam',
    K: 'Kite', L: 'Lion', M: 'Moon', N: 'Nest', O: 'Orange',
    P: 'Pig', Q: 'Queen', R: 'Rabbit', S: 'Sun', T: 'Tiger',
    U: 'Umbrella', V: 'Van', W: 'Whale', X: 'Xylophone', Y: 'Yak', Z: 'Zebra'
  };
  return map[letter] || '...';
}

// modal events (attach once)
document.addEventListener('click', function(e){
  const modal = document.getElementById('alphaModal');
  if (!modal) return;
  const closeBtn = document.getElementById('modalClose');
  if (e.target === closeBtn) { closeAlphaModal(); }
  // click outside content closes modal
  if (e.target === modal) closeAlphaModal();
});

// play button
document.addEventListener('DOMContentLoaded', function(){
  const playBtn = document.getElementById('playAudio');
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      const a = document.getElementById('modalAudio');
      if (a) { a.play().catch(()=>{}); }
    });
  }
});
