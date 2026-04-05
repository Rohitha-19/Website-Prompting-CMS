/* js/ui.js */

const UI = {
    // ---- Toasts ----
    showToast: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-circle-info';
        if (type === 'success') iconClass = 'fa-check-circle';
        if (type === 'error') iconClass = 'fa-exclamation-circle';
        if (type === 'warning') iconClass = 'fa-exclamation-triangle';

        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;
        container.appendChild(toast);

        // Remove after animation (3s)
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 3000);
    },

    // ---- Modals ----
    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
        }
    },
    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    },
    closeAllModals: () => {
        document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show'));
    },

    // ---- Statistics Rendering ----
    updateStats: (complaints) => {
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const inProgress = complaints.filter(c => c.status === 'In Progress').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;

        document.getElementById('stat-total').textContent = total;
        document.getElementById('stat-pending').textContent = pending;
        document.getElementById('stat-inprogress').textContent = inProgress;
        document.getElementById('stat-resolved').textContent = resolved;
    },

    // ---- Table Rendering ----
    renderTable: (complaints, tbodyId, type = 'user', role = 'user') => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        tbody.innerHTML = '';
        
        const emptyStateId = type === 'user' ? 'my-empty-state' : (type === 'recent' ? 'recent-empty-state' : 'all-empty-state');
        const emptyState = document.getElementById(emptyStateId);
        
        if (complaints.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            tbody.parentElement.style.display = 'none';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';
        tbody.parentElement.style.display = 'table';

        complaints.forEach(comp => {
            const tr = document.createElement('tr');
            
            // Format Date
            const dateStr = new Date(comp.date).toLocaleDateString();

            // Status Badge
            let statusClass = 'status-pending';
            if (comp.status === 'In Progress') statusClass = 'status-inprogress';
            if (comp.status === 'Resolved') statusClass = 'status-resolved';

            // Priority Class
            let priorityClass = 'priority-medium';
            if (comp.priority === 'Low') priorityClass = 'priority-low';
            if (comp.priority === 'High') priorityClass = 'priority-high';

            let html = `
                <td><strong>${comp.id}</strong></td>
                ${type === 'all' ? `<td>${comp.userEmail}</td>` : ''}
                <td>${comp.title}</td>
                <td>${comp.category}</td>
                <td class="${priorityClass}">${comp.priority}</td>
                <td><span class="status-badge ${statusClass}">${comp.status}</span></td>
                <td>${dateStr}</td>
            `;

            // Actions mapping
            if (type !== 'recent') {
                html += `
                    <td>
                        <button class="action-btn view" onclick="App.viewComplaint('${comp.id}')" title="View"><i class="fa-solid fa-eye"></i></button>
                        ${role === 'user' && comp.status === 'Pending' ? `<button class="action-btn edit" onclick="App.editComplaint('${comp.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>` : ''}
                        ${role === 'user' && comp.status === 'Pending' ? `<button class="action-btn delete" onclick="App.confirmDelete('${comp.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
                    </td>
                `;
            }

            tr.innerHTML = html;
            tbody.appendChild(tr);
        });
    },

    // ---- View Modal Content ----
    populateViewModal: (comp, role) => {
        const body = document.getElementById('view-modal-body');
        const footer = document.getElementById('view-modal-footer');
        
        let statusClass = 'status-pending';
        if (comp.status === 'In Progress') statusClass = 'status-inprogress';
        if (comp.status === 'Resolved') statusClass = 'status-resolved';

        body.innerHTML = `
            <div class="detail-row">
                <div class="detail-label">Complaint ID</div>
                <div class="detail-value"><strong>${comp.id}</strong></div>
            </div>
            ${role === 'admin' ? `
            <div class="detail-row">
                <div class="detail-label">User Email</div>
                <div class="detail-value">${comp.userEmail}</div>
            </div>` : ''}
            <div class="detail-row">
                <div class="detail-label">Title</div>
                <div class="detail-value">${comp.title}</div>
            </div>
            <div class="detail-row" style="display: flex; gap: 15px;">
                <div style="flex: 1;">
                    <div class="detail-label">Category</div>
                    <div class="detail-value">${comp.category}</div>
                </div>
                <div style="flex: 1;">
                    <div class="detail-label">Priority</div>
                    <div class="detail-value">${comp.priority}</div>
                </div>
                <div style="flex: 1;">
                    <div class="detail-label">Status</div>
                    <div class="detail-value"><span class="status-badge ${statusClass}">${comp.status}</span></div>
                </div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Date Submitted</div>
                <div class="detail-value">${new Date(comp.date).toLocaleString()}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Description</div>
                <div class="detail-value">${comp.description}</div>
            </div>
        `;

        if (role === 'admin') {
            footer.innerHTML = `
                <div style="display:flex; align-items:center; gap: 10px; width: 100%;">
                    <label style="font-weight:600; font-size:0.9rem;">Update Status:</label>
                    <select id="admin-status-update" class="filter-select" style="flex:1;">
                        <option value="Pending" ${comp.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${comp.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Resolved" ${comp.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                    <button class="btn btn-primary" onclick="App.updateStatus('${comp.id}')">Update</button>
                    <button class="btn btn-outline close-modal-btn">Close</button>
                </div>
            `;
            // Reattach close event for dynamically created button
            footer.querySelector('.close-modal-btn').addEventListener('click', () => UI.closeModal('view-modal'));
        } else {
            footer.innerHTML = `<button class="btn btn-outline" onclick="UI.closeModal('view-modal')">Close</button>`;
        }
    }
};

// Global Listeners for modals
document.addEventListener('DOMContentLoaded', () => {
    // Close modal on 'x' click
    document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) modal.classList.remove('show');
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
});
