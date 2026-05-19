/* ============================================================================
   PUBLIC PAGE - Advanced Public Profile Page (Full Page View - Responsive)
   ============================================================================ */

views.publicPage = async function(handle) {
    console.log('=== PUBLIC PAGE DEBUG ===');
    console.log('Handle parameter received:', handle);
    console.log('Route info:', getHashRoute());
    
    if (!handle) {
        console.log('❌ No handle provided!');
        await router.navigate('home');
        return '';
    }
    
    // Try to get user from Firestore first, then fallback to localStorage
    let user = null;
    let blocks = [];
    let products = [];
    let userTheme = {
        bg: 'linear-gradient(135deg, #1d8f7f, #17a697)',
        btnColor: '#17a697',
        textColor: '#FFFFFF',
        btnStyle: 'rounded'
    };
    let avatar = '';
    
    try {
        // Try to fetch from Firestore
        if (typeof fbDb !== 'undefined' && typeof firebaseService !== 'undefined') {
            const userDoc = await fbDb.collection('users').where('handle', '==', handle).get();
            if (!userDoc.empty) {
                user = userDoc.docs[0].data();
                user.uid = userDoc.docs[0].id;
                console.log('✅ User loaded from Firestore:', user);
                
                // Load blocks from Firestore using correct path (pages/{pageId}/blocks)
                try {
                    const pages = await firebaseService.getUserPages(user.uid);
                    console.log('📄 Pages found:', pages.length);
                    
                    // Load blocks from all pages (usually just "main" page)
                    for (const page of pages) {
                        const pageBlocks = await firebaseService.getPageBlocks(user.uid, page.id);
                        console.log(`✅ Blocks loaded from page ${page.id}:`, pageBlocks.length);
                        blocks = blocks.concat(pageBlocks);
                    }
                } catch (blockError) {
                    console.warn('⚠️ Error loading blocks:', blockError.message);
                    blocks = [];
                }
                
                // Load products from Firestore
                try {
                    products = await firebaseService.getUserProducts(user.uid);
                    console.log('✅ Products loaded:', products.length);
                } catch (productError) {
                    console.warn('⚠️ Error loading products:', productError.message);
                    products = [];
                }
                
                // Load custom theme from user profile (persisted in Firestore)
                if (user.theme) {
                    userTheme = { ...userTheme, ...user.theme };
                    console.log('✅ Custom theme loaded from user profile:', userTheme);
                } else {
                    console.log('ℹ️ Using default theme');
                }
            }
        }
    } catch (error) {
        console.warn('⚠️ Failed to load from Firestore, trying localStorage:', error.message);
    }
    
    // Fallback to localStorage if Firestore data not found
    if (!user) {
        const users = getFromStorage('beacons_users', {});
        user = users[handle];
        console.log('User from localStorage:', user);
        
        if (!user) {
            console.log('❌ User not found in either Firestore or localStorage!');
            return `
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary);">
                    <div class="empty-state">
                        <div class="empty-state-icon">👤</div>
                        <h3 class="empty-state-title">Profile not found</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">The user <strong>@${handle}</strong> doesn't exist</p>
                        <button class="btn btn-primary" onclick="router.navigate('home')">← Back Home</button>
                    </div>
                </div>
            `;
        }
        
        // Load from localStorage as fallback
        const allBlocks = getFromStorage('beacons_blocks', {});
        blocks = allBlocks[handle] || [];
        
        const allProducts = getFromStorage('beacons_products', {});
        products = allProducts[handle] || [];
        
        const themes = getFromStorage('beacons_theme', {});
        userTheme = themes[handle] || userTheme;
    }
    
    // Get avatar from user profile (Firestore now includes it)
    avatar = user?.avatar || '';
    
    console.log('✅ User profile loaded successfully');
    
    // Get social block
    const socialBlock = blocks.find(b => b.type === 'social' && b.visible);
    const visibleBlocks = blocks.filter(b => b.type !== 'social' && b.visible);
    
    const html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

#public-page-container, #public-page-container * {
    font-family: 'Poppins', sans-serif;
}
            
            html, body {
                width: 100%;
                height: 100%;
                overflow-x: hidden;
            }
            
            #public-page-container {
                background: ${userTheme.bg};
                min-height: 100vh;
                width: 100%;
                display: flex;
                flex-direction: column;
                overflow-x: hidden;
            }
            
            /* ===== HEADER STYLES ===== */
            #public-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                background: transparent;
                position: sticky;
                top: 0;
                z-index: 100;
            }
            
            .public-header-left {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .public-header-right {
                display: flex;
                gap: 12px;
                align-items: center;
            }
            
            .public-logo-section {
                display: flex;
                align-items: center;
                gap: 6px;
                font-weight: 700;
                font-size: 16px;
                color: ${userTheme.textColor};
                letter-spacing: -0.5px;
                text-decoration: none;
            }
            
            .public-logo-mark {
                font-size: 20px;
                font-weight: 800;
            }
            
            .public-shop-btn {
                position: relative;
                padding: 8px 14px;
                background: transparent;
                border: 1.5px solid ${userTheme.textColor};
                border-radius: 20px;
                color: ${userTheme.textColor};
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
                text-decoration: none;
                font-weight: 600;
            }
            
            .public-shop-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: scale(1.02);
            }
            
            .shop-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
            }
            
            .shop-badge {
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ff5252;
                color: white;
                width: 22px;
                height: 22px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: 700;
                border: 2px solid ${userTheme.bg};
            }
            
            /* ===== MAIN CONTENT ===== */
            #public-main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 40px 20px;
                overflow-y: auto;
                max-width: 100%;
            }
            
            /* ===== PROFILE SECTION ===== */
            #public-profile-wrapper {
                width: 100%;
                max-width: 500px;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
            }
            
            #public-avatar-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
                text-align: center;
            }
            
            #public-avatar-img {
                width: 120px;
                height: 120px;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #333;
                font-size: 60px;
                overflow: hidden;
                flex-shrink: 0;
                border: 3px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            }
            
            #public-avatar-img img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            #public-name {
                font-size: 28px;
                font-weight: 700;
                color: ${userTheme.textColor};
                margin: 0;
                letter-spacing: -0.5px;
            }
            
            #public-handle {
                font-size: 14px;
                color: ${userTheme.textColor};
                opacity: 0.85;
                margin: 0;
                font-weight: 500;
            }
            
            #public-bio {
                font-size: 14px;
                color: ${userTheme.textColor};
                opacity: 0.9;
                line-height: 1.5;
                margin: 0;
                max-width: 100%;
                word-wrap: break-word;
            }
            
            /* ===== SOCIAL ICONS ===== */
            #public-socials {
                display: flex;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .public-social-icon {
    width: 52px;
    height: 52px;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    transition: all 0.3s ease;
}
            
            .public-social-icon:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: translateY(-3px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .social-icon-svg {
                width: 20px;
                height: 20px;
                fill: currentColor;
            }
            
            /* ===== BLOCKS GRID ===== */
            #public-blocks-container {
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .public-block-item {
                width: 100%;
                padding: 14px 16px;
                background: rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: ${userTheme.textColor};
                text-decoration: none;
                display: flex;
                align-items: center;
                gap: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 500;
                font-size: 15px;
            }
            
            .public-block-item:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: translateX(4px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            
            .public-block-icon {
                font-size: 24px;
                flex-shrink: 0;
            }
            
            .public-block-title {
                flex: 1;
                text-align: left;
            }
            
            .public-block-arrow {
                font-size: 16px;
                opacity: 0.6;
                flex-shrink: 0;
            }
            
            /* ===== CONNECTXB SECTION ===== */
            #public-connectxb-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
                margin-top: 40px;
                padding-top: 40px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
                width: 100%;
            }
            
            #public-connectxb-logo-text {
                font-size: 20px;
                color: ${userTheme.textColor};
                font-weight: 700;
                letter-spacing: 0.5px;
            }
            
            /* ===== PRODUCTS GRID ===== */
            #public-products-grid {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 16px;
                margin-top: 20px;
                padding: 0 10px;
            }
            
            .public-product-card {
                background: rgba(0, 0, 0, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                overflow: hidden;
                transition: all 0.3s ease;
                cursor: pointer;
                text-decoration: none;
                color: inherit;
                display: flex;
                flex-direction: column;
                height: 100%;
                position: relative;
            }
            
            .public-product-card:hover {
                background: rgba(0, 0, 0, 0.2);
                transform: translateY(-6px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            }
            
            .public-product-image {
                width: 100%;
                height: 120px;
                background-size: cover;
                background-position: center;
                background-color: rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                position: relative;
            }
            
            .public-product-info {
                padding: 12px;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 10px;
            }
            
            .public-product-title {
                font-weight: 600;
                font-size: 13px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .product-visit-link {
                width: 100%;
                padding: 8px;
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 8px;
                color: ${userTheme.textColor};
                text-decoration: none;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
            }
            
            .product-visit-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.02);
            }
            
            /* ===== EMPTY STATE ===== */
            #public-empty-state {
                text-align: center;
                padding: 40px 20px;
                color: ${userTheme.textColor};
                opacity: 0.7;
                font-size: 14px;
            }
            
            /* ===== MODAL STYLES ===== */
            .public-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
}

