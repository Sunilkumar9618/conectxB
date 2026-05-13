/* ============================================================================
   BUILDER - Page Builder, Block Management, Drag & Drop (MOBILE OPTIMIZED)
   ============================================================================ */

// Use Font Awesome CDN for icons
const LOGO_CONFIG = {
    facebook: { icon: 'fab fa-facebook-f', color: '#1877F2' },
    twitter: { icon: 'fab fa-twitter', color: '#000000' },
    instagram: { icon: 'fab fa-instagram', color: '#E4405F' },
    linkedin: { icon: 'fab fa-linkedin-in', color: '#0A66C2' },
    youtube: { icon: 'fab fa-youtube', color: '#FF0000' },
    tiktok: { icon: 'fab fa-tiktok', color: '#000000' },
    whatsapp: { icon: 'fab fa-whatsapp', color: '#25D366' },
    email: { icon: 'fas fa-envelope', color: '#EA4335' },
    shopping_cart: { icon: 'fas fa-shopping-cart', color: '#667eea' }
};

const builder = {
    currentHandle: null,
    blocks: [],
    draggedBlock: null,

    init(handle) {
        this.currentHandle = handle;
        this.loadBlocks();
    },

    loadBlocks() {
        const handle = this.currentHandle;
        const allBlocks = getFromStorage('beacons_blocks', {});
        this.blocks = allBlocks[handle] || [];
    },

    saveBlocks() {
        const handle = this.currentHandle;
        let allBlocks = getFromStorage('beacons_blocks', {});
        allBlocks[handle] = this.blocks;
        setToStorage('beacons_blocks', allBlocks);
        showToast('Page saved ✓', 'success', 2000);
    },

    addBlock(type, data = {}) {
        const block = {
            id: generateId('b'),
            type,
            visible: true,
            order: this.blocks.length,
            data
        };
        this.blocks.push(block);
        this.saveBlocks();
        emit('block-added', block);
        return block;
    },

    updateBlock(blockId, updates) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block) {
            Object.assign(block, updates);
            this.saveBlocks();
            emit('block-updated', block);
        }
    },

    deleteBlock(blockId) {
        this.blocks = this.blocks.filter(b => b.id !== blockId);
        this.saveBlocks();
        emit('block-deleted', { blockId });
    },

    reorderBlocks(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.blocks.length) return;
        if (toIndex < 0 || toIndex >= this.blocks.length) return;
        const block = this.blocks.splice(fromIndex, 1)[0];
        this.blocks.splice(toIndex, 0, block);
        this.saveBlocks();
        emit('blocks-reordered', { fromIndex, toIndex });
    },

    toggleBlockVisibility(blockId) {
        const block = this.blocks.find(b => b.id === blockId);
        if (block) {
            block.visible = !block.visible;
            this.saveBlocks();
        }
    },

    getBlock(blockId) {
        return this.blocks.find(b => b.id === blockId);
    },

    getVisibleBlocks() {
        return this.blocks.filter(b => b.visible);
    }
};

// ---- RENDER BUILDER VIEW ----

