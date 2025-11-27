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

// Data Structure
const CONCEPT_STRUCTURE = {
  'Spatial': { maxScore: 20 },
  'Relational': { maxScore: 62 },
  'Quantitative': { maxScore: 11 },
  'Qualitative': { maxScore: 20 },
  'Temporal': { maxScore: 6 },
  'Color & Shape': { maxScore: 10 },
  'Comparative': { maxScore: 7 },
  'Social': { maxScore: 11 }
};

// Mock Student Data (Replace dengan data dari Firebase)
const studentData = {
  username: 'Ahmad bin Ali',
  spiderWebData: {
    'Spatial Concepts': { score: 15, maxScore: 20, percentage: 75 },
    'Relational Concepts': { score: 45, maxScore: 62, percentage: 73 },
    'Quantitative Concepts': { score: 8, maxScore: 11, percentage: 73 },
    'Qualitative Concepts': { score: 12, maxScore: 20, percentage: 60 },
    'Temporal Concepts': { score: 4, maxScore: 6, percentage: 67 },
    'Color & Shape': { score: 8, maxScore: 10, percentage: 80 },
    'Comparative': { score: 5, maxScore: 7, percentage: 71 },
    'Social/Emotional': { score: 7, maxScore: 11, percentage: 64 }
  }
};

let hoveredConcept = null;

// Open/Close Functions
function openSpiderWeb() {
  document.getElementById('spiderWebOverlay').classList.add('active');
  drawSpiderWeb();
  generateConceptCards();
  updateOverallProgress();
}

function closeSpiderWeb() {
  document.getElementById('spiderWebOverlay').classList.remove('active');
}

// Calculate Overall Progress
function updateOverallProgress() {
  const values = Object.values(studentData.spiderWebData);
  const avg = values.reduce((sum, item) => sum + item.percentage, 0) / values.length;
  document.getElementById('overallPercentage').textContent = Math.round(avg) + '%';
  document.getElementById('studentName').textContent = studentData.username;
}

