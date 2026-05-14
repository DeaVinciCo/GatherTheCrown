-- Gather The Crown: Creats & Foes
-- Supabase bootstrap schema (direct SQL import)
-- Run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

create table if not exists public."User" (
  id text primary key default gen_random_uuid()::text,
  username text not null unique,
  password text not null,
  email text unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."Hero" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  level integer not null default 1,
  class text not null default 'Knight',
  element text not null,
  race text not null default 'Human',
  "skinTone" text not null default 'tan',
  "hairStyle" text not null default 'short',
  "hairColor" text not null default 'brown',
  "selectedWeapons" text not null default '[]',
  "originTrait" text not null default 'Realm-born',
  "combatDoctrine" text not null default 'Balanced',
  "heroTattoo" text not null default '',
  "currentScene" text not null default 'ForestZone',
  gold integer not null default 25,
  bond double precision not null default 0,
  "creatElement" text not null default '',
  "creatName" text not null default '',
  "creatCompatibility" text not null default 'match',
  "creatBond" double precision not null default 0,
  "creatHunger" double precision not null default 100,
  "creatOffensePoints" double precision not null default 0,
  "creatRunaway" boolean not null default false,
  "creatCorrupted" boolean not null default false,
  "creatStage" text not null default 'none',
  "hasCreatEgg" boolean not null default false,
  "hasHatchedCreat" boolean not null default false,
  "creatLastFedAt" timestamptz not null default now(),
  "creatInventory" text not null default '[]',
  "storyModeCompleted" boolean not null default false,
  "userId" text not null references public."User"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  "lastPlayedAt" timestamptz not null default now()
);

create index if not exists idx_hero_user on public."Hero" ("userId");

