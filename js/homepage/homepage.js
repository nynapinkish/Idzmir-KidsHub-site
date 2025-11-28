// ============================================
// IDZMIR KIDS HUB - HOMEPAGE.JS (COMPLETE VERSION)
// ============================================

let currentStudent = null;
let studentSpiderData = null;
let hoveredConcept = null;

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

// ================= PAGE LOAD - CHECK LOGIN FIRST =================
window.addEventListener('DOMContentLoaded', () => {
  console.log('🎓 Homepage Loaded');
  
  const userName = sessionStorage.getItem('userName');
  const userRole = sessionStorage.getItem('userRole');
  const studentId = sessionStorage.getItem('studentId');
  const userAge = sessionStorage.getItem('userAge');
  
  if (!userName || userRole !== 'student') {
    console.log('❌ No student logged in - redirecting to main page');
    redirectToLogin();
    return;
  }
  
  currentStudent = {
    username: userName,
    studentId: studentId,
    age: userAge
  };
  
  console.log('✅ Student detected:', currentStudent);
  updateHeaderProfile();
  
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  
  if (!hasSeenWelcome) {
    console.log('✨ First time visitor - showing Welcome Parents modal');
    showWelcomeParentsAutomatic();
  } else {
    console.log('👋 Returning visitor - ready to play!');
  }
});

// ================= REDIRECT TO LOGIN =================
function redirectToLogin() {
  alert('🔒 Please login first to access the educational website!');
  window.location.href = '../../html/Mainpage/mainpage.html';
}

// ================= SHOW WELCOME PARENTS AUTOMATICALLY =================
function showWelcomeParentsAutomatic() {
  const modalOverlay = document.getElementById('modalOverlay');
  const welcomeParents = document.getElementById('welcomeParents');
  const heyThere = document.getElementById('heyThere');
  
  if (!modalOverlay || !welcomeParents) {
    console.error('❌ Welcome modal not found');
    return;
  }
  
  if (heyThere) heyThere.style.display = 'none';
  
  modalOverlay.style.display = 'flex';
  welcomeParents.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  localStorage.setItem('hasSeenWelcome', 'true');
  
  const autoCloseTimer = setTimeout(() => {
    closeWelcomeModal();
  }, 8000);
  
  welcomeParents.addEventListener('click', function() {
    clearTimeout(autoCloseTimer);
    closeWelcomeModal();
  }, { once: true });
}

// ================= CLOSE WELCOME MODAL =================
function closeWelcomeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  const welcomeParents = document.getElementById('welcomeParents');
  
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
  
  if (!currentStudent) {
    redirectToLogin();
    return;
  }
  
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

// ================= SPIDER WEB FUNCTIONS =================
async function openSpiderWeb(section) {
  console.log('🕷️ Opening spider web for:', section);
  
  const overlay = document.getElementById('spiderWebOverlay');
  if (!overlay) {
    console.error('❌ Spider web overlay not found');
    return;
  }
  
  const studentId = sessionStorage.getItem('studentId');
  const userName = sessionStorage.getItem('userName');
  
  if (!studentId || !userName) {
    alert('Please login first!');
    return;
  }
  
  document.getElementById('studentName').textContent = 'Loading...';
  document.getElementById('overallPercentage').textContent = '...';
  
  overlay.classList.add('active');
  
  await fetchStudentProgress(studentId, userName);
  
  drawSpiderWeb();
  generateConceptCards();
  updateOverallProgress();
}