.public-modal-content {
    width: 100%;
    background: white;
    border-radius: 20px 20px 0 0;
    padding: 24px 20px;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
}
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            }
            
            .modal-title {
                font-size: 18px;
                font-weight: 700;
                color: #333;
            }
            
            .modal-close-btn {
                width: 32px;
                height: 32px;
                background: #f0f0f0;
                border: none;
                border-radius: 50%;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .modal-close-btn:hover {
                background: #e0e0e0;
            }
            
            .modal-products-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
}
            
            .modal-product-card {
                background: #f5f5f5;
                border: 1px solid #e0e0e0;
                border-radius: 12px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                color: inherit;
            }
            
            .modal-product-card:hover {
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
            }
            
            .modal-product-image {
    width: 100%;
    height: 200px;
    background-size: cover;
    background-position: center;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
}
            
            .modal-product-info {
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .modal-product-title {
                font-weight: 600;
                font-size: 12px;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .modal-product-link {
                width: 100%;
                padding: 8px;
                background: ${userTheme.btnColor};
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                text-align: center;
                display: block;
            }
            
            .modal-product-link:hover {
                opacity: 0.9;
                transform: scale(1.02);
            }
            
            /* ===== ANIMATIONS ===== */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #public-profile-wrapper {
                animation: fadeInUp 0.5s ease forwards;
            }
            
            /* ===== TABLET RESPONSIVENESS ===== */
            @media (max-width: 768px) {
                #public-main-content {
                    padding: 32px 16px;
                }
                
                #public-profile-wrapper {
                    gap: 20px;
                }
                
                #public-avatar-img {
                    width: 110px;
                    height: 110px;
                    font-size: 54px;
                }
                
                #public-name {
                    font-size: 24px;
                }
                
                #public-handle {
                    font-size: 13px;
                }
                
                #public-bio {
                    font-size: 13px;
                }
                
                .public-block-item {
                    padding: 12px 14px;
                    font-size: 14px;
                    border-radius: 10px;
                }
                
                .public-block-icon {
                    font-size: 22px;
                }
                
                #public-connectxb-section {
                    margin-top: 32px;
                    padding-top: 32px;
                }
                
                #public-products-grid {
                    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
                    gap: 12px;
                }
                
                .modal-products-grid {
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }
            }
            
            /* ===== MOBILE RESPONSIVENESS ===== */
            @media (max-width: 480px) {
                #public-header {
                    padding: 12px 16px;
                }
                
                .public-logo-section {
                    font-size: 14px;
                }
                
                .public-logo-mark {
                    font-size: 18px;
                }
                
                .public-shop-btn {
                    padding: 6px 12px;
                    font-size: 12px;
                    gap: 4px;
                }
                
                .shop-icon {
                    width: 16px;
                    height: 16px;
                }
                
                #public-main-content {
                    padding: 24px 16px;
                }
                
                #public-profile-wrapper {
                    gap: 16px;
                }
                
                #public-avatar-img {
                    width: 100px;
                    height: 100px;
                    font-size: 48px;
                    border-width: 2px;
                }
                
                #public-name {
                    font-size: 22px;
                }
                
                #public-handle {
                    font-size: 12px;
                }
                
                #public-bio {
                    font-size: 12px;
                }
                
                #public-socials {
                    gap: 10px;
                }
                
                .public-social-icon {
                    width: 36px;
                    height: 36px;
                    font-size: 16px;
                }
                
                .public-block-item {
                    padding: 12px;
                    font-size: 13px;
                    gap: 12px;
                    border-radius: 8px;
                }
                
                .public-block-icon {
                    font-size: 20px;
                }
                
                #public-connectxb-section {
                    margin-top: 28px;
                    padding-top: 28px;
                    gap: 20px;
                }
                
                #public-connectxb-logo-text {
                    font-size: 16px;
                }
                
                #public-products-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    padding: 0;
                }
                
                .public-product-image {
                    height: 100px;
                    font-size: 40px;
                }
                
                .public-modal-overlay {
                    align-items: flex-end;
                }
                
                .public-modal-content {
                    border-radius: 20px 20px 0 0;
                    padding: 20px 16px;
                }
                
                .modal-products-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }
                
            }
            
            /* ===== VERY SMALL MOBILE ===== */
            @media (max-width: 360px) {
                #public-header {
                    padding: 10px 12px;
                }
                
                #public-main-content {
                    padding: 16px 12px;
                }
                
                #public-avatar-img {
                    width: 90px;
                    height: 90px;
                    font-size: 44px;
                }
                
                #public-name {
                    font-size: 20px;
                }
                
                #public-products-grid {
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                
                .public-product-image {
                    height: 90px;
                    font-size: 36px;
                }
            }
        </style>
        
        <div id="public-page-container">
            <!-- Header -->
            <div id="public-header">
                <div class="public-header-left">
                    <div class="public-logo-section">
                        <span class="public-logo-mark">✦</span>
                        <span>connectxB</span>
                    </div>
                </div>
                <div class="public-header-right">
                    ${products.length > 0 ? `
                        <button class="public-shop-btn" onclick="window.openProductsModal('${handle}');" title="Our Products">
                            <span class="shop-icon">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7 4V3c0-.6.4-1 1-1h8c.6 0 1 .4 1 1v1h5c.6 0 1 .4 1 1v2c0 .4-.2.7-.5.9L19 20c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2L1.5 7.9C1.2 7.7 1 7.4 1 7V5c0-.6.4-1 1-1h5zm2 0h6V3H9v1z"/>
                                </svg>
                            </span>
                            <span>Our Products</span>
                            ${products.length > 0 ? '<span class="shop-badge">' + products.length + '</span>' : ''}
                        </button>
                    ` : ''}
                </div>
            </div>
            
            <!-- Main Content -->
            <div id="public-main-content">
                <div id="public-profile-wrapper">
                    <!-- Avatar Section -->
                    <div id="public-avatar-section">
                        <div id="public-avatar-img">
                            ${avatar ? `<img src="${avatar}" alt="${user.name}">` : getInitials(user.name || 'User')}
                        </div>
                        <div>
                            <h1 id="public-name">${user.name || 'Your Name'}</h1>
                            <p id="public-handle">@${handle}</p>
                        </div>
                        ${user.bio ? `<p id="public-bio">${user.bio}</p>` : ''}
                    </div>
                    
                    <!-- Social Icons -->
                    ${socialBlock && socialBlock.data?.platforms && Object.keys(socialBlock.data.platforms).some(k => socialBlock.data.platforms[k]) ? `
                        <div id="public-socials">
                            ${window.getSocialIconsSVG(socialBlock.data.platforms)}
                        </div>
                    ` : ''}
                    
                    <!-- Blocks -->
                    ${visibleBlocks.length > 0 ? `
                        <div id="public-blocks-container">
                            ${visibleBlocks.map(block => `
                                <a href="${block.data.url || '#'}" target="_blank" rel="noopener" class="public-block-item">
                                    <span class="public-block-icon">${block.data.icon || '🔗'}</span>
                                    <span class="public-block-title">${block.data.title || block.type}</span>
                                    <span class="public-block-arrow">→</span>
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <!-- Products Section -->
                    ${products.length > 0 ? `
                        <div id="public-connectxb-section">
                            <div id="public-connectxb-logo-text">Featured Products</div>
                            
                            <!-- Products Grid -->
                            <div id="public-products-grid">
                                ${products.slice(0, 4).map(p => `
                                    <a href="${p.url || '#'}" target="_blank" rel="noopener" class="public-product-card">
                                        <div class="public-product-image" ${p.image ? 'style="background-image: url(\'' + p.image + '\')"' : ''}>
                                            ${!p.image ? '📦' : ''}
                                        </div>
                                        <div class="public-product-info">
                                            <div class="public-product-title">${p.title}</div>
                                            <span class="product-visit-link">
                                                <span>Visit</span>
                                                <svg style="width: 12px; height: 12px; fill: currentColor;" viewBox="0 0 24 24">
                                                    <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/>
                                                    <path d="M11 3v2h3.59l-9.83 9.83 1.41 1.41L16 7.41V11h2V3h-8z"/>
                                                </svg>
                                            </span>
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                            
                            ${products.length > 4 ? '<div style="text-align: center; margin-top: 24px;"><button class="public-block-item" style="width: 100%; margin: 0; text-align: center; justify-content: center;" onclick="window.openProductsModal(\'' + handle + '\');">View All Products →</button></div>' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Products Modal -->
        <div id="public-products-modal" style="display: none;">
            <div class="public-modal-overlay" onclick="window.closeProductsModal();">
                <div class="public-modal-content" onclick="event.stopPropagation();">
                    <div class="modal-header">
                        <h2 class="modal-title">Our Products</h2>
                        <button class="modal-close-btn" onclick="window.closeProductsModal();">×</button>
                    </div>
                    <div class="modal-products-grid">
                        ${products.map(p => `
                            <a href="${p.url || '#'}" target="_blank" rel="noopener" class="modal-product-card">
                                <div class="modal-product-image" ${p.image ? 'style="background-image: url(\'' + p.image + '\')"' : ''}>
                                    ${!p.image ? '📦' : ''}
                                </div>
                                <div class="modal-product-info">
                                    <div class="modal-product-title">${p.title}</div>
                                    <span class="modal-product-link">Visit Site →</span>
                                </div>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        if (typeof initPublicPage === 'function') {
            initPublicPage();
        }
    }, 10);
    
    return html;
};

/* ============================================================================
   HELPER FUNCTIONS - Public Page
   ============================================================================ */

window.getSocialIconsSVG = function(platforms) {
    const socialIcons = {
        facebook:  'fab fa-facebook-f',
        twitter:   'fab fa-twitter',
        instagram: 'fab fa-instagram',
        linkedin:  'fab fa-linkedin-in',
        youtube:   'fab fa-youtube',
        tiktok:    'fab fa-tiktok',
        whatsapp:  'fab fa-whatsapp',
        email:     'fas fa-envelope'
    };

    return Object.entries(platforms).map(([key, url]) => {
        if (!url) return '';
        const iconClass = socialIcons[key] || 'fas fa-link';
        const href = key === 'email' ? 'mailto:' + url : url;
        return `<a href="${href}" target="_blank" rel="noopener" class="public-social-icon" title="${key}">
            
        </a>`;
    }).join('');
};

function initPublicPage() {
    const container = document.getElementById('public-page-container');
    if (!container) return;
}

// Helper function to get initials
function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

// Open Products Modal
window.openProductsModal = function(handle) {
    const modal = document.getElementById('public-products-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
};

// Close Products Modal
window.closeProductsModal = function() {
    const modal = document.getElementById('public-products-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
};

// Helper to show toast notifications
function showToast(message, type = 'info', duration = 2000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 20px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 9999;
        animation: slideUp 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Storage helpers
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('Storage read error:', e);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Storage write error:', e);
    }
}