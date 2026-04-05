/* js/app.js */

const App = (() => {
    let currentUser = null;
    let allComplaints = [];

    const init = () => {
        currentUser = StorageUtil.getCurrentUser();
        if (!currentUser) return; // auth.js will redirect

        // Display user info
        document.getElementById('display-name').textContent = currentUser.name;
        document.getElementById('user-initial').textContent = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('user-role-badge').textContent = currentUser.role;
        document.getElementById('settings-name').value = currentUser.name;
        document.getElementById('settings-email').value = currentUser.email;

        // Make Admin section available if admin
        if (currentUser.role === 'admin') {
            document.querySelector('.admin-only').style.display = 'flex';
        }

        loadData();
        setupEventListeners();
        renderDashboard();
    };

    const loadData = () => {
        allComplaints = StorageUtil.getComplaints();
        // Sort by latest initially
        allComplaints.sort((a, b) => new Date(b.date) - new Date(a.date));
    };

    const setupEventListeners = () => {
        // Sidebar Navigation
        const navItems = document.querySelectorAll('#nav-links .nav-item');
        const sections = document.querySelectorAll('.content-section');
        const pageTitle = document.getElementById('page-title');
        
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Update active nav
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Update title
                pageTitle.textContent = item.querySelector('span').textContent;

                // Show section
                const targetId = item.getAttribute('data-target');
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                // Re-render data when changing tabs
                if (targetId === 'dashboard-section') renderDashboard();
                if (targetId === 'my-complaints-section') renderMyComplaints();
                if (targetId === 'all-complaints-section') renderAllComplaints();
                
                // Close sidebar on mobile
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('open');
                }
            });
        });

        // Mobile Sidebar Toggle
        const mobileBtn = document.getElementById('mobile-menu-btn');
        const closeSidebarBtn = document.getElementById('close-sidebar');
        const sidebar = document.getElementById('sidebar');
        
        if (mobileBtn && sidebar) {
            mobileBtn.addEventListener('click', () => sidebar.classList.add('open'));
        }
        if (closeSidebarBtn && sidebar) {
            closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));
        }

        // Add Complaint Form
        const addForm = document.getElementById('add-complaint-form');
        if (addForm) {
            addForm.addEventListener('submit', handleAddComplaint);
        }

        // Edit Complaint Form
        const editForm = document.getElementById('edit-complaint-form');
        if (editForm) {
            editForm.addEventListener('submit', handleEditComplaint);
        }

        // Confirm Delete Button
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', executeDelete);
        }

        // Filters - My Complaints
        document.getElementById('my-search').addEventListener('input', renderMyComplaints);
        document.getElementById('my-filter-status').addEventListener('change', renderMyComplaints);
        document.getElementById('my-filter-category').addEventListener('change', renderMyComplaints);
        document.getElementById('my-sort').addEventListener('change', renderMyComplaints);

        // Filters - All Complaints
        if (currentUser.role === 'admin') {
            document.getElementById('all-search').addEventListener('input', renderAllComplaints);
            document.getElementById('all-filter-status').addEventListener('change', renderAllComplaints);
            document.getElementById('all-sort').addEventListener('change', renderAllComplaints);
        }

        // Quick View All Recent
        const viewAllRecent = document.getElementById('view-all-recent');
        if (viewAllRecent) {
            viewAllRecent.addEventListener('click', () => {
                document.querySelector('[data-target="my-complaints-section"]').click();
            });
        }

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', exportData);
        document.getElementById('import-btn').addEventListener('change', importData);
    };

    // ---- Data Processing ----

    const getMyComplaints = () => {
        return allComplaints.filter(c => c.userEmail === currentUser.email);
    };

    const filterAndSort = (complaints, searchElem, statusElem, catElem, sortElem) => {
        let result = [...complaints];
        
        const search = document.getElementById(searchElem)?.value.toLowerCase() || '';
        const status = document.getElementById(statusElem)?.value || 'All';
        const category = document.getElementById(catElem)?.value || 'All';
        const sort = document.getElementById(sortElem)?.value || 'latest';

        // Filter
        if (search) {
            result = result.filter(c => c.title.toLowerCase().includes(search) || c.id.toLowerCase().includes(search) || (c.userEmail && c.userEmail.toLowerCase().includes(search)));
        }
        if (status !== 'All') {
            result = result.filter(c => c.status === status);
        }
        if (category !== 'All') {
            result = result.filter(c => c.category === category);
        }

        // Sort
        if (sort === 'latest') {
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (sort === 'oldest') {
            result.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sort === 'priority') {
            const pMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
            result.sort((a, b) => pMap[b.priority] - pMap[a.priority]);
        }

        return result;
    };

    // ---- Rendering Views ----

    const renderDashboard = () => {
        const myData = currentUser.role === 'admin' ? allComplaints : getMyComplaints();
        UI.updateStats(myData);

        // Recent 5 complaints
        const recent = [...myData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        UI.renderTable(recent, 'recent-complaints-body', 'recent', currentUser.role);
    };

    const renderMyComplaints = () => {
        const filtered = filterAndSort(getMyComplaints(), 'my-search', 'my-filter-status', 'my-filter-category', 'my-sort');
        UI.renderTable(filtered, 'my-complaints-body', 'user', currentUser.role);
    };

    const renderAllComplaints = () => {
        if (currentUser.role !== 'admin') return;
        const filtered = filterAndSort(allComplaints, 'all-search', 'all-filter-status', null, 'all-sort');
        UI.renderTable(filtered, 'all-complaints-body', 'all', currentUser.role);
    };

    // ---- Handlers ----

    const handleAddComplaint = (e) => {
        e.preventDefault();
        
        const title = document.getElementById('comp-title').value.trim();
        const category = document.getElementById('comp-category').value;
        const priority = document.getElementById('comp-priority').value;
        const description = document.getElementById('comp-desc').value.trim();

        const newComplaint = {
            id: StorageUtil.generateId(),
            title,
            category,
            priority,
            description,
            status: 'Pending',
            date: new Date().toISOString(),
            userEmail: currentUser.email,
            userName: currentUser.name
        };

        allComplaints.push(newComplaint);
        StorageUtil.saveComplaints(allComplaints);
        
        e.target.reset();
        UI.showToast("Complaint submitted successfully!", "success");
        renderDashboard();
        
        // Switch back to dashboard
        document.querySelector('[data-target="dashboard-section"]').click();
    };

    const viewComplaint = (id) => {
        const comp = allComplaints.find(c => c.id === id);
        if (!comp) return;
        UI.populateViewModal(comp, currentUser.role);
        UI.openModal('view-modal');
    };

    const editComplaint = (id) => {
        const comp = allComplaints.find(c => c.id === id);
        if (!comp) return;

        if (comp.status !== 'Pending') {
            UI.showToast("Only Pending complaints can be edited.", "warning");
            return;
        }

        document.getElementById('edit-id').value = comp.id;
        document.getElementById('edit-title').value = comp.title;
        document.getElementById('edit-category').value = comp.category;
        document.getElementById('edit-priority').value = comp.priority;
        document.getElementById('edit-desc').value = comp.description;

        UI.openModal('edit-modal');
    };

    const handleEditComplaint = (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-id').value;
        const index = allComplaints.findIndex(c => c.id === id);
        
        if (index > -1) {
            allComplaints[index].title = document.getElementById('edit-title').value.trim();
            allComplaints[index].category = document.getElementById('edit-category').value;
            allComplaints[index].priority = document.getElementById('edit-priority').value;
            allComplaints[index].description = document.getElementById('edit-desc').value.trim();
            allComplaints[index].date = new Date().toISOString(); // optionally update date

            StorageUtil.saveComplaints(allComplaints);
            UI.closeModal('edit-modal');
            UI.showToast("Complaint updated successfully.", "success");
            
            // Re-render current views
            const currentActive = document.querySelector('.nav-item.active').getAttribute('data-target');
            if (currentActive === 'dashboard-section') renderDashboard();
            if (currentActive === 'my-complaints-section') renderMyComplaints();
            if (currentActive === 'all-complaints-section') renderAllComplaints();
        }
    };

    const confirmDelete = (id) => {
        const comp = allComplaints.find(c => c.id === id);
        if (!comp) return;
        document.getElementById('delete-id').value = id;
        UI.openModal('delete-modal');
    };

    const executeDelete = () => {
        const id = document.getElementById('delete-id').value;
        allComplaints = allComplaints.filter(c => c.id !== id);
        StorageUtil.saveComplaints(allComplaints);
        UI.closeModal('delete-modal');
        UI.showToast("Complaint deleted.", "success");
        
        const currentActive = document.querySelector('.nav-item.active').getAttribute('data-target');
        if (currentActive === 'dashboard-section') renderDashboard();
        if (currentActive === 'my-complaints-section') renderMyComplaints();
        if (currentActive === 'all-complaints-section') renderAllComplaints();
    };

    const updateStatus = (id) => {
        if (currentUser.role !== 'admin') return;
        const newStatus = document.getElementById('admin-status-update').value;
        const index = allComplaints.findIndex(c => c.id === id);
        
        if (index > -1) {
            allComplaints[index].status = newStatus;
            StorageUtil.saveComplaints(allComplaints);
            UI.showToast(`Status updated to ${newStatus}`, "success");
            UI.closeModal('view-modal');
            renderDashboard();
            renderAllComplaints();
        }
    };

    const exportData = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allComplaints));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "complaints_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        UI.showToast("Data exported successfully.", "success");
    };

    const importData = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (Array.isArray(imported)) {
                    allComplaints = imported;
                    StorageUtil.saveComplaints(allComplaints);
                    UI.showToast("Data imported successfully.", "success");
                    location.reload(); // Quick refresh to apply all state
                } else {
                    UI.showToast("Invalid JSON format.", "error");
                }
            } catch (err) {
                UI.showToast("Error parsing JSON file.", "error");
            }
        };
        reader.readAsText(file);
    };

    // Public API
    return {
        init,
        viewComplaint,
        editComplaint,
        confirmDelete,
        updateStatus
    };
})();

// Boot the app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Only init if we are on dashboard logic page to avoid errors on auth page.
    if (document.getElementById('sidebar')) {
        App.init();
    }
});
