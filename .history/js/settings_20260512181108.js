/* ============================================================================
   SETTINGS - User Settings, Profile, Account Management
   ============================================================================ */

const settings = {
    currentHandle: null,
    
    // Initialize settings
    init(handle) {
        this.currentHandle = handle;
    }
};

// ---- RENDER SETTINGS VIEW ----

views.settings = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || 'User',
        email: profile.email || auth.currentUser?.email,
        handle: profile.handle,
        bio: profile.bio || '',
        avatar: profile.avatar || ''
    };
    
    settings.init(user.handle);
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const themeSetting = getFromStorage('jsbeacons_theme', {}).mode || 'dark';
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="max-width: 800px; padding: var(--spacing-xl);">
                <h1>Settings</h1>
                
                <!-- Profile Section -->
                <div class="card" style="margin-bottom: var(--spacing-2xl);">
                    <div class="card-header">
                        <h3 class="card-title">Profile</h3>
                    </div>
                    <div class="card-content">
                        <div class="form-group">
                            <label class="form-label">Display Name</label>
                            <input type="text" class="form-input" id="settings-name" value="${user.name}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Bio</label>
                            <textarea class="form-textarea" id="settings-bio" placeholder="Tell your story...">${user.bio || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Handle</label>
                            <input type="text" class="form-input" value="@${handle}" disabled>
                        </div>
                        
                        <button class="btn btn-primary" id="save-profile-btn">Save Profile</button>
                    </div>
                </div>
                
                <!-- Account Section -->
                <div class="card" style="margin-bottom: var(--spacing-2xl);">
                    <div class="card-header">
                        <h3 class="card-title">Account</h3>
                    </div>
                    <div class="card-content">
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-input" id="settings-email" value="${user.email}" disabled>
                            <div class="form-hint">Email cannot be changed</div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Current Password</label>
                            <input type="password" class="form-input" id="settings-current-pwd" placeholder="Enter your current password">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-input" id="settings-new-pwd" placeholder="New password (min. 6 characters)">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" class="form-input" id="settings-confirm-pwd" placeholder="Confirm new password">
                        </div>
                        
                        <button class="btn btn-secondary" id="change-password-btn">Change Password</button>
                    </div>
                </div>
                
                <!-- Appearance Section -->
                <div class="card" style="margin-bottom: var(--spacing-2xl);">
                    <div class="card-header">
                        <h3 class="card-title">Appearance</h3>
                    </div>
                    <div class="card-content">
                        <div class="form-group">
                            <label class="form-label">Theme</label>
                            <div style="display: flex; gap: 12px; margin-top: 12px;">
                                <button class="btn btn-secondary ${themeSetting === 'dark' ? '' : 'btn-primary'}" id="theme-dark-btn" onclick="theme.setMode('dark')">🌙 Dark</button>
                                <button class="btn btn-secondary ${themeSetting === 'light' ? '' : ''}" id="theme-light-btn" onclick="theme.setMode('light')">☀️ Light</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Integrations Section -->
                <div class="card" style="margin-bottom: var(--spacing-2xl);">
                    <div class="card-header">
                        <h3 class="card-title">Integrations</h3>
                    </div>
                    <div class="card-content">
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border);">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">Mailchimp</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Email newsletter integration</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox">
                                <span></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border);">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">Stripe</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Payment processing</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox">
                                <span></span>
                            </label>
                        </div>
                        
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 0;">
                            <div>
                                <div style="font-weight: 600; margin-bottom: 4px;">Zapier</div>
                                <div style="font-size: 14px; color: var(--text-secondary);">Workflow automation</div>
                            </div>
                            <label class="toggle-switch">
                                <input type="checkbox">
                                <span></span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Danger Zone -->
                <div class="card" style="border-color: var(--error);">
                    <div class="card-header">
                        <h3 class="card-title" style="color: var(--error);">Danger Zone</h3>
                    </div>
                    <div class="card-content">
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">
                            Deleting your account is permanent and cannot be undone. All your data will be permanently deleted.
                        </p>
                        <button class="btn btn-danger" id="delete-account-btn">Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        initSettingsView();
    }, 10);
    
    return html;
};

function initSettingsView() {
    const handle = auth.getCurrentHandle();
    
    // Save profile
    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
        const name = document.getElementById('settings-name').value;
        const bio = document.getElementById('settings-bio').value;
        
        if (!name) {
            showToast('Name is required', 'error');
            return;
        }
        
        auth.updateProfile({ name, bio });
        showToast('Profile saved ✓', 'success');
    });
    
    // Change password
    document.getElementById('change-password-btn')?.addEventListener('click', () => {
        const currentPwd = document.getElementById('settings-current-pwd').value;
        const newPwd = document.getElementById('settings-new-pwd').value;
        const confirmPwd = document.getElementById('settings-confirm-pwd').value;
        
        if (!currentPwd || !newPwd || !confirmPwd) {
            showToast('All password fields are required', 'error');
            return;
        }
        
        if (newPwd !== confirmPwd) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        const result = auth.changePassword(currentPwd, newPwd);
        
        if (result.error) {
            showToast(result.error, 'error');
            return;
        }
        
        // Clear inputs
        document.getElementById('settings-current-pwd').value = '';
        document.getElementById('settings-new-pwd').value = '';
        document.getElementById('settings-confirm-pwd').value = '';
        
        showToast('Password changed ✓', 'success');
    });
    
    // Delete account
    document.getElementById('delete-account-btn')?.addEventListener('click', async () => {
        const confirmed = await showConfirm(
            'This will permanently delete your account and all associated data. This action cannot be undone.',
            {
                title: 'Delete Account',
                confirmText: 'Delete Permanently',
                cancelText: 'Cancel',
                type: 'danger',
                onConfirm: () => {
                    auth.deleteAccount();
                    showToast('Account deleted', 'info');
                }
            }
        );
    });
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    hamburger?.addEventListener('click', () => {
        sidebar?.classList.toggle('visible');
    });
}
