# Startup Flow Integration - Complete Journey

## Overview
The startup sequence has been fully integrated with the new authentication system and existing narrative infrastructure. The flow seamlessly connects Boot → Preload → MainMenu → Auth → Hero Creation → Story → Haven.

---

## Startup Sequence

### 1. **Boot.ts** (Existing - Unchanged)
- **Purpose**: Sprite generation and texture creation
- **Generates**: 9 textures programmatically (hero, enemy, boss, grass, stone, portal, coin, hpbg, hpfill)
- **Transitions**: → Preload

### 2. **Preload.ts** (Enhanced)
- **Purpose**: Language loading + splash screen intro
- **New Features**:
  - Animated starfield with 100 twinkling stars
  - Title: "GATHER THE CROWN" with glow effect
  - Subtitle: "Rise, Rider. The Crown Awaits."
  - **Loads registry from localStorage** (critical for persistent user state)
  - 2.8 second delay for visual polish
  - Smooth fade-out transition
- **Transitions**: → MainMenu

### 3. **MainMenu.ts** (Enhanced)
- **Purpose**: Account selection and game entry
- **Features**:
  - Decorative crown icon (♔) at top
  - Animated starfield background
  - User state aware:
    - **Returning Players**: Shows welcome message, Continue Adventure / New Hero / Sign Out buttons
    - **New Players**: Shows Sign In / Create Account buttons
  - Achievements button at bottom
  - All buttons styled with hover effects and color coding:
    - Blue (3b82f6) for Sign In / Continue
    - Green (22c55e) for Create Account / New Hero
    - Red (ef4444) for Sign Out
- **Key Logic**: `gameRegistry.loadFromLocalStorage()` on create checks user state
- **Transitions**:
  - Continue Adventure → Haven (if hero forged) or ForgeHero (if not)
  - Sign In → LoginScreen
  - Create Account → CreateAccountScreen
  - New Hero → ForgeHero

### 4. **LoginScreen.ts** (Existing - No Changes)
- **Purpose**: User sign-in form
- **Features**: Username + password validation, POST to `/auth/login`
- **Transitions**: → Haven (if hero exists) or ForgeHero (if new user)

### 5. **CreateAccountScreen.ts** (Existing - No Changes)
- **Purpose**: Account creation form
- **Features**: Account validation, POST to `/auth/signup`
- **Transitions**: → ForgeHero

### 6. **ForgeHero.ts** (Updated)
- **Purpose**: Hero customization (7+ attributes)
- **Expanded Features**:
  - Name, Class, Race, Skin Tone, Hair Style, Hair Color, Element
  - Multi-select weapon system
  - Live preview with tinting
  - Scrollable form overlay
- **New Logic**: **Story intro check**
  ```typescript
  const storyIntroSeen = this.registry.get('storyIntroSeen') || localStorage.getItem('storyIntroSeen');
  if (!storyIntroSeen) {
    this.scene.start('StoryIntro');  // First-time players
  } else {
    this.scene.start('Haven');       // Returning players skip intro
  }
  ```
- **Transitions**: → StoryIntro (first time) or Haven (repeat players)

### 7. **StoryIntro.ts** (Enhanced)
- **Purpose**: Narrative introduction and world-building
- **Features**:
  - Elder Miriam character with portrait (tinted hero sprite)
  - Creat egg glow animation
  - 10-line dialogue tree with branching choices
  - Dark temple background with starfield
  - "Skip →" button for impatient players
- **New Logic**: **Flag persistence**
  - Skip button saves flag to both registry and localStorage
  - Dialog completion (index < 0) also saves flag
  - Ensures flag survives browser refreshes
- **Transitions**: → Haven (after completion or skip)

### 8. **Haven.ts** (Existing - No Changes)
- **Purpose**: Main hub for realm selection and hero management
- **Transitions**: → ForestZone / VolcanoZone / District01 / BattleArena / CrownForge / RaceCircuit

---

## Key Integration Points

