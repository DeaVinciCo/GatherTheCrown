using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace GatherTheCrown.Systems
{
    public enum CutsceneType
    {
        Preparation,        // Get ready for quest/journey
        PreBattle,          // Gear up before boss fight
        PreTravel,          // Pack supplies for long journey
        MorningRoutine,     // Wake up, eat breakfast, care for creat
        CampSetup,          // Set up camp for the night
        Bonding,            // Special bonding moment with creat
        Shopping,           // Interactive shopping scene
        Crafting,           // Interactive crafting scene
        Story               // Story-driven cutscene with choices
    }

    [System.Serializable]
    public class CutsceneAction
    {
        public string actionName;
        public string description;
        public string buttonPrompt; // e.g., "Press E to eat"
        public KeyCode key;
        public float duration;
        public bool required;
        public bool completed;
        
        // Effects
        public float healthRestore;
        public float energyRestore;
        public float hungerRestore;
        public float creatHungerRestore;
        public float creatHappinessIncrease;
        public int bondIncrease;
        public string itemUsed;
        public string animation;
    }

    [System.Serializable]
    public class InteractiveCutscene
    {
        public string id;
        public CutsceneType type;
        public string title;
        public string description;
        public List<CutsceneAction> actions = new List<CutsceneAction>();
        public bool canSkip;
        public float timeLimit; // 0 = no limit
        public string location;
    }

    public class InteractiveCutsceneSystem : MonoBehaviour
    {
        private static InteractiveCutsceneSystem _instance;
        public static InteractiveCutsceneSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<InteractiveCutsceneSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("InteractiveCutsceneSystem");
                        _instance = go.AddComponent<InteractiveCutsceneSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Current Cutscene")]
        public InteractiveCutscene currentCutscene;
        public bool isPlaying = false;
        public int currentActionIndex = 0;
        public float cutsceneTimer = 0f;

        [Header("UI References")]
        public GameObject cutsceneUI;
        public UnityEngine.UI.Text titleText;
        public UnityEngine.UI.Text descriptionText;
        public UnityEngine.UI.Text actionPromptText;
        public UnityEngine.UI.Text progressText;

        [Header("Camera")]
        public Camera mainCamera;
        public Vector3 cutsceneCameraPosition;
        public Vector3 cutsceneCameraRotation;
        private Vector3 originalCameraPosition;
        private Quaternion originalCameraRotation;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            if (mainCamera == null)
            {
                mainCamera = Camera.main;
            }
        }

        void Update()
        {
            if (isPlaying && currentCutscene != null)
            {
                UpdateCutscene();
                CheckActionInput();
            }
        }

        private void UpdateCutscene()
        {
            cutsceneTimer += Time.deltaTime;

            // Check time limit
            if (currentCutscene.timeLimit > 0 && cutsceneTimer >= currentCutscene.timeLimit)
            {
                Debug.LogWarning("⏰ Time's up! Cutscene ending.");
                EndCutscene(false);
                return;
            }

            // Update UI
            UpdateCutsceneUI();
        }

        private void CheckActionInput()
        {
            if (currentActionIndex >= currentCutscene.actions.Count)
            {
                // All actions complete
                EndCutscene(true);
                return;
            }

            var action = currentCutscene.actions[currentActionIndex];

            // Check for action input
            if (Input.GetKeyDown(action.key))
            {
                PerformAction(action);
            }

            // Skip option
            if (currentCutscene.canSkip && Input.GetKeyDown(KeyCode.Escape))
            {
                Debug.Log("⏭️ Cutscene skipped");
                EndCutscene(false);
            }
        }

        private void PerformAction(CutsceneAction action)
        {
            if (action.completed) return;

            Debug.Log($"✓ {action.actionName}");
            action.completed = true;

            // Calculate XP based on action and cutscene
            int xpReward = CalculateActionXP(action);

            // Apply effects
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                if (action.healthRestore > 0)
                    playerNeeds.health = Mathf.Min(100, playerNeeds.health + action.healthRestore);
                
                if (action.energyRestore > 0)
                    playerNeeds.energy = Mathf.Min(100, playerNeeds.energy + action.energyRestore);
                
                if (action.hungerRestore > 0)
                    playerNeeds.hunger = Mathf.Min(100, playerNeeds.hunger + action.hungerRestore);
                
                if (action.creatHungerRestore > 0)
                    playerNeeds.creatHunger = Mathf.Min(100, playerNeeds.creatHunger + action.creatHungerRestore);
                
                if (action.creatHappinessIncrease > 0)
                    playerNeeds.creatHappiness = Mathf.Min(100, playerNeeds.creatHappiness + action.creatHappinessIncrease);
            }

            // Increase bond
            if (action.bondIncrease > 0)
            {
                var gameManager = GameManager.Instance;
                if (gameManager?.playerCreat != null)
                {
                    gameManager.playerCreat.IncreaseBond(action.bondIncrease);
                }
            }

            // Use item from inventory
            if (!string.IsNullOrEmpty(action.itemUsed))
            {
                PreparationSystem.Instance?.RemoveItem(action.itemUsed, 1);
            }

            // Give XP for completing action
            if (xpReward > 0)
            {
                var gameManager = GameManager.Instance;
                if (gameManager != null)
                {
                    gameManager.AddXP(xpReward);
                    Debug.Log($"💫 +{xpReward} XP: {action.actionName}");
                }
            }

            // Play animation (placeholder)
            if (!string.IsNullOrEmpty(action.animation))
            {
                Debug.Log($"🎬 Playing animation: {action.animation}");
            }

            // Move to next action
            currentActionIndex++;
        }

        /// <summary>
        /// Calculate XP reward based on action type and cutscene length
        /// </summary>
        private int CalculateActionXP(CutsceneAction action)
        {
            if (currentCutscene == null) return 0;

            int baseXP = 0;
            int totalActions = currentCutscene.actions.Count;
            int requiredActions = currentCutscene.actions.FindAll(a => a.required).Count;

            // Base XP depends on cutscene type
            switch (currentCutscene.type)
            {
                case CutsceneType.MorningRoutine:
                    baseXP = 50 / totalActions; // 50 XP total, split among actions
                    break;
                case CutsceneType.Preparation:
                    baseXP = 100 / totalActions; // 100 XP total for quest prep
                    break;
                case CutsceneType.PreBattle:
                    baseXP = 150 / totalActions; // 150 XP total for boss prep
                    break;
                case CutsceneType.CampSetup:
                    baseXP = 75 / totalActions; // 75 XP total for camp
                    break;
                case CutsceneType.PreTravel:
                    baseXP = 80 / totalActions; // 80 XP total for travel
                    break;
                case CutsceneType.Bonding:
                    baseXP = 60 / totalActions; // 60 XP total for bonding
                    break;
                default:
                    baseXP = 10;
                    break;
            }

            // Bonus for required actions
            if (action.required)
            {
                baseXP = (int)(baseXP * 1.5f);
            }

            // Bonus for actions that restore stats
            if (action.healthRestore > 0 || action.energyRestore > 0 || action.hungerRestore > 0)
            {
                baseXP += 5;
            }

            // Bonus for creat care actions
            if (action.creatHungerRestore > 0 || action.creatHappinessIncrease > 0 || action.bondIncrease > 0)
            {
                baseXP += 10;
            }

            return baseXP;
        }

        private void UpdateCutsceneUI()
        {
            if (currentActionIndex >= currentCutscene.actions.Count) return;

            var action = currentCutscene.actions[currentActionIndex];

            if (titleText != null)
                titleText.text = currentCutscene.title;

            if (descriptionText != null)
                descriptionText.text = currentCutscene.description;

            if (actionPromptText != null)
            {
                if (!action.completed)
                {
                    actionPromptText.text = $"{action.buttonPrompt}\n{action.description}";
                }
                else
                {
                    actionPromptText.text = "✓ " + action.actionName;
                }
            }

            if (progressText != null)
            {
                int completed = currentCutscene.actions.FindAll(a => a.completed).Count;
                progressText.text = $"Progress: {completed}/{currentCutscene.actions.Count}";
            }
        }

        /// <summary>
        /// Start an interactive cutscene
        /// </summary>
        public void PlayCutscene(InteractiveCutscene cutscene)
        {
            currentCutscene = cutscene;
            isPlaying = true;
            currentActionIndex = 0;
            cutsceneTimer = 0f;

            // Reset action states
            foreach (var action in currentCutscene.actions)
            {
                action.completed = false;
            }

            // Save camera position
            if (mainCamera != null)
            {
                originalCameraPosition = mainCamera.transform.position;
                originalCameraRotation = mainCamera.transform.rotation;
            }

            // Show UI
            if (cutsceneUI != null)
            {
                cutsceneUI.SetActive(true);
            }

            // Create checkpoint before cutscene
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.BeforeCutscene,
                cutscene.location,
                $"Before: {cutscene.title}"
            );

            Debug.Log($"🎬 Starting Interactive Cutscene: {cutscene.title}");
        }

        /// <summary>
        /// End the current cutscene
        /// </summary>
        private void EndCutscene(bool completed)
        {
            isPlaying = false;

            // Restore camera
            if (mainCamera != null)
            {
                mainCamera.transform.position = originalCameraPosition;
                mainCamera.transform.rotation = originalCameraRotation;
            }

            // Hide UI
            if (cutsceneUI != null)
            {
                cutsceneUI.SetActive(false);
            }

            if (completed)
            {
                Debug.Log($"✅ Cutscene Complete: {currentCutscene.title}");
                
                // Calculate completion bonus XP
                int completionBonus = CalculateCompletionBonus();
                if (completionBonus > 0)
                {
                    var gameManager = GameManager.Instance;
                    if (gameManager != null)
                    {
                        gameManager.AddXP(completionBonus);
                        Debug.Log($"🌟 Completion Bonus: +{completionBonus} XP!");
                    }
                }

                // Check for perfect completion (all actions including optional)
                int completedActions = currentCutscene.actions.FindAll(a => a.completed).Count;
                if (completedActions == currentCutscene.actions.Count)
                {
                    int perfectBonus = 25;
                    var gameManager = GameManager.Instance;
                    if (gameManager != null)
                    {
                        gameManager.AddXP(perfectBonus);
                        Debug.Log($"✨ Perfect Completion: +{perfectBonus} XP!");
                    }
                }

                // Track analytics
                GameAnalyticsSystem.Instance?.TrackPreparationChoice(
                    currentCutscene.id,
                    $"Completed {currentCutscene.title}"
                );
                
                // Create checkpoint after successful completion
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.RestPoint,
                    currentCutscene.location,
                    $"Completed: {currentCutscene.title}"
                );
            }
            else
            {
                Debug.Log($"⏭️ Cutscene Ended: {currentCutscene.title}");
            }

            currentCutscene = null;
        }

        /// <summary>
        /// Calculate completion bonus based on cutscene type and actions completed
        /// </summary>
        private int CalculateCompletionBonus()
        {
            if (currentCutscene == null) return 0;

            int bonus = 0;
            int completedActions = currentCutscene.actions.FindAll(a => a.completed).Count;
            int totalActions = currentCutscene.actions.Count;
            int requiredActions = currentCutscene.actions.FindAll(a => a.required).Count;

            // Base completion bonus
            switch (currentCutscene.type)
            {
                case CutsceneType.MorningRoutine:
                    bonus = 25;
                    break;
                case CutsceneType.Preparation:
                    bonus = 50;
                    break;
                case CutsceneType.PreBattle:
                    bonus = 75;
                    break;
                case CutsceneType.CampSetup:
                    bonus = 40;
                    break;
                case CutsceneType.PreTravel:
                    bonus = 45;
                    break;
                case CutsceneType.Bonding:
                    bonus = 35;
                    break;
            }

            // Bonus for completing optional actions
            int optionalCompleted = completedActions - requiredActions;
            if (optionalCompleted > 0)
            {
                bonus += optionalCompleted * 10;
                Debug.Log($"📋 Completed {optionalCompleted} optional actions!");
            }

            // Speed bonus if completed quickly
            if (currentCutscene.timeLimit > 0 && cutsceneTimer < currentCutscene.timeLimit * 0.5f)
            {
                int speedBonus = 20;
                bonus += speedBonus;
                Debug.Log($"⚡ Speed Bonus: +{speedBonus} XP!");
            }

            return bonus;
        }

        // === PRESET CUTSCENES ===

        /// <summary>
        /// Morning routine cutscene
        /// </summary>
        public void PlayMorningRoutine()
        {
            var cutscene = new InteractiveCutscene
            {
                id = "morning_routine",
                type = CutsceneType.MorningRoutine,
                title = "🌅 Morning Routine",
                description = "Start your day right! Take care of yourself and your creat.",
                canSkip = true,
                timeLimit = 0,
                location = "Camp",
                actions = new List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Wake Up",
                        description = "Stretch and get out of bed",
                        buttonPrompt = "Press E to wake up",
                        key = KeyCode.E,
                        energyRestore = 10f,
                        animation = "wake_up"
                    },
                    new CutsceneAction
                    {
                        actionName = "Eat Breakfast",
                        description = "Have a hearty breakfast",
                        buttonPrompt = "Press E to eat",
                        key = KeyCode.E,
                        hungerRestore = 40f,
                        energyRestore = 10f,
                        itemUsed = "bread",
                        animation = "eat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Drink Water",
                        description = "Hydrate for the day ahead",
                        buttonPrompt = "Press E to drink",
                        key = KeyCode.E,
                        itemUsed = "water",
                        animation = "drink"
                    },
                    new CutsceneAction
                    {
                        actionName = "Feed Creat",
                        description = "Give your creat breakfast",
                        buttonPrompt = "Press E to feed",
                        key = KeyCode.E,
                        creatHungerRestore = 40f,
                        creatHappinessIncrease = 10f,
                        bondIncrease = 3,
                        itemUsed = "creat_food",
                        animation = "feed_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Pet Creat",
                        description = "Give your creat some morning affection",
                        buttonPrompt = "Press E to pet",
                        key = KeyCode.E,
                        creatHappinessIncrease = 5f,
                        bondIncrease = 2,
                        animation = "pet_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Check Gear",
                        description = "Make sure you have everything",
                        buttonPrompt = "Press E to check",
                        key = KeyCode.E,
                        animation = "check_inventory"
                    }
                }
            };

            PlayCutscene(cutscene);
        }

        /// <summary>
        /// Pre-quest preparation cutscene
        /// </summary>
        public void PlayQuestPreparation(string questName)
        {
            var cutscene = new InteractiveCutscene
            {
                id = "quest_prep_" + questName,
                type = CutsceneType.Preparation,
                title = $"📋 Preparing for: {questName}",
                description = "Get ready for your quest. Make sure you're fully prepared!",
                canSkip = false, // Can't skip quest prep!
                timeLimit = 0,
                location = "Quest Start",
                actions = new List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Check Supplies",
                        description = "Review your inventory",
                        buttonPrompt = "Press E to check supplies",
                        key = KeyCode.E,
                        required = true,
                        animation = "check_inventory"
                    },
                    new CutsceneAction
                    {
                        actionName = "Eat Food",
                        description = "Eat to restore hunger",
                        buttonPrompt = "Press E to eat",
                        key = KeyCode.E,
                        hungerRestore = 30f,
                        required = true,
                        itemUsed = "bread",
                        animation = "eat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Drink Potion",
                        description = "Drink energy potion",
                        buttonPrompt = "Press E to drink",
                        key = KeyCode.E,
                        energyRestore = 30f,
                        itemUsed = "energy_potion",
                        animation = "drink_potion"
                    },
                    new CutsceneAction
                    {
                        actionName = "Feed Creat",
                        description = "Make sure your creat is fed",
                        buttonPrompt = "Press E to feed",
                        key = KeyCode.E,
                        creatHungerRestore = 40f,
                        bondIncrease = 2,
                        required = true,
                        itemUsed = "creat_food",
                        animation = "feed_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Encourage Creat",
                        description = "Give your creat a pep talk",
                        buttonPrompt = "Press E to encourage",
                        key = KeyCode.E,
                        creatHappinessIncrease = 15f,
                        bondIncrease = 5,
                        required = true,
                        animation = "pet_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Equip Weapon",
                        description = "Ready your weapon",
                        buttonPrompt = "Press E to equip",
                        key = KeyCode.E,
                        required = true,
                        animation = "equip_weapon"
                    },
                    new CutsceneAction
                    {
                        actionName = "Mount Creat",
                        description = "Climb onto your creat",
                        buttonPrompt = "Press E to mount",
                        key = KeyCode.E,
                        required = true,
                        animation = "mount_creat"
                    }
                }
            };

            PlayCutscene(cutscene);
        }

        /// <summary>
        /// Pre-boss battle preparation
        /// </summary>
        public void PlayBossPreperation(string bossName)
        {
            var cutscene = new InteractiveCutscene
            {
                id = "boss_prep_" + bossName,
                type = CutsceneType.PreBattle,
                title = $"⚔️ Preparing for Boss: {bossName}",
                description = "This is it! Make your final preparations before the battle.",
                canSkip = false,
                timeLimit = 0,
                location = "Boss Arena Entrance",
                actions = new List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Sharpen Weapon",
                        description = "Sharpen your blade for maximum damage",
                        buttonPrompt = "Press E to sharpen",
                        key = KeyCode.E,
                        required = true,
                        animation = "sharpen_weapon"
                    },
                    new CutsceneAction
                    {
                        actionName = "Drink Health Potion",
                        description = "Restore to full health",
                        buttonPrompt = "Press E to drink",
                        key = KeyCode.E,
                        healthRestore = 100f,
                        required = true,
                        itemUsed = "health_potion",
                        animation = "drink_potion"
                    },
                    new CutsceneAction
                    {
                        actionName = "Drink Energy Potion",
                        description = "Restore to full energy",
                        buttonPrompt = "Press E to drink",
                        key = KeyCode.E,
                        energyRestore = 100f,
                        required = true,
                        itemUsed = "energy_potion",
                        animation = "drink_potion"
                    },
                    new CutsceneAction
                    {
                        actionName = "Feed Creat Premium Food",
                        description = "Give your creat the best food",
                        buttonPrompt = "Press E to feed",
                        key = KeyCode.E,
                        creatHungerRestore = 100f,
                        creatHappinessIncrease = 20f,
                        bondIncrease = 5,
                        required = true,
                        itemUsed = "premium_creat_food",
                        animation = "feed_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Bond with Creat",
                        description = "Share a moment with your companion",
                        buttonPrompt = "Press E to bond",
                        key = KeyCode.E,
                        creatHappinessIncrease = 30f,
                        bondIncrease = 10,
                        required = true,
                        animation = "bond_cutscene"
                    },
                    new CutsceneAction
                    {
                        actionName = "Take Deep Breath",
                        description = "Center yourself for battle",
                        buttonPrompt = "Press E to breathe",
                        key = KeyCode.E,
                        energyRestore = 10f,
                        required = true,
                        animation = "meditate"
                    },
                    new CutsceneAction
                    {
                        actionName = "Enter Arena",
                        description = "Step through the door...",
                        buttonPrompt = "Press E to enter",
                        key = KeyCode.E,
                        required = true,
                        animation = "walk_forward"
                    }
                }
            };

            PlayCutscene(cutscene);
        }

        /// <summary>
        /// Evening camp setup
        /// </summary>
        public void PlayCampSetup()
        {
            var cutscene = new InteractiveCutscene
            {
                id = "camp_setup",
                type = CutsceneType.CampSetup,
                title = "🏕️ Setting Up Camp",
                description = "Night is falling. Set up camp and rest.",
                canSkip = true,
                timeLimit = 0,
                location = "Campsite",
                actions = new List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Gather Firewood",
                        description = "Collect wood for the campfire",
                        buttonPrompt = "Press E to gather",
                        key = KeyCode.E,
                        animation = "gather_wood"
                    },
                    new CutsceneAction
                    {
                        actionName = "Start Fire",
                        description = "Light the campfire",
                        buttonPrompt = "Press E to light",
                        key = KeyCode.E,
                        animation = "light_fire"
                    },
                    new CutsceneAction
                    {
                        actionName = "Cook Dinner",
                        description = "Prepare a warm meal",
                        buttonPrompt = "Press E to cook",
                        key = KeyCode.E,
                        hungerRestore = 50f,
                        itemUsed = "raw_meat",
                        animation = "cook_food"
                    },
                    new CutsceneAction
                    {
                        actionName = "Feed Creat",
                        description = "Share dinner with your creat",
                        buttonPrompt = "Press E to feed",
                        key = KeyCode.E,
                        creatHungerRestore = 50f,
                        creatHappinessIncrease = 10f,
                        bondIncrease = 3,
                        itemUsed = "creat_food",
                        animation = "feed_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Tell Story",
                        description = "Share stories by the fire",
                        buttonPrompt = "Press E to talk",
                        key = KeyCode.E,
                        creatHappinessIncrease = 15f,
                        bondIncrease = 5,
                        animation = "sit_talk"
                    },
                    new CutsceneAction
                    {
                        actionName = "Sleep",
                        description = "Rest until morning",
                        buttonPrompt = "Press E to sleep",
                        key = KeyCode.E,
                        energyRestore = 100f,
                        healthRestore = 50f,
                        animation = "sleep"
                    }
                }
            };

            PlayCutscene(cutscene);
        }
    }
}
