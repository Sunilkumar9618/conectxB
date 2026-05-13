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
            
            <!-- FEATURES SECTION -->
            <section style="background-color: var(--dark-bg-secondary); padding: var(--spacing-3xl) var(--spacing-xl);">
                <div class="container">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-lg);">Powerful Tools for Creators</h2>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-2xl); max-width: 600px; margin-left: auto; margin-right: auto;">
                        Everything you need to build, monetize, and grow your presence
                    </p>
                    
                    <div class="features">
                        <div class="feature-card">
                            <div class="feature-icon">🔗</div>
                            <h3 class="feature-title">Link in Bio</h3>
                            <p class="feature-description">
                                Share multiple links in one custom URL. Direct your followers to everything you want them to see.
                            </p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">💰</div>
                            <h3 class="feature-title">Monetize</h3>
                            <p class="feature-description">
                                Sell digital products, courses, and services directly from your profile. Easy payments built-in.
                            </p>
                        </div>
                        
                        <div class="feature-card">
                            <div class="feature-icon">📈</div>
                            <h3 class="feature-title">Analytics</h3>
                            <p class="feature-description">
                                Track views, clicks, and traffic sources. Understand what resonates with your audience.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- CREATORS SHOWCASE -->
            <section class="creators-section">
                <div class="container">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-xl);">Trusted by Creators</h2>
                    <div class="creators-carousel">
                        ${[...Array(8)].map((_, i) => {
                            const user = randomUser();
                            return `
                                <div class="creator-card">
                                    <div class="creator-avatar" style="background: linear-gradient(135deg, ${randomColor()}, ${randomColor()});">
                                        ${getInitials(user.name)}
                                    </div>
                                    <div class="creator-name">${user.name}</div>
                                    <div class="creator-handle">${user.handle}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </section>
            
            <!-- PRICING SECTION -->
            <section style="padding: var(--spacing-3xl) var(--spacing-xl); background-color: var(--dark-bg-secondary);">
                <div class="container-md">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-lg);">Simple, Transparent Pricing</h2>
                    <p style="text-align: center; color: var(--text-secondary); margin-bottom: var(--spacing-2xl);">
                        Start free, upgrade when you're ready
                    </p>
                    
                    <div class="pricing-cards">
                        <!-- FREE PLAN -->
                        <div class="pricing-card">
                            <div class="pricing-name">Free</div>
                            <div class="pricing-price">$0</div>
                            <div class="pricing-period">Forever free</div>
                            <div class="pricing-description">Perfect for getting started</div>
                            
                            <ul class="pricing-features">
                                <li class="pricing-feature">Up to 5 links</li>
                                <li class="pricing-feature">Basic analytics</li>
                                <li class="pricing-feature">Custom domain</li>
                                <li class="pricing-feature">Community support</li>
                            </ul>
                            
                            <button class="btn btn-secondary" style="width: 100%;">Get Started</button>
                        </div>
                        
                        <!-- PRO PLAN -->
                        <div class="pricing-card featured">
                            <div class="pricing-badge">MOST POPULAR</div>
                            <div class="pricing-name">Pro</div>
                            <div class="pricing-price">$10</div>
                            <div class="pricing-period">per month</div>
                            <div class="pricing-description">For serious creators</div>
                            
                            <ul class="pricing-features">
                                <li class="pricing-feature">Unlimited links</li>
                                <li class="pricing-feature">Advanced analytics</li>
                                <li class="pricing-feature">Digital store</li>
                                <li class="pricing-feature">Priority support</li>
                                <li class="pricing-feature">Custom domain</li>
                                <li class="pricing-feature">Email capture</li>
                            </ul>
                            
                            <button class="btn btn-primary" style="width: 100%;">Start Free Trial</button>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- FAQ SECTION -->
            <section style="padding: var(--spacing-3xl) var(--spacing-xl);">
                <div class="container-md">
                    <h2 style="text-align: center; margin-bottom: var(--spacing-2xl);">Frequently Asked Questions</h2>
                    
                    <div class="faq">
                        <div class="accordion-item active">
                            <div class="accordion-header">
                                <h4 class="accordion-title">What is connectxB?</h4>
                                <span class="accordion-toggle">▼</span>
                            </div>
                            <div class="accordion-content">
                                <p class="accordion-text">
                                    connectxB is a creator platform that helps you build a link in bio page, monetize your audience, and track analytics all in one place.
                                </p>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <div class="accordion-header">
                                <h4 class="accordion-title">Is it really free?</h4>
                                <span class="accordion-toggle">▼</span>
                            </div>
                            <div class="accordion-content">
                                <p class="accordion-text">
                                    Yes! You can use connectxB completely free with up to 5 links. Upgrade to Pro for advanced features.
                                </p>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <div class="accordion-header">
                                <h4 class="accordion-title">Can I sell products?</h4>
                                <span class="accordion-toggle">▼</span>
                            </div>
                            <div class="accordion-content">
                                <p class="accordion-text">
                                    Yes! With a Pro account, you can set up a digital store and sell products directly from your profile.
                                </p>
                            </div>
                        </div>
                        
                        <div class="accordion-item">
                            <div class="accordion-header">
                                <h4 class="accordion-title">What analytics do you provide?</h4>
                                <span class="accordion-toggle">▼</span>
                            </div>
                            <div class="accordion-content">
                                <p class="accordion-text">
                                    We provide detailed analytics including page views, click tracking, traffic sources, and more.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <!-- FOOTER -->
            <footer>
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>Product</h4>
                            <ul class="footer-links">
                                <li><a href="#home">Features</a></li>
                                <li><a href="#home">Pricing</a></li>
                                <li><a href="#home">Security</a></li>
                                <li><a href="#home">Roadmap</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Company</h4>
                            <ul class="footer-links">
                                <li><a href="#home">About</a></li>
                                <li><a href="#home">Blog</a></li>
                                <li><a href="#home">Careers</a></li>
                                <li><a href="#home">Contact</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Legal</h4>
                            <ul class="footer-links">
                                <li><a href="#home">Privacy</a></li>
                                <li><a href="#home">Terms</a></li>
                                <li><a href="#home">Cookies</a></li>
                            </ul>
                        </div>
                        
                        <div class="footer-section">
                            <h4>Follow</h4>
                            <div class="footer-socials">
                                <div class="social-icon">👨‍💼</div>
                                <div class="social-icon">🐦</div>
                                <div class="social-icon">📱</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer-bottom">
                        <p>&copy; 2024 connectxB. All rights reserved. Built for creators. ✦</p>
                    </div>
                </div>
            </footer>
        </div>
    `;
    
    setTimeout(() => {
        initAccordion();
        
        // Hamburger menu
        const hamburger = document.getElementById('hamburger-menu');
        const sidebar = document.getElementById('sidebar');
        hamburger?.addEventListener('click', () => {
            if (sidebar) sidebar.classList.toggle('visible');
        });
        
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle-navbar');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                theme.toggle();
            });
        }
    }, 10);

    // FIX 1: Added missing return statement — without this the router
    // receives undefined and renders the text "undefined" on screen
    return html;
};

/* ============================================================================
   DASHBOARD - User Dashboard
   ============================================================================ */

views.dashboard = async function() {
    const session = getFromStorage('jsbeacons_session');
    const handle = session?.handle;
    
    if (!handle) {
        await router.navigate('auth');
        return '';
    }
    
    const users = getFromStorage('beacons_users', {});
    const user = users[handle] || { name: 'User' };
    
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
        activeBlocks: getFromStorage('beacons_blocks', {})[handle]?.filter(b => b.visible).length || 0
    };
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <div class="dashboard-header">
                    <div>
                        <h1 class="dashboard-greeting">👋 Welcome back, ${user.name}!</h1>
                        <p style="color: var(--text-secondary);">Here's what's happening with your page</p>
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
