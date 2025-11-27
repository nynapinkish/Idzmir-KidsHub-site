// ================= FIREBASE CONFIGURATION =================
const firebaseConfig = {
    apiKey: "AIzaSyCpDrWgLXXHK7_9nioEQGBKJkUv4byCEd4",
    authDomain: "idzmir-kids-hub.firebaseapp.com",
    projectId: "idzmir-kids-hub",
    storageBucket: "idzmir-kids-hub.firebasestorage.app",
    messagingSenderId: "301692363279",
    appId: "1:301692363279:web:86c6270d0593dee46eb97a"
};

// Global variables
let db = null;
let firebaseReady = false;
let selectedRole = "";

// ================= INITIALIZE FIREBASE =================
(function initializeFirebase() {
    console.log("🔄 Starting Firebase initialization...");
    
    if (typeof firebase === 'undefined') {
        console.error("❌ Firebase library not found!");
        setTimeout(() => alert("Connection error. Refresh the page."), 1000);
        return;
    }
    
    try {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseReady = true;
        console.log("✅ Firebase ready!");
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        alert("System initialization failed. Refresh the page.");
    }
})();

// ================= MODAL CONTROLS =================
function openModal() {
    if (!firebaseReady) return alert("⚠️ System loading. Please wait...");
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    modal.classList.add('active');

    document.getElementById('loginOptions').style.display = 'block';
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('signupFormContainer').style.display = 'none';

    document.body.classList.add('modal-open');
}

function closeModal(skipReset = false) {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    modal.classList.remove('active');

    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';

    if (!skipReset) {
        backToPortalSelection();
    }
}

function backToPortalSelection() {
    selectedRole = "";
    document.getElementById('loginOptions').style.display = 'block';
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('signupFormContainer').style.display = 'none';

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.reset();
    if (signupForm) signupForm.reset();
}

// ================= SHOW LOGIN / SIGNUP =================
function showLoginForm(role) {
    selectedRole = role;
    document.getElementById('loginOptions').style.display = 'none';
    document.getElementById('signupFormContainer').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'block';

    const portalTitle = document.getElementById('portalTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const formFooter = document.querySelector('.login-form-container .form-footer');

    const roleConfig = {
        'student': { title: '🎓 Student Portal', message: 'Sign in to access your dashboard', showSignup: true },
        'staff': { title: '👨‍🏫 Staff Portal', message: 'Welcome back, teacher!', showSignup: false },
        'admin': { title: '👨‍💼 Admin Portal', message: 'Administrative access', showSignup: false }
    };

    const config = roleConfig[role] || roleConfig['student'];
    portalTitle.textContent = config.title;
    welcomeMessage.textContent = config.message;

    if (formFooter) formFooter.style.display = config.showSignup ? 'block' : 'none';

    // Reset form fields
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();
}

function showSignUpForm() {
    document.getElementById('loginOptions').style.display = 'none';
    document.getElementById('loginFormContainer').style.display = 'none';
    document.getElementById('signupFormContainer').style.display = 'block';

    const signupForm = document.getElementById('signupForm');
    if (signupForm) signupForm.reset();
}

function togglePassword(fieldId, btn) {
    const passwordField = document.getElementById(fieldId);
    if (!passwordField || !btn) return;

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        // Icon mata terbuka (password visible)
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
            </svg>
        `;
    } else {
        passwordField.type = 'password';
        // Icon mata tertutup dengan slash (password hidden)
        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/>
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/>
            </svg>
        `;
    }
}

// ================= FORGOT PASSWORD =================
function handleForgotPassword(event) {
    event.preventDefault();
    const portalName = selectedRole === 'student' ? 'Student' : selectedRole === 'staff' ? 'Staff' : 'Admin';
    alert(`🔐 ${portalName} Password Reset\nContact admin: info@idzmirkidshub.com`);
}

