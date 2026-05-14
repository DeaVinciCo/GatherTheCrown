using UnityEngine;
using System.Collections.Generic;

namespace GatherTheCrown.Systems
{
    /// <summary>
    /// Handles preparation phase before quests: crafting, eating, resting, creat care
    /// </summary>
    public class PreparationSystem : MonoBehaviour
    {
        private static PreparationSystem _instance;
        public static PreparationSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<PreparationSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("PreparationSystem");
                        _instance = go.AddComponent<PreparationSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Inventory")]
        public int gold = 1000;
        public Dictionary<string, int> inventory = new Dictionary<string, int>();

        [Header("Preparation State")]
        public bool isInPreparationMode = false;
        public string currentLocation = "Camp";

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeStartingItems();
        }

        private void InitializeStartingItems()
        {
            // Starting supplies
            AddItem("bread", 5);
            AddItem("water", 5);
            AddItem("health_potion", 3);
            AddItem("energy_potion", 2);
            AddItem("creat_food", 10);
            AddItem("wood", 20);
            AddItem("iron_ore", 5);
        }

        public void EnterPreparationMode(string location)
        {
            isInPreparationMode = true;
            currentLocation = location;
            Debug.Log($"📋 Entered Preparation Mode at {location}");
            Debug.Log("Available actions: Eat, Drink, Rest, Feed Creat, Craft, Check Status");
            ShowPreparationMenu();
        }

