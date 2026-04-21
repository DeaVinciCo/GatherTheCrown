extends Node
## Central combat engine
## Applies combat profiles to all combat interactions

class_name CombatEngine

static var FAST_FORGIVING_PROFILE = {
	"aim_assist": 0.8,
	"input_buffer_ms": 100,
	"lenient_i_frames": 0.3,
	"enemy_hit_stun_ms": 50,
	"parry_window_ms": 200,
	"damage_forgiveness_curve": 0.8
}

static var PRECISE_BOSS_PROFILE = {
	"aim_assist": 0.3,
	"input_buffer_ms": 50,
	"lenient_i_frames": 0.15,
	"enemy_hit_stun_ms": 75,
	"parry_window_ms": 100,
	"damage_forgiveness_curve": 1.0
}

func apply_profile(target: Node, profile_name: String) -> void:
	var profile = FAST_FORGIVING_PROFILE if profile_name == "fast" else PRECISE_BOSS_PROFILE
	target.combat_profile = profile

func calculate_damage(base_damage: float, attacker_level: int, defender_level: int) -> float:
	var level_factor = float(attacker_level) / float(max(1, defender_level))
	return base_damage * level_factor

func apply_sync_bonus(base_value: float) -> float:
	if SyncSystem.is_synced:
		return base_value * SyncSystem.sync_bonuses["damage_multiplier"]
	return base_value
