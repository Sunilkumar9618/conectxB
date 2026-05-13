/* ============================================================================
   APP - Main Application Initialization with Firebase
   ============================================================================ */

// Route guard functions
async function requireAuth(route, params) {
    if (!auth.isLoggedIn()) {
        showToast('Please log in to access this page', 'warning');
        await router.navigate('auth');
        return false;
    }
    return true;
}

async function requireGuest(route, params) {
    if (auth.isLoggedIn()) {
        await router.navigate('dashboard');
        return false;
    }
    return true;
}

function registerRoutes() {
    // Public routes
    router.register('home', views.landing);
    router.register('auth', views.auth);
    router.register('page', views.publicPage);
    
    // Protected routes
    router.register('dashboard', views.dashboard);
    router.register('builder', views.builder);
    router.register('store', views.store);
    router.register('analytics', views.analytics);
    router.register('settings', views.settings);
}

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize app
    await initApp();
});

async function initApp() {
    console.log('🚀 Initializing ConnectXB...');
    
    // Wait for Firebase to be ready
    console.log('⏳ Waiting for Firebase authentication state...');
    await auth.init();
    
    // Initialize theme
    theme.init();
    
    // Register all routes
    registerRoutes();
    
    // Add route guards
    router.use(async (route, params) => {
        // Routes that require authentication
        const protectedRoutes = ['dashboard', 'builder', 'store', 'analytics', 'settings'];
        
        if (protectedRoutes.includes(route)) {
            return requireAuth(route, params);
        }
        
        // Routes that require guest status (not logged in)
        const guestRoutes = ['auth'];
        
        if (guestRoutes.includes(route)) {
            return requireGuest(route, params);
        }
        
        return true;
    });
    
    // Initialize modals and components
    initializeGlobalListeners();
    
    // Try clean URL first (e.g., /Homelander211), then fall back to hash routing
    if (!handleCleanUrl()) {
        // Start router for hash-based routing
        await router.start();
    }
    
    // Hide loading screen
    setTimeout(() => {
        const loading = $('#loading-screen');
        if (loading) {
            loading.classList.add('hidden');
        }
        console.log('✅ ConnectXB Ready!');
    }, 500);
    
    // Log auth status
    if (auth.isLoggedIn()) {
        console.log('👤 User logged in:', auth.currentUser?.email);
    } else {
        console.log('🚪 User not logged in');
    }
}

function initializeGlobalListeners() {
    // Close modals on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = $('#modal-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    });
    
    // Global theme toggle
    document.addEventListener('click', (e) => {
        if (e.target.id === 'theme-toggle-navbar') {
            theme.toggle();
        }
    });
    
    // Initialize accordions, tabs, and dropdowns when view changes
    document.addEventListener('view-changed', () => {
        setTimeout(() => {
            initAccordion();
            initTabs();
            initDropdowns();
        }, 100);
    });
    
    // Handle visibility changes (when user switches tabs/windows)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('👁️ App came to focus');
            // Refresh user data if needed
            if (auth.isLoggedIn()) {
                console.log('🔄 User still authenticated');
            }
        }
    });
}

// Monitor Firebase auth state changes globally
if (typeof firebase !== 'undefined') {
    fbAuth.onAuthStateChanged((user) => {
        if (user) {
            console.log('🔐 Firebase Auth: User logged in');
        } else {
            console.log('🔓 Firebase Auth: User logged out');
        }
    });
}

// ============================================================================
// GLOBAL FUNCTION EXPORTS
// ============================================================================

// Router
window.router = router;

// Auth
window.auth = auth;
window.requireAuth = requireAuth;
window.requireGuest = requireGuest;

// Data stores
window.builder = builder;
window.store = store;
window.analytics = analytics;

// Theme
window.theme = theme;

// UI Components
window.Modal = Modal;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showAlert = showAlert;
window.showPrompt = showPrompt;

// Utilities
window.copyToClipboard = copyToClipboard;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.getInitials = getInitials;
window.emit = emit;

// Rendering functions
window.renderNavbar = renderNavbar;
window.renderSidebar = renderSidebar;
window.renderBlock = renderBlock;
window.renderEmptyState = renderEmptyState;
window.renderLayout = renderLayout;

// Router utilities
window.getHashRoute = getHashRoute;
window.setHashRoute = setHashRoute;

// DOM utilities
window.$ = $;
window.
$$
=
$$
;

// Modal functions
window.showAddBlockModal = showAddBlockModal;
window.showEditBlockModal = showEditBlockModal;
window.showAddProductModal = showAddProductModal;
window.showEditProductModal = showEditProductModal;
window.deleteProductConfirm = deleteProductConfirm;
window.toggleProductStatus = toggleProductStatus;

// Firebase service
window.firebaseService = firebaseService;

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('❌ Global error:', event.error);
    showToast('An error occurred. Please try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Unhandled promise rejection:', event.reason);
    showToast('An error occurred. Please try again.', 'error');
});

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

// Log performance metrics
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log(`📊 Page load time: ${loadTime}ms`);
    });
}

// ============================================================================
// SERVICE WORKER (Optional - for offline support)
// ============================================================================

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.warn('⚠️ Service Worker registration failed:', error);
    });
}