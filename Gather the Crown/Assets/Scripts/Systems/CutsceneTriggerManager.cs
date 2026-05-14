using UnityEngine;

namespace GatherTheCrown.Systems
{
    /// <summary>
    /// Automatically triggers interactive cutscenes at appropriate moments
    /// </summary>
    public class CutsceneTriggerManager : MonoBehaviour
    {
        private static CutsceneTriggerManager _instance;
        public static CutsceneTriggerManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<CutsceneTriggerManager>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("CutsceneTriggerManager");
                        _instance = go.AddComponent<CutsceneTriggerManager>();
                    }
                }
                return _instance;
            }
        }

        [Header("Settings")]
        public bool autoTriggerEnabled = true;
        public bool suggestMorningRoutine = true;
        public bool suggestCampSetup = true;
        public bool forcePrepBeforeQuests = true;
        public bool forcePrepBeforeBosses = true;

        [Header("State")]
        private bool morningRoutineSuggested = false;
        private bool campSetupSuggested = false;
        private int lastDay = 0;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);
        }

        void Update()
        {
            if (!autoTriggerEnabled) return;

            CheckMorningRoutineTrigger();
            CheckCampSetupTrigger();
        }

        /// <summary>
        /// Check if morning routine should be suggested
        /// </summary>
        private void CheckMorningRoutineTrigger()
        {
            if (!suggestMorningRoutine) return;

            var timeSystem = TimeSystem.Instance;
            if (timeSystem == null) return;

            // New day started
            if (timeSystem.currentDay > lastDay)
            {
                lastDay = timeSystem.currentDay;
                morningRoutineSuggested = false;
            }

            // Morning time (8-10 AM) and not yet suggested today
            if (!morningRoutineSuggested && 
                timeSystem.currentTime >= 480f && 
                timeSystem.currentTime < 600f &&
                timeSystem.timeOfDay == "Morning")
            {
                morningRoutineSuggested = true;
                SuggestMorningRoutine();
            }
        }

        /// <summary>
        /// Check if camp setup should be suggested
        /// </summary>
        private void CheckCampSetupTrigger()
        {
            if (!suggestCampSetup) return;

            var timeSystem = TimeSystem.Instance;
            if (timeSystem == null) return;

            // Dusk/evening and not yet suggested
            if (!campSetupSuggested && 
                (timeSystem.timeOfDay == "Dusk" || timeSystem.timeOfDay == "Night"))
            {
                var playerNeeds = PlayerNeedsSystem.Instance;
                if (playerNeeds != null && playerNeeds.ShouldAutoRest())
                {
                    campSetupSuggested = true;
                    SuggestCampSetup();
                }
            }

            // Reset suggestion at dawn
            if (timeSystem.timeOfDay == "Dawn" || timeSystem.timeOfDay == "Morning")
            {
                campSetupSuggested = false;
            }
        }

        /// <summary>
        /// Suggest morning routine to player
        /// </summary>
        private void SuggestMorningRoutine()
        {
            Debug.Log("🌅 Good morning! Press M to start your morning routine.");
            // Could show UI notification here
        }

        /// <summary>
        /// Suggest camp setup to player
        /// </summary>
        private void SuggestCampSetup()
        {
            Debug.Log("🌙 Night is falling. Press C to set up camp and rest.");
            // Could show UI notification here
        }

        /// <summary>
        /// Trigger quest preparation cutscene (called by QuestSystem)
        /// </summary>
        public bool TriggerQuestPreparation(string questName, string questType)
        {
            if (!forcePrepBeforeQuests) return true; // Allow quest to start

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds == null) return true;

            // Check if player needs preparation
            bool needsPrep = playerNeeds.energy < 50f || 
                           playerNeeds.hunger < 50f || 
                           playerNeeds.creatEnergy < 50f ||
                           playerNeeds.creatHunger < 50f;

            if (needsPrep)
            {
                Debug.Log($"⚠️ You need to prepare before starting: {questName}");
                
                // Trigger preparation cutscene
                var cutsceneSystem = InteractiveCutsceneSystem.Instance;
                if (cutsceneSystem != null)
                {
                    cutsceneSystem.PlayQuestPreparation(questName);
                }

                return false; // Block quest start until prep complete
            }

            return true; // Allow quest to start
        }

        /// <summary>
        /// Trigger boss preparation cutscene (called when entering boss area)
        /// </summary>
        public void TriggerBossPreparation(string bossName)
        {
            if (!forcePrepBeforeBosses) return;

            Debug.Log($"⚔️ Boss ahead: {bossName}. Prepare yourself!");

            // Create checkpoint before boss prep
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.BeforeBoss,
                "Boss Arena Entrance",
                $"Before {bossName}"
            );

            // Trigger boss preparation cutscene
            var cutsceneSystem = InteractiveCutsceneSystem.Instance;
            if (cutsceneSystem != null)
            {
                cutsceneSystem.PlayBossPreperation(bossName);
            }
        }

        /// <summary>
        /// Trigger travel preparation cutscene
        /// </summary>
        public void TriggerTravelPreparation(string destination)
        {
            Debug.Log($"🗺️ Preparing for journey to: {destination}");

            var cutscene = new InteractiveCutscene
            {
                id = "travel_prep_" + destination,
                type = CutsceneType.PreTravel,
                title = $"🗺️ Journey to {destination}",
                description = "Pack your supplies for the long journey ahead.",
                canSkip = false,
                location = "Departure Point",
                actions = new System.Collections.Generic.List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Pack Food",
                        description = "Ensure you have enough food",
                        buttonPrompt = "Press E to pack food",
                        key = KeyCode.E,
                        required = true,
                        animation = "pack_items"
                    },
                    new CutsceneAction
                    {
                        actionName = "Pack Water",
                        description = "Fill water containers",
                        buttonPrompt = "Press E to pack water",
                        key = KeyCode.E,
                        required = true,
                        animation = "pack_items"
                    },
                    new CutsceneAction
                    {
                        actionName = "Pack Creat Food",
                        description = "Don't forget your companion",
                        buttonPrompt = "Press E to pack",
                        key = KeyCode.E,
                        required = true,
                        animation = "pack_items"
                    },
                    new CutsceneAction
                    {
                        actionName = "Check Map",
                        description = "Review the route",
                        buttonPrompt = "Press E to check map",
                        key = KeyCode.E,
                        required = true,
                        animation = "check_map"
                    },
                    new CutsceneAction
                    {
                        actionName = "Say Goodbye",
                        description = "Wave to the villagers",
                        buttonPrompt = "Press E to wave",
                        key = KeyCode.E,
                        animation = "wave"
                    },
                    new CutsceneAction
                    {
                        actionName = "Mount Up",
                        description = "Begin your journey",
                        buttonPrompt = "Press E to mount",
                        key = KeyCode.E,
                        required = true,
                        animation = "mount_creat"
                    }
                }
            };

            var cutsceneSystem = InteractiveCutsceneSystem.Instance;
            if (cutsceneSystem != null)
            {
                cutsceneSystem.PlayCutscene(cutscene);
            }
        }

        /// <summary>
        /// Trigger bonding cutscene (special moments)
        /// </summary>
        public void TriggerBondingMoment(string momentName)
        {
            Debug.Log($"❤️ Special bonding moment: {momentName}");

            var cutscene = new InteractiveCutscene
            {
                id = "bonding_" + momentName,
                type = CutsceneType.Bonding,
                title = $"❤️ {momentName}",
                description = "A special moment with your creat.",
                canSkip = true,
                location = "Special Location",
                actions = new System.Collections.Generic.List<CutsceneAction>
                {
                    new CutsceneAction
                    {
                        actionName = "Approach Creat",
                        description = "Walk closer to your companion",
                        buttonPrompt = "Press E to approach",
                        key = KeyCode.E,
                        animation = "walk_forward"
                    },
                    new CutsceneAction
                    {
                        actionName = "Pet Creat",
                        description = "Gently pet your creat",
                        buttonPrompt = "Press E to pet",
                        key = KeyCode.E,
                        creatHappinessIncrease = 20f,
                        bondIncrease = 10,
                        animation = "pet_creat"
                    },
                    new CutsceneAction
                    {
                        actionName = "Share Moment",
                        description = "Sit together in silence",
                        buttonPrompt = "Press E to sit",
                        key = KeyCode.E,
                        creatHappinessIncrease = 15f,
                        bondIncrease = 15,
                        animation = "sit_together"
                    },
                    new CutsceneAction
                    {
                        actionName = "Heart Connection",
                        description = "Feel the bond strengthen",
                        buttonPrompt = "Press E to connect",
                        key = KeyCode.E,
                        bondIncrease = 20,
                        animation = "bond_effect"
                    }
                }
            };

            var cutsceneSystem = InteractiveCutsceneSystem.Instance;
            if (cutsceneSystem != null)
            {
                cutsceneSystem.PlayCutscene(cutscene);
            }
        }

        /// <summary>
        /// Check if cutscene is currently playing
        /// </summary>
        public bool IsCutscenePlaying()
        {
            var cutsceneSystem = InteractiveCutsceneSystem.Instance;
            return cutsceneSystem != null && cutsceneSystem.isPlaying;
        }

        /// <summary>
        /// Enable/disable auto-triggering
        /// </summary>
        public void SetAutoTrigger(bool enabled)
        {
            autoTriggerEnabled = enabled;
            Debug.Log($"Auto-trigger cutscenes: {(enabled ? "Enabled" : "Disabled")}");
        }
    }
}
