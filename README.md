# Beacons.ai Clone - Full-Stack Creator Platform

A complete, pixel-perfect clone of **Beacons.ai** built with vanilla HTML, CSS, and JavaScript. Single-page application with hash-based routing and full localStorage persistence.

## 🚀 Features

### Core Functionality
- ✅ **Landing Page** - Marketing hero with features, pricing, FAQ
- ✅ **Authentication** - Sign up / Login with localStorage persistence
- ✅ **Dashboard** - User dashboard with stats and quick actions
- ✅ **Page Builder** - Drag-and-drop block editor with real-time preview
- ✅ **Public Profile** - Customizable creator link-in-bio page
- ✅ **Store** - Digital product management and selling
- ✅ **Analytics** - Chart.js powered analytics with traffic insights
- ✅ **Settings** - Profile, account, theme, integrations

### Technical Features
- 🎨 **Design System** - CSS variables, glassmorphism, animations
- 🌙 **Dark/Light Mode** - Full theme support
- 📱 **Responsive Design** - Mobile-first, fully responsive
- 💾 **localStorage** - Complete data persistence
- 🎯 **Hash-based Routing** - Single-page navigation (#home, #builder, etc)
- 🏗️ **Modular Architecture** - Separated concerns, reusable components
- ⚡ **No Dependencies** - Vanilla JS (Chart.js via CDN only)

## 📁 Project Structure

```
beacons-clone/
├── index.html              # Main HTML file
├── css/
│   ├── design-system.css   # Colors, fonts, utilities
│   ├── layout.css          # Layout components
│   ├── components.css      # Reusable UI components
│   └── pages.css           # Page-specific styles
├── js/
│   ├── utils.js            # Utility functions
│   ├── router.js           # Hash-based router
│   ├── auth.js             # Authentication
│   ├── theme.js            # Theme management
│   ├── components.js       # UI components (modals, toasts, etc)
│   ├── builder.js          # Page builder
│   ├── store.js            # Product store
│   ├── analytics.js        # Analytics dashboard
│   ├── settings.js         # Settings page
│   ├── publicPage.js       # Public profile & dashboard
│   ├── views.js            # Landing page view
│   └── app.js              # Main app initialization
└── assets/                 # Images, icons (if any)
```

## 🎨 Color Palette

```
Primary     : #6C63FF (Purple)
Accent      : #FF6584 (Pink/Coral)
Success     : #43D9A2 (Green)
Error       : #FF6B6B (Red)
Warning     : #FFB347 (Orange)
Dark BG     : #0D0D0D
Light BG    : #FFFFFF
```

## 🔐 localStorage Schema

```javascript
{
  // Session
  jsbeacons_session: {
    loggedIn: true,
    handle: "jane_doe"
  },
  
  // Users
  beacons_users: {
    "jane_doe": {
      name: "Jane Doe",
      email: "jane@example.com",
      password: "hashed",
      bio: "Creator & Designer",
      avatar: "data:image/..."
    }
  },
  
  // Blocks
  beacons_blocks: {
    "jane_doe": [
      {
        id: "b_123...",
        type: "link",
        visible: true,
        order: 0,
        data: { title: "My Website", url: "..." }
      }
    ]
  },
  
  // Theme
  beacons_theme: {
    "jane_doe": {
      bg: "linear-gradient(...)",
      font: "DM Sans",
      btnStyle: "rounded",
      btnColor: "#6C63FF",
      textColor: "#FFFFFF",
      cardStyle: "glass"
    }
  },
  
  // Products
  beacons_products: {
    "jane_doe": [
      {
        id: "p_123...",
        title: "Digital Course",
        price: 29.99,
        status: "published"
      }
    ]
  },
  
  // Analytics
  beacons_analytics: {
    "jane_doe": {
      views: [{ date: "2024-05-05", count: 42 }],
      clicks: { block_123: 12 },
      sources: { instagram: 30, direct: 12 }
    }
  }
}
```

## 🚀 Getting Started

### 1. Open in Browser
```bash
# Simply open index.html in your browser
# Or use a local server for better experience
python3 -m http.server 8000
# Then visit http://localhost:8000
```

### 2. Test Account
Create your own account or use:
- **Email**: demo@example.com
- **Password**: password123
- **Handle**: @demo

### 3. Navigation
- `#home` - Landing page
- `#auth` - Authentication
- `#dashboard` - User dashboard
- `#builder` - Page builder
- `#store` - Product store
- `#analytics` - Analytics
- `#settings` - Settings
- `#page/:handle` - Public profile

## 📦 Block Types

The page builder supports these block types:

- **Link** - External/internal links with icons
- **Video** - YouTube/TikTok embeds with thumbnails
- **Image** - Upload or embed images
- **Text** - Rich text content
- **Product** - Sellable items with pricing
- **Social** - Social media profile links
- **Music** - Spotify/music embeds
- **Email** - Email capture forms
- **Booking** - Calendly-style booking
- **Testimonial** - Customer testimonials

## 🎯 Key Features Walkthrough

### Authentication Flow
1. Land on homepage
2. Click "Get Started"
3. Sign up with name, email, handle, password
4. Data persisted to localStorage
5. Automatically logged in and redirected to dashboard

### Page Builder
1. Go to #builder
2. Upload avatar (FileReader API)
3. Edit profile info
4. Click "+ Add Block"
5. Choose block type
6. Edit block details
7. Drag-drop to reorder
8. Real-time preview on right panel
9. Customizes theme colors
10. Auto-saves to localStorage

### Public Profile
1. Each user accessible at `#page/@username`
2. Shows avatar, name, bio
3. Displays all visible blocks
4. Click blocks to navigate
5. Records page views and clicks

### Analytics
1. Chart.js powered visualizations
2. Line chart: Page views over time
3. Bar chart: Clicks per block
4. Doughnut chart: Traffic sources
5. Date range selector (7d/30d/90d)
6. Fake data generation for demo

## 🛠️ Module Reference

### auth.js
- `auth.signup()` - Create new account
- `auth.login()` - Authenticate user
- `auth.logout()` - Clear session
- `auth.getCurrentUser()` - Get current user data
- `auth.updateProfile()` - Save profile changes

### builder.js
- `builder.addBlock()` - Add new block
- `builder.updateBlock()` - Edit block
- `builder.deleteBlock()` - Remove block
- `builder.reorderBlocks()` - Drag-drop reorder
- `builder.toggleBlockVisibility()` - Show/hide block

### store.js
- `store.addProduct()` - Create product
- `store.updateProduct()` - Edit product
- `store.deleteProduct()` - Remove product
- `store.toggleProductStatus()` - Publish/unpublish

### analytics.js
- `analytics.recordView()` - Track page view
- `analytics.recordClick()` - Track link click
- `analytics.getStats()` - Get stats for period
- `analytics.generateFakeData()` - Demo data generator

### components.js
- `showToast()` - Show notification
- `showConfirm()` - Confirmation dialog
- `showAlert()` - Alert dialog
- `showPrompt()` - Input dialog
- `Modal` - Reusable modal class

### router.js
- `router.register()` - Register route
- `router.navigate()` - Change route
- `router.start()` - Initialize router
- Route guards: `requireAuth()`, `requireGuest()`

## 🎨 Customization

### Colors
Edit `css/design-system.css` CSS variables:
```css
:root {
  --primary: #6C63FF;
  --accent: #FF6584;
  --success: #43D9A2;
  /* ... etc */
}
```

### Fonts
Change in design-system.css:
```css
--font-heading: 'Syne', sans-serif;
--font-body: 'DM Sans', sans-serif;
```

### Spacing
Adjust scale:
```css
--spacing-md: 1rem;
--spacing-lg: 1.5rem;
/* ... etc */
```

## 🐛 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ⚠️ IE11 (not supported - uses ES6+)

## 📝 Notes

### Security
- Passwords stored in plaintext (for demo only!)
- In production: Use bcrypt/hashing
- Add CORS, rate limiting, validation on backend
- Use HTTPS only

### Performance
- Lazy load images
- Optimize images before upload
- Cache API responses
- Use service workers for offline support

### Future Enhancements
- Backend API integration
- User authentication with JWT
- Image upload to cloud storage
- Email confirmations
- Social login (OAuth)
- Payment processing (Stripe)
- Real analytics tracking
- Advanced customization
- Team collaboration

## 📄 License

This is an educational project. Feel free to use for learning purposes.

## 💡 Tips

1. **Test Locally**: Use `python3 -m http.server 8000`
2. **Clear Data**: Open DevTools → Application → localStorage → Clear All
3. **Debug**: Check DevTools console for logs
4. **Network**: Simulate on slower connections to test UI
5. **Responsive**: Test on mobile with DevTools device emulation

---

**Built with ❤️ • No frameworks, no backend, pure vanilla web dev**