views.builder = async function() {
    if (!auth.isLoggedIn()) {
        await router.navigate('auth');
        return '';
    }

    const profile = auth.currentUser?.profile || {};
    const handle = profile.handle;

    if (!handle) {
        await router.navigate('auth');
        return '';
    }

    builder.init(handle);
    
    const avatars = getFromStorage('beacons_avatars', {});
    const avatar = avatars[handle] || '';

    const user = {
        name: profile.name || 'User',
        email: profile.email || auth.currentUser?.email,
        handle: profile.handle,
        bio: profile.bio || '',
        avatar: avatar
    };

    const themes = getFromStorage('beacons_theme', {});
    const userTheme = themes[handle] || {
        bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        btnColor: '#667eea',
        textColor: '#FFFFFF',
        btnStyle: 'rounded'
    };

    const publicUrl = 'connectxb.ai/' + handle;

    const html = `
        <style>
            /* ===== GLOBAL BUILDER STYLES ===== */
            * { margin: 0; padding: 0; box-sizing: border-box; }

            html, body {
                width: 100%;
                height: 100%;
                overflow: hidden;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }

            .builder-wrapper {
                display: flex;
                flex-direction: column;
                height: 100vh;
                background: #0f0f0f;
                color: #fff;
            }

            /* ===== NAVBAR ===== */
            .builder-navbar {
                height: 70px;
                background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 24px;
                flex-shrink: 0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .builder-navbar-left {
                display: flex;
                align-items: center;
                gap: 24px;
                flex: 1;
            }

            .builder-logo {
                font-size: 20px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                letter-spacing: -1px;
            }

            .builder-nav-breadcrumb {
                display: flex;
                gap: 12px;
                align-items: center;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.6);
            }

            .builder-nav-breadcrumb strong {
                color: #667eea;
            }

            .builder-navbar-right {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .builder-nav-stat {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 6px;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }

            .builder-nav-stat strong {
                color: #667eea;
                font-size: 14px;
            }

            .builder-nav-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: none;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 6px;
                text-decoration: none;
            }

            .builder-nav-btn.primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .builder-nav-btn.primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .builder-nav-btn.secondary {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .builder-nav-btn.secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            /* ===== MAIN CONTENT AREA ===== */
            .builder-content {
                display: flex;
                flex: 1;
                overflow: hidden;
                gap: 0;
            }

            /* ===== LEFT PANEL: EDITOR ===== */
            .builder-panel-left {
                flex: 0 0 45%;
                background: #1a1a1a;
                border-right: 1px solid rgba(255, 255, 255, 0.08);
                overflow-y: auto;
                overflow-x: hidden;
                padding: 24px;
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            .builder-panel-left::-webkit-scrollbar {
                width: 8px;
            }

            .builder-panel-left::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.05);
            }

            .builder-panel-left::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 4px;
            }

            .builder-panel-left::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            /* ===== RIGHT PANEL: PREVIEW AREA ===== */
            .builder-panel-right {
                flex: 1;
                background: linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                position: relative;
                overflow: hidden;
            }

            /* ===== SECTIONS ===== */
            .builder-section {
                display: flex;
                flex-direction: column;
                gap: 16px;
                padding: 16px;
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                transition: all 0.3s ease;
            }

            .builder-section:hover {
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(255, 255, 255, 0.12);
            }

            .builder-section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .builder-section-title {
                font-size: 14px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #667eea;
            }

            .builder-add-btn {
                padding: 6px 12px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .builder-add-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            /* ===== PROFILE SECTION ===== */
            .builder-profile {
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .builder-avatar-upload {
                position: relative;
                cursor: pointer;
                display: inline-block;
            }

            .builder-avatar-upload input {
                display: none;
            }

            .builder-avatar-preview {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 36px;
                font-weight: 700;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
                border: 2px solid rgba(102, 126, 234, 0.3);
                overflow: hidden;
            }

            .builder-avatar-preview:hover {
                transform: scale(1.05);
                border-color: #667eea;
                box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
            }

            .builder-avatar-preview img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* ===== FORM ELEMENTS ===== */
            .form-group {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .form-label {
                font-size: 12px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.7);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .form-input,
            .form-textarea,
            .form-select {
                padding: 10px 12px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                color: white;
                font-size: 13px;
                font-family: inherit;
                transition: all 0.3s ease;
            }

            .form-input:focus,
            .form-textarea:focus,
            .form-select:focus {
                outline: none;
                background: rgba(0, 0, 0, 0.3);
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            .form-input::placeholder {
                color: rgba(255, 255, 255, 0.4);
            }

            .form-textarea {
                resize: vertical;
                min-height: 80px;
            }

            .form-select {
                cursor: pointer;
            }

            .form-select option {
                background: #1a1a1a;
                color: white;
            }

            /* ===== BLOCKS LIST ===== */
            .blocks-list {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .block-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: move;
                transition: all 0.3s ease;
                user-select: none;
            }

            .block-card:hover {
                background: rgba(102, 126, 234, 0.1);
                border-color: rgba(102, 126, 234, 0.3);
            }

            .block-card.dragging {
                opacity: 0.5;
                background: rgba(102, 126, 234, 0.2);
            }

            .block-drag-handle {
                color: rgba(255, 255, 255, 0.3);
                font-size: 16px;
                cursor: grab;
                flex-shrink: 0;
            }

            .block-drag-handle:active {
                cursor: grabbing;
            }

            .block-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 4px;
                min-width: 0;
            }

            .block-title {
                font-size: 12px;
                font-weight: 700;
                color: #667eea;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .block-preview {
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .block-actions {
                display: flex;
                gap: 6px;
                flex-shrink: 0;
            }

            .block-action-btn {
                width: 28px;
                height: 28px;
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                border: none;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .block-action-btn:hover {
                background: rgba(102, 126, 234, 0.3);
            }

            .block-action-btn:active {
                transform: scale(0.95);
            }

            /* ===== PHONE MOCKUP CONTAINER ===== */
            .phone-mockup-container {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 16px;
            }

            .phone-mockup-info {
                display: flex;
                gap: 12px;
                width: 100%;
                padding: 12px;
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
                font-size: 11px;
                color: rgba(255, 255, 255, 0.8);
                align-items: center;
            }

            .phone-mockup-info-icon {
                font-size: 14px;
                flex-shrink: 0;
            }

            /* ===== DOMAIN BAR ===== */
            .builder-domain-bar {
                width: 100%;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .builder-domain-label {
                font-size: 10px;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.5);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .builder-domain-url {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .builder-domain-box {
                flex: 1;
                padding: 8px 12px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                font-size: 12px;
                color: white;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .builder-domain-btn {
                padding: 8px 12px;
                border-radius: 6px;
                border: none;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }

            .builder-domain-btn.copy {
                background: rgba(102, 126, 234, 0.2);
                color: #667eea;
                border: 1px solid rgba(102, 126, 234, 0.3);
            }

            .builder-domain-btn.copy:hover {
                background: rgba(102, 126, 234, 0.3);
            }

            .builder-domain-btn.open {
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.8);
            }

            .builder-domain-btn.open:hover {
                background: rgba(255, 255, 255, 0.15);
            }

            .builder-domain-btn.share {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }

            .builder-domain-btn.share:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
            }

            .builder-domain-claim {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }

            .builder-domain-claim:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(255, 23, 68, 0.4);
            }

            /* ===== PHONE FRAME (FIXED) ===== */
            .phone-frame {
                width: 340px;
                height: 680px;
                border-radius: 40px;
                border: 10px solid #222;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
                position: relative;
                overflow: hidden;
                background: #000;
                flex-shrink: 0;
            }

            .phone-notch {
                position: absolute;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 180px;
                height: 24px;
                background: #000;
                border-radius: 0 0 24px 24px;
                z-index: 100;
            }

            .phone-content-wrapper {
                width: 100%;
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                scroll-behavior: smooth;
            }

            .phone-content-wrapper::-webkit-scrollbar {
                width: 4px;
            }

            .phone-content-wrapper::-webkit-scrollbar-track {
                background: transparent;
            }

            .phone-content-wrapper::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 2px;
            }

            .phone-content {
                width: 100%;
                display: flex;
                flex-direction: column;
                padding-top: 8px;
            }

            .phone-status-bar {
                padding: 8px 16px;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                justify-content: space-between;
                align-items: center;
                height: 32px;
            }

            /* ===== SOCIAL ICONS ===== */
            .social-icon-img {
                width: 36px;
                height: 36px;
                background: rgba(255, 255, 255, 0.15);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4px;
                transition: all 0.3s ease;
            }

            .social-icon-img:hover {
                background: rgba(255, 255, 255, 0.25);
                transform: scale(1.1);
            }

            .social-icon-img img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }

            /* ===== EMPTY STATE ===== */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 12px;
                padding: 32px 16px;
                text-align: center;
                color: rgba(255, 255, 255, 0.5);
            }

            .empty-state-icon {
                font-size: 40px;
            }

            .empty-state-title {
                font-size: 14px;
                font-weight: 600;
            }

            .empty-state-description {
                font-size: 12px;
            }

            /* ===== DESKTOP (1200px+) ===== */
            @media (min-width: 1200px) {
                .builder-panel-left {
                    flex: 0 0 45%;
                }
            }

            /* ===== TABLET (769px - 1199px) ===== */
            @media (max-width: 1199px) and (min-width: 769px) {
                .builder-panel-left {
                    flex: 0 0 50%;
                }

                .phone-frame {
                    width: 300px;
                    height: 600px;
                }

                .builder-domain-bar {
                    padding: 10px;
                }

                .builder-domain-btn {
                    padding: 6px 10px;
                    font-size: 10px;
                }
            }

            /* ===== MOBILE (max 768px) ===== */
            @media (max-width: 768px) {
                html, body {
                    overflow: auto;
                }

                .builder-wrapper {
                    height: auto;
                    min-height: 100vh;
                }

                .builder-navbar {
                    height: auto;
                    padding: 12px 16px;
                    flex-direction: column;
                    gap: 12px;
                }

                .builder-navbar-left {
                    width: 100%;
                    gap: 12px;
                }

                .builder-logo {
                    font-size: 18px;
                }

                .builder-nav-breadcrumb {
                    font-size: 11px;
                    display: none;
                }

                .builder-navbar-right {
                    width: 100%;
                    gap: 8px;
                    justify-content: space-between;
                }

                .builder-nav-btn {
                    padding: 8px 12px;
                    font-size: 11px;
                    flex: 1;
                    justify-content: center;
                }

                .builder-nav-stat {
                    padding: 6px 10px;
                    font-size: 11px;
                }

                .builder-content {
                    flex-direction: column;
                    overflow-y: auto;
                }

                .builder-panel-left,
                .builder-panel-right {
                    flex: none;
                    width: 100%;
                    border-right: none;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .builder-panel-left {
                    gap: 16px;
                }

                .builder-section {
                    padding: 12px;
                    gap: 12px;
                }

                .builder-section-title {
                    font-size: 12px;
                }

                .builder-add-btn {
                    padding: 6px 10px;
                    font-size: 10px;
                }

                .builder-avatar-preview {
                    width: 70px;
                    height: 70px;
                    font-size: 32px;
                }

                .form-input,
                .form-textarea,
                .form-select {
                    padding: 8px 10px;
                    font-size: 12px;
                }

                .form-textarea {
                    min-height: 70px;
                }

                .form-label {
                    font-size: 11px;
                }

                .block-card {
                    padding: 10px;
                    gap: 10px;
                }

                .block-drag-handle {
                    font-size: 14px;
                }

                .block-title {
                    font-size: 11px;
                }

                .block-preview {
                    font-size: 11px;
                }

                .block-action-btn {
                    width: 24px;
                    height: 24px;
                    font-size: 11px;
                }

                .phone-mockup-container {
                    gap: 12px;
                    width: 100%;
                }

                .phone-mockup-info {
                    padding: 10px;
                    font-size: 10px;
                    gap: 8px;
                }

                .phone-frame {
                    width: 90vw;
                    max-width: 320px;
                    height: auto;
                    aspect-ratio: 9 / 16;
                    border-width: 8px;
                    border-radius: 30px;
                }

                .builder-domain-bar {
                    width: 100%;
                    padding: 10px;
                    gap: 10px;
                }

                .builder-domain-label {
                    font-size: 9px;
                }

                .builder-domain-url {
                    flex-direction: column;
                    gap: 8px;
                }

                .builder-domain-box {
                    width: 100%;
                    padding: 8px 10px;
                    font-size: 11px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .builder-domain-btn {
                    padding: 8px 10px;
                    font-size: 10px;
                    flex: 1;
                }

                .builder-domain-claim {
                    width: 100%;
                    padding: 10px;
                    font-size: 10px;
                }

                .phone-status-bar {
                    padding: 6px 12px;
                    font-size: 10px;
                    height: 28px;
                }
            }

            /* ===== SMALL MOBILE (max 480px) ===== */
            @media (max-width: 480px) {
                .builder-navbar {
                    padding: 10px 12px;
                }

                .builder-logo {
                    font-size: 16px;
                }

                .builder-nav-stat {
                    font-size: 10px;
                    padding: 4px 8px;
                }

                .builder-nav-btn {
                    padding: 6px 10px;
                    font-size: 10px;
                }

                .builder-panel-left,
                .builder-panel-right {
                    padding: 12px;
                }

                .builder-section {
                    padding: 10px;
                    gap: 10px;
                }

                .builder-avatar-preview {
                    width: 60px;
                    height: 60px;
                    font-size: 28px;
                }

                .form-input,
                .form-textarea {
                    padding: 8px;
                    font-size: 11px;
                }

                .block-card {
                    padding: 8px;
                }

                .block-action-btn {
                    width: 22px;
                    height: 22px;
                    font-size: 10px;
                }

                .phone-frame {
                    width: 100%;
                    max-width: 280px;
                    border-width: 6px;
                }

                .builder-domain-url {
                    flex-direction: column;
                }

                .builder-domain-btn {
                    width: 100%;
                    font-size: 9px;
                    padding: 6px 8px;
                }

                .builder-domain-box {
                    font-size: 10px;
                }
            }

            /* ===== VERY SMALL MOBILE (max 360px) ===== */
            @media (max-width: 360px) {
                .builder-navbar {
                    padding: 8px 10px;
                }

                .builder-logo {
                    font-size: 14px;
                }

                .builder-nav-stat {
                    display: none;
                }

                .builder-nav-btn {
                    padding: 6px 8px;
                    font-size: 9px;
                }

                .builder-nav-breadcrumb {
                    display: none;
                }

                .phone-frame {
                    width: 100%;
                    max-width: 260px;
                    border-width: 5px;
                }

                .builder-domain-bar {
                    padding: 8px;
                }

                .form-input,
                .form-textarea {
                    font-size: 10px;
                    padding: 6px;
                }

                .builder-avatar-preview {
                    width: 50px;
                    height: 50px;
                    font-size: 24px;
                }
            }
        </style>

        <div class="builder-wrapper">
            <!-- NAVBAR -->
            <div class="builder-navbar">
                <div class="builder-navbar-left">
                    <div class="builder-logo">✦ connectxB</div>
                    <div class="builder-nav-breadcrumb">
                        Dashboard <strong>/</strong> <strong>Builder</strong>
                    </div>
                </div>
                <div class="builder-navbar-right">
                    <div class="builder-nav-stat">
                        📦 <strong>${builder.blocks.length}</strong> Blocks
                    </div>
                    <button class="builder-nav-btn secondary" onclick="router.navigate('dashboard')"><i class="fas fa-arrow-left"></i> Dashboard</button>
                    <button class="builder-nav-btn primary" onclick="window.open(window.location.origin + window.location.pathname + '#page/${handle}', '_blank')"><i class="fas fa-eye"></i> Preview</button>
                </div>
            </div>

            <!-- MAIN CONTENT -->
            <div class="builder-content">
                <!-- LEFT PANEL: EDITOR -->
                <div class="builder-panel-left">
                    <!-- PROFILE SECTION -->
                    <div class="builder-section">
                        <div class="builder-section-header">
                            <h3 class="builder-section-title"><i class="fas fa-user"></i> Profile</h3>
                        </div>
                        
                        <div class="builder-profile">
                            <label class="builder-avatar-upload">
                                <input type="file" accept="image/*" id="avatar-upload">
                                <div class="builder-avatar-preview">
                                    ${user.avatar ? `<img src="${user.avatar}" alt="Avatar">` : getInitials(user.name || 'User')}
                                </div>
                            </label>
                            
                            <div class="form-group">
                                <label class="form-label">Display Name</label>
                                <input type="text" class="form-input" id="builder-name" value="${user.name || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Bio</label>
                                <textarea class="form-textarea" id="builder-bio" placeholder="Tell your story...">${user.bio || ''}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Handle</label>
                                <input type="text" class="form-input" value="@${handle}" disabled style="opacity: 0.6; cursor: not-allowed;">
                            </div>
                        </div>
                    </div>

                    <!-- BLOCKS SECTION -->
                    <div class="builder-section">
                        <div class="builder-section-header">
                            <h3 class="builder-section-title"><i class="fas fa-link"></i> Blocks</h3>
                            <button class="builder-add-btn" id="add-block-btn">
                                <span>+</span> Add
                            </button>
                        </div>
                        
                        <div id="blocks-list" class="blocks-list">
                            ${builder.blocks.length === 0 ? `
                                <div class="empty-state">
                                    <div class="empty-state-icon">📭</div>
                                    <div class="empty-state-title">No blocks yet</div>
                                    <div class="empty-state-description">Click "Add" to create your first block</div>
                                </div>
                            ` : builder.blocks.map((block, idx) => `
                                <div class="block-card" data-block-id="${block.id}" data-block-index="${idx}" draggable="true">
                                    <span class="block-drag-handle">⋮⋮</span>
                                    <div class="block-content">
                                        <div class="block-title">${block.type}</div>
                                        <div class="block-preview">${renderBlockPreview(block)}</div>
                                    </div>
                                    <div class="block-actions">
                                        <button class="block-action-btn" title="Edit" data-action="edit" data-block-id="${block.id}"><i class="fas fa-edit"></i></button>
                                        <button class="block-action-btn" title="Toggle visibility" data-action="toggle" data-block-id="${block.id}">
                                            ${block.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'}
                                        </button>
                                        <button class="block-action-btn" title="Delete" data-action="delete" data-block-id="${block.id}"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- THEME SECTION -->
                    <div class="builder-section">
                        <div class="builder-section-header">
                            <h3 class="builder-section-title"><i class="fas fa-palette"></i> Theme</h3>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Background Color</label>
                            <input type="color" class="form-input" id="theme-bg" value="#667eea">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Button Color</label>
                            <input type="color" class="form-input" id="theme-btn-color" value="${userTheme.btnColor}">
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Text Color</label>
                            <input type="color" class="form-input" id="theme-text-color" value="${userTheme.textColor}">
                        </div>
                    </div>
                </div>

                <!-- RIGHT PANEL: PREVIEW -->
                <div class="builder-panel-right">
                    <div class="phone-mockup-container">
                        <!-- INFO -->
                        <div class="phone-mockup-info">
                            <div class="phone-mockup-info-icon">ℹ️</div>
                            <div>This is a preview of your profile. Changes update in real-time.</div>
                        </div>

                        <!-- DOMAIN BAR -->
                        <div class="builder-domain-bar">
                            <div class="builder-domain-label">📍 Your Domain</div>
                            
                            <div class="builder-domain-url">
                                <div class="builder-domain-box">🔗 ${publicUrl}</div>
                                <button class="builder-domain-btn copy" onclick="copyToClipboard('https://${publicUrl}'); showToast('Link copied! 📋', 'success', 2000);">Copy</button>
                                <button class="builder-domain-btn open" onclick="window.open('#page/${handle}', '_blank');">↗</button>
                            </div>

                            <button class="builder-domain-btn share" style="width: 100%;" onclick="shareProfile('${handle}', '${user.name}');">SHARE PROFILE</button>
                            
                            <button class="builder-domain-claim" onclick="claimDomain('${handle}');">
                                🌐 Claim ${handle}.com
                            </button>
                        </div>

                        <!-- PHONE MOCKUP (FIXED) -->
                        <div class="phone-frame" style="background: ${userTheme.bg};">
                            <div class="phone-notch"></div>
                            <div class="phone-status-bar" style="background: rgba(0, 0, 0, 0.2); color: white;">
                                <span>9:41</span>
                                <span>●●●●●</span>
                            </div>

                            <!-- SCROLLABLE CONTENT -->
                            <div class="phone-content-wrapper">
                                <div class="phone-content" style="background: ${userTheme.bg}; color: ${userTheme.textColor};">
                                    <!-- Header -->
                                    <div style="padding: 24px 16px; text-align: center;">
                                        <div style="width: 100px; height: 100px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 48px; overflow: hidden;">
                                            ${user.avatar ? `<img src="${user.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : getInitials(user.name || 'User')}
                                        </div>
                                        <h2 style="margin-bottom: 4px; font-size: 18px; font-weight: 700;">${user.name || 'Your Name'}</h2>
                                        <p style="margin-bottom: 12px; font-size: 12px; opacity: 0.8;">@${handle}</p>
                                        ${user.bio ? `<p style="font-size: 12px; opacity: 0.8; line-height: 1.4;">${user.bio}</p>` : ''}
                                    </div>

                                    <!-- Social Icons with Font Awesome -->
                                    ${(() => {
                                        const socialBlock = builder.blocks.find(b => b.type === 'social' && b.visible);
                                        if (!socialBlock || !socialBlock.data?.platforms) return '';
                                        const hasLinks = Object.values(socialBlock.data.platforms || {}).some(v => v);
                                        if (!hasLinks) return '';
                                        
                                        return '<div style="padding: 0 16px 16px; display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">' +
                                            Object.entries(socialBlock.data.platforms).filter(([, url]) => url).map(([key, url]) => {
                                                const config = LOGO_CONFIG[key];
                                                if (!config) return '';
                                                return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
                                                    <div style="width: 40px; height: 40px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; cursor: pointer;"
                                                         onmouseover="this.style.background='rgba(255,255,255,0.25)'; this.style.transform='scale(1.1)'"
                                                         onmouseout="this.style.background='rgba(255,255,255,0.15)'; this.style.transform='scale(1)'">
                                                        <i class="${config.icon}" style="font-size: 18px; color: white;"></i>
                                                    </div>
                                                </a>`;
                                            }).join('') +
                                        '</div>';
                                    })()}

                                    <!-- Blocks -->
                                    ${builder.blocks.filter(b => b.type !== 'social' && b.visible).length === 0 ? `
                                        <div style="padding: 24px 16px; text-align: center; opacity: 0.6;">
                                            <div style="font-size: 36px; margin-bottom: 8px;">+</div>
                                            <div style="font-size: 12px;">Add blocks to get started</div>
                                        </div>
                                    ` : '<div style="padding: 0 12px 24px;">' + 
                                        builder.blocks.filter(b => b.type !== 'social' && b.visible).map(block => {
                                            const icon = block.type === 'product' ? '🛍️' : (block.data.icon || '🔗');
                                            return `<div style="padding: 8px 0;">
                                                <div style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); padding: 14px 16px; border-radius: 10px; color: ${userTheme.textColor}; text-align: center; font-weight: 500; font-size: 13px; cursor: pointer; transition: all 0.3s;">
                                                    ${icon} ${block.data.title || block.type}
                                                </div>
                                            </div>`;
                                        }).join('') +
                                    '</div>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        initBuilderView();
    }, 10);

    return html;
};

