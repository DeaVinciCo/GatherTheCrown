extends RefCounted

const POTION_GAUGE_CAP := 20.0
const FOOD_GAUGE_CAP := 100.0

func build_state(player: Node, companion: Node) -> Dictionary:
	var hero_hp_current: float = float(GameState.player_stats.get("hp", 100.0))
	var hero_hp_max: float = float(GameState.player_stats.get("max_hp", 100.0))
	if player and player.has_node("Health"):
		var hero_health: Node = player.get_node("Health")
		hero_hp_current = float(hero_health.current_hp)
		hero_hp_max = float(hero_health.max_hp)

	var mana_current: float = float(SyncSystem.sync_meter)
	var mana_max: float = float(SyncSystem.max_sync_meter)
	if mana_max <= 0.0:
		mana_max = 100.0

	var potion_health: int = InventorySystem.get_item_count("potion_health")
	var potion_mana: int = InventorySystem.get_item_count("potion_mana")
	if potion_health == 0 and AdvancedInventorySystem:
		potion_health = AdvancedInventorySystem.get_item_count("potion_health")
	if potion_mana == 0 and AdvancedInventorySystem:
		potion_mana = AdvancedInventorySystem.get_item_count("potion_mana")
	var potion_total: float = float(potion_health + potion_mana)
	var potion_used: float = clampf(POTION_GAUGE_CAP - potion_total, 0.0, POTION_GAUGE_CAP)

	var creat_state: int = CompanionLifecycle.current_state
	var creat_active: bool = creat_state == CompanionLifecycle.LifecycleState.CREAT_ACTIVE

	var creat_hp_current: float = 0.0
	var creat_hp_max: float = 100.0
	if creat_active and companion and companion.has_node("Health"):
		var creat_health: Node = companion.get_node("Health")
		creat_hp_current = float(creat_health.current_hp)
		creat_hp_max = float(creat_health.max_hp)
	elif creat_active:
		creat_hp_current = 75.0

	var creat_xp_current: float = 0.0
	var creat_xp_max: float = 100.0
	var creat_food_current: float = 0.0
	var creat_food_max: float = FOOD_GAUGE_CAP
	if creat_active:
		creat_xp_current = BondSystem.get_bond(CompanionLifecycle.egg_type) * 100.0
		creat_food_current = clampf(FOOD_GAUGE_CAP - BondSystem.get_hunger(CompanionLifecycle.egg_type), 0.0, FOOD_GAUGE_CAP)

	var attack_slots_unlocked: int = int(GameState.player_stats.get("attack_slots_unlocked", 1))
	attack_slots_unlocked = clampi(attack_slots_unlocked, 1, 6)
	var attack_cooldown_pct: float = clampf(float(GameState.player_stats.get("attack_cooldown_pct", 0.35)), 0.0, 1.0)
	var attack_count_total: int = int(GameState.player_stats.get("attack_count_total", 1))
	var hero_xp_current: float = float(GameState.player_stats.get("xp", 0.0))
	var hero_xp_max: float = maxf(float(GameState.player_stats.get("max_xp", 100.0)), 1.0)

	var mana_boosted: bool = mana_current >= mana_max * 0.8
	var potion_boosted: bool = potion_total >= POTION_GAUGE_CAP * 0.65
	var spell_cooldown_pct: float = clampf(float(GameState.player_stats.get("spell_cooldown_pct", 0.25)), 0.0, 1.0)

	return {
		"hero_health": {
			"current": hero_hp_current,
			"max": hero_hp_max
		},
		"mana_potions": {
			"mana_current": mana_current,
			"mana_max": mana_max,
			"potions_current": potion_total,
			"potions_max": POTION_GAUGE_CAP,
			"potions_used": potion_used,
			"spell_cooldown_pct": spell_cooldown_pct,
			"mana_boosted": mana_boosted,
			"potions_boosted": potion_boosted
		},
		"creat_status": {
			"active": creat_active,
			"health_current": creat_hp_current,
			"health_max": creat_hp_max,
			"xp_current": creat_xp_current,
			"xp_max": creat_xp_max,
			"food_current": creat_food_current,
			"food_max": creat_food_max
		},
		"attacks": {
			"unlocked_slots": attack_slots_unlocked,
			"cooldown_pct": attack_cooldown_pct,
			"attack_count": attack_count_total,
			"hero_xp_current": hero_xp_current,
			"hero_xp_max": hero_xp_max
		}
	}
