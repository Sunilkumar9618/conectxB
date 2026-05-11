/* ============================================================================
   COMPONENTS - Reusable UI Components (Toast, Modal, Confirm, etc.)
   ============================================================================ */

// ---- TOAST NOTIFICATIONS ----

function showToast(message, type = 'info', duration = 3000) {
    const container = $('#toast-container') || createToastContainer();
    
    const toast = createElement('div', { class: `toast ${type} animate-slide-in-right` }, `
        <span class="toast-message">${message}</span>
        <button class="toast-close">✕</button>
    `);
    
    container.appendChild(toast);
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.remove();
    });
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = createElement('div', { id: 'toast-container', class: 'toast-container' });
    document.body.appendChild(container);
    return container;
}

// ---- MODAL ----

class Modal {
    constructor(options = {}) {
        const {
            title = 'Modal',
            content = '',
            actions = [],
            size = 'medium',
            closeable = true,
            onClose = null
        } = options;
        
        this.title = title;
        this.content = content;
        this.actions = actions;
        this.size = size;
        this.closeable = closeable;
        this.onClose = onClose;
        this.isOpen = false;
    }
    
    open() {
        const container = $('#modal-container') || this.createContainer();
        
        const overlay = createElement('div', { class: 'modal-overlay', id: 'modal-overlay' });
        const modal = createElement('div', { class: `modal modal-${this.size}` });
        
        // Header
        const header = createElement('div', { class: 'modal-header' }, `
            <h2 class="modal-title">${this.title}</h2>
            ${this.closeable ? '<button class="modal-close">✕</button>' : ''}
        `);
        
        // Content
        const contentDiv = createElement('div', { class: 'modal-content' });
        if (typeof this.content === 'string') {
            contentDiv.innerHTML = this.content;
        } else {
            contentDiv.appendChild(this.content);
        }
        
        // Footer with actions
        let footer = '';
        if (this.actions.length > 0) {
            footer = `<div class="modal-footer">
                ${this.actions.map((action, i) => `
                    <button class="btn btn-${action.type || 'secondary'}" data-action-index="${i}">
                        ${action.label}
                    </button>
                `).join('')}
            </div>`;
        }
        
        modal.appendChild(header);
        modal.appendChild(contentDiv);
        if (footer) {
            modal.innerHTML += footer;
        }
        
        overlay.appendChild(modal);
        container.appendChild(overlay);
        
        // Event listeners
        if (this.closeable) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn?.addEventListener('click', () => this.close());
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close();
            });
        }
        
        // Action buttons
        modal.querySelectorAll('[data-action-index]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.actionIndex);
                const action = this.actions[index];
                if (action.callback) {
                    action.callback();
                }
                this.close();
            });
        });
        
        this.isOpen = true;
    }
    
    close() {
        const overlay = $('#modal-overlay');
        if (overlay) {
            overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
            setTimeout(() => {
                overlay.remove();
                this.isOpen = false;
                if (this.onClose) this.onClose();
            }, 200);
        }
    }
    
    createContainer() {
        const container = createElement('div', { id: 'modal-container' });
        document.body.appendChild(container);
        return container;
    }
}

// ---- CONFIRM DIALOG ----

function showConfirm(message, options = {}) {
    const {
        title = 'Confirm',
        confirmText = 'Confirm',
        cancelText = 'Cancel',
        type = 'info',
        onConfirm = null,
        onCancel = null
    } = options;
    
    return new Promise((resolve) => {
        const modal = new Modal({
            title,
            content: `<p style="font-size: 16px; color: var(--text-secondary);">${message}</p>`,
            closeable: true,
            actions: [
                {
                    label: cancelText,
                    type: 'ghost',
                    callback: () => {
                        if (onCancel) onCancel();
                        resolve(false);
                    }
                },
                {
                    label: confirmText,
                    type: type === 'danger' ? 'danger' : 'primary',
                    callback: () => {
                        if (onConfirm) onConfirm();
                        resolve(true);
                    }
                }
            ]
        });
        
        modal.open();
    });
}

// ---- ALERT ----

function showAlert(message, title = 'Alert') {
    return new Promise((resolve) => {
        const modal = new Modal({
            title,
            content: `<p style="font-size: 16px; color: var(--text-secondary);">${message}</p>`,
            closeable: true,
            actions: [
                {
                    label: 'OK',
                    type: 'primary',
                    callback: () => resolve()
                }
            ]
        });
        
        modal.open();
    });
}

// ---- PROMPT ----

