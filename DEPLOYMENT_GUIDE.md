# Deployment Guide - Gather The Crown

## Publishing to Each Platform

### 1. Web (Browser)
**Simplest deployment option - no installation needed**

#### Option A: Netlify (Recommended - Free)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd packages/client
npm run build
netlify deploy --prod --dir=dist
```

#### Option B: Vercel
```bash
npm install -g vercel
cd packages/client
vercel --prod
```

#### Option C: GitHub Pages
```bash
# Update vite.config.ts with:
# export default {
#   base: '/game/',
#   ...
# }

cd packages/client
npm run build
# Push to GitHub, enable Pages in Settings
```

**Result:** Playable at `https://your-domain.com`

---

### 2. Desktop (Windows/Mac/Linux)

#### Prerequisites
- **Windows**: Code signing certificate (optional but recommended)
- **Mac**: Apple Developer account + signing certificate ($99/year)
- **Linux**: No special requirements

#### Build
```bash
npm run build:desktop
```

**Generated files in `dist/`:**
- `Gather The Crown Setup 1.0.0.exe` (Windows Installer)
- `Gather The Crown 1.0.0.dmg` (Mac Installer)
- `Gather The Crown-1.0.0.AppImage` (Linux)

#### Distribution Options

**Option A: GitHub Releases (Free)**
```bash
# Create a GitHub release
# Upload .exe, .dmg, .AppImage files
# Users download directly from GitHub
```

**Option B: Windows Store**
```bash
# 1. Join Microsoft Partner Center ($19 one-time)
# 2. Create app listing
# 3. Upload .appx files (use electron-builder --win --target=appx)
# 4. Submit for review (2-24 hours)
```

**Option C: Mac App Store**
```bash
# 1. Join Apple Developer Program ($99/year)
# 2. Create app listing in App Store Connect
# 3. Generate signing certificates
# 4. Build: electron-builder --mac --target=mas
# 5. Submit .pkg file
```

**Option D: Installer Hosting (Any Web Host)**
```bash
# Upload to your website:
# Download from: https://your-domain.com/downloads/Gather-The-Crown-Setup.exe
```

#### Code Signing (Production)

**Windows (self-signed for testing):**
```bash
# electron-builder handles test signing automatically
# For production, import valid certificate in package.json
```

**Mac (Required for distribution):**
```bash
# 1. Export certificate from Keychain
# 2. Set environment variables:
export CSC_LINK="/path/to/certificate.p12"
export CSC_KEY_PASSWORD="your_password"
npm run build:desktop
```

---

### 3. Mobile (iOS)

#### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode installed
- Signing certificates from Apple

#### Build & Test Locally
```bash
# Set up certificate
export APP_STORE_CONNECT_ISSUER_ID="your_issuer_id"
export APP_STORE_CONNECT_KEY_ID="your_key_id"
export APP_STORE_CONNECT_PRIVATE_KEY="your_private_key"

# Build for App Store
expo build:ios --release-channel production

# This outputs:
# - .ipa file (for TestFlight or App Store)
# - .app file (for Xcode simulator)
```

#### Upload to App Store Connect
```bash
# Option 1: Automatic (Expo)
expo upload:ios --release-channel production

# Option 2: Manual via Xcode
# Open Gather-The-Crown.xcworkspace
# Archive app (Product > Archive)
# Distribute App in Organizer window
```

#### TestFlight (Beta Testing)
```bash
# 1. Upload .ipa to App Store Connect
# 2. Select internal/external testing
# 3. Invite testers via email
# 4. Share TestFlight link
```

#### App Store Review Requirements
- ✅ Privacy policy
- ✅ Age rating (PEGI/ESRB)
- ✅ Screenshots (5+)
- ✅ Description & keywords
- ✅ Support contact info
- ✅ IDFA tracking (if applicable)

**Review time:** 24-48 hours typically

---

### 4. Mobile (Android)