### **GameRegistry.ts** - Central State Management
```typescript
// On Preload create:
gameRegistry.loadFromLocalStorage();

// On MainMenu create:
const isLoggedIn = gameRegistry.isLoggedIn();  // Checks currentUserId
const isHeroForged = gameRegistry.isHeroForged();  // Checks currentHeroId

// On ForgeHero success:
gameRegistry.setHero(heroId, heroData);
gameRegistry.saveToLocalStorage();

// On StoryIntro completion:
localStorage.setItem('storyIntroSeen', 'true');
```

### **Story Intro Flag**
- **Set at**: ForgeHero (if first-time) or StoryIntro (skip/completion)
- **Checked at**: ForgeHero scene before transition
- **Persistence**: Both Phaser registry and localStorage
- **Purpose**: Ensures new players see story, returning players can skip

### **User Flow Branching**

**First-Time New Player:**
```
Boot → Preload → MainMenu 
  → [Create Account] → CreateAccountScreen 
  → ForgeHero 
  → StoryIntro (NEW - story intro flag not set) 
  → Haven
```

**Returning Existing Player (Hero already created):**
```
Boot → Preload → MainMenu 
  → [Continue Adventure] 
  → Haven (skips ForgeHero & StoryIntro - story flag already set)
```

**Returning Player Creating New Hero:**
```
Boot → Preload → MainMenu 
  → [New Hero] 
  → ForgeHero 
  → Haven (skips StoryIntro - story flag already set from previous hero)
```

---

## LocalStorage Keys Used

| Key | Purpose | Set By | Read By |
|-----|---------|--------|---------|
| `currentUserId` | Active user ID | LoginScreen / CreateAccountScreen | GameRegistry |
| `currentHeroId` | Active hero ID | ForgeHero | GameRegistry |
| `heroData_*` | Hero customization data | ForgeHero | GameRegistry |
| `gold` | Player currency | ForgeHero / Gameplay | GameRegistry |
| `inventory` | Collected items | ForgeHero / Gameplay | GameRegistry |
| `storyIntroSeen` | **NEW** - Story intro completion flag | StoryIntro (skip/completion) | ForgeHero / MainMenu |
| `lang` | Language preference | Preload | i18n system |

---

## Visual Polish Highlights

### **Preload Splash**
- 100 animated stars with varying twinkle speeds (1200-3000ms)
- Title glow effect with purple stroke (7c3aed)
- Gradual fade-in (800-1200ms)
- 2.8 second delay for cinematic feel
- Smooth fade-out transition

### **MainMenu Styling**
- Gradient background: `0b1020 → 111827 → 1f2937 → 0f172a`
- 80 animated stars in background
- Color-coded buttons (blue/green/red with hover states)
- Crown icon (♔) at top for thematic consistency
- Achievement panel at bottom

### **StoryIntro Aesthetics**
- Dark temple ambiance
- Character portrait with gentle breathing animation (±4px y-offset)
- Creat egg with pulsing glow (alpha: 0.4-0.8)
- Dialogue box with purple border
- Branching choice system with smooth transitions

---

## Testing Checklist

- [ ] **New Player Flow**: Create account → ForgeHero → StoryIntro → Haven
- [ ] **Returning Player**: MainMenu → Continue → Haven (no hero selection)
- [ ] **New Hero on Existing Account**: MainMenu → New Hero → ForgeHero → Haven
- [ ] **Story Skip**: Click "Skip →" button in StoryIntro
- [ ] **Story Completion**: Complete all 10 dialogue lines
- [ ] **Browser Refresh**: After any step, refresh and verify state persistence
- [ ] **Sign Out & Re-login**: Verify clean state after logout

---

## Files Modified

1. **packages/client/src/scenes/Preload.ts** - Enhanced splash screen
2. **packages/client/src/scenes/MainMenu.ts** - User state aware entry
3. **packages/client/src/scenes/ForgeHero.ts** - Story intro check on hero creation
4. **packages/client/src/scenes/StoryIntro.ts** - Flag persistence (localStorage)

---

## Build Status

✅ **Clean Build**: 1,614.37 kB JS / 373.86 kB gzip (37 modules)  
✅ **No Errors**: All TypeScript compiled successfully  
✅ **Ready for Testing**: Start with `npm run dev` (port 4174)
