/* ============================================================================
   UTILS - Utility Functions
   ============================================================================ */

// ---- ID GENERATION ----

function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ---- LOCALSTORAGE HELPERS ----

function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function setToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

function clearStorage() {
    try {
        const keysToKeep = ['jsbeacons_session', 'beacons_theme'];
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (!keysToKeep.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        return true;
    } catch (error) {
        console.error('Storage error:', error);
        return false;
    }
}

// ---- DEBOUNCE & THROTTLE ----

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ---- FORMATTING ----

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(date, format = 'short') {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const options = {
        short: { month: 'short', day: 'numeric', year: '2-digit' },
        long: { month: 'long', day: 'numeric', year: 'numeric' },
        full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return date.toLocaleDateString('en-US', options[format] || options.short);
}

function formatTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    
    return formatDate(date, 'short');
}

function truncateText(text, maxLength = 50) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// ---- VALIDATION ----

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isValidPassword(password) {
    // At least 6 characters
    return password && password.length >= 6;
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function validateHandle(handle) {
    // Alphanumeric and underscore only, 3-20 characters
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(handle);
}

// ---- COPY TO CLIPBOARD ----

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
    }
}

// ---- FILE READING ----

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ---- URL HELPERS ----

function getHashRoute() {
    const hash = window.location.hash.substr(1) || 'home';
    const [route, ...params] = hash.split('/');
    return { route, params };
}

function setHashRoute(route, ...params) {
    const path = params.length ? `${route}/${params.join('/')}` : route;
    window.location.hash = path;
}

function getQueryParam(param) {
    const url = new URL(window.location);
    return url.searchParams.get(param);
}

// ---- DOM HELPERS ----

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'class') {
            element.className = value;
        } else if (key === 'style') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on')) {
            const eventName = key.substring(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (content) {
        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Element) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            content.forEach(item => {
                if (typeof item === 'string') {
                    element.innerHTML += item;
                } else {
                    element.appendChild(item);
                }
            });
        }
    }
    
    return element;
}

function addClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element?.classList.add(className);
}

function removeClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element?.classList.remove(className);
}

function toggleClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element?.classList.toggle(className);
}

function hasClass(element, className) {
    if (typeof element === 'string') {
        element = $(element);
    }
    return element?.classList.contains(className) || false;
}

// ---- RANDOM DATA GENERATORS ----

function randomUser() {
    const names = ['Sarah', 'Emma', 'Alex', 'Jordan', 'Casey', 'Morgan'];
    const industries = ['Creator', 'Designer', 'Developer', 'Influencer', 'Artist'];
    
    return {
        name: names[Math.floor(Math.random() * names.length)],
        handle: `@creator_${Math.floor(Math.random() * 10000)}`,
        industry: industries[Math.floor(Math.random() * industries.length)]
    };
}

function randomColor() {
    const colors = ['#6C63FF', '#FF6584', '#43D9A2', '#FFB347', '#FF8B94'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ---- ARRAY HELPERS ----

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function groupBy(array, key) {
    return array.reduce((result, obj) => {
        const group = obj[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(obj);
        return result;
    }, {});
}

function unique(array, key) {
    if (!key) return [...new Set(array)];
    
    const seen = new Set();
    return array.filter(item => {
        const k = item[key];
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

// ---- EVENT HELPERS ----

function on(element, event, handler) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element?.addEventListener(event, handler);
}

function off(element, event, handler) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element?.removeEventListener(event, handler);
}

function emit(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
}

function on_custom(eventName, handler) {
    document.addEventListener(eventName, handler);
}

// ---- ANIMATION HELPERS ----

function fadeIn(element, duration = 300) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.offsetHeight; // Trigger reflow
    element.style.opacity = '1';
}

function slideInUp(element, duration = 300) {
    if (typeof element === 'string') {
        element = $(element);
    }
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = `all ${duration}ms ease-out`;
    element.offsetHeight; // Trigger reflow
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
}

// ---- MISC HELPERS ----

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function request(method, path, data = null) {
    // Placeholder for actual API calls
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, data });
        }, 100);
    });
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
}
