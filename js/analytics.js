/* ============================================================================
   ANALYTICS - Analytics Dashboard with Chart.js
   ============================================================================ */

const analytics = {
    currentHandle: null,
    data: null,
    charts: {},
    dateRange: '30d',
    
    // Initialize analytics
    init(handle) {
        this.currentHandle = handle;
        this.loadData();
    },
    
    // Load analytics data
    loadData() {
        const handle = this.currentHandle;
        const allAnalytics = getFromStorage('beacons_analytics', {});
        this.data = allAnalytics[handle] || {
            views: [],
            clicks: {},
            sources: {}
        };
    },
    
    // Generate fake data for demo
    generateFakeData(days = 30) {
        const views = [];
        const clicks = {};
        const sources = { instagram: 0, tiktok: 0, direct: 0, twitter: 0, other: 0 };
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            views.push({
                date: date.toISOString().split('T')[0],
                count: Math.floor(Math.random() * 200) + 20
            });
        }
        
        // Generate clicks per block
        for (let i = 0; i < 5; i++) {
            clicks[`block_${i}`] = Math.floor(Math.random() * 500) + 50;
        }
        
        // Generate source distribution
        const sourceNames = Object.keys(sources);
        sourceNames.forEach(source => {
            sources[source] = Math.floor(Math.random() * 300) + 50;
        });
        
        return { views, clicks, sources };
    },
    
    // Record page view
    recordView() {
        if (!this.data.views) {
            this.data.views = [];
        }
        
        const today = new Date().toISOString().split('T')[0];
        const todayView = this.data.views.find(v => v.date === today);
        
        if (todayView) {
            todayView.count++;
        } else {
            this.data.views.push({ date: today, count: 1 });
        }
        
        this.saveData();
    },
    
    // Record click
    recordClick(blockId) {
        if (!this.data.clicks) {
            this.data.clicks = {};
        }
        
        this.data.clicks[blockId] = (this.data.clicks[blockId] || 0) + 1;
        this.saveData();
    },
    
    // Save analytics data
    saveData() {
        const handle = this.currentHandle;
        let allAnalytics = getFromStorage('beacons_analytics', {});
        allAnalytics[handle] = this.data;
        setToStorage('beacons_analytics', allAnalytics);
    },
    
    // Get stats
    getStats(days = 30) {
        const fakeData = this.generateFakeData(days);
        const views = fakeData.views.reduce((sum, v) => sum + v.count, 0);
        const clicks = Object.values(fakeData.clicks).reduce((sum, c) => sum + c, 0);
        const ctr = views > 0 ? (clicks / views * 100).toFixed(2) : 0;
        
        return { views, clicks, ctr };
    }
};

// ---- RENDER ANALYTICS VIEW ----

views.analytics = async function() {
    const session = getFromStorage('jsbeacons_session');
    const handle = session?.handle;
    
    if (!handle) {
        await router.navigate('auth');
        return '';
    }
    
    analytics.init(handle);
    
    const users = getFromStorage('beacons_users', {});
    const user = users[handle] || { name: 'User' };
    
    const sidebarNav = [
        { icon: '📄', label: 'Page', href: 'builder' },
        { icon: '🛍️', label: 'Store', href: 'store' },
        { icon: '📈', label: 'Analytics', href: 'analytics' },
        { icon: '⚙️', label: 'Settings', href: 'settings' }
    ];
    
    const stats = analytics.getStats(30);
    const fakeData = analytics.generateFakeData(30);
    
    const html = `
        ${renderNavbar()}
        ${renderSidebar(user, sidebarNav)}
        <div class="main-content with-sidebar">
            <div class="analytics-container">
                <div class="analytics-header">
                    <h1 style="margin: 0;">Analytics</h1>
                    
                    <div class="analytics-filters">
                        <button class="date-range-btn active" data-range="7d">7 Days</button>
                        <button class="date-range-btn" data-range="30d">30 Days</button>
                        <button class="date-range-btn" data-range="90d">90 Days</button>
                    </div>
                </div>
                
                <!-- Stats Cards -->
                <div class="analytics-stats">
                    <div class="stat-card">
                        <div class="stat-value">${stats.views}</div>
                        <div class="stat-label">Total Views</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.clicks}</div>
                        <div class="stat-label">Total Clicks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.ctr}%</div>
                        <div class="stat-label">Click Through Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${(Math.random() * 5 + 1).toFixed(1)}m</div>
                        <div class="stat-label">Avg. Session</div>
                    </div>
                </div>
                
                <!-- Charts -->
                <div class="analytics-charts">
                    <div class="chart-card">
                        <h3 class="chart-title">Page Views (Last 30 Days)</h3>
                        <div class="chart-container">
                            <canvas id="views-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <h3 class="chart-title">Clicks by Block</h3>
                        <div class="chart-container">
                            <canvas id="clicks-chart"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <h3 class="chart-title">Traffic Sources</h3>
                        <div class="chart-container">
                            <canvas id="sources-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        initAnalyticsView();
    }, 10);
    
    return html;
};

function initAnalyticsView() {
    const fakeData = analytics.generateFakeData(30);
    
    // Views Chart
    const viewsCtx = document.getElementById('views-chart');
    if (viewsCtx) {
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: fakeData.views.map(v => {
                    const date = new Date(v.date);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }),
                datasets: [{
                    label: 'Views',
                    data: fakeData.views.map(v => v.count),
                    borderColor: '#6C63FF',
                    backgroundColor: 'rgba(108, 99, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Clicks Chart
    const clicksCtx = document.getElementById('clicks-chart');
    if (clicksCtx) {
        new Chart(clicksCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(fakeData.clicks).map((k, i) => `Block ${i + 1}`),
                datasets: [{
                    label: 'Clicks',
                    data: Object.values(fakeData.clicks),
                    backgroundColor: 'rgba(255, 101, 132, 0.5)',
                    borderColor: '#FF6584',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Sources Chart
    const sourcesCtx = document.getElementById('sources-chart');
    if (sourcesCtx) {
        new Chart(sourcesCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(fakeData.sources).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                datasets: [{
                    data: Object.values(fakeData.sources),
                    backgroundColor: [
                        '#6C63FF',
                        '#FF6584',
                        '#43D9A2',
                        '#FFB347',
                        '#FF8B94'
                    ],
                    borderColor: 'rgba(13, 13, 13, 0.8)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Date range buttons
    document.querySelectorAll('.date-range-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.date-range-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const range = e.target.dataset.range;
            const days = parseInt(range);
            
            // Reload with new data
            router.loadView('analytics');
        });
    });
    
    // Hamburger menu
    const hamburger = document.getElementById('hamburger-menu');
    const sidebar = document.getElementById('sidebar');
    hamburger?.addEventListener('click', () => {
        sidebar?.classList.toggle('visible');
    });
}
