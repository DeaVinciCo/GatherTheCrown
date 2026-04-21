# Cross-Platform Deployment Guide

## Overview
The game is configured for three deployment targets:
1. **Desktop** (PC/Mac/Linux) - via Electron
2. **Mobile** (iOS/Android) - via Expo/React Native
3. **Web** (Browser) - via Vite

## Current Architecture

```
packages/
├── client/          # Phaser game (web/desktop/mobile)
├── server/          # Node.js + Colyseus backend
└── shared/          # Shared types & constants
```

## Build & Deployment

### 1. Web Version (Browser)
```bash
cd packages/client
npm run build      # Creates dist/ folder
npm run start      # Runs preview server on http://localhost:4173
```

### 2. Desktop (Electron - Windows/Mac/Linux)
```bash
npm run build:desktop   # Bundles web app for Electron
npm run pack:desktop    # Creates desktop installers
```

**Outputs:**
- Windows: `.exe` installer
- Mac: `.dmg` package
- Linux: AppImage or `.deb`

### 3. Mobile (Expo - iOS/Android)
```bash
npm run build:mobile    # Prepares mobile build
npm run pack:ios        # Creates iOS app
npm run pack:android    # Creates APK/AAB for Android
```

**Outputs:**
- iOS: Can submit to App Store or use Testflight
- Android: APK for Play Store or sideload

### 4. Unified Build Script
```bash
npm run build:all       # Builds for all platforms
npm run deploy:all      # Prepares all platforms for release
```

## Environment Setup

### Required Tools

#### Desktop (Electron)
- Node.js (already have)
- electron-builder: `npm install -g electron-builder`

#### Mobile (Expo)
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (Mac only)
- Android: Android Studio + SDK

#### All Platforms
- TypeScript compiler (included)
- Git (for versioning)

## Platform-Specific Configuration

### Desktop (electron.config.js)
- Executable: `GatherTheCrown-Desktop`
- Auto-updates: Enabled
- File associations: `.crown` game save files
- Tray icon: Game shortcuts

### Mobile (app.json)
- Package: `com.DeaVinciCo.gatherthecrown`
- Version: Synced across platforms
- Permissions: Network access for multiplayer
- Splash screen: Custom branded

### Web (vite.config.ts)
- Base URL: `https://game.example.com`
- API endpoint: `wss://api.example.com`
- PWA support: Offline-first features

## Deployment Checklist

- [ ] Update version in `package.json` (syncs to all platforms)
- [ ] Run `npm run build:all`
- [ ] Test each platform locally
- [ ] Sign desktop builds (Windows certificate, Mac signing key)
- [ ] Upload to app stores:
  - Google Play Console (Android)
  - App Store Connect (iOS)
  - Windows Store (optional)
  - GitHub Releases (free desktop distribution)
- [ ] Update landing page with download links

## Server Deployment

Backend runs on Node.js (any cloud provider):
```bash
npm run build
npm run start
```

Recommended hosting:
- **AWS/Azure/Google Cloud**: Docker containerized
- **Heroku**: Free tier available
- **DigitalOcean**: Simple VPS
- **Local**: For testing

## File Structure (Post-Build)

```
dist/
├── web/                    # Browser version
├── desktop/                # Electron app
│   ├── win/               # Windows build
│   ├── mac/               # Mac build
│   └── linux/             # Linux build
└── mobile/                # React Native app
    ├── ios/               # iOS Xcode project
    └── android/           # Android Studio project
```

## Common Tasks

### Release a new version
```bash
npm version patch                    # Bumps version
git push origin main                 # Push to GitHub
npm run build:all                    # Build all platforms
npm run deploy:all                   # Prepare for release
```

### Local testing
```bash
# Web
npm run dev --workspace=client

# Desktop (in development)
npm run dev:desktop

# Mobile
npm run dev:mobile
```

### Update app across platforms
All platforms pull from same backend, so server updates affect all devices simultaneously.

## Troubleshooting

**Expo build fails**: Check `app.json` configuration
**Electron won't package**: Verify signing certificates
**Mobile login issues**: Ensure API endpoint is HTTPS
**Cross-device sync**: Verify Colyseus server is running