function showPrompt(message, options = {}) {
    const {
        title = 'Enter value',
        defaultValue = '',
        placeholder = '',
        onConfirm = null
    } = options;
    
    return new Promise((resolve) => {
        const content = `
            <p style="font-size: 16px; color: var(--text-secondary); margin-bottom: 16px;">${message}</p>
            <input type="text" id="prompt-input" class="form-input" placeholder="${placeholder}" value="${defaultValue}" style="width: 100%;">
        `;
        
        const modal = new Modal({
            title,
            content,
            closeable: true,
            actions: [
                {
                    label: 'Cancel',
                    type: 'ghost',
                    callback: () => resolve(null)
                },
                {
                    label: 'OK',
                    type: 'primary',
                    callback: () => {
                        const value = document.getElementById('prompt-input')?.value;
                        if (onConfirm) onConfirm(value);
                        resolve(value);
                    }
                }
            ]
        });
        
        modal.open();
        
        setTimeout(() => {
            const input = document.getElementById('prompt-input');
            if (input) input.focus();
        }, 100);
    });
}

// ---- ACCORDION ----

function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    
    items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        }
    });
}

// ---- TABS ----

function initTabs() {
    const tabContainers = document.querySelectorAll('.tabs');
    
    tabContainers.forEach(container => {
        const buttons = container.querySelectorAll('.tab-button');
        const contents = container.parentElement.querySelectorAll('.tab-content');
        
        buttons.forEach((button, index) => {
            button.addEventListener('click', () => {
                // Remove active from all
                buttons.forEach(b => b.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));
                
                // Add active to clicked
                button.classList.add('active');
                contents[index].classList.add('active');
            });
        });
    });
}

// ---- DROPDOWN ----

function initDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('[data-dropdown-trigger]');
        
        if (trigger) {
            trigger.addEventListener('click', () => {
                dropdown.classList.toggle('active');
            });
        }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
}

// ---- COPY TO CLIPBOARD BUTTON ----

function renderCopyButton(text, label = 'Copy') {
    return createElement('button', {
        class: 'btn btn-secondary btn-small',
        onclick: async () => {
            if (await copyToClipboard(text)) {
                showToast('Copied to clipboard! 📋', 'success');
            }
        }
    }, label);
}

// ---- RENDER BLOCK ----