function closeSpiderWeb() {
  const overlay = document.getElementById('spiderWebOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

async function fetchStudentProgress(studentId, userName) {
  try {
    console.log('📡 Fetching data for:', studentId);
    
    const db = firebase.firestore();
    const studentQuery = await db.collection('students')
      .where('studentId', '==', studentId)
      .get();
    
    if (studentQuery.empty) {
      console.warn('⚠️ Student not found in Firebase');
      studentSpiderData = getEmptyData(userName);
      return;
    }
    
    const studentDoc = studentQuery.docs[0];
    const data = studentDoc.data();
    
    console.log('✅ Student data fetched:', data);
    
    studentSpiderData = {
      username: data.username || userName,
      spiderWebData: {}
    };
    
    const conceptProgress = data.conceptProgress || {};
    
    Object.keys(CONCEPT_STRUCTURE).forEach(concept => {
      const conceptName = `${concept} Concepts`;
      const maxScore = CONCEPT_STRUCTURE[concept].maxScore;
      
      let score = 0;
      
      if (conceptProgress[conceptName]) {
        score = conceptProgress[conceptName].totalScore || 0;
      }
      
      const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      
      studentSpiderData.spiderWebData[conceptName] = {
        score: score,
        maxScore: maxScore,
        percentage: percentage
      };
    });
    
    console.log('📊 Spider data prepared:', studentSpiderData);
    
  } catch (error) {
    console.error('❌ Error fetching student data:', error);
    studentSpiderData = getEmptyData(userName);
  }
}

function getEmptyData(userName) {
  const emptyData = {
    username: userName,
    spiderWebData: {}
  };
  
  Object.keys(CONCEPT_STRUCTURE).forEach(concept => {
    const conceptName = `${concept} Concepts`;
    emptyData.spiderWebData[conceptName] = {
      score: 0,
      maxScore: CONCEPT_STRUCTURE[concept].maxScore,
      percentage: 0
    };
  });
  
  return emptyData;
}

function updateOverallProgress() {
  if (!studentSpiderData) return;
  
  const values = Object.values(studentSpiderData.spiderWebData);
  const avg = values.reduce((sum, item) => sum + item.percentage, 0) / values.length;
  
  document.getElementById('overallPercentage').textContent = Math.round(avg) + '%';
  document.getElementById('studentName').textContent = studentSpiderData.username;
}

function generateConceptCards() {
  if (!studentSpiderData) return;
  
  const container = document.getElementById('conceptCards');
  container.innerHTML = '';
  
  Object.keys(CONCEPT_STRUCTURE).forEach(concept => {
    const fullName = `${concept} Concepts`;
    const data = studentSpiderData.spiderWebData[fullName];
    
    if (!data) return;
    
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

function setHoveredConcept(concept) {
  hoveredConcept = concept;
  const fullName = `${concept} Concepts`;
  const data = studentSpiderData.spiderWebData[fullName];
  
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

function drawSpiderWeb() {
  if (!studentSpiderData) return;
  
  const svg = document.getElementById('spiderWebSVG');
  const concepts = Object.keys(CONCEPT_STRUCTURE);
  const numPoints = concepts.length;
  const centerX = 200;
  const centerY = 200;
  const maxRadius = 140;
  const levels = 5;
  
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
  
  svg.innerHTML = `
    <defs>
      <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1e3a8a;stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:#003e8d;stop-opacity:0.6" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
  `;
  
  for (let i = 1; i <= levels; i++) {
    const radius = (maxRadius * i) / levels;
    const percentage = (100 * i) / levels;
    const points = [];
    
    for (let j = 0; j < numPoints; j++) {
      const point = getAxisPoint(j, radius);
      points.push(`${point.x},${point.y}`);
    }
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points.join(' '));
    polygon.setAttribute('fill', 'none');
    polygon.setAttribute('stroke', i === levels ? '#003e8d' : '#e0f2fe');
    polygon.setAttribute('stroke-width', i === levels ? '2' : '1');
    polygon.setAttribute('opacity', i === levels ? '0.6' : '0.3');
    svg.appendChild(polygon);
    
    if (i === levels || i === Math.floor(levels / 2)) {
      const labelPoint = getAxisPoint(0, radius);
      const percentText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      percentText.setAttribute('x', labelPoint.x + 10);
      percentText.setAttribute('y', labelPoint.y - 5);
      percentText.setAttribute('fill', '#64748b');
      percentText.setAttribute('font-size', '11');
      percentText.setAttribute('font-weight', '600');
      percentText.setAttribute('font-family', 'Poppins');
      percentText.textContent = Math.round(percentage) + '%';
      svg.appendChild(percentText);
    }
  }
  
  concepts.forEach((concept, index) => {
    const end = getAxisPoint(index, maxRadius);
    const isHovered = hoveredConcept === concept;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', centerX);
    line.setAttribute('y1', centerY);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('stroke', isHovered ? '#ffd032' : '#003e8d');
    line.setAttribute('stroke-width', isHovered ? '2.5' : '1.5');
    line.setAttribute('opacity', isHovered ? '1' : '0.4');
    svg.appendChild(line);
  });
  
  const dataPoints = concepts.map((concept, index) => {
    const fullName = `${concept} Concepts`;
    const data = studentSpiderData.spiderWebData[fullName] || { percentage: 0 };
    return getDataPoint(index, data.percentage);
  });
  
  const dataPolygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  dataPolygon.setAttribute('points', dataPoints.map(p => `${p.x},${p.y}`).join(' '));
  dataPolygon.setAttribute('fill', 'url(#blueGradient)');
  dataPolygon.setAttribute('fill-opacity', '0.5');
  dataPolygon.setAttribute('stroke', '#003e8d');
  dataPolygon.setAttribute('stroke-width', '2.5');
  dataPolygon.setAttribute('filter', 'url(#glow)');
  svg.appendChild(dataPolygon);
  
  dataPoints.forEach((point, index) => {
    const concept = concepts[index];
    const isHovered = hoveredConcept === concept;
    const fullName = `${concept} Concepts`;
    const data = studentSpiderData.spiderWebData[fullName];
    
    if (isHovered) {
      const hoverGlow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      hoverGlow.setAttribute('cx', point.x);
      hoverGlow.setAttribute('cy', point.y);
      hoverGlow.setAttribute('r', '15');
      hoverGlow.setAttribute('fill', '#ffd032');
      hoverGlow.setAttribute('opacity', '0.3');
      hoverGlow.setAttribute('filter', 'url(#glow)');
      svg.appendChild(hoverGlow);
    }
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', point.x);
    circle.setAttribute('cy', point.y);
    circle.setAttribute('r', isHovered ? '7' : '5');
    circle.setAttribute('fill', isHovered ? '#ffd032' : '#003e8d');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '2.5');
    svg.appendChild(circle);
    
    const labelPoint = getAxisPoint(index, maxRadius + 60);
    
    const text1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text1.setAttribute('x', labelPoint.x);
    text1.setAttribute('y', labelPoint.y);
    text1.setAttribute('text-anchor', 'middle');
    text1.setAttribute('fill', isHovered ? '#003e8d' : '#64748b');
    text1.setAttribute('font-size', isHovered ? '13' : '11');
    text1.setAttribute('font-weight', '700');
    text1.setAttribute('font-family', 'Poppins');
    text1.textContent = concept;
    svg.appendChild(text1);
    
    const percentBgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const percentText = data.percentage + '%';
    const textWidth = percentText.length * 10;
    
    percentBgRect.setAttribute('x', labelPoint.x - textWidth / 2);
    percentBgRect.setAttribute('y', labelPoint.y + 4);
    percentBgRect.setAttribute('width', textWidth);
    percentBgRect.setAttribute('height', '20');
    percentBgRect.setAttribute('fill', isHovered ? '#ffd032' : '#003e8d');
    percentBgRect.setAttribute('rx', '8');
    percentBgRect.setAttribute('opacity', '0.9');
    svg.appendChild(percentBgRect);
    
    const text2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text2.setAttribute('x', labelPoint.x);
    text2.setAttribute('y', labelPoint.y + 19);
    text2.setAttribute('text-anchor', 'middle');
    text2.setAttribute('fill', 'white');
    text2.setAttribute('font-size', '13');
    text2.setAttribute('font-weight', '800');
    text2.setAttribute('font-family', 'Poppins');
    text2.textContent = percentText;
    svg.appendChild(text2);
    
    const text3 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text3.setAttribute('x', labelPoint.x);
    text3.setAttribute('y', labelPoint.y + 35);
    text3.setAttribute('text-anchor', 'middle');
    text3.setAttribute('fill', '#64748b');
    text3.setAttribute('font-size', '10');
    text3.setAttribute('font-weight', '600');
    text3.setAttribute('font-family', 'Poppins');
    text3.textContent = `${data.score}/${data.maxScore}`;
    svg.appendChild(text3);
  });
  
  const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  center.setAttribute('cx', centerX);
  center.setAttribute('cy', centerY);
  center.setAttribute('r', '6');
  center.setAttribute('fill', '#003e8d');
  svg.appendChild(center);
}

// ================= SIGNUP FUNCTIONS =================
function goToExplorerName() {
  const heyThere = document.getElementById('heyThere');
  const explorerName = document.getElementById('explorerName');
  heyThere.style.display = 'none';
  explorerName.style.display = 'block';
  setTimeout(() => document.getElementById('nameInput').focus(), 100);
}

function closeLater() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function handleNameKeyPress(event) {
  if (event.key === 'Enter') setExplorerNameNew();
}

function setExplorerNameNew() {
  const nameInput = document.getElementById('nameInput');
  const nameSuccess = document.getElementById('nameSuccess');
  const name = nameInput.value.trim();
  if (!name) { alert('Please enter your name! 😊'); return; }
  sessionStorage.setItem('userName', name);
  sessionStorage.setItem('userRole', 'student');
  nameSuccess.style.display = 'block';
  console.log('✅ Name saved:', name);
}

function continueToAge() {
  const userName = sessionStorage.getItem('userName');
  if (!userName) { alert('Please set your name first! 😊'); return; }
  const modalOverlay = document.getElementById('modalOverlay');
  const explorerName = document.getElementById('explorerName');
  const ageModal = document.getElementById('ageModal');
  modalOverlay.style.display = 'none';
  explorerName.style.display = 'none';
  ageModal.style.display = 'flex';
}

function selectAge(age, button) {
  sessionStorage.setItem('userAge', age);
  document.querySelectorAll('.age-options button').forEach(btn => btn.style.background = '');
  button.style.background = '#4CAF50';
  const ageMessage = document.getElementById('ageMessage');
  ageMessage.textContent = `Great! You're ${age} years old!`;
  setTimeout(() => continueToAnimal(), 1000);
}

function continueToAnimal() {
  const ageModal = document.getElementById('ageModal');
  const animalModal = document.getElementById('animalModal');
  ageModal.style.display = 'none';
  animalModal.style.display = 'flex';
}

function selectAnimal(animal, img) {
  sessionStorage.setItem('userAnimal', animal.toLowerCase());
  document.querySelectorAll('.animal').forEach(a => a.style.border = '');
  img.style.border = '4px solid #4CAF50';
  const animalMessage = document.getElementById('animalMessage');
  animalMessage.textContent = `${animal} is your buddy now! 🎉`;
}

function finishSignup() {
  const userName = sessionStorage.getItem('userName');
  const userAge = sessionStorage.getItem('userAge');
  const userAnimal = sessionStorage.getItem('userAnimal');
  if (!userName || !userAge || !userAnimal) { alert('Please complete all steps! 😊'); return; }
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

// Make functions global
window.openSpiderWeb = openSpiderWeb;
window.closeSpiderWeb = closeSpiderWeb;

console.log('✅ Homepage.js loaded with login protection!');