-- ── Migration 002: Hero full persistence fields ───────────────────────────────
-- Adds all registry-mapped fields to Hero and makes User.password optional.
-- Run this in the Supabase SQL Editor after 001_gtc_core.sql.

-- User table: make password nullable, add guestIntroCompleted
ALTER TABLE "User"
  ALTER COLUMN password DROP NOT NULL,
  ALTER COLUMN password SET DEFAULT '',
  ADD COLUMN IF NOT EXISTS "guestIntroCompleted" BOOLEAN NOT NULL DEFAULT FALSE;

-- Hero table: extended creat fields
ALTER TABLE "Hero"
  ADD COLUMN IF NOT EXISTS "creatLastCaredAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS "creatSpecies"      TEXT         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "creatTrackerTag"   TEXT         NOT NULL DEFAULT 'King''s Sigil Band',
  ADD COLUMN IF NOT EXISTS "creatLastSeenKingdom" TEXT      NOT NULL DEFAULT 'Haven';

-- Hero table: economy fields
ALTER TABLE "Hero"
  ADD COLUMN IF NOT EXISTS "soulshards"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "greenGems"      INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "redGems"        INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "emberFruit"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "crownFragments" INTEGER NOT NULL DEFAULT 0;

-- Hero table: identity
ALTER TABLE "Hero"
  ADD COLUMN IF NOT EXISTS "heroGender" TEXT NOT NULL DEFAULT '';

-- Hero table: progression / unlocks
ALTER TABLE "Hero"
  ADD COLUMN IF NOT EXISTS "havenPathsUnlocked"   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "havenUnlocked"         BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "forestTrialsStarted"   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseUnlocked"      BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "kingdomArcUnlocked"    BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "unlockedSkills"        TEXT    NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS "completedSkillLessons" TEXT    NOT NULL DEFAULT '[]';

-- Hero table: home base state
ALTER TABLE "Hero"
  ADD COLUMN IF NOT EXISTS "homeBaseName"                 TEXT    NOT NULL DEFAULT 'Sanctuary',
  ADD COLUMN IF NOT EXISTS "homeBaseRegionName"           TEXT    NOT NULL DEFAULT 'Sanctuary Isle',
  ADD COLUMN IF NOT EXISTS "homeBaseNameChosen"           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseRestDays"             INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "homeBaseStoryReady"           BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseDay1Inspected"        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseDay1SuppliesGathered" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseDay2Crafted"          BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "homeBaseDay2EggCared"         BOOLEAN NOT NULL DEFAULT FALSE;
