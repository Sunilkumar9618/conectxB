/* ============================================================================
   BUILDER - Page Builder View
   ============================================================================ */

views.builder = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || 'User',
        handle: profile.handle || 'user'
    };
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <h1>✏️ Page Builder</h1>
                <p style="color: var(--text-secondary);">Coming soon - Drag & drop page builder will be available here</p>
                <div class="card" style="margin-top: var(--spacing-lg); padding: var(--spacing-lg);">
                    <h2>Build Your Page</h2>
                    <p>Add text, images, links, buttons, and more to create your unique profile page.</p>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }
    }, 10);
    
    return html;
};

/* ============================================================================
   STORE - Digital Store View
   ============================================================================ */

views.store = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || 'User',
        handle: profile.handle || 'user'
    };
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <h1>🛍️ Digital Store</h1>
                <p style="color: var(--text-secondary);">Manage your digital products and sales</p>
                <div class="card" style="margin-top: var(--spacing-lg); padding: var(--spacing-lg);">
                    <h2>Create Products</h2>
                    <p>Add digital products, courses, or services to sell through your profile.</p>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }
    }, 10);
    
    return html;
};

/* ============================================================================
   ANALYTICS - Analytics Dashboard View
   ============================================================================ */

views.analytics = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || 'User',
        handle: profile.handle || 'user'
    };
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const fakeAnalytics = analytics.generateFakeData(30);
    const totalViews = fakeAnalytics.views.reduce((sum, v) => sum + v.count, 0);
    const totalClicks = Object.values(fakeAnalytics.clicks).reduce((sum, c) => sum + c, 0);
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <h1>📈 Analytics</h1>
                <p style="color: var(--text-secondary);">Track your page performance and traffic</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); margin-top: var(--spacing-lg);">
                    <div class="stat-card">
                        <div class="stat-value">${totalViews}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalClicks}</div>
                        <div class="stat-label">Total Clicks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0}%</div>
                        <div class="stat-label">Click Rate</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }
    }, 10);
    
    return html;
};

/* ============================================================================
   SETTINGS - User Settings View
   ============================================================================ */

views.settings = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || 'User',
        email: profile.email || auth.currentUser?.email || '',
        handle: profile.handle || 'user'
    };
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <h1>⚙️ Settings</h1>
                <p style="color: var(--text-secondary);">Manage your account and preferences</p>
                
                <div class="card" style="margin-top: var(--spacing-lg); padding: var(--spacing-lg);">
                    <h2>Account Information</h2>
                    <div style="margin-top: var(--spacing-lg);">
                        <div style="margin-bottom: var(--spacing-lg);">
                            <label style="font-weight: 600;">Name</label>
                            <p style="color: var(--text-secondary); margin: var(--spacing-xs) 0 0 0;">${user.name}</p>
                        </div>
                        <div style="margin-bottom: var(--spacing-lg);">
                            <label style="font-weight: 600;">Email</label>
                            <p style="color: var(--text-secondary); margin: var(--spacing-xs) 0 0 0;">${user.email}</p>
                        </div>
                        <div>
                            <label style="font-weight: 600;">Handle</label>
                            <p style="color: var(--text-secondary); margin: var(--spacing-xs) 0 0 0;">@${user.handle}</p>
                        </div>
                    </div>
                </div>
                
                <div class="card" style="margin-top: var(--spacing-lg); padding: var(--spacing-lg);">
                    <h2>Danger Zone</h2>
                    <button class="btn btn-secondary" style="margin-top: var(--spacing-lg);" onclick="auth.logout(); router.navigate('home');">Logout</button>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        if (hamburger && sidebar) {
            hamburger.addEventListener('click', () => {
                sidebar.classList.toggle('visible');
            });
        }
    }, 10);
    
    return html;
};
