document.addEventListener('DOMContentLoaded', function() {
    // Toggle Password Visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.form-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    // Password Strength Meter (Signup Page Only)
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            const password = this.value;
            
            // Reset
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Password Strength: ';
            
            if (password.length === 0) {
                strengthText.textContent += 'None';
                return;
            }
            
            // Very basic strength check
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength += 1;
            if (password.length >= 12) strength += 1;
            
            // Character type checks
            if (/[A-Z]/.test(password)) strength += 1;
            if (/[0-9]/.test(password)) strength += 1;
            if (/[^A-Za-z0-9]/.test(password)) strength += 1;
            
            // Update UI
            if (strength <= 2) {
                strengthBar.classList.add('weak');
                strengthText.textContent += 'Weak';
            } else if (strength <= 4) {
                strengthBar.classList.add('medium');
                strengthText.textContent += 'Medium';
            } else {
                strengthBar.classList.add('strong');
                strengthText.textContent += 'Strong';
            }
        });
    }

    // Form Validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Add your login logic here
            window.location.href = 'dashboard.html';
        });
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const password = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirm').value;
            
            if (password !== confirm) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!document.getElementById('agreeTerms').checked) {
                alert('You must agree to the terms and conditions');
                return;
            }
            
            // Add your signup logic here
            window.location.href = 'dashboard.html';
        });
    }

    // Social Login Buttons
    document.querySelectorAll('.social-btn').forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'GitHub';
            alert(`Would normally authenticate with ${provider} here`);
        });
    });
});