create table if not exists public."Creat" (
  id text primary key default gen_random_uuid()::text,
  species text not null,
  element text not null,
  stage text not null,
  level integer not null default 1,
  hp integer not null default 100,
  "maxHp" integer not null default 100,
  attack integer not null default 10,
  defense integer not null default 5,
  speed integer not null default 8,
  stamina integer not null default 50,
  "elementPower" integer not null default 10,
  "bondLevel" integer not null default 0,
  hunger integer not null default 100,
  "offensePoints" integer not null default 0,
  "isCorrupted" boolean not null default false,
  "isRunaway" boolean not null default false,
  "evolvedAt" timestamptz,
  "heroId" text not null unique references public."Hero"(id) on delete cascade,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."InventoryItem" (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text not null,
  rarity text default 'common',
  quantity integer not null default 1,
  stackable boolean not null default true,
  source text,
  metadata text default '{}',
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_inventory_hero on public."InventoryItem" ("heroId");
create index if not exists idx_inventory_type on public."InventoryItem" (type);

create table if not exists public."CrownFragment" (
  id text primary key default gen_random_uuid()::text,
  metal text not null,
  gem text,
  shards integer not null,
  mode text default 'story',
  "sourceBoss" text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_fragment_hero on public."CrownFragment" ("heroId");

create table if not exists public."Progress" (
  id text primary key default gen_random_uuid()::text,
  district01 boolean not null default false,
  "currentAct" integer not null default 1,
  alignment integer not null default 0,
  "totalRestorationProgress" double precision not null default 0,
  "storyMilestones" text not null default '[]',
  "heroId" text not null unique references public."Hero"(id) on delete cascade,
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."MatchHistory" (
  id text primary key default gen_random_uuid()::text,
  mode text not null default 'battle',
  result text not null,
  score integer not null default 0,
  "durationSec" integer not null default 0,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_match_hero on public."MatchHistory" ("heroId");
create index if not exists idx_match_mode on public."MatchHistory" (mode);

create table if not exists public."Boss" (
  id text primary key,
  name text not null,
  element text not null,
  hp integer not null,
  stamina integer not null,
  mana integer not null,
  phases integer not null,
  "rageThreshold" double precision not null,
  tier integer not null default 1,
  "accessType" text not null default 'door',
  "bossType" text not null default 'structure_guardian',
  "sizeClass" text not null default 'medium',
  "strengthClass" text not null default 'elite',
  "battleStyle" text not null default 'elite_duel',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public."QuestDefinition" (
  id text primary key,
  name text not null,
  description text not null,
  type text not null,
  "levelRequired" integer not null default 1,
  giver text,
  location text,
  "rewardsJson" text not null default '{}',
  "createdAt" timestamptz not null default now()
);

create table if not exists public."HeroQuest" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "questId" text not null references public."QuestDefinition"(id) on delete cascade,
  status text not null default 'AVAILABLE',
  "progressJson" text not null default '[]',
  "startedAt" timestamptz,
  "completedAt" timestamptz,
  unique ("heroId", "questId")
);

create index if not exists idx_heroquest_hero on public."HeroQuest" ("heroId");

create table if not exists public."Kingdom" (
  id text primary key,
  name text not null,
  element text not null,
  lore text not null,
  "vaultLocation" text not null,
  status text not null default 'FALLEN',
  "createdAt" timestamptz not null default now()
);

create table if not exists public."HeroKingdomProgress" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "kingdomId" text not null references public."Kingdom"(id) on delete cascade,
  status text not null default 'FALLEN',
  "restorationProgress" double precision not null default 0,
  "vaultCleared" boolean not null default false,
  "updatedAt" timestamptz not null default now(),
  unique ("heroId", "kingdomId")
);

create index if not exists idx_herokingdom_hero on public."HeroKingdomProgress" ("heroId");

create table if not exists public."CrownRecipe" (
  id text primary key,
  mode text not null,
  metal text not null,
  gem text not null,
  "requiredShards" integer not null,
  "createdAt" timestamptz not null default now()
);

create table if not exists public."HeroCrown" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "recipeId" text not null references public."CrownRecipe"(id) on delete cascade,
  name text not null,
  state text not null default 'ACTIVE',
  durability integer not null default 100,
  "maxDurability" integer not null default 100,
  "battlesRemaining" integer not null default 5,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_herocrown_hero on public."HeroCrown" ("heroId");

create table if not exists public."AchievementDefinition" (
  id text primary key,
  title text not null,
  description text not null,
  category text not null,
  "targetValue" integer not null default 1,
  "rewardJson" text not null default '{}',
  "createdAt" timestamptz not null default now()
);

create table if not exists public."HeroAchievement" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "achievementId" text not null references public."AchievementDefinition"(id) on delete cascade,
  status text not null default 'LOCKED',
  "progressValue" integer not null default 0,
  "unlockedAt" timestamptz,
  unique ("heroId", "achievementId")
);

create index if not exists idx_heroachievement_hero on public."HeroAchievement" ("heroId");

create table if not exists public."HeroStoryChoice" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "choiceKey" text not null,
  "alignmentDelta" integer not null default 0,
  "createdAt" timestamptz not null default now()
);

create index if not exists idx_herostory_hero on public."HeroStoryChoice" ("heroId");

create table if not exists public."HeroBossProgress" (
  id text primary key default gen_random_uuid()::text,
  "heroId" text not null references public."Hero"(id) on delete cascade,
  "bossId" text not null references public."Boss"(id) on delete cascade,
  defeats integer not null default 0,
  "bestTier" integer not null default 0,
  "bestTimeSec" integer,
  "updatedAt" timestamptz not null default now(),
  unique ("heroId", "bossId")
);

create index if not exists idx_heroboss_hero on public."HeroBossProgress" ("heroId");

create trigger trg_user_updated_at
before update on public."User"
for each row execute function public.set_updated_at();

create trigger trg_creat_updated_at
before update on public."Creat"
for each row execute function public.set_updated_at();

create trigger trg_progress_updated_at
before update on public."Progress"
for each row execute function public.set_updated_at();

create trigger trg_boss_updated_at
before update on public."Boss"
for each row execute function public.set_updated_at();

create trigger trg_hero_kingdom_updated_at
before update on public."HeroKingdomProgress"
for each row execute function public.set_updated_at();

create trigger trg_hero_boss_updated_at
before update on public."HeroBossProgress"
for each row execute function public.set_updated_at();

alter table public."User" enable row level security;
alter table public."Hero" enable row level security;
alter table public."Creat" enable row level security;
alter table public."InventoryItem" enable row level security;
alter table public."CrownFragment" enable row level security;
alter table public."Progress" enable row level security;
alter table public."MatchHistory" enable row level security;
alter table public."HeroQuest" enable row level security;
alter table public."HeroKingdomProgress" enable row level security;
alter table public."HeroCrown" enable row level security;
alter table public."HeroAchievement" enable row level security;
alter table public."HeroStoryChoice" enable row level security;
alter table public."HeroBossProgress" enable row level security;

-- Public content is readable by all signed-in users.
alter table public."Boss" enable row level security;
alter table public."QuestDefinition" enable row level security;
alter table public."Kingdom" enable row level security;
alter table public."CrownRecipe" enable row level security;
alter table public."AchievementDefinition" enable row level security;

drop policy if exists "content_read_boss" on public."Boss";
create policy "content_read_boss"
on public."Boss"
for select
to authenticated
using (true);

drop policy if exists "content_read_quest" on public."QuestDefinition";
create policy "content_read_quest"
on public."QuestDefinition"
for select
to authenticated
using (true);

drop policy if exists "content_read_kingdom" on public."Kingdom";
create policy "content_read_kingdom"
on public."Kingdom"
for select
to authenticated
using (true);

drop policy if exists "content_read_crown_recipe" on public."CrownRecipe";
create policy "content_read_crown_recipe"
on public."CrownRecipe"
for select
to authenticated
using (true);

drop policy if exists "content_read_achievement" on public."AchievementDefinition";
create policy "content_read_achievement"
on public."AchievementDefinition"
for select
to authenticated
using (true);

-- User self-access policy.
-- IMPORTANT: this assumes public."User".id is the same UUID as auth.uid().
drop policy if exists "user_self_select" on public."User";
create policy "user_self_select"
on public."User"
for select
to authenticated
using (id = auth.uid()::text);

drop policy if exists "user_self_modify" on public."User";
create policy "user_self_modify"
on public."User"
for update
to authenticated
using (id = auth.uid()::text)
with check (id = auth.uid()::text);

-- Hero-owned data policies. Works when user ids in app align with auth.uid()::text.
drop policy if exists "hero_owner_select" on public."Hero";
create policy "hero_owner_select"
on public."Hero"
for select
to authenticated
using ("userId" = auth.uid()::text);

drop policy if exists "hero_owner_modify" on public."Hero";
create policy "hero_owner_modify"
on public."Hero"
for all
to authenticated
using ("userId" = auth.uid()::text)
with check ("userId" = auth.uid()::text);

-- For linked tables, enforce ownership through Hero table relationship.
create or replace function public.hero_owned(hero_id text)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public."Hero" h
    where h.id = hero_id
      and h."userId" = auth.uid()::text
  );
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'Creat' and policyname = 'creat_owner_all'
  ) then
    create policy "creat_owner_all" on public."Creat"
    for all to authenticated
    using (public.hero_owned("heroId"))
    with check (public.hero_owned("heroId"));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'InventoryItem' and policyname = 'inventory_owner_all'
  ) then
    create policy "inventory_owner_all" on public."InventoryItem"
    for all to authenticated
    using (public.hero_owned("heroId"))
    with check (public.hero_owned("heroId"));
  end if;
end $$;

-- Repeatable pattern for the rest of hero-linked tables.
do $$
declare
  t text;
begin
  foreach t in array array['CrownFragment','Progress','MatchHistory','HeroQuest','HeroKingdomProgress','HeroCrown','HeroAchievement','HeroStoryChoice','HeroBossProgress']
  loop
    execute format('drop policy if exists %I on public.%I', lower(t) || '_owner_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.hero_owned("heroId")) with check (public.hero_owned("heroId"))',
      lower(t) || '_owner_all',
      t
    );
  end loop;
end $$;