        public void ExitPreparationMode()
        {
            isInPreparationMode = false;
            Debug.Log("✅ Preparation complete!");

            // Create checkpoint when leaving preparation
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.RestPoint,
                currentLocation,
                "Finished preparation"
            );
        }

        private void ShowPreparationMenu()
        {
            Debug.Log("\n=== PREPARATION MENU ===");
            Debug.Log("1. Eat Food");
            Debug.Log("2. Drink Water");
            Debug.Log("3. Rest");
            Debug.Log("4. Feed Creat");
            Debug.Log("5. Pet Creat");
            Debug.Log("6. Play with Creat");
            Debug.Log("7. Use Potion");
            Debug.Log("8. Craft Items");
            Debug.Log("9. Check Status");
            Debug.Log("0. Exit Preparation");
            Debug.Log("========================\n");
        }

        // === FOOD & DRINK ===

        public void EatFood(string foodType)
        {
            if (!HasItem(foodType))
            {
                Debug.LogWarning($"No {foodType} in inventory!");
                return;
            }

            RemoveItem(foodType, 1);

            float hungerRestore = 0f;
            switch (foodType)
            {
                case "bread": hungerRestore = 20f; break;
                case "cooked_meat": hungerRestore = 40f; break;
                case "fruit": hungerRestore = 15f; break;
                case "stew": hungerRestore = 50f; break;
                default: hungerRestore = 10f; break;
            }

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.Eat(foodType, hungerRestore);
            }

            // Reward XP for eating
            PreparationRewardSystem.Instance?.RewardEat(foodType);
        }

        public void DrinkWater()
        {
            if (!HasItem("water"))
            {
                Debug.LogWarning("No water in inventory!");
                return;
            }

            RemoveItem("water", 1);

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.Drink("water", 30f);
            }

            // Reward XP for drinking
            PreparationRewardSystem.Instance?.RewardDrink("water");
        }

        public void UsePotion(string potionType)
        {
            if (!HasItem(potionType))
            {
                Debug.LogWarning($"No {potionType} in inventory!");
                return;
            }

            RemoveItem(potionType, 1);

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                switch (potionType)
                {
                    case "health_potion":
                        playerNeeds.UsePotion("Health Potion", 50f, 0f);
                        break;
                    case "energy_potion":
                        playerNeeds.UsePotion("Energy Potion", 0f, 50f);
                        break;
                    case "full_restore_potion":
                        playerNeeds.UsePotion("Full Restore", 100f, 100f);
                        break;
                }
            }
        }

        // === REST ===

        public void Rest(float hours)
        {
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.Rest(hours);
            }

            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                timeSystem.AdvanceTime(hours * 60f);
            }

            Debug.Log($"😴 Rested for {hours} hours");

            // Reward XP for resting
            PreparationRewardSystem.Instance?.RewardRest(hours);
        }

        public void RestUntilMorning()
        {
            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                timeSystem.RestUntilMorning();
            }
        }

        // === CREAT CARE ===

        public void FeedCreat()
        {
            if (!HasItem("creat_food"))
            {
                Debug.LogWarning("No creat food in inventory!");
                return;
            }

            RemoveItem("creat_food", 1);

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.FeedCreat("Creat Food", 40f);
            }

            // Reward XP for feeding creat
            PreparationRewardSystem.Instance?.RewardFeedCreat("Creat Food");

            // Update quest objective if active
            var questManager = QuestManager.Instance;
            if (questManager != null)
            {
                questManager.UpdateQuestObjective("forest_trial_003", "feed_creat", 1);
            }
        }

        public void PetCreat()
        {
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.PetCreat();
            }

            // Reward XP for petting creat
            PreparationRewardSystem.Instance?.RewardPetCreat();

            // Update quest objective if active
            var questManager = QuestManager.Instance;
            if (questManager != null)
            {
                questManager.UpdateQuestObjective("forest_trial_003", "pet_creat", 1);
            }
        }

        public void PlayWithCreat(float minutes)
        {
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.PlayWithCreat(minutes);
            }

            // Reward XP for playing with creat
            PreparationRewardSystem.Instance?.RewardPlayWithCreat(minutes);

            // Update quest objective if active
            var questManager = QuestManager.Instance;
            if (questManager != null)
            {
                questManager.UpdateQuestObjective("forest_trial_003", "play_creat", 1);
            }
        }

        // === CRAFTING ===

        public void CraftItem(string itemName)
        {
            bool success = false;

            switch (itemName)
            {
                case "health_potion":
                    if (HasItem("herb", 3) && gold >= 50)
                    {
                        RemoveItem("herb", 3);
                        gold -= 50;
                        AddItem("health_potion", 1);
                        success = true;
                    }
                    break;

                case "energy_potion":
                    if (HasItem("herb", 2) && HasItem("honey", 1) && gold >= 50)
                    {
                        RemoveItem("herb", 2);
                        RemoveItem("honey", 1);
                        gold -= 50;
                        AddItem("energy_potion", 1);
                        success = true;
                    }
                    break;

                case "basic_sword":
                    if (HasItem("iron_ore", 5) && HasItem("wood", 2) && gold >= 200)
                    {
                        RemoveItem("iron_ore", 5);
                        RemoveItem("wood", 2);
                        gold -= 200;
                        AddItem("basic_sword", 1);
                        success = true;
                    }
                    break;
            }

            if (success)
            {
                Debug.Log($"🔨 Crafted {itemName}!");
                
                // Reward XP for crafting
                PreparationRewardSystem.Instance?.RewardCraft(itemName);
                
                // Create checkpoint after crafting
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.CraftingComplete,
                    currentLocation,
                    $"Crafted {itemName}"
                );
            }
            else
            {
                Debug.LogWarning($"Cannot craft {itemName}. Missing materials or gold.");
            }
        }

        // === INVENTORY ===

        public void AddItem(string itemName, int quantity)
        {
            if (inventory.ContainsKey(itemName))
            {
                inventory[itemName] += quantity;
            }
            else
            {
                inventory[itemName] = quantity;
            }
            Debug.Log($"+ {quantity}x {itemName}");
        }

        public void RemoveItem(string itemName, int quantity)
        {
            if (inventory.ContainsKey(itemName))
            {
                inventory[itemName] -= quantity;
                if (inventory[itemName] <= 0)
                {
                    inventory.Remove(itemName);
                }
                Debug.Log($"- {quantity}x {itemName}");
            }
        }

        public bool HasItem(string itemName, int quantity = 1)
        {
            return inventory.ContainsKey(itemName) && inventory[itemName] >= quantity;
        }

        public int GetItemCount(string itemName)
        {
            return inventory.ContainsKey(itemName) ? inventory[itemName] : 0;
        }

        // === STATUS ===

        public void ShowStatus()
        {
            Debug.Log("\n=== STATUS ===");
            Debug.Log($"Gold: {gold}g");
            
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                Debug.Log($"\nPlayer:");
                Debug.Log($"  Health: {playerNeeds.health:F0}%");
                Debug.Log($"  Energy: {playerNeeds.energy:F0}%");
                Debug.Log($"  Hunger: {playerNeeds.hunger:F0}%");
                Debug.Log($"  Thirst: {playerNeeds.thirst:F0}%");

                Debug.Log($"\nCreat:");
                Debug.Log($"  Health: {playerNeeds.creatHealth:F0}%");
                Debug.Log($"  Energy: {playerNeeds.creatEnergy:F0}%");
                Debug.Log($"  Hunger: {playerNeeds.creatHunger:F0}%");
                Debug.Log($"  Happiness: {playerNeeds.creatHappiness:F0}%");
            }

            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                Debug.Log($"\nTime: {timeSystem.GetFullTimeString()}");
            }

            Debug.Log($"\nInventory ({inventory.Count} items):");
            foreach (var item in inventory)
            {
                Debug.Log($"  {item.Key}: {item.Value}");
            }
            Debug.Log("==============\n");
        }
    }
}