// ================= HANDLE LOGIN - FIXED VERSION =================
async function handleLogin(event) {
    event.preventDefault();
    if (!firebaseReady || !db) return alert("System not ready.");

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const submitBtn = event.target.querySelector('.submit-btn');
    if (!username || !password) return alert("Fill all fields.");

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
        let collectionName = selectedRole === 'staff' ? 'staff' : selectedRole === 'admin' ? 'admins' : 'students';
        const querySnapshot = await db.collection(collectionName).where('username', '==', username.toLowerCase()).get();

        if (querySnapshot.empty) {
            if (selectedRole === 'student' && confirm("User not found. Register?")) {
                showSignUpForm();
            } else alert("User not found. Contact admin.");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        const userData = querySnapshot.docs[0].data();
        const docId = querySnapshot.docs[0].id;

        if (userData.password !== password) {
            alert("Incorrect password.");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        // Update last login
        await db.collection(collectionName).doc(docId).update({ 
            lastLogin: firebase.firestore.FieldValue.serverTimestamp() 
        });

        // ✅ FIXED: Clear old session first!
        console.log('🧹 Clearing previous session...');
        sessionStorage.clear();

        // ✅ FIXED: Use userData from Firebase, not input!
        console.log('📝 Setting new session for:', userData.username);
        sessionStorage.setItem('userName', userData.username);  // ← FROM FIREBASE!
        sessionStorage.setItem('userRole', selectedRole);
        
        if (selectedRole === 'student') {
            sessionStorage.setItem('userAge', userData.age || '');
            sessionStorage.setItem('studentId', userData.studentId || 'N/A');
        }

        // Log session data
        console.log('✅ Session established:', {
            userName: sessionStorage.getItem('userName'),
            studentId: sessionStorage.getItem('studentId'),
            userRole: sessionStorage.getItem('userRole'),
            userAge: sessionStorage.getItem('userAge')
        });

        // Trigger header update event
        window.dispatchEvent(new Event('userLogin'));

        // Close modal
        closeModal(true);

        // Redirect
        const redirectUrl = selectedRole === 'student' ? '../homepage/homepage.html'
            : selectedRole === 'staff' ? '../Admin/Department/dashboard.html'
            : '../Admin/dashboard.html';
        
        console.log('🚀 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;

    } catch (error) {
        console.error("❌ Login Error:", error);
        alert("Login failed: " + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ================= HANDLE SIGN UP - UPDATED WITH USERNAME FIELD =================
async function handleSignUp(event) {
    event.preventDefault();
    if (!firebaseReady || !db) return alert("System not ready.");

    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    const age = parseInt(document.getElementById('signupAge').value);
    const submitBtn = document.getElementById('signupSubmitBtn');

    if (!username || !password || !age) return alert("Fill all fields.");
    if (!/^[a-zA-Z0-9]+$/.test(username)) return alert("Username only letters/numbers.");
    if (password.length < 6) return alert("Password min 6 chars.");
    if (age < 3 || age > 12) return alert("Age must be 3-12.");

    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;

    try {
        const checkUser = await db.collection('students').where('username', '==', username.toLowerCase()).get();
        if (!checkUser.empty) {
            alert("Username exists!");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }

        const studentsSnapshot = await db.collection('students').get();
        const studentId = 'S' + String(studentsSnapshot.size + 1).padStart(4, '0');

        // ✅ Create proper student document with all required fields
        await db.collection('students').add({
            username: username.toLowerCase(),  // ← Store lowercase for consistency
            password: password,
            age: age,
            studentId: studentId,
            totalScore: 0,
            conceptProgress: {},  // ← NEW: For new system
            spiderWebData: {},    // ← NEW: For spider chart
            gameScores: { game1:0, game2:0, game3:0, game4:0, game5:0 },  // ← OLD: Keep for compatibility
            registrationDate: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active',
            lastLogin: null
        });

        console.log('✅ New student registered:', username);
        alert(`Registration Successful!\nUsername: ${username}\nStudent ID: ${studentId}\nAge: ${age}`);
        showLoginForm('student');

    } catch (error) {
        console.error("❌ Sign Up Error:", error);
        alert("Registration failed: " + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// ================= GLOBAL FUNCTIONS =================
window.openModal = openModal;
window.closeModal = closeModal;
window.showLoginForm = showLoginForm;
window.showSignUpForm = showSignUpForm;
window.backToPortalSelection = backToPortalSelection;
window.togglePassword = togglePassword;
window.handleLogin = handleLogin;
window.handleSignUp = handleSignUp;
window.handleForgotPassword = handleForgotPassword;

// ================= CLOSE MODAL ON CLICK OUTSIDE =================
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) closeModal();
};

// ================= ESC KEY =================
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') closeModal();
});

console.log("✅ Login system script loaded with session management!");