/* ============================================================================
   APP - Main Application Initialization
   ============================================================================ */


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
        
        // Routes that require guest status
        const guestRoutes = ['auth'];
        
        if (guestRoutes.includes(route)) {
            return requireGuest(route, params);
        }
        
        return true;
    });
    
    // Initialize modals and components
    initializeGlobalListeners();
    
    // Start router
    await router.start();
    
    // Show app after loading
    setTimeout(() => {
        const loading = $('#loading-screen');
        if (loading) {
            loading.classList.add('hidden');
        }
    }, 500);
}

function initializeGlobalListeners() {
    // Close modals on escape
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
    
    // Initialize accordions when view changes
    document.addEventListener('view-changed', () => {
        setTimeout(() => {
            initAccordion();
            initTabs();
            initDropdowns();
        }, 100);
    });
}

// Make functions available globally for inline event handlers
window.router = router;
window.auth = auth;
window.builder = builder;
window.store = store;
window.analytics = analytics;
window.theme = theme;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showAlert = showAlert;
window.showPrompt = showPrompt;
window.Modal = Modal;
window.copyToClipboard = copyToClipboard;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.getInitials = getInitials;
window.emit = emit;
window.renderNavbar = renderNavbar;
window.renderSidebar = renderSidebar;
window.renderBlock = renderBlock;
window.renderEmptyState = renderEmptyState;
window.renderLayout = renderLayout;
window.getHashRoute = getHashRoute;
window.setHashRoute = setHashRoute;
window.$= $;
window.$$ = $$;
window.showAddBlockModal = showAddBlockModal;
window.showEditBlockModal = showEditBlockModal;
window.showAddProductModal = showAddProductModal;
window.showEditProductModal = showEditProductModal;
window.deleteProductConfirm = deleteProductConfirm;
