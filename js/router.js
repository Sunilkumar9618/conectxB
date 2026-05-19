/* ============================================================================
   ROUTER - Hash-based routing, view management, transitions
   ============================================================================ */

// Handle clean URL paths (e.g., /Homelander211 instead of /#page/Homelander211)
function handleCleanUrl() {
    const path = window.location.pathname;
    // Check if path starts with /@handle pattern
    if (path && path.startsWith('/@')) {
        const handle = path.replace('/@', '').trim();
        if (handle && !handle.includes('.')) {
            router.navigate('page', handle);
            return true;
        }
    }
    return false;
}
 
const router = {
    currentRoute: 'home',
    routes: {},
    middleware: [],
    
    // Register a route
    register(path, viewRenderer) {
        this.routes[path] = viewRenderer;
    },
    
    // Add middleware (runs before route change)
    use(fn) {
        this.middleware.push(fn);
    },
    
    // Get current route info
    getCurrentRoute() {
        return getHashRoute();
    },
    
    // Navigate to route
    async navigate(route, ...params) {
        // Run middleware
        for (const fn of this.middleware) {
            const shouldContinue = await fn(route, params);
            if (!shouldContinue) return false;
        }
        
        setHashRoute(route, ...params);
        return true;
    },
    
    // Load and render view
    async loadView(route, params = []) {
        const viewContainer = $('#view-container');
        const viewRenderer = this.routes[route];
        
        if (!viewRenderer) {
            console.warn(`Route not found: ${route}`);
            return;
        }
        
        // Hide loading screen
        const loading = $('#loading-screen');
        if (loading) {
            loading.classList.add('hidden');
        }
        
        try {
            // Render view
            const html = await viewRenderer(...params);
            
            // Fade transition
            viewContainer.style.opacity = '0';
            viewContainer.innerHTML = html;
            
            setTimeout(() => {
                viewContainer.style.opacity = '1';
            }, 10);
            
            // Initialize view-specific scripts
            this.initializeView(route);
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            this.currentRoute = route;
        } catch (error) {
            console.error('Error loading view:', error);
            viewContainer.innerHTML = '<div class="error-page">Error loading page</div>';
        }
    },
    
    // Initialize view-specific event listeners
    initializeView(route) {
        // Emit custom event for view initialization
        emit('view-changed', { route });
    },
    
    async start() {
    // First, try to handle clean URL paths (e.g., /@Homelander211)
    const path = window.location.pathname;
    if (path && path.startsWith('/@')) {
        const handle = path.replace('/@', '').trim();
        if (handle && !handle.includes('.')) {
            // Load the public page view directly
            await this.loadView('page', [handle]);
            
            // Listen for hash changes for normal navigation
            window.addEventListener('hashchange', async () => {
                const { route: newRoute, params: newParams } = getHashRoute();
                await this.loadView(newRoute, newParams);
            });
            return;
        }
    }
    
    // If no clean URL, fallback to hash routing
    let { route, params } = getHashRoute();
    if (!route) route = 'home';
    
    await this.loadView(route, params);
    
    // Listen for hash changes
    window.addEventListener('hashchange', async () => {
        const { route: newRoute, params: newParams } = getHashRoute();
        await this.loadView(newRoute, newParams);
    });
}
};
 
// ---- ROUTE GUARDS (MIDDLEWARE) ----
 
// Require authentication
function requireAuth(route, params) {
    const session = getFromStorage('jsbeacons_session');
    if (!session || !session.loggedIn) {
        router.navigate('auth');
        return false;
    }
    return true;
}
 
// Require guest (no login)
function requireGuest(route, params) {
    const session = getFromStorage('jsbeacons_session');
    if (session && session.loggedIn) {
        router.navigate('dashboard');
        return false;
    }
    return true;
}
 
// ---- ROUTE TRANSITIONS ----
 
function fadeInView() {
    const viewContainer = $('#view-container');
    viewContainer.style.transition = 'opacity 0.3s ease-out';
    viewContainer.style.opacity = '0';
    setTimeout(() => {
        viewContainer.style.opacity = '1';
    }, 10);
}
 
// ---- RENDER HELPERS ----
 
function renderLayout(content, options = {}) {
    const {
        showNavbar = true,
        showSidebar = false,
        sidebarUser = null,
        sidebarNav = []
    } = options;
    
    let html = '';
    
    if (showNavbar) {
        html += renderNavbar();
    }
    
    if (showSidebar) {
        html += renderSidebar(sidebarUser, sidebarNav);
        html += `<div class="main-content with-sidebar">${content}</div>`;
    } else {
        html += `<div class="main-content">${content}</div>`;
    }
    
    return html;
}
 
function renderNavbar() {
    const isDarkMode = getFromStorage('jsbeacons_theme', { mode: 'dark' }).mode === 'dark';
    const isLoggedIn = auth.isLoggedIn(); // Use Firebase auth state
    
    return `
        <nav class="navbar">
            <div class="navbar-logo" onclick="router.navigate('home')">✦ connectxB</div>
            <ul class="navbar-nav">
                <li><a href="#home" ${getHashRoute().route === 'home' ? 'class="active"' : ''}>Home</a></li>
                ${isLoggedIn ? `
                    <li><a href="#dashboard" ${getHashRoute().route === 'dashboard' ? 'class="active"' : ''}>Dashboard</a></li>
                    <li><a href="#builder" ${getHashRoute().route === 'builder' ? 'class="active"' : ''}>Builder</a></li>
                ` : `
                    <li><a href="#auth" ${getHashRoute().route === 'auth' ? 'class="active"' : ''}>Sign In</a></li>
                `}
            </ul>
            <div class="navbar-actions">
                <button class="btn btn-icon" id="theme-toggle-navbar" style="background: none; border: none; font-size: 20px;" title="Toggle theme">
                    ${isDarkMode ? '☀️' : '🌙'}
                </button>
                ${isLoggedIn ? `
                    <button class="btn btn-secondary btn-small" onclick="auth.logout(); router.navigate('home');">Logout</button>
                ` : `
                    <button class="btn btn-primary" onclick="router.navigate('auth')">Get Started</button>
                `}
            </div>
            <button class="hamburger" id="hamburger-menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    `;
}
 
function renderSidebar(user, navItems) {
    // Use the user object passed to the function (Firebase data)
    const userDisplay = user || { name: 'User', handle: 'user' };
    
    return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-profile">
                <div class="sidebar-avatar">${getInitials(userDisplay.name)}</div>
                <div class="sidebar-handle">@${userDisplay.handle}</div>
            </div>
            <nav>
                <ul class="sidebar-nav">
                    ${navItems.map(item => `
                        <li>
                            <a href="#${item.href}" class="${getHashRoute().route === item.href ? 'active' : ''}">
                                <span class="sidebar-nav-icon">${item.icon}</span>
                                <span>${item.label}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            </nav>
        </aside>
    `;
}
 

const views = {};