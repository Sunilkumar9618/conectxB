/* ============================================================================
   AUTH - Authentication, Signup, Login, Session Management
   ============================================================================ */

const auth = {
    // Check if user is logged in
    isLoggedIn() {
        const session = getFromStorage('jsbeacons_session');
        return !!(session && session.loggedIn);
    },
    
    // Get current user
    getCurrentUser() {
        const session = getFromStorage('jsbeacons_session');
        if (!session || !session.loggedIn) return null;
        
        const users = getFromStorage('beacons_users', {});
        return users[session.handle];
    },
    
    // Get current handle
    getCurrentHandle() {
        const session = getFromStorage('jsbeacons_session');
        return session?.handle;
    },
    
    // Sign up
    signup(name, email, password, handle) {
        // Validation
        if (!name || !email || !password || !handle) {
            return { error: 'All fields required' };
        }
        
        if (!isValidEmail(email)) {
            return { error: 'Invalid email' };
        }
        
        if (!isValidPassword(password)) {
            return { error: 'Password must be at least 6 characters' };
        }
        
        if (!validateHandle(handle)) {
            return { error: 'Handle must be 3-20 alphanumeric characters' };
        }
        
        // Check if handle already exists
        const users = getFromStorage('beacons_users', {});
        if (users[handle]) {
            return { error: 'Handle already taken' };
        }
        
        // Create user
        users[handle] = {
            name,
            email,
            password, // In production, hash this!
            bio: '',
            avatar: null,
            created: new Date().toISOString()
        };
        
        setToStorage('beacons_users', users);
        
        // Initialize user data structures
        this.initializeUserData(handle);
        
        // Create session
        this.login(email, password);
        
        return { success: true };
    },
    
    // Login
    login(email, password) {
        // Validation
        if (!email || !password) {
            return { error: 'Email and password required' };
        }
        
        // Find user
        const users = getFromStorage('beacons_users', {});
        let foundHandle = null;
        
        for (const [handle, user] of Object.entries(users)) {
            if (user.email === email && user.password === password) {
                foundHandle = handle;
                break;
            }
        }
        
        if (!foundHandle) {
            return { error: 'Invalid email or password' };
        }
        
        // Create session
        const session = {
            loggedIn: true,
            handle: foundHandle,
            loginTime: new Date().toISOString()
        };
        
        setToStorage('jsbeacons_session', session);
        
        return { success: true, handle: foundHandle };
    },
    
    // Logout
    logout() {
        removeFromStorage('jsbeacons_session');
        router.navigate('home');
    },
    
    // Initialize user data structures
    initializeUserData(handle) {
        // Initialize blocks
        const blocks = getFromStorage('beacons_blocks', {});
        blocks[handle] = [];
        setToStorage('beacons_blocks', blocks);
        
        // Initialize theme
        const themes = getFromStorage('beacons_theme', {});
        themes[handle] = {
            bg: 'linear-gradient(135deg, #6C63FF, #FF6584)',
            font: 'DM Sans',
            btnStyle: 'rounded',
            btnColor: '#6C63FF',
            textColor: '#FFFFFF',
            cardStyle: 'glass'
        };
        setToStorage('beacons_theme', themes);
        
        // Initialize products
        const products = getFromStorage('beacons_products', {});
        products[handle] = [];
        setToStorage('beacons_products', products);
        
        // Initialize analytics
        const analytics = getFromStorage('beacons_analytics', {});
        analytics[handle] = {
            views: [],
            clicks: {},
            sources: {}
        };
        setToStorage('beacons_analytics', analytics);
    },
    
    // Check handle availability
    checkHandleAvailability(handle) {
        if (!validateHandle(handle)) {
            return { available: false, message: 'Invalid format' };
        }
        
        const users = getFromStorage('beacons_users', {});
        if (users[handle]) {
            return { available: false, message: 'Already taken' };
        }
        
        return { available: true, message: 'Available' };
    },
    
    // Update user profile
    updateProfile(updates) {
        const handle = this.getCurrentHandle();
        if (!handle) return { error: 'Not logged in' };
        
        const users = getFromStorage('beacons_users', {});
        if (!users[handle]) {
            return { error: 'User not found' };
        }
        
        users[handle] = {
            ...users[handle],
            ...updates
        };
        
        setToStorage('beacons_users', users);
        
        emit('profile-updated', users[handle]);
        return { success: true };
    },
    
    // Change password
    changePassword(oldPassword, newPassword) {
        const handle = this.getCurrentHandle();
        if (!handle) return { error: 'Not logged in' };
        
        const users = getFromStorage('beacons_users', {});
        const user = users[handle];
        
        if (user.password !== oldPassword) {
            return { error: 'Current password incorrect' };
        }
        
        if (!isValidPassword(newPassword)) {
            return { error: 'Password must be at least 6 characters' };
        }
        
        user.password = newPassword;
        setToStorage('beacons_users', users);
        
        return { success: true };
    },
    
    // Delete account
    deleteAccount() {
        const handle = this.getCurrentHandle();
        if (!handle) return { error: 'Not logged in' };
        
        // Delete user
        const users = getFromStorage('beacons_users', {});
        delete users[handle];
        setToStorage('beacons_users', users);
        
        // Delete user data
        let blocks = getFromStorage('beacons_blocks', {});
        delete blocks[handle];
        setToStorage('beacons_blocks', blocks);
        
        let themes = getFromStorage('beacons_theme', {});
        delete themes[handle];
        setToStorage('beacons_theme', themes);
        
        let products = getFromStorage('beacons_products', {});
        delete products[handle];
        setToStorage('beacons_products', products);
        
        let analytics = getFromStorage('beacons_analytics', {});
        delete analytics[handle];
        setToStorage('beacons_analytics', analytics);
        
        // Logout
        this.logout();
        
        return { success: true };
    }
};