// Generate Concept Cards
function generateConceptCards() {
  const container = document.getElementById('conceptCards');
  container.innerHTML = '';
  
  Object.keys(CONCEPT_STRUCTURE).forEach(concept => {
    const fullName = `${concept} Concepts`;
    const data = studentData.spiderWebData[fullName] || 
                studentData.spiderWebData[concept] || 
                { score: 0, maxScore: CONCEPT_STRUCTURE[concept].maxScore, percentage: 0 };
    
    const card = document.createElement('div');
    card.className = 'concept-card';
    card.onmouseenter = () => setHoveredConcept(concept);
    card.onmouseleave = () => clearHoveredConcept();
    
    card.innerHTML = `
      <h4>${concept}</h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${data.percentage}%"></div>
      </div>
      <div class="concept-stats">
        <span class="concept-score">${data.score}/${data.maxScore}</span>
        <span class="concept-percentage">${data.percentage}%</span>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Hover Handlers
function setHoveredConcept(concept) {
  hoveredConcept = concept;
  const fullName = `${concept} Concepts`;
  const data = studentData.spiderWebData[fullName] || 
              studentData.spiderWebData[concept] || 
              { score: 0, maxScore: CONCEPT_STRUCTURE[concept].maxScore };
  
  const hoverInfo = document.getElementById('hoverInfo');
  document.getElementById('hoverTitle').textContent = fullName;
  document.getElementById('hoverText').textContent = `${data.score} / ${data.maxScore} points`;
  hoverInfo.style.display = 'block';
  
  drawSpiderWeb();
}

function clearHoveredConcept() {
  hoveredConcept = null;
  document.getElementById('hoverInfo').style.display = 'none';
  drawSpiderWeb();
}

// Draw Spider Web
function drawSpiderWeb() {
  const svg = document.getElementById('spiderWebSVG');
  const concepts = Object.keys(CONCEPT_STRUCTURE);
  const numPoints = concepts.length;
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 140;
  const levels = 5;
  
  // Helper Functions
  const getAxisPoint = (index, radius) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };
  
  const getDataPoint = (index, percentage) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const radius = (maxRadius * percentage) / 100;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  };
  
  // Clear SVG
  svg.innerHTML = `
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#21537c;stop-opacity:0.6" />
        <stop offset="100%" style="stop-color:#003e8d;stop-opacity:0.8" />
      </linearGradient>
    </defs>
  `;
  
  // Draw Web Circles
  for (let i = 1; i <= levels; i++) {
    const radius = (maxRadius * i) / levels;
    const points = [];
    for (let j = 0; j < numPoints; j++) {
      const point = getAxisPoint(j, radius);
      points.push(`${point.x},${point.y}`);
    }
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.join(' '));
    polygon.setAttribute('fill', 'none');
    polygon.setAttribute('stroke', i === levels ? '#21537c' : '#cbd5e1');
    polygon.setAttribute('stroke-width', i === levels ? '2' : '1');
    polygon.setAttribute('opacity', i === levels ? '0.8' : '0.4');
    svg.appendChild(polygon);
  }
  
  // Draw Axis Lines
  concepts.forEach((concept, index) => {
    const end = getAxisPoint(index, maxRadius);
    const isHovered = hoveredConcept === concept;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', isHovered ? '#fbbf24' : '#21537c');
    line.setAttribute('stroke-width', isHovered ? '3' : '1.5');
    line.setAttribute('opacity', isHovered ? '1' : '0.5');
    svg.appendChild(line);
  });
  
  // Draw Data Polygon
  const dataPoints = concepts.map((concept, index) => {
    const fullName = `${concept} Concepts`;
    const data = studentData.spiderWebData[fullName] || 
                studentData.spiderWebData[concept] || 
                { percentage: 0 };
    return getDataPoint(index, data.percentage);
  });
  
  const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  dataPolygon.setAttribute('points', dataPoints.map(p => `${p.x},${p.y}`).join(' '));
  dataPolygon.setAttribute('fill', 'url(#blueGradient)');
  dataPolygon.setAttribute('fill-opacity', '0.4');
  dataPolygon.setAttribute('stroke', '#003e8d');
  dataPolygon.setAttribute('stroke-width', '3');
  svg.appendChild(dataPolygon);
  
  // Draw Data Points
  dataPoints.forEach((point, index) => {
    const concept = concepts[index];
    const isHovered = hoveredConcept === concept;
    
    if (isHovered) {
      const hoverCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hoverCircle.setAttribute('cx', point.x);
      hoverCircle.setAttribute('cy', point.y);
      hoverCircle.setAttribute('r', '12');
      hoverCircle.setAttribute('fill', '#fbbf24');
      hoverCircle.setAttribute('opacity', '0.3');
      svg.appendChild(hoverCircle);
    }
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', isHovered ? '7' : '5');
    circle.setAttribute('fill', isHovered ? '#fbbf24' : '#003e8d');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '3');
    svg.appendChild(circle);
  });
  
  // Draw Labels
  concepts.forEach((concept, index) => {
    const labelPoint = getAxisPoint(index, maxRadius + 50);
    const fullName = `${concept} Concepts`;
    const data = studentData.spiderWebData[fullName] || 
                studentData.spiderWebData[concept] || 
                { percentage: 0 };
    const isHovered = hoveredConcept === concept;
    
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', labelPoint.x);
    text1.setAttribute('y', labelPoint.y);
    text1.setAttribute('text-anchor', 'middle');
    text1.setAttribute('fill', isHovered ? '#fbbf24' : '#003e8d');
    text1.setAttribute('font-size', isHovered ? '14' : '12');
    text1.setAttribute('font-weight', '700');
    text1.textContent = concept;
    svg.appendChild(text1);
    
    const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', labelPoint.x);
    text2.setAttribute('y', labelPoint.y + 18);
    text2.setAttribute('text-anchor', 'middle');
    text2.setAttribute('fill', '#fbbf24');
    text2.setAttribute('font-size', '16');
    text2.setAttribute('font-weight', '800');
    text2.textContent = data.percentage + '%';
    svg.appendChild(text2);
  });
  
  // Center Point
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('cx', centerX);
  center.setAttribute('cy', centerY);
  center.setAttribute('r', '6');
  center.setAttribute('fill', '#003e8d');
  svg.appendChild(center);
}

// Close on outside click
document.getElementById('spiderWebOverlay').addEventListener('click', function(e) {
  if (e.target === this) {
    closeSpiderWeb();
  }
});
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