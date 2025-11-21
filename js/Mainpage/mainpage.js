// ========================================
// NAVBAR SCROLL EFFECT
// ========================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ========================================
// MOBILE MENU TOGGLE
// ========================================
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    mobileNav.classList.toggle('active');
    mobileOverlay.classList.toggle('active');
    document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : 'auto';
}

// ========================================
// MODAL LOGIN FUNCTIONALITY
// ========================================

// Modal Login Variables
const loginModal = document.getElementById('loginModal');
const loginFormContainer = document.getElementById('loginFormContainer');
const loginOptions = document.getElementById('loginOptions');
const portalTitle = document.getElementById('portalTitle');

let selectedPortal = '';

// Open login modal
function openModal() {
    loginModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    backToPortalSelection(); // Reset to portal selection view
}

// Close login modal
function closeModal() {
    loginModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Small delay before resetting to avoid visual glitch
    setTimeout(() => {
        backToPortalSelection();
    }, 300);
}

// Show login form for selected portal
function showLoginForm(portal) {
    selectedPortal = portal;
    
    // Update title based on portal
    const portalTitles = {
        'admin': 'Admin Portal',
        'staff': 'Staff Portal',
        'student': 'Student Portal'
    };
    
    const portalMessages = {
        'admin': 'Welcome back Admin!',
        'staff': 'Welcome back Staff!',
        'student': 'Welcome back Student!'
    };
    
    portalTitle.textContent = portalTitles[portal] || 'Sign In';
    
    // Update welcome message if element exists
    const welcomeMsg = document.getElementById('welcomeMessage');
    if (welcomeMsg) {
        welcomeMsg.textContent = portalMessages[portal] || 'Welcome back!';
    }
    
    // Hide portal options, show login form with smooth transition
    loginOptions.style.display = 'none';
    loginFormContainer.style.display = 'block';
}

// Back to portal selection
function backToPortalSelection() {
    loginFormContainer.style.display = 'none';
    loginOptions.style.display = 'block';
    selectedPortal = '';
    
    // Clear form inputs
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput) usernameInput.value = '';
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.type = 'password'; // Reset to password type
    }
    
    // Reset toggle button
    const toggleBtn = document.querySelector('.toggle-password');
    if (toggleBtn) toggleBtn.textContent = '👁️';
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validate inputs
    if (!username || !password) {
        alert('⚠️ Please enter both username and password!');
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'LOGGING IN...';
    submitBtn.disabled = true;

    // Simulate authentication (replace with actual API call)
    setTimeout(() => {
        // Demo credentials - REPLACE WITH REAL AUTHENTICATION
        const demoCredentials = {
            admin: { username: 'admin', password: 'admin123' },
            staff: { username: 'staff', password: 'staff123' },
            student: { username: 'student', password: 'student123' }
        };

        // Check credentials
        if (demoCredentials[selectedPortal] && 
            username === demoCredentials[selectedPortal].username && 
            password === demoCredentials[selectedPortal].password) {
            
            alert(`✅ Successfully logged in as ${selectedPortal.toUpperCase()}!\n\nWelcome, ${username}!`);
            
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
            // Close modal and redirect
            closeModal();
            
            // Redirect to respective dashboard
            const redirectUrls = {
                'admin': '../admin/dashboard.html',
                'staff': '../staff/dashboard.html',
                'student': '../student/dashboard.html'
            };
            
            // Uncomment to enable actual redirection
            // setTimeout(() => {
            //     window.location.href = redirectUrls[selectedPortal];
            // }, 500);
            
            console.log(`Would redirect to: ${redirectUrls[selectedPortal]}`);
            
        } else {
            alert('❌ Invalid username or password!\n\n📝 Demo Credentials:\n• Admin: admin / admin123\n• Staff: staff / staff123\n• Student: student / student123');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 1200);
}

// ========================================
// MODAL EVENT LISTENERS
// ========================================

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && loginModal.classList.contains('active')) {
        closeModal();
    }
});

// ========================================
// CONTACT FORM SUBMISSION
// ========================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('.submit-btn');
        const originalText = btn.textContent;
        
        // Show loading state
        btn.textContent = '📧 Sending...';
        btn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            alert('✅ Thank you for your interest! We will contact you soon.');
            btn.textContent = originalText;
            btn.disabled = false;
            contactForm.reset();
        }, 1500);
    });
}

// ========================================
// SMOOTH SCROLL FOR NAVIGATION LINKS
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // Skip if it's just "#" or modal trigger
        if (href === '#' || this.hasAttribute('onclick')) {
            return;
        }
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            // Close mobile menu if open
            const mobileNav = document.getElementById('mobileNav');
            const mobileOverlay = document.getElementById('mobileOverlay');
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
            
            // Smooth scroll to target
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ========================================
// PAGE INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎓 Idzmir Kids Hub Website Loaded Successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Demo Login Credentials:');
    console.log('   👨‍💼 Admin:   admin / admin123');
    console.log('   👨‍🏫 Staff:   staff / staff123');
    console.log('   🎓 Student: student / student123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 Click "Login" button to access portal');
    console.log('🚀 All systems operational!');
});