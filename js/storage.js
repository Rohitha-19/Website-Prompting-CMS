/* js/storage.js */

// Helper to interact with LocalStorage
const StorageUtil = {
    // ---- Theme ----
    getTheme: () => {
        return localStorage.getItem('cms_theme') || 'light';
    },
    setTheme: (theme) => {
        localStorage.setItem('cms_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },
    initTheme: () => {
        const theme = StorageUtil.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
    },

    // ---- Users ----
    getUsers: () => {
        return JSON.parse(localStorage.getItem('cms_users')) || [];
    },
    saveUsers: (users) => {
        localStorage.setItem('cms_users', JSON.stringify(users));
    },
    getUserByEmail: (email) => {
        const users = StorageUtil.getUsers();
        return users.find(u => u.email === email);
    },
    addUser: (user) => {
        const users = StorageUtil.getUsers();
        users.push(user);
        StorageUtil.saveUsers(users);
    },

    // ---- Session ----
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('cms_current_user'));
    },
    setCurrentUser: (user) => {
        localStorage.setItem('cms_current_user', JSON.stringify(user));
    },
    clearCurrentUser: () => {
        localStorage.removeItem('cms_current_user');
    },

    // ---- Complaints ----
    getComplaints: () => {
        return JSON.parse(localStorage.getItem('cms_complaints')) || [];
    },
    saveComplaints: (complaints) => {
        localStorage.setItem('cms_complaints', JSON.stringify(complaints));
    },
    
    // Generate a unique complaint ID like "COMP-12345"
    generateId: () => {
        const complaints = StorageUtil.getComplaints();
        const lastId = complaints.length > 0 ? complaints[complaints.length - 1].id : 'COMP-10000';
        const numPart = parseInt(lastId.split('-')[1]);
        return `COMP-${numPart + 1}`;
    }
};

// Initialize theme immediately on script load
StorageUtil.initTheme();

// Handle theme toggle globally if button exists
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        // Set correct icon initially based on theme
        const icon = themeBtn.querySelector('i');
        if (StorageUtil.getTheme() === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }

        themeBtn.addEventListener('click', () => {
            const currentTheme = StorageUtil.getTheme();
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            StorageUtil.setTheme(newTheme);
            
            // Toggle icon
            if (newTheme === 'dark') {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
});
