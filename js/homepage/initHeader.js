// ========================================
// INIT HEADER SYSTEM - FIXED VERSION
// ========================================

function initializeHeader(headerPath, assetsPath = '../../../assets') {
  console.log('🔍 Loading header from:', headerPath);
  console.log('🔍 Assets path:', assetsPath);
  
  const headerPlaceholder = document.getElementById('header-placeholder');
  
  if (!headerPlaceholder) {
    console.error('❌ header-placeholder not found!');
    return;
  }

  // Store assets path globally for use in fallback
  window._assetsPath = assetsPath;

  // Fetch header HTML
  fetch(headerPath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load header: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      console.log('✅ Header HTML loaded');
      
      // Replace asset paths in the loaded HTML
      html = html.replace(/\{\{ASSETS_PATH\}\}/g, assetsPath);
      
      headerPlaceholder.innerHTML = html;
      
      // Initialize header UI after DOM is ready
      setTimeout(() => {
        updateHeaderUI();
        console.log('✅ Header initialized');
      }, 50);
    })
    .catch(error => {
      console.error('❌ Error loading header:', error);
      
      // Fallback: Create header directly
      createFallbackHeader(assetsPath);
    });
}

// Update Header UI based on login status
function updateHeaderUI() {
  const userProfile = document.getElementById('userProfile');
  const profileName = document.getElementById('profileName');
  const profilePic = document.getElementById('profilePic');
  
  // Wait for elements if not ready
  if (!userProfile || !profileName || !profilePic) {
    console.log('⏳ Waiting for header elements...');
    setTimeout(updateHeaderUI, 100);
    return;
  }
  
  // Get login data from sessionStorage
  const userName = sessionStorage.getItem('userName');
  const userRole = sessionStorage.getItem('userRole');
  const studentId = sessionStorage.getItem('studentId');
  const userAnimal = sessionStorage.getItem('userAnimal');
  
  console.log('🔍 Header checking session:', {
    userName,
    userRole,
    studentId,
    userAnimal
  });
  
  // If user is logged in as student
  if (userName && userRole === 'student' && studentId) {
    userProfile.style.display = 'flex';
    profileName.textContent = userName;
    
    // Use saved animal or pick random
    let animalImage = userAnimal || 'lion';
    const animals = ['lion', 'elephant', 'tiger'];
    if (!userAnimal) {
      animalImage = animals[Math.floor(Math.random() * animals.length)];
      sessionStorage.setItem('userAnimal', animalImage);
    }
    
    // Use the stored assets path
    const assetsPath = window._assetsPath || '../../../assets';
    profilePic.src = `${assetsPath}/images/${animalImage}.png`;
    console.log('✅ Header synced with student:', userName, '(ID:', studentId, ')');
  } else {
    // Show default profile if no user logged in
    userProfile.style.display = 'flex';
    profileName.textContent = 'Guest';  // ← FIXED: Changed from 'nyna' to 'Guest'
    
    // Use the stored assets path
    const assetsPath = window._assetsPath || '../../../assets';
    profilePic.src = `${assetsPath}/images/lion.png`;
    console.log('ℹ️ Showing default profile (Guest)');
  }
}

// Fallback function if fetch fails
function createFallbackHeader(assetsPath = '../../../assets') {
  console.log('⚠️ Using fallback header with assets path:', assetsPath);
  
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (!headerPlaceholder) return;
  
  headerPlaceholder.innerHTML = `
    <header class="header">
      <div class="logo">
        <img src="${assetsPath}/images/logo1.png" alt="Logo" onerror="console.error('Failed to load logo1')">
        <img src="${assetsPath}/images/logo2.png" alt="Idzmir Kids Hub" onerror="console.error('Failed to load logo2')">
      </div>

      <nav class="nav-menu">
        <a href="/html/homepage/homepage.html" class="nav-item">Home</a>
        <a href="#about" class="nav-item">About</a>
        <a href="#tutorial" class="nav-item tutorial">Tutorial</a>
        <a href="#contact" class="nav-item">Contact</a>
      </nav>

      <div class="user-profile" id="userProfile" onclick="toggleUserMenu()">
        <img src="${assetsPath}/images/lion.png" alt="User Avatar" class="profile-pic" id="profilePic" onerror="console.error('Failed to load profile pic')">
        <span class="profile-name" id="profileName">Guest</span>
      </div>
    </header>
  `;
  
  setTimeout(updateHeaderUI, 50);
}

// Toggle user menu
function toggleUserMenu() {
  console.log('👤 User menu toggled');
  // This will be handled by homepage.js or other page scripts
}

// Listen for storage changes (sync across tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'userName' || e.key === 'userRole' || e.key === 'studentId') {
    console.log('🔄 Storage changed, updating header...');
    updateHeaderUI();
  }
});

// Listen for custom events
window.addEventListener('userLogin', () => {
  console.log('🔄 User login event, updating header...');
  setTimeout(updateHeaderUI, 100);
});

window.addEventListener('userLogout', () => {
  console.log('🔄 User logout event, updating header...');
  updateHeaderUI();
});

console.log('✅ initHeader.js loaded!');