#### Prerequisites
- Google Play Developer Account ($25 one-time)
- Signing keystore file

#### Generate Signing Key
```bash
# First time only
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-app

# Set environment variables:
export EXPO_ANDROID_KEYSTORE_PATH="./my-release-key.jks"
export EXPO_ANDROID_KEYSTORE_ALIAS="my-app"
export EXPO_ANDROID_KEYSTORE_PASSWORD="your_password"
export EXPO_ANDROID_KEY_PASSWORD="your_password"
```

#### Build APK/AAB
```bash
# AAB (recommended for Play Store)
expo build:android --release-channel production

# Output: Gather-The-Crown-1.0.0.aab
```

#### Upload to Google Play
```bash
# Option 1: Automatic
expo upload:android --release-channel production

# Option 2: Manual
# 1. Go to Google Play Console > Your App
# 2. Select "Release" > "Create new release"
# 3. Upload .aab file
# 4. Add release notes
# 5. Set rollout percentage (5% -> 100%)
```

#### Internal Testing Track
```bash
# Good for initial testing before public release
# Upload to Internal Testing track first
# Invite testers from your team
# Get feedback before public release
```

#### Public Beta (Open Testing)
```bash
# After internal testing works:
# Create release in Open Testing track
# Generate shareable link for testers
# Collect feedback
```

#### Play Store Review Requirements
- ✅ Content rating questionnaire
- ✅ Privacy policy URL
- ✅ Screenshots (5+)
- ✅ Description
- ✅ Category classification
- ✅ Contact email

**Review time:** 1-3 hours typically (usually auto-approved)

---

## Version Management

Keep versions in sync across all platforms:

```json
// package.json
{
  "version": "1.0.0"
}

// electron build config: auto-reads from package.json
// app.json: update manually
// Android: updates versionCode in app.json
```

**Release Process:**
```bash
# 1. Update version
npm version patch  # or minor/major

# 2. Commit & tag
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin main --tags

# 3. Build all
npm run build:all

# 4. Publish to each platform
# - Upload web to Netlify
# - Upload desktop to GitHub Releases
# - Upload iOS to App Store
# - Upload Android to Play Store
```

---

## Monitoring & Updates

### Server Status
```bash
# Check server health
curl https://api.your-domain.com/health

# Server logs
pm2 logs
```

### User Feedback
- In-game crash reporting
- Analytics integration (e.g., Sentry)
- Discord community updates

### Automatic Updates
- **Desktop**: Electron auto-updater (configured in electron.config.js)
- **Mobile**: App Store automatic updates
- **Web**: Service Worker for offline support

---

## Rollback Procedure

If a release has critical bugs:

```bash
# 1. Identify last working version
git log --oneline | head -20

# 2. Rebuild and redeploy
git checkout v1.0.0
npm run build:all

# 3. Push to app stores with note:
# "Hotfix: Critical bug resolution - version reverted to 1.0.0"
```

---

## Cost Summary

| Platform | Cost | Frequency |
|----------|------|-----------|
| Web | $0-10/mo | Monthly |
| Desktop (GitHub) | $0 | One-time setup |
| Desktop (Store) | $19-99 | One-time |
| iOS | $99/year | Annual |
| Android | $25 | One-time |
| Server | $5-50/mo | Monthly |
| **Total** | **$150-500/year** | - |

---

## Troubleshooting

### Build fails on desktop
```bash
# Clear cache
rm -rf dist/ node_modules/
npm install
npm run build:desktop
```

### iOS build timeout
```bash
# Increase timeout in package.json build config
# Or use Xcode locally:
cd ios && xcodebuild archive
```

### Android signing error
```bash
# Verify keystore file exists and password is correct
keytool -list -v -keystore my-release-key.jks
```

### Web deploy incomplete
```bash
# Check bundle size
npm run build
du -sh packages/client/dist/

# Optimize if >5MB
# - Remove unused dependencies
# - Enable gzip compression on host
```
