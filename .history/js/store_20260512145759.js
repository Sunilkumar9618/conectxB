/* ============================================================================
   STORE - Product Store Management with Firebase
   ============================================================================ */

const store = {
    products: [],
    currentUserId: null,

    // Initialize store
    async init() {
        if (!auth.isAuthenticated || !auth.currentUser) {
            console.error('User not authenticated');
            return;
        }

        this.currentUserId = auth.currentUser.uid;
        await this.loadProducts();
    },

    // Load products from Firestore
    async loadProducts() {
        if (!this.currentUserId) return;

        try {
            this.products = await firebaseService.getUserProducts(this.currentUserId);
            console.log('✅ Products loaded:', this.products.length);
        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.products = [];
        }
    },

    // Add product
    async addProduct(productData) {
        if (!this.currentUserId) {
            return { error: 'Not authenticated' };
        }

        try {
            const productId = generateId('p');
            const product = {
                id: productId,
                ...productData,
                created: new Date().toISOString(),
                status: 'draft',
                sales: 0
            };

            const result = await firebaseService.saveProduct(this.currentUserId, productId, product);

            if (result.success) {
                this.products.push(product);
                emit('product-added', product);
                return { success: true, product };
            }

            return result;
        } catch (error) {
            console.error('❌ Error adding product:', error);
            return { error: error.message };
        }
    },

    // Update product
    async updateProduct(productId, updates) {
        if (!this.currentUserId) {
            return { error: 'Not authenticated' };
        }

        try {
            const result = await firebaseService.saveProduct(this.currentUserId, productId, updates);

            if (result.success) {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    Object.assign(product, updates);
                    emit('product-updated', product);
                }
            }

            return result;
        } catch (error) {
            console.error('❌ Error updating product:', error);
            return { error: error.message };
        }
    },

    // Delete product
    async deleteProduct(productId) {
        if (!this.currentUserId) {
            return { error: 'Not authenticated' };
        }

        try {
            const result = await firebaseService.deleteProduct(this.currentUserId, productId);

            if (result.success) {
                this.products = this.products.filter(p => p.id !== productId);
                emit('product-deleted', { productId });
            }

            return result;
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            return { error: error.message };
        }
    },

    // Toggle product status
    async toggleProductStatus(productId) {
        if (!this.currentUserId) {
            return { error: 'Not authenticated' };
        }

        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) return { error: 'Product not found' };

            const newStatus = product.status === 'draft' ? 'published' : 'draft';

            const result = await firebaseService.saveProduct(this.currentUserId, productId, {
                status: newStatus
            });

            if (result.success) {
                product.status = newStatus;
                emit('product-status-changed', { productId, status: newStatus });
            }

            return result;
        } catch (error) {
            console.error('❌ Error toggling product status:', error);
            return { error: error.message };
        }
    },

    // Get product
    getProduct(productId) {
        return this.products.find(p => p.id === productId);
    },

    // Get all published products
    getPublishedProducts() {
        return this.products.filter(p => p.status === 'published');
    }
};

// ---- RENDER STORE VIEW ----

