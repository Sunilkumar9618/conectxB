/* ============================================================================
   AUTH - Authentication with Firebase
   ============================================================================ */

const auth = {
    currentUser: null,
    isAuthenticated: false,

    // Initialize Firebase authentication
    async init() {
        console.log('🔐 Initializing Firebase Auth...');
        
        return new Promise((resolve) => {
            try {
                // Check if Firebase is available
                if (typeof fbAuth === 'undefined') {
                    console.error('❌ Firebase Auth not available');
                    resolve();
                    return;
                }

                firebaseService.onAuthStateChanged(async (user) => {
                    if (user) {
                        this.currentUser = user;
                        this.isAuthenticated = true;

                        // Get user profile from Firestore
                        const profile = await firebaseService.getUserProfile(user.uid);
                        this.currentUser.profile = profile;

                        console.log('✅ User authenticated:', user.email);
                    } else {
                        this.currentUser = null;
                        this.isAuthenticated = false;
                        console.log('🚪 No authenticated user');
                    }
                    resolve();
                });
            } catch (error) {
                console.error('❌ Auth init error:', error);
                resolve();
            }
        });
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    },

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    },

    // Get current user ID
    getCurrentUserId() {
        return this.currentUser?.uid;
    },

    // Get current user handle
    getCurrentHandle() {
        return this.currentUser?.profile?.handle;
    },

    // Sign up
    async signup(name, email, password, handle) {
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
        const handleCheck = await firebaseService.checkHandleAvailability(handle);
        if (!handleCheck.available) {
            return { error: 'Handle already taken' };
        }

        // Create user with Firebase
        const result = await firebaseService.signUp(email, password, {
            name: name,
            email: email,
            handle: handle,
            bio: '',
            avatar: null
        });

        if (result.success) {
            this.currentUser = result.user;
            this.currentUser.profile = {
                name: name,
                email: email,
                handle: handle,
                bio: '',
                avatar: null
            };
            this.isAuthenticated = true;

            // Initialize user data structures in Firestore
            await this.initializeUserData(result.userId);

            return { success: true };
        } else {
            return { error: result.error };
        }
    },

    // Login
    async login(email, password) {
        // Validation
        if (!email || !password) {
            return { error: 'Email and password required' };
        }

        // Attempt login with Firebase
        const result = await firebaseService.login(email, password);

        if (result.success) {
            this.currentUser = result.user;
            this.currentUser.profile = result.profile;
            this.isAuthenticated = true;
            return { success: true, handle: result.profile?.handle };
        } else {
            return { error: result.error };
        }
    },

    // Logout
    async logout() {
        const result = await firebaseService.logout();

        if (result.success) {
            this.currentUser = null;
            this.isAuthenticated = false;
            router.navigate('home');
        }
    },

    // Initialize user data structures in Firestore
    async initializeUserData(userId) {
        try {
            // Create initial user collections
            await firebaseService.savePage(userId, 'default-page', {
                title: 'My Page',
                description: 'Welcome to my page!',
                blocks: [],
                theme: {
                    bg: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                    font: 'DM Sans',
                    btnStyle: 'rounded',
                    btnColor: '#6C63FF',
                    textColor: '#FFFFFF',
                    cardStyle: 'glass'
                }
            });

            // Initialize analytics
            await firebaseService.saveAnalytics(userId, {
                views: [],
                clicks: {},
                sources: {}
            });

            console.log('✅ User data structures initialized');
        } catch (error) {
            console.error('❌ Error initializing user data:', error);
        }
    },

    // Check handle availability
    async checkHandleAvailability(handle) {
        if (!validateHandle(handle)) {
            return { available: false, message: 'Invalid format' };
        }

        const result = await firebaseService.checkHandleAvailability(handle);
        return result;
    },

    // Update user profile
    async updateProfile(updates) {
        if (!this.currentUser) {
            return { error: 'Not logged in' };
        }

        const result = await firebaseService.updateUserProfile(this.currentUser.uid, updates);

        if (result.success) {
            this.currentUser.profile = { ...this.currentUser.profile, ...updates };
            emit('profile-updated', this.currentUser.profile);
            return { success: true };
        }

        return result;
    },

    // Change password
    async changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            return { error: 'Not logged in' };
        }

        try {
            // Re-authenticate user
            const credential = firebase.auth.EmailAuthProvider.credential(
                this.currentUser.email,
                oldPassword
            );

            await this.currentUser.reauthenticateWithCredential(credential);

            // Update password
            await this.currentUser.updatePassword(newPassword);

            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    },

    // Delete account
    async deleteAccount() {
        if (!this.currentUser) {
            return { error: 'Not logged in' };
        }

        try {
            const userId = this.currentUser.uid;

            // Delete user data from Firestore (will be handled by cascade delete rules)
            // Or manually delete collections

            // Delete user from Firebase Auth
            await this.currentUser.delete();

            this.currentUser = null;
            this.isAuthenticated = false;

            console.log('✅ Account deleted');
            return { success: true };
        } catch (error) {
            return { error: error.message };
        }
    }
};

// ---- RENDER AUTH VIEW ----

views.auth = async function() {
    // Redirect if already logged in
    if (auth.isLoggedIn()) {
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

async function handleSignup() {
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

    // Show loading state
    const btn = document.getElementById('signup-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Creating account...</span>';

    // Attempt signup
    const result = await auth.signup(name, email, password, handle);

    if (result.error) {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (result.error.includes('Handle')) {
            showError('signup-handle-error', result.error);
        } else if (result.error.includes('email')) {
            showError('signup-email-error', result.error);
        } else {
            showError('signup-email-error', result.error);
        }
        return;
    }

    // Success
    showToast('Account created! Welcome to connectxB! 🎉', 'success');
    await router.navigate('dashboard');
}

async function handleLogin() {
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

    // Show loading state
    const btn = document.getElementById('login-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span>Signing in...</span>';

    // Attempt login
    const result = await auth.login(email, password);

    if (result.error) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        showError('login-email-error', result.error);
        return;
    }

    // Success
    showToast(`Welcome back! 👋`, 'success');
    await router.navigate('dashboard');
}

function showError(elementId, message) {
    const errorEl = document.getElementById(elementId);
    if (errorEl) {
        errorEl.textContent = '⚠️ ' + message;
        errorEl.classList.remove('hidden');
    }
}