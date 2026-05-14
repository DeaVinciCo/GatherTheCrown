# Game Development Tools

This directory contains development tools for **Gather The Crown: Creats & Foes**.

## Tools Overview

### 1. Asset Validator (`asset_validator.py`)
Validates game assets against design specifications.

**Features:**
- Checks directory structure
- Validates sprite dimensions (64x64, 128x128, etc.)
- Verifies audio formats (OGG, WAV)
- Checks naming conventions (lowercase, underscores)

**Usage:**
```bash
python tools/asset_validator.py
```

**Requirements:**
- Python 3.7+
- PIL/Pillow (optional, for image dimension checks)

### 2. Crown Calculator (`crown_calculator.py`)
Calculates crown statistics, requirements, and completion rewards.

**Features:**
- Calculate stats for any metal + gem combination
- List all crown types by game mode
- Calculate completion rewards
- Display formatted crown cards

**Usage:**
```bash
python tools/crown_calculator.py
```

**Example Output:**
```
╔══════════════════════════════════════════════════════════╗
║              Story Mode - Sovereign's Diadem             ║
╠══════════════════════════════════════════════════════════╣
║  Metal: Starforged                                       ║
║  Gems: Painite, Alexandrite, Jeremejevite               ║
╠══════════════════════════════════════════════════════════╣
║  STATS                                                   ║
║  • Attack Bonus:    +175                                 ║
║  • Defense Bonus:   +152                                 ║
║  • Speed Bonus:     +90                                  ║
║  • Crit Bonus:      +55.0%                               ║
║  • Durability:      70 battles                           ║
╠══════════════════════════════════════════════════════════╣
║  Total Value: 40,000 GC                                  ║
╚══════════════════════════════════════════════════════════╝
```

### 3. Content Tracker (`content_tracker.py`)
Tracks implementation progress of all game content.

**Features:**
- Track progress by category (characters, creats, bosses, etc.)
- Generate progress reports with ASCII progress bars
- Save/load progress data (JSON)
- MVP recommendations

### 4. Supabase Full Backup (`supabase_full_backup.mjs`)
Uploads the full Gather The Crown workspace snapshot to a Supabase Storage bucket.

Key behavior:
- Uploads all files recursively from project root.
- Writes and uploads a backup manifest JSON.
- Uppercases remote object paths and folder names by default for readability.
- Replaces spaces and special characters in remote paths with underscores.
- Uses upsert mode so reruns refresh changed files.

Environment variables required for upload:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended process:

```bash
# 1) Preview file count, size, and ETA (no upload)
pnpm backup:supabase:dry

# 2) Upload backup snapshot
pnpm backup:supabase
```

Optional flags:

```bash
# Include everything (including node_modules/dist)
node tools/supabase_full_backup.mjs --include-everything true

# Keep original case remotely
node tools/supabase_full_backup.mjs --uppercase false

# Custom bucket and prefix
node tools/supabase_full_backup.mjs --bucket GTC_ARCHIVE --prefix MAY_2026_FULL
```

### 5. Supabase Game Database Bootstrap

Game database setup now includes a direct SQL bootstrap file:

- `supabase/migrations/001_gtc_core.sql`

Use this file in Supabase SQL Editor to create the core game schema (heroes, creats, inventory, bosses, crowns, quests, kingdom progress, achievements, and RLS starter policies).

Then configure:

- `packages/server/.env` with `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`

And run:

```bash
pnpm --filter @game/server db:generate
pnpm --filter @game/server db:push
pnpm --filter @game/server db:seed
```

**Usage:**
```bash
# Generate initial report
python tools/content_tracker.py

# Mark items complete (in code)
tracker = ContentTracker()
tracker.mark_complete("ui_screens", "title_screen")
tracker.update_progress("characters", count=3)
tracker.generate_report()
```

**Example Output:**
```
📊 OVERALL PROGRESS: 0/189 (0.0%)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0.0%

Characters: 0/48 (0.0%)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0.0%

Creats: 0/56 (0.0%)
[░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 0.0%
```

## Installation

```bash
# Install Python dependencies
pip install pillow  # For asset_validator.py image checks
```

## Development Workflow

1. **Start of Project:**
   - Run `content_tracker.py` to see baseline progress
   - Run `asset_validator.py` to check directory structure

2. **During Development:**
   - Update `content_tracker.py` as you implement features
   - Run `asset_validator.py` after adding new assets
   - Use `crown_calculator.py` to verify crown balance

3. **Before Commits:**
   - Run all validators to ensure quality
   - Update progress tracker
   - Check for warnings/errors

## Future Tools (Planned)

- **Dialogue Editor**: Visual editor for NPC dialogue trees
- **Quest Builder**: Tool for creating and validating quests
- **Balance Analyzer**: Analyze game balance (damage, rewards, economy)
- **Sprite Sheet Generator**: Automate sprite sheet creation
- **Audio Batch Converter**: Convert audio files to required formats
- **Localization Manager**: Manage translations and text strings

## Contributing

When adding new tools:
1. Follow the existing code style
2. Add docstrings and type hints
3. Update this README
4. Add usage examples
