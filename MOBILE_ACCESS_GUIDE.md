# 🏰 Gather The Crown - Mobile Access Guide

## ✅ Current Status
- **Dev Server:** Running ✓
- **Mobile Optimized:** Yes ✓
- **QR Code:** Available ✓

---

## 🎮 How to Access

### Option 1: Direct URLs (Fastest)

**Desktop/Laptop:**
```
http://localhost:5173/
```

**Phone on same WiFi:**
```
http://192.168.1.104:5173/
```

### Option 2: QR Code

1. Open: `http://192.168.1.104:5173/qrcode.html`
2. Scan QR code with your phone's camera app
3. Tap the notification to open in browser

### Option 3: Home Page

1. Open: `http://192.168.1.104:5173/public/index.html`
2. Click "PLAY ON PHONE" or "PLAY ON DESKTOP"

---

## 📱 Mobile Features

✅ **Touch Controls** - Tap to interact with the game  
✅ **Full Screen** - Auto-scales to your device  
✅ **No Scrollbars** - Pure game experience  
✅ **Responsive UI** - Works on all screen sizes  
✅ **Optimized Performance** - Smooth gameplay  

---

## 🎮 Game Controls

| Action | Control |
|--------|---------|
| **Move** | WASD or Arrow Keys or Touch |
| **Attack** | Auto-attack on enemy contact |
| **Interact** | Click/Touch on objects |
| **Menu** | Press ESC or back button |
| **Inventory** | Press I key |
| **Map** | Press M key |

---

## 🚀 Server Management

### Start Server
```bash
cd packages/client
npm run dev
```

### Stop Server
Press `Ctrl + C` in the terminal

### Server URLs
- **Local:** http://localhost:5173/
- **Network:** http://192.168.1.104:5173/
- **QR Page:** http://192.168.1.104:5173/qrcode.html
- **Home:** http://192.168.1.104:5173/public/index.html

---

## ⚙️ Troubleshooting

### "Page Won't Load"
1. Verify the dev server is running (you should see "VITE ready" in terminal)
2. Check your WiFi connection
3. Try refreshing the page (F5)

### "Game Still Shows Only Menu"
- Wait 5 seconds for all assets to load
- Check browser console for errors (F12)
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### "Can't Access from Phone"
- Ensure phone is on **same WiFi network**
- Try: `http://192.168.1.104:5173/` 
- If that doesn't work, try checking your computer's IP (run: `ipconfig` in terminal)

### "Touch Controls Not Working"
- Make sure you're using a recent browser
- Try tapping the game area first to activate it
- Some older phones may need browser updates

---

## 📂 Game Files

**TypeScript/Phaser Web Version:**
```
packages/client/
├── src/
│   ├── main.ts (Mobile-optimized config)
│   ├── scenes/ (Game levels)
│   └── ui/ (UI components)
├── index.html (Main page)
└── public/
    ├── index.html (Home/launcher)
    └── qrcode.html (QR code)
```

**Alternative Python/Pygame Version:**
```
extracted_game/GatherTheCrown-CreatsAndFoes/
└── complete_ultimate_game.py
```

---

## 💾 Both Game Versions Available

**Web Version (Recommended for Phone):**
- Access: http://192.168.1.104:5173/
- Platform: Browser
- Optimization: Mobile-first

**Python Version (Desktop Only):**
- Run: `python complete_ultimate_game.py`
- Platform: Windows/Mac/Linux
- Features: Complete pygame implementation

---

## 🎯 Quick Start

1. **Game is already running!** No need to restart.
2. Open your phone browser to: `http://192.168.1.104:5173/`
3. Click "Start Game" in the menu
4. Enjoy! 🎮

**Any issues?** Check the troubleshooting section above!

---

**Enjoy your adventure! 🏰⚔️💰**