// ---- HELPER FUNCTIONS ----

function renderBlockPreview(block) {
    const data = block.data || {};
    switch(block.type) {
        case 'link': return (data.icon || '🔗') + ' ' + (data.title || 'Link');
        case 'video': return '📹 ' + (data.caption || 'Video');
        case 'image': return '🖼️ ' + (data.alt || 'Image');
        case 'text': return '📝 ' + (data.text?.substring(0, 20) || 'Text') + '...';
        case 'product': return '🛍️ ' + (data.title || 'Product');
        case 'social': return '🔗 Social Links';
        default: return block.type;
    }
}

function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}

function initBuilderView() {
    const handle = builder.currentHandle;

    // Add Block Button
    document.getElementById('add-block-btn')?.addEventListener('click', showAddBlockModal);

    // Profile inputs
    const nameInput = document.getElementById('builder-name');
    const bioInput = document.getElementById('builder-bio');

    const saveProfile = debounce(() => {
        auth.updateProfile({ name: nameInput.value, bio: bioInput.value });
        showToast('Profile saved ✓', 'success', 2000);
        setTimeout(() => router.loadView('builder'), 100);
    }, 500);

    nameInput?.addEventListener('input', saveProfile);
    bioInput?.addEventListener('input', saveProfile);

    // Avatar upload
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const avatarData = event.target.result;
                    auth.updateProfile({ avatar: avatarData });
                    showToast('Avatar updated ✓', 'success', 2000);
                    setTimeout(() => router.loadView('builder'), 100);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Block actions
    document.querySelectorAll('.block-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = btn.dataset.action;
            const blockId = btn.dataset.blockId;
            
            if (action === 'edit') {
                showEditBlockModal(blockId);
            } else if (action === 'toggle') {
                builder.toggleBlockVisibility(blockId);
                setTimeout(() => router.loadView('builder'), 100);
            } else if (action === 'delete') {
                if (confirm('Delete this block?')) {
                    builder.deleteBlock(blockId);
                    setTimeout(() => router.loadView('builder'), 100);
                }
            }
        });
    });

    // Drag & drop
    const blocksList = document.getElementById('blocks-list');
    if (blocksList && blocksList.children.length > 1) {
        blocksList.addEventListener('dragstart', (e) => {
            if (e.target.closest('.block-card')) {
                const card = e.target.closest('.block-card');
                card.classList.add('dragging');
                builder.draggedBlock = { index: parseInt(card.dataset.blockIndex) };
            }
        });

        blocksList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        blocksList.addEventListener('drop', (e) => {
            e.preventDefault();
            if (builder.draggedBlock) {
                const allCards = [...blocksList.querySelectorAll('.block-card')];
                const targetCard = e.target.closest('.block-card');
                if (targetCard) {
                    const newIndex = allCards.indexOf(targetCard);
                    builder.reorderBlocks(builder.draggedBlock.index, newIndex);
                    setTimeout(() => router.loadView('builder'), 100);
                }
            }
        });

        blocksList.addEventListener('dragend', () => {
            document.querySelectorAll('.block-card').forEach(card => card.classList.remove('dragging'));
        });
    }

    // Theme colors
    document.getElementById('theme-bg')?.addEventListener('change', (e) => {
        const newColor = e.target.value;
        theme.updateUserTheme(handle, { bg: newColor });
        setTimeout(() => router.loadView('builder'), 100);
    });

    document.getElementById('theme-btn-color')?.addEventListener('change', (e) => {
        theme.updateUserTheme(handle, { btnColor: e.target.value });
        setTimeout(() => router.loadView('builder'), 100);
    });

    document.getElementById('theme-text-color')?.addEventListener('change', (e) => {
        theme.updateUserTheme(handle, { textColor: e.target.value });
        setTimeout(() => router.loadView('builder'), 100);
    });
}

