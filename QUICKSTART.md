# 🚀 Quick Start Guide

## ⚡ Get Running in 30 Seconds

### Option 1: Direct Open
```bash
# Just open the file directly in your browser
File → Open → beacons-clone/index.html
```

### Option 2: Local Server (Recommended)
```bash
# Navigate to project folder
cd "c:\Users\sunil\OneDrive\Documents\Beacon's clone"

# Start Python server
python3 -m http.server 8000

# Or if Python 2
python -m SimpleHTTPServer 8000

# Then open
http://localhost:8000
```

### Option 3: VS Code Live Server
```bash
# Install "Live Server" extension
# Right-click index.html
# Select "Open with Live Server"
```

---

## 📝 First Time Setup

1. **Open the app** → You'll see the landing page
2. **Sign Up** → Click "Get Started"
3. **Create Account**:
   - Name: Your Name
   - Email: your@email.com
   - Handle: @yourhandle
   - Password: min 6 characters
4. **Redirected to Dashboard** → You're in!

---

## 🎮 Try These Features

### 1️⃣ Build Your Page
- Go to **Page Builder** (left sidebar)
- Edit profile: name, bio, avatar
- Click **+ Add Block**
- Choose block type (Link, Product, Video, etc)
- Edit block details
- **Drag-drop** to reorder
- See **live preview** on right
- Colors update in real-time

### 2️⃣ Create Products
- Go to **Store** (sidebar)
- Click **+ Add Product**
- Fill: name, price, category
- See products in grid
- Publish/unpublish

### 3️⃣ Check Analytics
- Go to **Analytics** (sidebar)
- See charts for views, clicks, sources
- Try date range buttons
- Refresh for new fake data

### 4️⃣ View Your Public Page
- Go to **Dashboard**
- Click **View Public Page** button
- OR go to `#page/@yourhandle`
- Share this link with anyone!

### 5️⃣ Customize Settings
- Go to **Settings** (sidebar)
- Change name, bio
- Toggle theme (Dark/Light)
- Change password
- Delete account (careful!)

---

## 🧪 Test Accounts

### Demo User (Pre-created)
```
Handle: @demo
Email: demo@example.com
Password: password123
```

### Create Your Own
Just sign up - all stored in localStorage!

---

## 💡 Pro Tips

### 🔄 Reset Everything
```javascript
// Open DevTools Console (F12)
// Paste and run:
localStorage.clear()
location.reload()
```

### 🎨 Change Theme
- Click **☀️ / 🌙** in top navbar
- Or go to Settings → Theme

### 📱 Test Mobile View
- Press F12 → Toggle Device Toolbar
- Or press Ctrl+Shift+M

### 🔍 Debug
- Open DevTools (F12)
- Go to Application → Storage → localStorage
- See all your data
- Edit JSON directly for testing

---

## 📂 What's Inside

```
index.html              ← Main file, open this
css/
  ├── design-system.css ← Colors, fonts, utilities
  ├── layout.css       ← Navbar, sidebar, layout
  ├── components.css   ← Buttons, forms, cards
  └── pages.css        ← Page-specific styles

js/
  ├── app.js           ← Entry point
  ├── router.js        ← Navigation system
  ├── auth.js          ← Login/Signup
  ├── builder.js       ← Page builder
  ├── store.js         ← Product store
  ├── analytics.js     ← Charts & analytics
  ├── settings.js      ← User settings
  ├── theme.js         ← Dark/Light mode
  ├── components.js    ← Modals, toasts, etc
  ├── publicPage.js    ← Public profile
  ├── views.js         ← Landing page
  └── utils.js         ← Helper functions
```

---

## ❌ Known Limitations

- Passwords stored plaintext (demo only!)
- No image upload (fake only)
- No real payment processing
- No email sending
- Analytics data is simulated
- No backend sync
- Single browser/device only (localStorage)

---

## ✨ Features Included

### Pages
- [x] Landing page with features, pricing, FAQ
- [x] Auth (Sign up, Log in)
- [x] Dashboard with stats
- [x] Page Builder with real-time preview
- [x] Public profile page
- [x] Product store
- [x] Analytics with Chart.js
- [x] Settings

### Blocks
- [x] Link blocks
- [x] Video embeds
- [x] Image blocks
- [x] Text blocks
- [x] Product blocks
- [x] Social icons
- [x] + more coming

### UI
- [x] Dark mode ✓
- [x] Light mode ✓
- [x] Fully responsive
- [x] Toast notifications
- [x] Modals & dialogs
- [x] Drag-drop reorder
- [x] Animations
- [x] Glassmorphism design

---

## 🎯 Next Steps

1. **Explore** - Try all the features
2. **Create** - Build your own link-in-bio page
3. **Customize** - Change colors, add content
4. **Share** - Copy your public profile link
5. **Hack** - Edit CSS/JS to personalize

---

## 🆘 Troubleshooting

### Blank Page?
- Check browser console (F12) for errors
- Make sure JavaScript is enabled
- Try refreshing (Ctrl+Shift+R for hard refresh)

### Can't Sign Up?
- Handle must be 3-20 alphanumeric characters
- Password must be 6+ characters
- Email format must be valid

### Data Lost?
- localStorage cleared?
- Different browser/device/incognito?
- Check DevTools → Application → Storage

### Slow Performance?
- Too many blocks?
- Chrome DevTools open? Close it
- Too many charts? Refresh

---

## 📞 Questions?

Check the **README.md** for full documentation!

---

**Have fun building! 🚀**
