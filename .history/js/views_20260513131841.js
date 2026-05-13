/* ============================================================================
   LANDING PAGE - Marketing Landing Page
   ============================================================================ */


views.landing = async function() {
    const session = getFromStorage('jsbeacons_session');
    
    const html = `
        ${renderNavbar()}
        <div class="main-content">
            <!-- HERO SECTION -->
            <section class="landing-hero">
                <div class="landing-hero-content">
                    <h1>Everything a creator needs, in one link</h1>
                    <p class="landing-hero-subtitle">
                        Create your ultimate creator profile. Monetize, share links, and grow your audience.
                    </p>
                    
                    <div class="landing-hero-actions">
                        <button class="btn btn-primary btn-large" onclick="router.navigate('auth')">
                            Get Started Free →
                        </button>
                        <button class="btn btn-outline btn-large">
                            👁️ See Examples
                        </button>
                    </div>
                </div>
            </section>
        </div>
    `;

    return html;
};

/* ============================================================================
   DASHBOARD - User Dashboard
   ============================================================================ */

views.dashboard = async function() {
    // Use Firebase authenticated user
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }
    
    // Get user profile with proper fallbacks
    const profile = auth.currentUser?.profile || {};
    const user = {
        name: profile.name || auth.currentUser?.displayName || 'User',
        email: profile.email || auth.currentUser?.email || '',
        handle: profile.handle || 'user'
    };
    
    console.log('📊 Dashboard user:', user);
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const fakeAnalytics = analytics.generateFakeData(30);
    const stats = {
        views: fakeAnalytics.views.reduce((sum, v) => sum + v.count, 0),
        clicks: Object.values(fakeAnalytics.clicks).reduce((sum, c) => sum + c, 0),
        activeBlocks: 0
    };
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <div class="dashboard-header">
                    <div>
                        <h1 class="dashboard-greeting">👋 Welcome back, <span style="color: var(--primary)">${user.name}</span>!</h1>
                        <p style="color: var(--text-secondary);">Here's what's happening with your page @${user.handle}</p>
                    </div>
                    <button class="btn btn-primary" onclick="router.navigate('builder')">✏️ Edit Page</button>
                </div>
                
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.views}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.clicks}</div>
                        <div class="stat-label">Total Clicks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.activeBlocks}</div>
                        <div class="stat-label">Active Blocks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(Math.random() * 10 + 1).toFixed(1)}%</div>
                        <div class="stat-label">Click Rate</div>
                    </div>
                </div>
                
                <div style="margin-top: var(--spacing-2xl);">
                    <h2>Quick Actions</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-lg);">
                        <div class="card" style="cursor: pointer;" onclick="router.navigate('builder')">
                            <div style="font-size: 32px; margin-bottom: 12px;">✏️</div>
                            <h3 style="margin: 0 0 8px 0;">Edit Page</h3>
                            <p style="color: var(--text-secondary); margin: 0;">Customize your profile and blocks</p>
                        </div>
                        <div class="card" style="cursor: pointer;" onclick="router.navigate('store')">
                            <div style="font-size: 32px; margin-bottom: 12px;">🛍️</div>
                            <h3 style="margin: 0 0 8px 0;">Manage Store</h3>
                            <p style="color: var(--text-secondary); margin: 0;">Add and sell digital products</p>
                        </div>
                        <div class="card" style="cursor: pointer;" onclick="router.navigate('analytics')">
                            <div style="font-size: 32px; margin-bottom: 12px;">📈</div>
                            <h3 style="margin: 0 0 8px 0;">View Analytics</h3>
                            <p style="color: var(--text-secondary); margin: 0;">Track your page performance</p>
                        </div>
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