function showAddBlockModal() {
    const blockTypes = [
        { id: 'link', icon: 'fas fa-link', name: 'Link', desc: 'External or internal link' },
        { id: 'video', icon: 'fas fa-video', name: 'Video', desc: 'YouTube/TikTok embed' },
        { id: 'image', icon: 'fas fa-image', name: 'Image', desc: 'Upload or embed' },
        { id: 'text', icon: 'fas fa-align-left', name: 'Text', desc: 'Rich text block' },
        { id: 'product', icon: 'fas fa-shopping-bag', name: 'Product', desc: 'Sellable item' },
        { id: 'social', icon: 'fas fa-share-alt', name: 'Social Icons', desc: 'Link to profiles' }
    ];

    const content = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px;">
            ${blockTypes.map(type => `
                <div onclick="window.addBlockType('${type.id}')" style="padding: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;" onmouseover="this.style.borderColor='#667eea'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'">
                    <div style="font-size: 32px; margin-bottom: 8px;"><i class="${type.icon}"></i></div>
                    <div style="font-weight: 600; margin-bottom: 4px; color: white; font-size: 12px;">${type.name}</div>
                    <div style="font-size: 11px; color: rgba(255, 255, 255, 0.6);">${type.desc}</div>
                </div>
            `).join('')}
        </div>
    `;

    const modal = new Modal({ title: 'Add Block', content, closeable: true });

    window.addBlockType = (type) => {
        builder.addBlock(type, {});
        modal.close();
        setTimeout(() => router.loadView('builder'), 100);
    };

    modal.open();
}

function showEditBlockModal(blockId) {
    const block = builder.getBlock(blockId);
    if (!block) return;

    let form = '';
    const data = block.data || {};

    switch(block.type) {
        case 'link':
            form = `
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" id="edit-title" value="${data.title || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">URL</label>
                    <input type="url" class="form-input" id="edit-url" value="${data.url || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Icon</label>
                    <input type="text" class="form-input" id="edit-icon" value="${data.icon || '🔗'}" placeholder="Emoji or icon">
                </div>
            `;
            break;
        case 'text':
            form = `
                <div class="form-group">
                    <label class="form-label">Text</label>
                    <textarea class="form-textarea" id="edit-text" placeholder="Enter text...">${data.text || ''}</textarea>
                </div>
            `;
            break;
        case 'product':
            form = `
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-input" id="edit-title" value="${data.title || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Price</label>
                    <input type="number" class="form-input" id="edit-price" value="${data.price || '0'}" step="0.01">
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-textarea" id="edit-desc" placeholder="Product description...">${data.desc || ''}</textarea>
                </div>
            `;
            break;
        case 'social':
            const platforms = [
                { name: 'Facebook', icon: 'fab fa-facebook-f', key: 'facebook' },
                { name: 'Twitter/X', icon: 'fab fa-twitter', key: 'twitter' },
                { name: 'Instagram', icon: 'fab fa-instagram', key: 'instagram' },
                { name: 'LinkedIn', icon: 'fab fa-linkedin-in', key: 'linkedin' },
                { name: 'YouTube', icon: 'fab fa-youtube', key: 'youtube' },
                { name: 'TikTok', icon: 'fab fa-tiktok', key: 'tiktok' },
                { name: 'WhatsApp', icon: 'fab fa-whatsapp', key: 'whatsapp' },
                { name: 'Email', icon: 'fas fa-envelope', key: 'email' }
            ];
            const socialData = data.platforms || {};
            form = `
                <div style="max-height: 400px; overflow-y: auto;">
                    ${platforms.map(p => `
                        <div class="form-group">
                            <label class="form-label">
                                <i class="${p.icon}" style="margin-right: 8px; color: #667eea;"></i>
                                ${p.name}
                            </label>
                            <input type="text" class="form-input" id="edit-${p.key}" placeholder="https://..." value="${socialData[p.key] || ''}">
                        </div>
                    `).join('')}
                </div>
            `;
            break;
    }

    const modal = new Modal({
        title: 'Edit ' + block.type.charAt(0).toUpperCase() + block.type.slice(1),
        content: form,
        closeable: true,
        actions: [
            { label: 'Cancel', type: 'ghost', callback: () => {} },
            {
                label: 'Save Changes',
                type: 'primary',
                callback: () => {
                    const updates = { data: {} };
                    const titleInput = document.getElementById('edit-title');
                    const urlInput = document.getElementById('edit-url');
                    const iconInput = document.getElementById('edit-icon');
                    const textInput = document.getElementById('edit-text');
                    const priceInput = document.getElementById('edit-price');
                    const descInput = document.getElementById('edit-desc');
                    
                    if (titleInput) updates.data.title = titleInput.value;
                    if (urlInput) updates.data.url = urlInput.value;
                    if (iconInput) updates.data.icon = iconInput.value;
                    if (textInput) updates.data.text = textInput.value;
                    if (priceInput) updates.data.price = parseFloat(priceInput.value);
                    if (descInput) updates.data.desc = descInput.value;
                    
                    if (block.type === 'social') {
                        const socialPlatforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'email'];
                        updates.data.platforms = {};
                        socialPlatforms.forEach(p => {
                            const val = document.getElementById('edit-' + p)?.value;
                            if (val) updates.data.platforms[p] = val;
                        });
                    }
                    
                    builder.updateBlock(blockId, updates);
                    showToast('Block updated ✓', 'success', 2000);
                    setTimeout(() => router.loadView('builder'), 100);
                }
            }
        ]
    });

    modal.open();
}