// ---- RENDER AUTH VIEW ----

views.auth = async function() {
    const session = getFromStorage('jsbeacons_session');
    
    // Redirect if already logged in
    if (session && session.loggedIn) {
        await router.navigate('dashboard');
        return '';
    }
    
    const html = `
        ${renderNavbar()}
        <div class="main-content">
            <div class="auth-container">
                <div class="auth-box">
                    <h1 class="auth-title">Join connectxB</h1>
                    
                    <div class="auth-tabs" id="auth-tabs">
                        <button class="auth-tab active" data-tab="signup">Sign Up</button>
                        <button class="auth-tab" data-tab="login">Log In</button>
                    </div>
                    
                    <!-- SIGNUP FORM -->
                    <div id="signup-tab" class="tab-content active">
                        <div class="auth-form" id="signup-form">
                            <div class="form-group">
                                <label class="form-label required">Full Name</label>
                                <input type="text" class="form-input" id="signup-name" placeholder="Your name">
                                <div class="form-error hidden" id="signup-name-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Email</label>
                                <input type="email" class="form-input" id="signup-email" placeholder="you@example.com">
                                <div class="form-error hidden" id="signup-email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Handle</label>
                                <input type="text" class="form-input" id="signup-handle" placeholder="@yourhandle">
                                <div class="form-hint" id="signup-handle-hint" style="color: var(--text-secondary);">3-20 alphanumeric characters</div>
                                <div class="form-error hidden" id="signup-handle-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Password</label>
                                <input type="password" class="form-input" id="signup-password" placeholder="At least 6 characters">
                                <div class="form-error hidden" id="signup-password-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Confirm Password</label>
                                <input type="password" class="form-input" id="signup-confirm" placeholder="Confirm your password">
                                <div class="form-error hidden" id="signup-confirm-error"></div>
                            </div>
                            
                            <button class="btn btn-primary" id="signup-btn" style="width: 100%;">Create Account</button>
                            
                            <div class="divider"></div>
                            
                            <button class="btn btn-secondary" style="width: 100%; gap: 8px;">
                                <span>📱</span>
                                Continue with Google
                            </button>
                        </div>
                    </div>
                    
                    <!-- LOGIN FORM -->
                    <div id="login-tab" class="tab-content">
                        <div class="auth-form" id="login-form">
                            <div class="form-group">
                                <label class="form-label required">Email</label>
                                <input type="email" class="form-input" id="login-email" placeholder="you@example.com">
                                <div class="form-error hidden" id="login-email-error"></div>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">Password</label>
                                <input type="password" class="form-input" id="login-password" placeholder="Your password">
                                <div class="form-error hidden" id="login-password-error"></div>
                            </div>
                            
                            <button class="btn btn-primary" id="login-btn" style="width: 100%;">Sign In</button>
                            
                            <div class="divider"></div>
                            
                            <button class="btn btn-secondary" style="width: 100%; gap: 8px;">
                                <span>📱</span>
                                Continue with Google
                            </button>
                            
                            <div class="auth-footer">
                                <a href="#">Forgot password?</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Delay to ensure DOM is ready
    setTimeout(() => {
        initAuthView();
    }, 10);
    
    return html;
};

// Initialize auth view event handlers
function initAuthView() {
    const tabs = document.querySelectorAll('.auth-tab');
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });
    
    // Signup handler
    if (signupBtn) {
        signupBtn.addEventListener('click', handleSignup);
    }
    
    // Login handler
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
    
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle-navbar');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            theme.toggle();
        });
    }
}

function handleSignup() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const handle = document.getElementById('signup-handle').value;
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;
    
    // Clear errors
    document.querySelectorAll('[id*="signup-error"]').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Validation
    if (!name) {
        showError('signup-name-error', 'Name required');
        return;
    }
    
    if (!email || !isValidEmail(email)) {
        showError('signup-email-error', 'Valid email required');
        return;
    }
    
    if (!handle) {
        showError('signup-handle-error', 'Handle required');
        return;
    }
    
    if (!password || password.length < 6) {
        showError('signup-password-error', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirm) {
        showError('signup-confirm-error', 'Passwords do not match');
        return;
    }
    
    // Attempt signup
    const result = auth.signup(name, email, password, handle);
    
    if (result.error) {
        if (result.error.includes('Handle')) {
            showError('signup-handle-error', result.error);
        } else {
            showError('signup-email-error', result.error);
        }
        return;
    }
    
    // Success
    showToast('Account created! Welcome to connectxB! 🎉', 'success');
    router.navigate('dashboard');
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Clear errors
    document.querySelectorAll('[id*="login-error"]').forEach(el => {
        el.classList.add('hidden');
    });
    
    // Validation
    if (!email) {
        showError('login-email-error', 'Email required');
        return;
    }
    
    if (!password) {
        showError('login-password-error', 'Password required');
        return;
    }
    
    // Attempt login
    const result = auth.login(email, password);
    
    if (result.error) {
        showError('login-email-error', result.error);
        return;
    }
    
    // Success
    showToast(`Welcome back! 👋`, 'success');
    router.navigate('dashboard');
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = '⚠️ ' + message;
        errorEl.classList.remove('hidden');
    }
}
