# 🎮 Gather The Crown - Quick Start: Cross-Platform Setup

Your game is now configured for **Universal Distribution** across all platforms:

## In 5 Minutes: Get Started

### 1️⃣ Install Dependencies
```bash
pnpm install
```

### 2️⃣ Choose Your Build
```bash
# Web (Browser) - Fastest to develop/test
npm run web:dev

# Desktop (Windows/Mac/Linux) - One command
npm run build:desktop

# Mobile (iOS/Android) - Via Expo
npm run build:mobile
```

### 3️⃣ Package for Distribution
```bash
# All platforms at once
npm run deploy:all

# Or individual:
npm run deploy:web       # Upload to Netlify/Vercel
npm run pack:desktop     # Creates installers
npm run pack:ios         # iOS app
npm run pack:android     # Android app
```

---

## 📦 What You Have Now

| Platform | Format | Users | Distribution |
|----------|--------|-------|--------------|
| **Web** | Browser | Anyone with internet | Free hosting (Netlify) |
| **Desktop** | .exe / .dmg / .AppImage | Windows, Mac, Linux | GitHub + Installers |
| **iOS** | App Store app | iPhone/iPad users | Apple App Store |
| **Android** | Play Store app | Android users | Google Play Store |

---

## 🚀 Three Deployment Paths

### Path A: Quick & Free (Web Only)
```bash
npm run web:build
# Deploy to: Netlify, Vercel, or GitHub Pages
# Users access: https://your-domain.com
# Result: No installation, cross-platform
```

### Path B: Desktop Distribution (Single File)
```bash
npm run build:desktop
# Creates: Setup.exe (Windows), .dmg (Mac), .AppImage (Linux)
# Publish: GitHub Releases (free)
# Users: Download and run (1-click install)
```

### Path C: Full Mobile + Desktop (Most Reach)
```bash
npm run deploy:all
# Builds: Web + Desktop + iOS + Android
# Publish: App Stores + Website + GitHub
# Users: Can use any device, any OS
```

---

## 📱 Platform-Specific Tips

### Web (Best for testing)
- Run locally: `npm run web:dev`
- Debug: Browser DevTools
- Instant updates: No build needed

### Desktop (Best for offline play)
- Ships as standalone .exe/.dmg
- Auto-updates supported
- Can run without internet
- Windows/Mac/Linux unified

### Mobile (Best for reach)
- Touch-optimized controls
- App Store distribution
- Cross-device sync (via server)
- iOS + Android from same codebase

---

## 🎯 Recommended First Step

**To see everything working immediately:**

```bash
# Terminal 1: Start the server
npm run server:dev

# Terminal 2: Start the web client
npm run web:dev

# Opens at http://localhost:5173
```

Then try building each format:

```bash
# Web (30 seconds)
npm run web:build

# Desktop (2 minutes)
npm run build:desktop

# Mobile (prep, then 5-10 min per platform)
npm run build:mobile
```

---

## 📖 Detailed Guides

- **[CROSS_PLATFORM_SETUP.md](./CROSS_PLATFORM_SETUP.md)** - Technical architecture
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Publishing to app stores
- **[build.sh](./build.sh)** - Automated build script (Mac/Linux)
- **[build.bat](./build.bat)** - Automated build script (Windows)

---

## 💡 Key Technologies

| Part | Technology | Purpose |
|------|-----------|---------|
| Game | Phaser 3 | Cross-platform game framework |
| Frontend | TypeScript + Vite | Fast web build tool |
| Backend | Node.js + Colyseus | Multiplayer real-time sync |
| Desktop | Electron | Package web app as desktop exe |
| Mobile | React Native + Expo | Single code = iOS + Android |

---

## 🔄 Development Workflow

```
Code changes
    ↓
Local web test (npm run web:dev)
    ↓
Mobile preview (npm run dev:mobile)
    ↓
Desktop test (npm run start:desktop)
    ↓
Build all platforms (npm run build:all)
    ↓
Upload to stores
    ↓
Users download on their device ✅
```

---

## ❓ Common Questions

**Q: Do I need to code separately for each platform?**  
A: No! Write once (TypeScript), runs everywhere.

**Q: How do users on different devices play together?**  
A: Server handles cross-platform sync automatically via Colyseus.

**Q: Can I update the game on all platforms at once?**  
A: Yes - server updates affect all devices. Desktop/mobile auto-update.

**Q: What's the cost to distribute?**  
A: Web ($0), Desktop ($0), iOS ($99/year), Android ($25 one-time).

**Q: How many downloads can I have?**  
A: Unlimited on web/Android. iOS has per-app limits (Google/Apple manage).

---

## 🎬 Next Steps

1. ✅ You can now build for any platform
2. 📝 Customize config files (app names, icons, etc.)
3. 🧪 Test on each platform (web, desktop, mobile simulator)
4. 🔐 Add signing certificates for production
5. 📤 Publish to app stores (see DEPLOYMENT_GUIDE.md)

---

**Ready to ship? Run:**
```bash
npm run deploy:all
```

Your game is cross-platform. Ship it! 🚀
