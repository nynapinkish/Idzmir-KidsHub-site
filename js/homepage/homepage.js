// ============================================
// IDZMIR KIDS HUB - HOMEPAGE.JS
// Must login from mainpage first!
// ============================================

let currentStudent = null;

// ================= PAGE LOAD - CHECK LOGIN FIRST =================
window.addEventListener('DOMContentLoaded', () => {
  console.log('🎓 Homepage Loaded');
  
  // CHECK IF USER LOGGED IN FROM MAINPAGE
  const userName = sessionStorage.getItem('userName');
  const userRole = sessionStorage.getItem('userRole');
  const studentId = sessionStorage.getItem('studentId');
  const userAge = sessionStorage.getItem('userAge');
  
  if (!userName || userRole !== 'student') {
    // NOT LOGGED IN - REDIRECT TO MAINPAGE
    console.log('❌ No student logged in - redirecting to main page');
    redirectToLogin();
    return;
  }
  
  // USER IS LOGGED IN
  currentStudent = {
    username: userName,
    studentId: studentId,
    age: userAge
  };
  
  console.log('✅ Student detected:', currentStudent);
  updateHeaderProfile();
  
  // Check if this is first visit (for Welcome Parents modal)
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  
  if (!hasSeenWelcome) {
    // FIRST TIME VISIT - Show Welcome Parents Modal
    console.log('✨ First time visitor - showing Welcome Parents modal');
    showWelcomeParentsAutomatic();
  } else {
    // RETURNING VISITOR
    console.log('👋 Returning visitor - ready to play!');
  }
});

// ================= REDIRECT TO LOGIN =================
function redirectToLogin() {
  alert('🔒 Please login first to access the educational website!');
  window.location.href = '../../html/Mainpage/mainpage.html';
}

// ================= SHOW WELCOME PARENTS AUTOMATICALLY (FIRST TIME) =================
function showWelcomeParentsAutomatic() {
  const modalOverlay = document.getElementById('modalOverlay');
  const welcomeParents = document.getElementById('welcomeParents');
  const heyThere = document.getElementById('heyThere');
  
  if (!modalOverlay || !welcomeParents) {
    console.error('❌ Welcome modal not found');
    return;
  }
  
  // Hide Hey There modal (we don't need it)
  if (heyThere) {
    heyThere.style.display = 'none';
  }
  
  // Show Welcome Parents modal
  modalOverlay.style.display = 'flex';
  welcomeParents.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  // Mark as seen
  localStorage.setItem('hasSeenWelcome', 'true');
  
  // Auto close after 8 seconds
  const autoCloseTimer = setTimeout(() => {
    closeWelcomeModal();
  }, 8000);
  
  // Click anywhere to close faster
  welcomeParents.addEventListener('click', function() {
    clearTimeout(autoCloseTimer);
    closeWelcomeModal();
  }, { once: true });
}

// ================= CLOSE WELCOME MODAL =================
function closeWelcomeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const welcomeParents = document.getElementById('welcomeParents');
  
  // Close modal
  modalOverlay.style.display = 'none';
  welcomeParents.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  console.log('✅ Welcome modal closed - ready to play!');
}

// ================= UPDATE HEADER PROFILE =================
function updateHeaderProfile() {
  const profileNameEl = document.getElementById('profileName');
  const profilePicEl = document.getElementById('profilePic');
  const userProfile = document.getElementById('userProfile');
  
  if (profileNameEl && currentStudent) {
    profileNameEl.textContent = currentStudent.username;
  }
  
  // Get or set animal buddy
  let userAnimal = sessionStorage.getItem('userAnimal');
  if (!userAnimal) {
    const animals = ['lion', 'elephant', 'tiger'];
    userAnimal = animals[Math.floor(Math.random() * animals.length)];
    sessionStorage.setItem('userAnimal', userAnimal);
  }
  
  if (profilePicEl) {
    profilePicEl.src = `../../assets/images/${userAnimal}.png`;
  }
  
  if (userProfile) {
    userProfile.style.display = 'flex';
  }
}

// ================= HANDLE CARD CLICK =================
function handleCardClick(cardId) {
  console.log('🎮 Card clicked:', cardId);
  
  // Check if still logged in
  if (!currentStudent) {
    redirectToLogin();
    return;
  }
  
  // Navigate to game
  navigateToGame(cardId);
}

// ================= NAVIGATE TO GAME =================
function navigateToGame(cardId) {
  const gameRoutes = {
    'spatial': '../homepage/spatialConcepts.html',
    'quantitative': '../homepage/quantitativeConcepts.html',
    'qualitative': '../homepage/qualitativeConcepts.html',
    'temporal': '../homepage/temporalConcepts.html',
    'color-shape': '../homepage/colorShapeConcepts.html',
    'relational': '../homepage/relationalConcepts.html',
    'social-emotional': '../homepage/socialEmoConcepts.html',
    'sensory': '../homepage/TherapyCard/SensoryProcessing.html',
    'gross': '../homepage/TherapyCard/gross-motor.html',
    'social': '../homepage/TherapyCard/social-play.html',
    'fine-motor': '../homepage/TherapyCard/fine-motor.html',
    'communication': '../homepage/TherapyCard/communication.html',
    'cognitive': '../homepage/TherapyCard/cognitive.html',
    'living': '../homepage/TherapyCard/living.html',
    'instrumental': '../homepage/TherapyCard/instrumental.html',
    'winter': '../seasonal/winter/winter.html',
    'spring': '../seasonal/spring/spring.html',
    'summer': '../seasonal/summer/summer.html',
    'autumn': '../seasonal/autumn/autumn.html',
    'calendar': '../seasonal/calendar/calendar.html'
  };
  
  const gameUrl = gameRoutes[cardId];
  if (gameUrl) {
    window.location.href = gameUrl;
  } else {
    console.log('Game for', cardId, 'not yet available');
    alert('This game will be available soon! 🎮');
  }
}

