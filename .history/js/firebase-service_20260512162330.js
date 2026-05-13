/* ============================================================================
   FIREBASE SERVICE - Complete Firebase Operations Handler
   ============================================================================ */

console.log('📦 Loading Firebase Service...');

// Simple Firebase Service - no waiting needed
const firebaseService = {
    
    async signUp(email, password, userData) {
        try {
            console.log('🔐 Creating user account...');
            
            // Check if Firebase Auth is available
            if (!fbAuth) {
                throw new Error('Firebase Auth not initialized. fbAuth is undefined');
            }
            
            const userCredential = await fbAuth.createUserWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            
            console.log('✅ User created in Auth');
            
            await fbDb.collection('users').doc(userId).set({
                uid: userId,
                email: email,
                ...userData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User profile saved to Firestore');
            return { success: true, userId: userId, user: userCredential.user };
        } catch (error) {
            console.error('❌ Sign up error:', error.message);
            return { success: false, error: error.message };
        }
    },

    async login(email, password) {
        try {
            console.log('🔑 Logging in...');
            const userCredential = await fbAuth.signInWithEmailAndPassword(email, password);
            const userId = userCredential.user.uid;
            const userProfile = await this.getUserProfile(userId);
            
            console.log('✅ User logged in');
            return { success: true, user: userCredential.user, profile: userProfile };
        } catch (error) {
            console.error('❌ Login error:', error.message);
            return { success: false, error: error.message };
        }
    },

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

    getCurrentUser() {
        return fbAuth.currentUser;
    },

    onAuthStateChanged(callback) {
        return fbAuth.onAuthStateChanged(callback);
    },

    async saveUserProfile(userId, profileData) {
        try {
            await fbDb.collection('users').doc(userId).set({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            
            console.log('✅ Profile saved');
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving profile:', error.message);
            return { success: false, error: error.message };
        }
    },

    async getUserProfile(userId) {
        try {
            const doc = await fbDb.collection('users').doc(userId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting profile:', error.message);
            return null;
        }
    },

    async updateUserProfile(userId, updates) {
        try {
            await fbDb.collection('users').doc(userId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Profile updated');
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating profile:', error.message);
            return { success: false, error: error.message };
        }
    },

    async checkHandleAvailability(handle) {
        try {
            console.log('🔍 Checking handle:', handle);
            
            const snapshot = await fbDb.collection('users')
                .where('handle', '==', handle)
                .get();
            
            const available = snapshot.empty;
            console.log(available ? '✅ Available' : '❌ Taken');
            
            return { 
                available: available, 
                message: available ? 'Available' : 'Already taken' 
            };
        } catch (error) {
            console.error('❌ Handle check error:', error.message);
            return { available: false, message: error.message };
        }
    },

    async deleteUserAccount(userId) {
        try {
            const user = fbAuth.currentUser;
            await fbDb.collection('users').doc(userId).delete();
            await user.delete();
            console.log('✅ Account deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ Delete error:', error.message);
            return { success: false, error: error.message };
        }
    },

    async savePage(userId, pageId, pageData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).set({
                    id: pageId,
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

    async getUserPages(userId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('pages').get();
            
            const pages = [];
            snapshot.forEach(doc => {
                pages.push({ id: doc.id, ...doc.data() });
            });
            
            return pages;
        } catch (error) {
            console.error('❌ Error getting pages:', error.message);
            return [];
        }
    },

    async getPage(userId, pageId) {
        try {
            const doc = await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).get();
            
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('❌ Error getting page:', error.message);
            return null;
        }
    },

    async deletePage(userId, pageId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId).delete();
            
            console.log('✅ Page deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting page:', error.message);
            return { success: false, error: error.message };
        }
    },

    async saveBlock(userId, pageId, blockId, blockData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').doc(blockId).set({
                    id: blockId,
                    ...blockData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving block:', error.message);
            return { success: false, error: error.message };
        }
    },

    async getPageBlocks(userId, pageId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').get();
            
            const blocks = [];
            snapshot.forEach(doc => {
                blocks.push({ id: doc.id, ...doc.data() });
            });
            
            return blocks;
        } catch (error) {
            console.error('❌ Error getting blocks:', error.message);
            return [];
        }
    },

    async deleteBlock(userId, pageId, blockId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('pages').doc(pageId)
                .collection('blocks').doc(blockId).delete();
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting block:', error.message);
            return { success: false, error: error.message };
        }
    },

    async saveProduct(userId, productId, productData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('products').doc(productId).set({
                    id: productId,
                    ...productData,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            console.log('✅ Product saved');
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving product:', error.message);
            return { success: false, error: error.message };
        }
    },

    async getUserProducts(userId) {
        try {
            const snapshot = await fbDb.collection('users').doc(userId)
                .collection('products').get();
            
            const products = [];
            snapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            
            return products;
        } catch (error) {
            console.error('❌ Error getting products:', error.message);
            return [];
        }
    },

    async deleteProduct(userId, productId) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('products').doc(productId).delete();
            
            console.log('✅ Product deleted');
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting product:', error.message);
            return { success: false, error: error.message };
        }
    },

    async saveAnalytics(userId, analyticsData) {
        try {
            await fbDb.collection('users').doc(userId)
                .collection('analytics').doc('overview').set({
                    ...analyticsData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            
            return { success: true };
        } catch (error) {
            console.error('❌ Error saving analytics:', error.message);
            return { success: false, error: error.message };
        }
    },

    async getAnalytics(userId) {
        try {
            const doc = await fbDb.collection('users').doc(userId)
                .collection('analytics').doc('overview').get();
            
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('❌ Error getting analytics:', error.message);
            return null;
        }
    }
};

window.firebaseService = firebaseService;
console.log('✅ Firebase Service loaded');