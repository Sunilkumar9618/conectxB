/* ============================================================================
   STORE - Product Store Management
   ============================================================================ */

const store = {
    currentHandle: null,
    products: [],
    
    // Initialize store
    init(handle) {
        this.currentHandle = handle;
        this.loadProducts();
    },
    
    // Load products from storage
    loadProducts() {
        const handle = this.currentHandle;
        const allProducts = getFromStorage('beacons_products', {});
        this.products = allProducts[handle] || [];
    },
    
    // Save products to storage
    saveProducts() {
        const handle = this.currentHandle;
        let allProducts = getFromStorage('beacons_products', {});
        allProducts[handle] = this.products;
        setToStorage('beacons_products', allProducts);
    },
    
    // Add product
    addProduct(productData) {
        const product = {
            id: generateId('p'),
            ...productData,
            created: new Date().toISOString(),
            status: 'draft',
            sales: 0
        };
        
        this.products.push(product);
        this.saveProducts();
        emit('product-added', product);
        return product;
    },
    
    // Update product
    updateProduct(productId, updates) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            Object.assign(product, updates);
            this.saveProducts();
            emit('product-updated', product);
        }
    },
    
    // Delete product
    deleteProduct(productId) {
        this.products = this.products.filter(p => p.id !== productId);
        this.saveProducts();
        emit('product-deleted', { productId });
    },
    
    // Toggle product status
    toggleProductStatus(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.status = product.status === 'draft' ? 'published' : 'draft';
            this.saveProducts();
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
    const session = getFromStorage('jsbeacons_session');
    const handle = session?.handle;
    
    if (!handle) {
        await router.navigate('auth');
        return '';
    }
    
    store.init(handle);
    
    const users = getFromStorage('beacons_users', {});
    const user = users[handle] || { name: 'User' };
    
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
                                <span style="font-size: 64px; opacity: 0.5;">📦</span>
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
                                    <button class="product-action-btn btn-secondary" onclick="store.toggleProductStatus('${product.id}'); router.loadView('store');">
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
    document.getElementById('add-product-btn')?.addEventListener('click', showAddProductModal);
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    hamburger?.addEventListener('click', () => {
        sidebar?.classList.toggle('visible');
    });
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
        <div class=\"form-group\">
            <label class=\"form-label\">Image URL</label>
            <input type=\"url\" class=\"form-input\" id=\"add-product-image\" placeholder=\"https://example.com/image.jpg\">
        </div>
        
        <div class=\"form-group\">
            <label class=\"form-label\">Product URL</label>
            <input type=\"url\" class=\"form-input\" id=\"add-product-url\" placeholder=\"https://example.com/product\">
        </div>    `;
    
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
                callback: () => {
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
                    
                    store.addProduct({
                        title: name,
                        description: desc,
                        price,
                        category,
                        image,
                        url
                    });
                    
                    showToast('Product created ✓', 'success');
                    router.loadView('store');
                }
            }
        ]
    });
    
    modal.open();
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
        <div class=\"form-group\">
            <label class=\"form-label\">Image URL</label>
            <input type=\"url\" class=\"form-input\" id=\"edit-product-image\" value=\"${product.image || ''}\" placeholder=\"https://example.com/image.jpg\">
        </div>
        
        <div class=\"form-group\">
            <label class=\"form-label\">Product URL</label>
            <input type=\"url\" class=\"form-input\" id=\"edit-product-url\" value=\"${product.url || ''}\" placeholder=\"https://example.com/product\">
        </div>    `;
    
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
                callback: () => {
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
                    
                    store.updateProduct(productId, {
                        title: name,
                        description: desc,
                        price,
                        category,
                        image,
                        url
                    });
                    
                    showToast('Product updated ✓', 'success');
                    router.loadView('store');
                }
            }
        ]
    });
    
    modal.open();
}

async function deleteProductConfirm(productId) {
    const confirmed = await showConfirm(
        'Are you sure you want to delete this product?',
        {
            title: 'Delete Product',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            onConfirm: () => {
                store.deleteProduct(productId);
                showToast('Product deleted', 'success');
                router.loadView('store');
            }
        }
    );
}
