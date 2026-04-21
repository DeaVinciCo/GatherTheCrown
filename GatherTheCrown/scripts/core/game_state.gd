extends Node
## Global game state holder
## Persists across scene changes

var current_zone: String = "GreenwoodClearing"
var player_position: Vector2 = Vector2(640, 300)  # Used by map system

var hero_profile: Dictionary = {
	"name": "",
	"element": "",  # Chosen during hero creation (not predetermined)
	"race": "Human",
	"look": "Trailblazer",
	"clothes": "Ranger Wrap",
	"starter_weapon": "Bronze Saber"
}

# Active hero remains hero_profile for compatibility.
# hero_roster stores all forged heroes (up to MAX_CHARACTERS).
var hero_roster: Array = []
var active_hero_index: int = -1

var player_stats: Dictionary = {
	"hp": 100,
	"max_hp": 100,
	"energy": 50,
	"max_energy": 50
}

var has_creat: bool = false  # Critical: creat only exists after egg hatches
var creat_egg_type: String = ""  # "fire_creat", etc.
var protected_first_creat_id: String = ""  # First-ever creat is locked except full account reset.

var companion_stats: Dictionary = {
	"hp": 60,
	"max_hp": 60,
	"hunger": 50,
	"bond": 0.5  # 0.0 to 1.0
}

var selected_crown: String = ""  # crown_id
var equipped_items: Dictionary = {}  # item_id -> quantity
var completed_crowns: Dictionary = {}  # crown_id -> true

var gold_coins: int = 0
var bixbite: int = 0
var earned_gc_lifetime: int = 0

var story_completed_once: bool = false
var story_completion_count: int = 0

const MAX_CHARACTERS: int = 3
const MAX_CREATS_PER_CHARACTER: int = 3
const ACCOUNT_RESET_COST_GC: int = 50000000

var unlocked_character_slots: int = 1
var boss_defeat_counts: Dictionary = {}  # boss_id -> defeats

var discovered_zones: Dictionary = {
	"greenwood_clearing": true  # Start with home zone discovered
}
var mastered_zones: Dictionary = {}  # Zones where player defeated boss/completed

var flags: Dictionary = {
	"completed_tutorial": false,
	"defeated_first_boss": false,
	"visited_restoration_site": false
}

var boss_cooldowns: Dictionary = {}  # boss_id -> timestamp when available again

func _ready() -> void:
	print("GameState initialized")

func reset() -> void:
	current_zone = "GreenwoodClearing"
	hero_profile = {
		"name": "",
		"element": "",  # Chosen during hero creation
		"race": "Human",
		"look": "Trailblazer",
		"clothes": "Ranger Wrap",
		"starter_weapon": "Bronze Saber"
	}
	hero_roster.clear()
	active_hero_index = -1
	has_creat = false
	creat_egg_type = ""
	player_stats = {
		"hp": 100,
		"max_hp": 100,
		"energy": 50,
		"max_energy": 50
	}
	companion_stats = {
		"hp": 60,
		"max_hp": 60,
		"hunger": 50,
		"bond": 0.5
	}
	selected_crown = ""
	equipped_items.clear()
	flags.clear()
	boss_cooldowns.clear()
	boss_defeat_counts.clear()
	completed_crowns.clear()
	protected_first_creat_id = ""
	gold_coins = 0
	bixbite = 0
	earned_gc_lifetime = 0
	story_completed_once = false
	story_completion_count = 0
	unlocked_character_slots = 1

func add_gold(amount: int) -> void:
	if amount <= 0:
		return
	gold_coins += amount
	earned_gc_lifetime += amount
	EventBus.gold_changed.emit(gold_coins, amount)

func spend_gold(amount: int) -> bool:
	if amount <= 0:
		return true
	if gold_coins < amount:
		return false
	gold_coins -= amount
	EventBus.gold_changed.emit(gold_coins, -amount)
	return true

func add_bixbite(amount: int) -> void:
	if amount <= 0:
		return
	bixbite += amount
	EventBus.bixbite_changed.emit(bixbite, amount)

func spend_bixbite(amount: int) -> bool:
	if amount <= 0:
		return true
	if bixbite < amount:
		return false
	bixbite -= amount
	EventBus.bixbite_changed.emit(bixbite, -amount)
	return true

func complete_story_mode() -> void:
	story_completed_once = true
	story_completion_count += 1
	unlocked_character_slots = MAX_CHARACTERS

func can_create_character(current_character_count: int = -1) -> bool:
	if current_character_count < 0:
		current_character_count = get_character_count()
	if current_character_count >= MAX_CHARACTERS:
		return false
	if current_character_count <= 0:
		return true
	if not story_completed_once:
		return false
	return current_character_count < unlocked_character_slots

func get_character_count() -> int:
	if hero_roster.size() > 0:
		return hero_roster.size()
	return 1 if has_hero_profile() else 0

func can_add_creat_to_current_hero(current_creat_count: int) -> bool:
	# Rule: first creat is available during normal progression;
	# extra creat slots open only after completing story mode.
	if current_creat_count < 1:
		return true
	if not story_completed_once:
		return false
	return current_creat_count < MAX_CREATS_PER_CHARACTER

func can_pay_account_reset() -> bool:
	if not story_completed_once:
		return false
	return gold_coins >= ACCOUNT_RESET_COST_GC

func can_delete_creat(creat_id: String, is_account_delete: bool = false) -> bool:
	if creat_id == "":
		return false
	if creat_id == protected_first_creat_id:
		return is_account_delete
	return true

func record_first_creat_if_needed(creat_id: String) -> void:
	if protected_first_creat_id == "" and creat_id != "":
		protected_first_creat_id = creat_id

func get_boss_level(boss_id: String) -> int:
	var defeats := int(boss_defeat_counts.get(boss_id, 0))
	return clampi(defeats + 1, 1, 3)

func record_boss_defeat(boss_id: String) -> int:
	var defeats := int(boss_defeat_counts.get(boss_id, 0)) + 1
	boss_defeat_counts[boss_id] = defeats
	return clampi(defeats, 1, 3)

func get_target_boss_duration_minutes(boss_level: int) -> int:
	# Trimmed pacing from design discussion: 5 / 10 / 15 minutes.
	match clampi(boss_level, 1, 3):
		1:
			return 5
		2:
			return 10
		_:
			return 15

func can_fight_boss(boss_id: String) -> bool:
	if boss_id not in boss_cooldowns:
		return true
	return Time.get_ticks_msec() >= boss_cooldowns[boss_id]

func set_boss_defeated(boss_id: String, cooldown_ms: int = 86400000) -> void:
	boss_cooldowns[boss_id] = Time.get_ticks_msec() + cooldown_ms

func has_hero_profile() -> bool:
	return String(hero_profile.get("name", "")).strip_edges() != ""

func set_hero_profile(profile: Dictionary) -> void:
	hero_profile = profile.duplicate(true)
	_sync_active_hero_into_roster()

func _sync_active_hero_into_roster() -> void:
	if not has_hero_profile():
		return

	if active_hero_index >= 0 and active_hero_index < hero_roster.size():
		hero_roster[active_hero_index] = hero_profile.duplicate(true)
		return

	if hero_roster.size() < MAX_CHARACTERS:
		hero_roster.append(hero_profile.duplicate(true))
		active_hero_index = hero_roster.size() - 1
		return

	# Safety fallback: keep active profile synced to first slot if roster is unexpectedly full.
	hero_roster[0] = hero_profile.duplicate(true)
	active_hero_index = 0
