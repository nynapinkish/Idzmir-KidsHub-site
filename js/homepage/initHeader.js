// initHeader.js - Universal header loader for all pages
// This file should be loaded at the END of every page
// Adjust headerPath based on current page location!

function initializeHeader(headerPath = '/header.html') {
  const headerPlaceholder = document.getElementById('header-placeholder');
  
  if (!headerPlaceholder) {
    console.warn('⚠️ No #header-placeholder found on this page');
    return;
  }

  // Fetch header component
  fetch(headerPath)
    .then(response => {
      if (!response.ok) throw new Error('Header not found at: ' + headerPath);
      return response.text();
    })
    .then(html => {
      headerPlaceholder.innerHTML = html;
      console.log('✅ Header loaded successfully from:', headerPath);
      updateHeaderUI();
    })
    .catch(error => {
      console.error('❌ Error loading header:', error);
    });
}

// Update header based on user data
function updateHeaderUI() {
  const signupBtn = document.getElementById('signupBtn');
  const userProfile = document.getElementById('userProfile');
  const profileName = document.getElementById('profileName');
  const profilePic = document.getElementById('profilePic');
  
  if (!signupBtn || !userProfile) {
    setTimeout(updateHeaderUI, 100);
    return;
  }
  
  const savedUser = localStorage.getItem('currentUser');
  
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      signupBtn.style.display = 'none';
      userProfile.style.display = 'flex';
      profileName.textContent = userData.name;
      profilePic.src = `/assets/images/${userData.animal.toLowerCase()}.png`;
      console.log('✅ Header updated with user:', userData.name);
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
}

// Toggle user menu
function toggleUserMenu() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    const userData = JSON.parse(savedUser);
    alert(`🎮 Explorer Profile:\n\nName: ${userData.name}\nAge: ${userData.age}\nBuddy: ${userData.animal}`);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeHeader('/header.html'); // Change this path based on page location
});

// Listen for user signup events
window.addEventListener('userSignedUp', updateHeaderUI);

// Listen for storage changes
window.addEventListener('storage', updateHeaderUI);