function renderBlock(block, options = {}) {
    const { editable = false, onEdit = null, onDelete = null } = options;
    
    let content = '';
    const data = block.data || {};
    
    switch(block.type) {
        case 'link':
            content = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">${data.icon || '🔗'}</div>
                    <div style="font-weight: 600;">${data.title || 'Link'}</div>
                </div>
            `;
            break;
        
        case 'video':
            content = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">📹</div>
                    <div style="font-weight: 600;">${data.caption || 'Video'}</div>
                </div>
            `;
            break;
        
        case 'image':
            content = `
                <img src="${data.url}" alt="Image" style="width: 100%; border-radius: 12px;">
            `;
            break;
        
        case 'text':
            content = `<div>${data.text || 'Text Block'}</div>`;
            break;
        
        case 'product':
            content = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🛍️</div>
                    <div style="font-weight: 600;">${data.title || 'Product'}</div>
                    <div style="color: #FF6584; font-weight: 600; margin-top: 8px;">${data.price || '$0'}</div>
                </div>
            `;
            break;
        
        case 'social':
            const iconMap = {
                facebook: '📘',
                twitter: '🐦',
                instagram: '📷',
                linkedin: '💼',
                youtube: '▶️',
                tiktok: '🎵',
                whatsapp: '💬',
                email: '✉️'
            };
            const socialPlatforms = data.platforms || {};
            content = `
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    ${Object.entries(socialPlatforms).map(([key, url]) => {
                        return `<a href="${url}" style="font-size: 24px; text-decoration: none; opacity: 0.7; transition: all 0.3s;" onmouseover="this.style.opacity='1'; this.style.transform='scale(1.2)'" onmouseout="this.style.opacity='0.7'; this.style.transform='scale(1)'">${iconMap[key] || '🔗'}</a>`;
                    }).join('')}
                    ${Object.keys(socialPlatforms).length === 0 ? '<div style="color: var(--text-secondary);">Add social links...</div>' : ''}
                </div>
            `;
            break;
        
        default:
            content = `<div>${block.type}</div>`;
    }
    
    return content;
}

// ---- SKELETON LOADER ----

function renderSkeleton(type = 'card', count = 1) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
        if (type === 'card') {
            skeletons.push(`
                <div class="card" style="pointer-events: none;">
                    <div class="skeleton skeleton-avatar" style="margin-bottom: 16px;"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `);
        } else if (type === 'text') {
            skeletons.push(`
                <div class="skeleton skeleton-text" style="margin-bottom: 12px;"></div>
                <div class="skeleton skeleton-text" style="width: 80%; margin-bottom: 12px;"></div>
            `);
        }
    }
    
    return skeletons.join('');
}

// ---- COLOR PICKER ----

function renderColorPicker(initialColor = '#6C63FF', onChange = null) {
    const colors = [
        '#6C63FF', '#FF6584', '#43D9A2', '#FFB347', '#FF8B94',
        '#8B84FF', '#FF8BA2', '#5FC9AD', '#FFC857', '#D62828'
    ];
    
    let html = `<div class="color-picker-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(40px, 1fr)); gap: 8px;">`;
    
    colors.forEach(color => {
        html += `
            <div style="
                width: 40px;
                height: 40px;
                background-color: ${color};
                border-radius: 8px;
                cursor: pointer;
                border: 2px solid ${initialColor === color ? 'white' : 'transparent'};
                transition: all 0.25s;
            " onclick="this.style.borderColor='white'; if (window.__colorCallback) window.__colorCallback('${color}');"></div>
        `;
    });
    
    html += '</div>';
    
    if (onChange) {
        window.__colorCallback = onChange;
    }
    
    return html;
}

// ---- FILE UPLOAD ----

function renderFileUpload(options = {}) {
    const { id = 'file-input', accept = 'image/*', onChange = null } = options;
    
    const html = `
        <div style="position: relative; display: inline-block;">
            <input type="file" id="${id}" accept="${accept}" style="display: none;">
            <label for="${id}" class="btn btn-secondary" style="cursor: pointer;">
                📁 Choose File
            </label>
        </div>
    `;
    
    setTimeout(() => {
        const input = document.getElementById(id);
        if (input && onChange) {
            input.addEventListener('change', (e) => {
                onChange(e.target.files[0]);
            });
        }
    }, 100);
    
    return html;
}

// ---- RESPONSIVE TABLE ----

function renderTable(data, columns) {
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    
    // Header
    html += '<thead style="border-bottom: 2px solid var(--border);"><tr>';
    columns.forEach(col => {
        html += `<th style="padding: 12px; text-align: left; font-weight: 600;">${col.label}</th>`;
    });
    html += '</tr></thead>';
    
    // Body
    html += '<tbody>';
    data.forEach((row, idx) => {
        html += `<tr style="border-bottom: 1px solid var(--border);">`;
        columns.forEach(col => {
            const value = col.render ? col.render(row) : row[col.key];
            html += `<td style="padding: 12px;">${value}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    
    return html;
}

// ---- PAGINATION ----

function renderPagination(currentPage, totalPages, onChange) {
    let html = '<div class="flex-center gap-md" style="margin-top: 24px;">';
    
    if (currentPage > 1) {
        html += `<button class="btn btn-secondary btn-small" onclick="if (window.__pageCallback) window.__pageCallback(${currentPage - 1});">← Previous</button>`;
    }
    
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            html += `<button class="btn btn-primary btn-small" disabled>${i}</button>`;
        } else {
            html += `<button class="btn btn-secondary btn-small" onclick="if (window.__pageCallback) window.__pageCallback(${i});">${i}</button>`;
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button class="btn btn-secondary btn-small" onclick="if (window.__pageCallback) window.__pageCallback(${currentPage + 1});">Next →</button>`;
    }
    
    html += '</div>';
    
    if (onChange) {
        window.__pageCallback = onChange;
    }
    
    return html;
}

// ---- BADGE COMPONENT ----

function renderBadge(text, type = 'primary') {
    return `<span class="badge badge-${type}">${text}</span>`;
}

// ---- EMPTY STATE ----

function renderEmptyState(icon = '📭', title = 'No data', description = '', action = null) {
    let html = `
        <div class="empty-state">
            <div class="empty-state-icon">${icon}</div>
            <h3 class="empty-state-title">${title}</h3>
            <p class="empty-state-description">${description}</p>
    `;
    
    if (action) {
        html += `<button class="btn btn-primary">${action.label}</button>`;
    }
    
    html += '</div>';
    
    setTimeout(() => {
        if (action) {
            const btn = document.querySelector('.empty-state .btn');
            if (btn) btn.addEventListener('click', action.callback);
        }
    }, 100);
    
    return html;
}
