extends Node
## Central event bus for game signals
## Decouples systems and enables reactive architecture

# Combat events
signal damage_dealt(damager: Node, target: Node, amount: float, hit_data: Dictionary)
signal entity_died(entity: Node)
signal hit_connected(attacker: Node, defender: Node)

# Bond system events
signal bond_changed(creat: Node, new_bond: float, delta: float)
signal creat_fed(creat: Node, food_item: String, bond_delta: float)

# Sync system events
signal sync_meter_changed(new_value: float, max_value: float)
signal sync_activated(player: Node, creat: Node)
signal sync_deactivated(player: Node)

# Inventory events
signal item_added(item_id: String, quantity: int)
signal item_removed(item_id: String, quantity: int)
signal inventory_changed

# Zone / world events
signal zone_changed(zone_name: String)
signal boss_started(boss_name: String)
signal boss_defeated(boss_name: String)
signal restoration_site_restored(site_name: String)

# UI events
signal hud_updated
signal screen_opened(screen_name: String)
signal screen_closed(screen_name: String)

# Currency events
signal gold_changed(new_total: int, delta: int)
signal bixbite_changed(new_total: int, delta: int)
signal gem_changed(gem_id: String, new_total: int)
signal shard_changed(shard_id: String, new_total: int)
