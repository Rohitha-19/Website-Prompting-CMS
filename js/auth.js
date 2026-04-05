/* js/auth.js */

document.addEventListener('DOMContentLoaded', () => {
    // Protect routes
    const currentUser = StorageUtil.getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Redirect logged-in users away from auth pages
    if (currentUser && (currentPage === 'index.html' || currentPage === 'signup.html' || currentPage === '')) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    // Redirect unauthenticated users away from dashboard
    if (!currentUser && currentPage === 'dashboard.html') {
        window.location.href = 'index.html';
        return;
    }

    // ---- Login Form Logic ----
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('login-error');
            
            const user = StorageUtil.getUserByEmail(email);
            if (!user) {
                showError(errorDiv, "Invalid email or password.");
                return;
            }
            
            if (user.password !== password) {
                showError(errorDiv, "Invalid email or password.");
                return;
            }
            
            // Login success
            StorageUtil.setCurrentUser({
                name: user.name,
                email: user.email,
                role: user.role
            });
            window.location.href = 'dashboard.html';
        });
    }

    // ---- Signup Form Logic ----
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const roleSelect = document.getElementById('role');
            const role = roleSelect ? roleSelect.value : 'user';
            
            const errorDiv = document.getElementById('signup-error');
            
            // Validation
            if (password !== confirmPassword) {
                showError(errorDiv, "Passwords do not match.");
                return;
            }
            
            // Check if user exists
            if (StorageUtil.getUserByEmail(email)) {
                showError(errorDiv, "A user with this email already exists.");
                return;
            }
            
            // Create user
            const newUser = {
                name,
                email,
                password, // Note: In a real app, passwords must be hashed. Stored as plain text for this local dev requirement.
                role
            };
            
            StorageUtil.addUser(newUser);
            
            // Auto login after signup
            StorageUtil.setCurrentUser({
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            });
            window.location.href = 'dashboard.html';
        });
    }
    
    // ---- Logout Logic ----
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            StorageUtil.clearCurrentUser();
            window.location.href = 'index.html';
        });
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        // Auto hide after 3 seconds
        setTimeout(() => {
            element.style.display = 'none';
        }, 3000);
    }
});
