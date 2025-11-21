// ---------- VARIABLES ----------
let explorerName = "";
let selectedAge = "";
let animalBuddy = "";
let isUserSignedUp = false;
let welcomeTimeout;
let currentUserId = null; // Store Firebase user ID

// ---------- CHECK IF USER ALREADY SIGNED UP (ON PAGE LOAD) ----------
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if redirected from header to sign up
    const redirectToSignUp = localStorage.getItem('redirectToSignUp');
    if (redirectToSignUp === 'true') {
      localStorage.removeItem('redirectToSignUp');
      showWelcomeFlow();
    }

    // Check localStorage first for quick load
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      explorerName = userData.name;
      selectedAge = userData.age;
      animalBuddy = userData.animal;
      currentUserId = userData.userId;
      isUserSignedUp = true;
      updateProfile();
      console.log('✅ User loaded from cache:', explorerName);
      return; // Exit if found in cache
    }

    // If not in cache, try to get from Firestore
    // But only if user has previously signed up (we need to know the ID)
    const lastUserId = localStorage.getItem('lastUserId');
    if (lastUserId) {
      console.log('Retrieving user from Firestore...');
      const userDoc = await db.collection('users').doc(lastUserId).get();
      
      if (userDoc.exists) {
        const userData = userDoc.data();
        explorerName = userData.name;
        selectedAge = userData.age;
        animalBuddy = userData.animal;
        currentUserId = userData.userId;
        isUserSignedUp = true;
        
        // Save back to localStorage for faster access next time
        localStorage.setItem('currentUser', JSON.stringify({
          userId: userData.userId,
          name: userData.name,
          age: userData.age,
          animal: userData.animal
        }));
        
        updateProfile();
        console.log('✅ User loaded from Firestore:', explorerName);
      }
    }
  } catch (error) {
    console.log('ℹ️ No user found or error loading:', error.message);
  }
});

// ---------- NEW MODAL FLOW ----------
function handleCardClick(cardId) {
  console.log('Card clicked:', cardId);
  
  if (!isUserSignedUp) {
    const overlay = document.getElementById('modalOverlay');
    const welcomeModal = document.getElementById('welcomeParents');
    
    overlay.classList.add('active');
    welcomeModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    welcomeTimeout = setTimeout(() => {
      transitionToHeyThere();
    }, 5000);
    
    welcomeModal.addEventListener('click', skipToHeyThere);
  } else {
    navigateToGame(cardId);
  }
}

function navigateToGame(cardId) {
  const gameRoutes = {
    'spatial': '/html/homepage/spatialConcepts.html',
    'quantitative': '/html/homepage/quantitativeConcepts.html',
    'qualitative': '/html/homepage/qualitativeConcepts.html',
    'temporal': '/html/homepage/temporalConcepts.html',
    'color-shape': '/html/homepage/colorShapeConcepts.html',
    'relational': '/html/homepage/relationalConcepts.html',
    'social-emotional': '/html/homepage/socialEmoConcepts.html',
    'sensory': '/html/homepage/therapy/sensory/sensory.html',
    'gross': '/html/homepage/therapy/gross-motor/gross-motor.html',
    'social': '/html/homepage/therapy/social-play/social-play.html',
    'fine-motor': '/html/homepage/therapy/fine-motor/fine-motor.html',
    'communication': '/html/homepage/therapy/communication/communication.html',
    'cognitive': '/html/homepage/therapy/cognitive/cognitive.html',
    'living': '/html/homepage/therapy/living/living.html',
    'instrumental': '/html/homepage/therapy/instrumental/instrumental.html',
    'winter': '/html/homepage/seasonal/winter/winter.html',
    'spring': '/html/homepage/seasonal/spring/spring.html',
    'summer': '/html/homepage/seasonal/summer/summer.html',
    'autumn': '/html/homepage/seasonal/autumn/autumn.html',
    'calendar': '/html/homepage/seasonal/calendar/calendar.html'
  };
  
  const gameUrl = gameRoutes[cardId];
  if (gameUrl) {
    window.location.href = gameUrl;
  } else {
    console.log('Game for', cardId, 'not yet available');
    alert('This game will be available soon! 🎮');
  }
}