// ================= TOGGLE USER MENU =================
function toggleUserMenu() {
  const userName = sessionStorage.getItem('userName');
  const userAge = sessionStorage.getItem('userAge');
  const userAnimal = sessionStorage.getItem('userAnimal');
  
  if (userName) {
    alert(`🎮 Explorer Profile:\n\nName: ${userName}\nAge: ${userAge}\nBuddy: ${userAnimal || 'None'}`);
  }
}

// ================= OPTIONAL: Keep signup functions for future use =================
function goToExplorerName() {
  const heyThere = document.getElementById('heyThere');
  const explorerName = document.getElementById('explorerName');
  
  heyThere.style.display = 'none';
  explorerName.style.display = 'block';
  
  setTimeout(() => {
    document.getElementById('nameInput').focus();
  }, 100);
}

function closeLater() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function handleNameKeyPress(event) {
  if (event.key === 'Enter') {
    setExplorerNameNew();
  }
}

function setExplorerNameNew() {
  const nameInput = document.getElementById('nameInput');
  const nameSuccess = document.getElementById('nameSuccess');
  const name = nameInput.value.trim();
  
  if (!name) {
    alert('Please enter your name! 😊');
    return;
  }
  
  sessionStorage.setItem('userName', name);
  sessionStorage.setItem('userRole', 'student');
  nameSuccess.style.display = 'block';
  
  console.log('✅ Name saved:', name);
}

function continueToAge() {
  const userName = sessionStorage.getItem('userName');
  
  if (!userName) {
    alert('Please set your name first! 😊');
    return;
  }
  
  const modalOverlay = document.getElementById('modalOverlay');
  const explorerName = document.getElementById('explorerName');
  const ageModal = document.getElementById('ageModal');
  
  modalOverlay.style.display = 'none';
  explorerName.style.display = 'none';
  ageModal.style.display = 'flex';
}

function selectAge(age, button) {
  sessionStorage.setItem('userAge', age);
  
  document.querySelectorAll('.age-options button').forEach(btn => {
    btn.style.background = '';
  });
  button.style.background = '#4CAF50';
  
  const ageMessage = document.getElementById('ageMessage');
  ageMessage.textContent = `Great! You're ${age} years old!`;
  
  setTimeout(() => {
    continueToAnimal();
  }, 1000);
}

function continueToAnimal() {
  const ageModal = document.getElementById('ageModal');
  const animalModal = document.getElementById('animalModal');
  
  ageModal.style.display = 'none';
  animalModal.style.display = 'flex';
}

function selectAnimal(animal, img) {
  sessionStorage.setItem('userAnimal', animal.toLowerCase());
  
  document.querySelectorAll('.animal').forEach(a => {
    a.style.border = '';
  });
  img.style.border = '4px solid #4CAF50';
  
  const animalMessage = document.getElementById('animalMessage');
  animalMessage.textContent = `${animal} is your buddy now! 🎉`;
}

function finishSignup() {
  const userName = sessionStorage.getItem('userName');
  const userAge = sessionStorage.getItem('userAge');
  const userAnimal = sessionStorage.getItem('userAnimal');
  
  if (!userName || !userAge || !userAnimal) {
    alert('Please complete all steps! 😊');
    return;
  }
  
  const animalModal = document.getElementById('animalModal');
  animalModal.style.display = 'none';
  showFinalResult();
}

function showFinalResult() {
  const lastResultPopup = document.getElementById('lastResultPopup');
  const resultName = document.getElementById('resultName');
  const resultAge = document.getElementById('resultAge');
  const resultBuddy = document.getElementById('resultBuddy');
  const resultImage = document.getElementById('resultImage');
  
  const userName = sessionStorage.getItem('userName');
  const userAge = sessionStorage.getItem('userAge');
  const userAnimal = sessionStorage.getItem('userAnimal');
  
  resultName.textContent = userName;
  resultAge.textContent = userAge + ' years';
  resultBuddy.textContent = userAnimal.charAt(0).toUpperCase() + userAnimal.slice(1);
  resultImage.src = `../../assets/images/${userAnimal}.png`;
  
  lastResultPopup.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeLastResult() {
  const lastResultPopup = document.getElementById('lastResultPopup');
  lastResultPopup.style.display = 'none';
  document.body.style.overflow = 'auto';
  
  updateHeaderProfile();
  console.log('🎉 Signup complete!');
}

// ================= RESET FOR TESTING =================
// Uncomment to test first-time experience:
// localStorage.removeItem('hasSeenWelcome');
// sessionStorage.clear();

console.log('✅ Homepage.js loaded with login protection!');