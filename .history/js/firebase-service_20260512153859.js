/* ============================================================================
   FIREBASE SERVICE - Handle all Firebase operations
   ============================================================================ */

// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase not loaded! Make sure Firebase SDK is included in index.html');
}

if (typeof fbAuth === 'undefined' || typeof fbDb === 'undefined') {
    console.error('❌ Firebase Auth or Firestore not initialized!');
}

const firebaseService = {
    // ========================================
    // USER AUTHENTICATION
    // ========================================
    
    /**
     * Sign up new user
     */
    async signUp(email, password, userData) {
        try {
            const userCredential = await fbAuth.createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            
            // Save user profile to Firestore
            await this.saveUserProfile(userId, {
                email: email,
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User signed up:', userId);
            return { success: true, userId: userId, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign up error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Login user
     */
    async login(email, password) {
        try {
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            
            // Get user profile from Firestore
            const userProfile = await this.getUserProfile(userId);
            
            console.log('✅ User logged in:', email);
            return { success: true, user: userCredential.user, profile: userProfile };
        } catch (error) {
            console.error('❌ Login error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Logout user
     */
    async logout() {
        try {
            await fbAuth.signOut();
            console.log('✅ User logged out');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return fbAuth.currentUser;
    },

    /**
     * Monitor authentication state changes
     */
    onAuthStateChanged(callback) {
        return fbAuth.onAuthStateChanged(callback);
    },

    // ========================================
    // USER PROFILE MANAGEMENT
    // ========================================

    /**
     * Save user profile to Firestore
     */
    async saveUserProfile(userId, profileData) {
        try {
            await fbDb.collection('users').doc(userId).set({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Profile saved:', userId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving profile:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get user profile from Firestore
     */
    async getUserProfile(userId) {
        try {
            const doc = await fbDb.collection('users').doc(userId).get();
            if (doc.exists) {
                console.log('✅ Profile retrieved:', userId);
                return doc.data();
            } else {
                console.log('⚠️ No profile found:', userId);
                return null;
            }
        } catch (error) {
            console.error('❌ Error retrieving profile:', error.message);
            return null;
        }
    },

    /**
     * Update user profile
     */
    async updateUserProfile(userId, updates) {
        try {
            await fbDb.collection('users').doc(userId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Profile updated:', userId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating profile:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete user account
     */
    async deleteUserAccount(userId) {
        try {
            const user = fbAuth.currentUser;
            
            // Delete user profile from Firestore
            await fbDb.collection('users').doc(userId).delete();
            
            // Delete user from Firebase Auth
            await user.delete();
            
            console.log('✅ Account deleted:', userId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting account:', error.message);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // PAGES / LINKS DATA
    // ========================================

    /**
     * Save page/link data
     */
    async savePage(userId, pageId, pageData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).set({
                    ...pageData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Page saved:', pageId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving page:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all pages for a user
     */
    async getUserPages(userId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('pages').get();
            
            const pages = [];
            snapshot.forEach(doc => {
                pages.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Pages retrieved:', pages.length);
            return pages;
        } catch (error) {
            console.error('❌ Error retrieving pages:', error.message);
            return [];
        }
    },

    /**
     * Get single page
     */
    async getPage(userId, pageId) {
        try {
            const doc = await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).get();
            
            if (doc.exists) {
                console.log('✅ Page retrieved:', pageId);
                return { id: doc.id, ...doc.data() };
            } else {
                console.log('⚠️ Page not found:', pageId);
                return null;
            }
        } catch (error) {
            console.error('❌ Error retrieving page:', error.message);
            return null;
        }
    },

    /**
     * Delete page
     */
    async deletePage(userId, pageId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).delete();
            
            console.log('✅ Page deleted:', pageId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting page:', error.message);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // BLOCKS DATA (Page Elements)
    // ========================================

    /**
     * Save block data
     */
    async saveBlock(userId, pageId, blockId, blockData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').doc(blockId).set({
                    ...blockData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Block saved:', blockId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving block:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all blocks for a page
     */
    async getPageBlocks(userId, pageId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').get();
            
            const blocks = [];
            snapshot.forEach(doc => {
                blocks.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Blocks retrieved:', blocks.length);
            return blocks;
        } catch (error) {
            console.error('❌ Error retrieving blocks:', error.message);
            return [];
        }
    },

    /**
     * Delete block
     */
    async deleteBlock(userId, pageId, blockId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').doc(blockId).delete();
            
            console.log('✅ Block deleted:', blockId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting block:', error.message);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // PRODUCTS DATA
    // ========================================

    /**
     * Save product
     */
    async saveProduct(userId, productId, productData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('products').doc(productId).set({
                    ...productData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Product saved:', productId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving product:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all products for a user
     */
    async getUserProducts(userId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('products').get();
            
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            
            console.log('✅ Products retrieved:', products.length);
            return products;
        } catch (error) {
            console.error('❌ Error retrieving products:', error.message);
            return [];
        }
    },

    /**
     * Delete product
     */
    async deleteProduct(userId, productId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('products').doc(productId).delete();
            
            console.log('✅ Product deleted:', productId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting product:', error.message);
            return { success: false, error: error.message };
        }
    },

    // ========================================
    // ANALYTICS DATA
    // ========================================

    /**
     * Save analytics data
     */
    async saveAnalytics(userId, analyticsData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('analytics').doc('overview').set({
                    ...analyticsData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Analytics saved');
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving analytics:', error.message);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get analytics data
     */
    async getAnalytics(userId) {
        try {
            const doc = await fbDb.collection('users').doc(userId)
                .collection('analytics').doc('overview').get();
            
            if (doc.exists) {
                console.log('✅ Analytics retrieved');
                return doc.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error('❌ Error retrieving analytics:', error.message);
            return null;
        }
    }
};

// Make Firebase service available globally
window.firebaseService = firebaseService;