views.store = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }

    await store.init();

    const user = auth.currentUser.profile;
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];

    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div style="padding: var(--spacing-xl);">
                <div class="store-header">
                    <div>
                        <h1 style="margin: 0;">Store</h1>
                        <p style="color: var(--text-secondary); margin: 0;">Manage your digital products</p>
                    </div>
                    <button class="btn btn-primary" id="add-product-btn">
                        <span>+</span>
                        <span>Add Product</span>
                    </button>
                </div>

                <div class="store-products" id="products-grid">
                    ${store.products.length === 0 ? `
                        ${renderEmptyState('📭', 'No products yet', 'Create your first digital product to start selling', {
                            label: '+ Add Product',
                            callback: () => showAddProductModal()
                        })}
                    ` : ''}

                    ${store.products.map(product => `
                        <div class="product-card" data-product-id="${product.id}">
                            <div class="product-image" style="background-color: var(--card-bg); display: flex; align-items: center; justify-content: center;">
                                ${product.image ? `
                                    <img src="${product.image}" alt="${product.title}" style="width: 100%; height: 100%; object-fit: cover;">
                                ` : `
                                    <span style="font-size: 64px; opacity: 0.5;">📦</span>
                                `}
                            </div>

                            <div class="product-info">
                                <h3 class="product-title">${product.title}</h3>
                                <div class="product-price">${formatCurrency(product.price)}</div>

                                <div class="product-status">
                                    <span class="badge badge-${product.status === 'published' ? 'success' : 'warning'}">
                                        ${product.status === 'published' ? '✓ Published' : '◐ Draft'}
                                    </span>
                                    <span style="color: var(--text-secondary);">${product.sales || 0} sales</span>
                                </div>

                                <div class="product-actions">
                                    <button class="product-action-btn btn-secondary" onclick="showEditProductModal('${product.id}')">Edit</button>
                                    <button class="product-action-btn btn-secondary" onclick="toggleProductStatus('${product.id}')">
                                        ${product.status === 'published' ? 'Unpublish' : 'Publish'}
                                    </button>
                                    <button class="product-action-btn btn-danger" onclick="deleteProductConfirm('${product.id}')">Delete</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        initStoreView();
    }, 10);

    return html;
};

function initStoreView() {
    const addBtn = document.getElementById('add-product-btn');
    if (addBtn) {
        addBtn.addEventListener('click', showAddProductModal);
    }

    // Hamburger menu
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            sidebar?.classList.toggle('visible');
        });
    }
}

function showAddProductModal() {
    const form = `
        <div class="form-group">
            <label class="form-label required">Product Name</label>
            <input type="text" class="form-input" id="add-product-name" placeholder="e.g., Digital Course">
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="add-product-desc" placeholder="Describe your product..."></textarea>
        </div>

        <div class="form-group">
            <label class="form-label required">Price</label>
            <div class="input-group">
                <span class="input-group-addon">$</span>
                <input type="number" class="form-input" id="add-product-price" placeholder="29.99" min="0.01" step="0.01">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="add-product-category">
                <option value="other">Other</option>
                <option value="course">Course</option>
                <option value="ebook">E-Book</option>
                <option value="template">Template</option>
                <option value="tool">Tool</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-input" id="add-product-image" placeholder="https://example.com/image.jpg">
        </div>

        <div class="form-group">
            <label class="form-label">Product URL</label>
            <input type="url" class="form-input" id="add-product-url" placeholder="https://example.com/product">
        </div>
    `;

    const modal = new Modal({
        title: 'Add New Product',
        content: form,
        closeable: true,
        actions: [
            {
                label: 'Cancel',
                type: 'ghost',
                callback: () => {}
            },
            {
                label: 'Create Product',
                type: 'primary',
                callback: () => addProductHandler(modal)
            }
        ]
    });

    modal.open();
}

async function addProductHandler(modal) {
    const name = document.getElementById('add-product-name').value;
    const desc = document.getElementById('add-product-desc').value;
    const price = parseFloat(document.getElementById('add-product-price').value);
    const category = document.getElementById('add-product-category').value;
    const image = document.getElementById('add-product-image').value;
    const url = document.getElementById('add-product-url').value;

    if (!name || !price) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const result = await store.addProduct({
        title: name,
        description: desc,
        price,
        category,
        image,
        url
    });

    if (result.error) {
        showToast('Error: ' + result.error, 'error');
        return;
    }

    showToast('Product created ✓', 'success');
    modal.close();
    await router.loadView('store');
}

function showEditProductModal(productId) {
    const product = store.getProduct(productId);
    if (!product) return;

    const form = `
        <div class="form-group">
            <label class="form-label required">Product Name</label>
            <input type="text" class="form-input" id="edit-product-name" value="${product.title}">
        </div>

        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-textarea" id="edit-product-desc">${product.description || ''}</textarea>
        </div>

        <div class="form-group">
            <label class="form-label required">Price</label>
            <div class="input-group">
                <span class="input-group-addon">$</span>
                <input type="number" class="form-input" id="edit-product-price" value="${product.price}" min="0.01" step="0.01">
            </div>
        </div>

        <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="edit-product-category">
                <option value="other" ${product.category === 'other' ? 'selected' : ''}>Other</option>
                <option value="course" ${product.category === 'course' ? 'selected' : ''}>Course</option>
                <option value="ebook" ${product.category === 'ebook' ? 'selected' : ''}>E-Book</option>
                <option value="template" ${product.category === 'template' ? 'selected' : ''}>Template</option>
                <option value="tool" ${product.category === 'tool' ? 'selected' : ''}>Tool</option>
            </select>
        </div>

        <div class="form-group">
            <label class="form-label">Image URL</label>
            <input type="url" class="form-input" id="edit-product-image" value="${product.image || ''}" placeholder="https://example.com/image.jpg">
        </div>

        <div class="form-group">
            <label class="form-label">Product URL</label>
            <input type="url" class="form-input" id="edit-product-url" value="${product.url || ''}" placeholder="https://example.com/product">
        </div>
    `;

    const modal = new Modal({
        title: 'Edit Product',
        content: form,
        closeable: true,
        actions: [
            {
                label: 'Cancel',
                type: 'ghost',
                callback: () => {}
            },
            {
                label: 'Save Changes',
                type: 'primary',
                callback: () => editProductHandler(productId, modal)
            }
        ]
    });

    modal.open();
}

async function editProductHandler(productId, modal) {
    const name = document.getElementById('edit-product-name').value;
    const desc = document.getElementById('edit-product-desc').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);
    const category = document.getElementById('edit-product-category').value;
    const image = document.getElementById('edit-product-image').value;
    const url = document.getElementById('edit-product-url').value;

    if (!name || !price) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const result = await store.updateProduct(productId, {
        title: name,
        description: desc,
        price,
        category,
        image,
        url
    });

    if (result.error) {
        showToast('Error: ' + result.error, 'error');
        return;
    }

    showToast('Product updated ✓', 'success');
    modal.close();
    await router.loadView('store');
}

async function toggleProductStatus(productId) {
    const result = await store.toggleProductStatus(productId);

    if (result.error) {
        showToast('Error: ' + result.error, 'error');
        return;
    }

    await router.loadView('store');
}

async function deleteProductConfirm(productId) {
    const confirmed = await showConfirm(
        'Are you sure you want to delete this product?',
        {
            title: 'Delete Product',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: async () => {
                const result = await store.deleteProduct(productId);

                if (result.error) {
                    showToast('Error: ' + result.error, 'error');
                    return;
                }

                showToast('Product deleted', 'success');
                await router.loadView('store');
            }
        }
    );
}