function showWelcomeFlow() {
  const overlay = document.getElementById('modalOverlay');
  const welcomeModal = document.getElementById('welcomeParents');
  
  overlay.classList.add('active');
  welcomeModal.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  welcomeTimeout = setTimeout(() => {
    transitionToHeyThere();
  }, 5000);
  
  welcomeModal.addEventListener('click', skipToHeyThere);
}

function skipToHeyThere() {
  clearTimeout(welcomeTimeout);
  transitionToHeyThere();
}

function transitionToHeyThere() {
  const welcomeModal = document.getElementById('welcomeParents');
  const heyThereModal = document.getElementById('heyThere');
  
  welcomeModal.removeEventListener('click', skipToHeyThere);
  welcomeModal.classList.add('fade-out');
  
  setTimeout(() => {
    welcomeModal.style.display = 'none';
    welcomeModal.classList.remove('fade-out', 'active');
    
    heyThereModal.style.display = 'block';
    setTimeout(() => {
      heyThereModal.classList.add('active');
    }, 50);
  }, 300);
}

function goToExplorerName() {
  const heyThereModal = document.getElementById('heyThere');
  const explorerModal = document.getElementById('explorerName');
  
  heyThereModal.classList.add('fade-out');
  
  setTimeout(() => {
    heyThereModal.style.display = 'none';
    heyThereModal.classList.remove('fade-out', 'active');
    
    explorerModal.style.display = 'block';
    setTimeout(() => {
      explorerModal.classList.add('active');
      document.getElementById('nameInput').focus();
    }, 50);
  }, 300);
}

function closeLater() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
  
  setTimeout(() => {
    document.getElementById('welcomeParents').style.display = 'block';
    document.getElementById('heyThere').style.display = 'none';
    document.getElementById('explorerName').style.display = 'none';
    
    document.getElementById('welcomeParents').classList.remove('active');
    document.getElementById('heyThere').classList.remove('active');
    document.getElementById('explorerName').classList.remove('active');
  }, 300);
}

function setExplorerNameNew() {
  const nameInput = document.getElementById('nameInput');
  const name = nameInput.value.trim();
  
  if (name) {
    explorerName = name;
    
    const successMsg = document.getElementById('nameSuccess');
    successMsg.classList.add('active');
    
    setTimeout(() => {
      successMsg.classList.remove('active');
    }, 2000);
    
    console.log('Explorer name set:', name);
  } else {
    alert('Please enter your name!');
  }
}

function handleNameKeyPress(event) {
  if (event.key === 'Enter') {
    setExplorerNameNew();
  }
}

function continueToAge() {
  if (!explorerName) {
    alert('Please set your name first!');
    return;
  }
  
  const overlay = document.getElementById('modalOverlay');
  const explorerModal = document.getElementById('explorerName');
  const ageModal = document.getElementById('ageModal');
  
  explorerModal.classList.add('fade-out');
  
  setTimeout(() => {
    overlay.classList.remove('active');
    explorerModal.style.display = 'none';
    explorerModal.classList.remove('fade-out', 'active');
    
    ageModal.style.display = 'flex';
  }, 300);
}

function closeAgeModal() {
  document.getElementById('ageModal').style.display = "none";
}

function openAnimalModal() {
  closeAgeModal();
  document.getElementById('animalModal').style.display = "flex";
}

function closeAnimalModal() {
  document.getElementById('animalModal').style.display = "none";
}

function selectAge(age, button) {
  selectedAge = age;
  
  document.querySelectorAll('.age-options button').forEach(btn => btn.classList.remove('selected-btn'));
  button.classList.add('selected-btn');
  
  document.getElementById('ageMessage').textContent = `Age selected: ${age}`;
  
  const ageModal = document.getElementById('ageModal');
  const animalModal = document.getElementById('animalModal');
  
  ageModal.classList.add('fade-out');
  
  setTimeout(() => {
    ageModal.style.display = 'none';
    ageModal.classList.remove('fade-out', 'active');
    
    animalModal.style.display = 'flex';
    setTimeout(() => {
      animalModal.classList.add('active');
    }, 50);
  }, 300);
}

