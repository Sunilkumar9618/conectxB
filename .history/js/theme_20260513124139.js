/* ============================================================================
   THEME - Dark/Light Mode, Theme Customization, CSS Variables
   ============================================================================ */

const theme = {
    currentMode: 'dark',
    
    // Initialize theme
    init() {
        const savedTheme = getFromStorage('jsbeacons_theme', {});
        const mode = savedTheme.mode || 'dark';
        this.setMode(mode);
    },
    
    // Set theme mode
    setMode(mode) {
        this.currentMode = mode;
        document.documentElement.setAttribute('data-theme', mode);
        
        let savedTheme = getFromStorage('jsbeacons_theme', {});
        savedTheme.mode = mode;
        setToStorage('jsbeacons_theme', savedTheme);
        
        emit('theme-changed', { mode });
        this.updateThemeToggle();
    },
    
    // Toggle between dark and light
    toggle() {
        const newMode = this.currentMode === 'dark' ? 'light' : 'dark';
        this.setMode(newMode);
        showToast(`Switched to ${newMode} mode`, 'info', 2000);
    },
    
    // Apply user theme
    applyUserTheme(handle) {
        const themes = getFromStorage('beacons_theme', {});
        const userTheme = themes[handle];
        
        if (!userTheme) return;
        
        // Set CSS variables
        const root = document.documentElement;
        
        if (userTheme.bg) {
            root.style.setProperty('--bg-gradient', userTheme.bg);
        }
        
        if (userTheme.btnColor) {
            root.style.setProperty('--primary', userTheme.btnColor);
        }
        
        if (userTheme.textColor) {
            root.style.setProperty('--text', userTheme.textColor);
        }
        
        if (userTheme.font) {
            root.style.setProperty('--font-body', userTheme.font);
        }
        
        emit('user-theme-applied', userTheme);
    },
    
    // Update user theme
    updateUserTheme(handle, updates) {
        let themes = getFromStorage('beacons_theme', {});
        if (!themes[handle]) {
            themes[handle] = {
                bg: 'linear-gradient(135deg, #1d8f7f, #17a697)',
                font: 'DM Sans',
                btnStyle: 'rounded',
                btnColor: '#17a697',
                textColor: '#FFFFFF',
                cardStyle: 'glass'
            };
        }
        
        themes[handle] = {
            ...themes[handle],
            ...updates
        };
        
        setToStorage('beacons_theme', themes);
        
        // ALSO save to Firestore for persistence
        if (auth.isLoggedIn()) {
            const userId = auth.currentUser.uid;
            firebaseService.updateUserProfile(userId, { 
                theme: themes[handle] 
            }).catch(error => {
                console.error('❌ Error saving theme to Firestore:', error);
            });
        }
        
        emit('user-theme-updated', themes[handle]);
    },
    
    // Get user theme
    getUserTheme(handle) {
        const themes = getFromStorage('beacons_theme', {});
        return themes[handle] || null;
    },
    
    // Update theme toggle button
    updateThemeToggle() {
        const btn = document.getElementById('theme-toggle-navbar');
        if (btn) {
            btn.textContent = this.currentMode === 'dark' ? '☀️' : '🌙';
        }
    }
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
    theme.init();
});
