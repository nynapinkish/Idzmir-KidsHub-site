document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('formth01');
    
    // ✅ CHECK USER ROLE - Change this based on your auth system
    const userRole = "admin"; // Options: "admin", "therapist", "staff"
    // You can get this from: localStorage.getItem('userRole') or session/backend
    
    // ✅ DISABLE FORM FOR ADMIN
    if (userRole === "admin") {
        // Disable all form inputs
        const allInputs = form.querySelectorAll('input, select, textarea, button[type="submit"]');
        allInputs.forEach(function(input) {
            input.disabled = true;
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.6';
        });
        
        // Disable custom selects
        const customSelects = document.querySelectorAll('.custom-select .selected');
        customSelects.forEach(function(select) {
            select.style.pointerEvents = 'none';
            select.style.opacity = '0.6';
            select.style.cursor = 'not-allowed';
        });
        
        return; // Stop execution for admin
    }
    
    // ✅ FOR NON-ADMIN USERS (Therapists/Staff) - Enable all features below
    
    // Handle custom selects
    const customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(function(select) {
        const selected = select.querySelector('.selected');
        const dropdown = select.querySelector('.dropdown');
        const options = dropdown.querySelectorAll('.option');
        selected.addEventListener('click', function() {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
        options.forEach(function(option) {
            option.addEventListener('click', function() {
                selected.textContent = this.textContent;
                dropdown.style.display = 'none';
            });
        });
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!select.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    });
    
    // Form validation
    form.addEventListener('submit', function(e) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        requiredFields.forEach(function(field) {
            if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = '#c5cedd';
            }
        });
        if (!isValid) {
            e.preventDefault();
            alert('Please fill in all required fields.');
        } else {
            console.log('Form submitted successfully!');
        }
    });
});