function selectAnimal(animal, imgElement) {
  animalBuddy = animal;
  document.getElementById('animalMessage').textContent = "You picked: " + animal;
  document.querySelectorAll('.animal-options img').forEach(img => img.classList.remove('selected-animal'));
  imgElement.classList.add('selected-animal');
}

// ---------- 🔥 FIREBASE: SAVE USER TO FIRESTORE ----------
async function finishSignup() {
  if (!explorerName || !selectedAge || !animalBuddy) {
    alert("Please complete all selections!");
    return;
  }
  
  try {
    // Generate unique user ID
    const userId = 'user_' + Date.now();
    currentUserId = userId;
    
    // Prepare user data
    const userData = {
      userId: userId,
      name: explorerName,
      age: selectedAge,
      animal: animalBuddy,
      createdAt: new Date().toISOString(),
      totalScore: 0,
      gamesPlayed: []
    };
    
    // Save to Firestore
    await db.collection('users').doc(userId).set(userData);
    console.log('✅ User saved to Firebase!', userData);
    
    // Save to localStorage for quick access
    localStorage.setItem('currentUser', JSON.stringify({
      userId: userId,
      name: explorerName,
      age: selectedAge,
      animal: animalBuddy
    }));
    
    // IMPORTANT: Save the userId so we can retrieve it later
    localStorage.setItem('lastUserId', userId);
    
    // Trigger header update event
    window.dispatchEvent(new Event('userSignedUp'));
    
    // Show success popup
    document.getElementById('resultName').textContent = explorerName;
    document.getElementById('resultAge').textContent = selectedAge;
    document.getElementById('resultBuddy').textContent = animalBuddy;
    document.getElementById('resultImage').src = `../../assets/images/${animalBuddy.toLowerCase()}.png`;
    
    document.getElementById('lastResultPopup').style.display = "flex";
    isUserSignedUp = true;
    closeAnimalModal();
    updateProfile();
    
  } catch (error) {
    console.error('❌ Error saving user:', error);
    alert('Oops! Something went wrong. Please try again.');
  }
}

function updateProfile() {
  const profileNameEl = document.getElementById('profileName');
  const profilePicEl = document.getElementById('profilePic');
  const signupBtn = document.getElementById('signupBtn');
  const userProfile = document.getElementById('userProfile');
  
  if (profileNameEl && profilePicEl && userProfile && signupBtn) {
    profileNameEl.textContent = explorerName;
    profilePicEl.src = `../../assets/images/${animalBuddy.toLowerCase()}.png`;
    userProfile.style.display = "flex";
    signupBtn.style.display = "none";
  }
}

function closeLastResult() {
  document.getElementById('lastResultPopup').style.display = "none";
  document.body.style.overflow = 'auto';
}

// Sign up button in header
document.getElementById('signupBtn')?.addEventListener('click', function(e) {
  e.preventDefault();
  showWelcomeFlow();
});

// ---------- 🔥 FIREBASE: SAVE GAME SCORE ----------
async function saveGameScore(gameName, score) {
  if (!currentUserId) {
    console.log('No user logged in');
    return;
  }
  
  try {
    const userRef = db.collection('users').doc(currentUserId);
    
    // Get current user data
    const doc = await userRef.get();
    const currentData = doc.data();
    
    // Update scores
    await userRef.update({
      totalScore: (currentData.totalScore || 0) + score,
      gamesPlayed: firebase.firestore.FieldValue.arrayUnion({
        game: gameName,
        score: score,
        playedAt: new Date().toISOString()
      })
    });
    
    console.log('✅ Score saved!', { game: gameName, score: score });
  } catch (error) {
    console.error('❌ Error saving score:', error);
  }
}

// Make function available globally for other pages
window.saveGameScore = saveGameScore;