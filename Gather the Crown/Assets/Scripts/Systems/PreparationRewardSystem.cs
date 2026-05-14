using UnityEngine;

namespace GatherTheCrown.Systems
{
    /// <summary>
    /// Rewards players with XP for completing preparation activities
    /// </summary>
    public class PreparationRewardSystem : MonoBehaviour
    {
        private static PreparationRewardSystem _instance;
        public static PreparationRewardSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<PreparationRewardSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("PreparationRewardSystem");
                        _instance = go.AddComponent<PreparationRewardSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("XP Rewards")]
        public int morningRoutineXP = 50;
        public int eatFoodXP = 10;
        public int drinkWaterXP = 5;
        public int restXP = 25;
        public int feedCreatXP = 15;
        public int petCreatXP = 10;
        public int playWithCreatXP = 20;
        public int craftItemXP = 30;
        public int questPrepCompleteXP = 100;
        public int bossPrepCompleteXP = 150;
        public int campSetupXP = 75;
        public int fullPreparationBonusXP = 200; // Bonus for completing all prep

        [Header("Streak Bonuses")]
        public int consecutiveDaysBonus = 25; // Per day streak
        public int maxStreakBonus = 500; // Cap at 20 days
        public int currentStreak = 0;

        [Header("Statistics")]
        public int totalPrepXPEarned = 0;
        public int morningRoutinesCompleted = 0;
        public int mealsEaten = 0;
        public int creatCareSessions = 0;
        public int itemsCrafted = 0;

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

        // === INDIVIDUAL ACTIONS ===

        /// <summary>
        /// Reward for eating food
        /// </summary>
        public void RewardEat(string foodType)
        {
            int xp = eatFoodXP;
            
            // Bonus for eating healthy/premium food
            if (foodType.Contains("premium") || foodType.Contains("stew"))
            {
                xp = (int)(xp * 1.5f);
            }

            GiveXP(xp, $"Ate {foodType}");
            mealsEaten++;

            // Track analytics
            GameAnalyticsSystem.Instance?.TrackPreparationChoice("eat_food", $"Ate {foodType}");
        }

        /// <summary>
        /// Reward for drinking
        /// </summary>
        public void RewardDrink(string drinkType)
        {
            int xp = drinkWaterXP;
            GiveXP(xp, $"Drank {drinkType}");

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("drink", $"Drank {drinkType}");
        }

        /// <summary>
        /// Reward for resting
        /// </summary>
        public void RewardRest(float hours)
        {
            int xp = (int)(restXP * Mathf.Min(hours / 2f, 2f)); // Max 2x bonus for long rest
            GiveXP(xp, $"Rested for {hours} hours");

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("rest", $"Rested {hours}h");
        }

        /// <summary>
        /// Reward for feeding creat
        /// </summary>
        public void RewardFeedCreat(string foodType)
        {
            int xp = feedCreatXP;
            
            // Bonus for premium creat food
            if (foodType.Contains("premium"))
            {
                xp = (int)(xp * 2f);
            }

            GiveXP(xp, $"Fed creat {foodType}");
            creatCareSessions++;

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("feed_creat", $"Fed creat {foodType}");
        }

        /// <summary>
        /// Reward for petting creat
        /// </summary>
        public void RewardPetCreat()
        {
            GiveXP(petCreatXP, "Pet creat");
            creatCareSessions++;

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("pet_creat", "Pet creat");
        }

        /// <summary>
        /// Reward for playing with creat
        /// </summary>
        public void RewardPlayWithCreat(float minutes)
        {
            int xp = (int)(playWithCreatXP * Mathf.Min(minutes / 5f, 3f)); // Max 3x for 15+ min
            GiveXP(xp, $"Played with creat for {minutes} minutes");
            creatCareSessions++;

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("play_creat", $"Played {minutes}min");
        }

        /// <summary>
        /// Reward for crafting
        /// </summary>
        public void RewardCraft(string itemName)
        {
            int xp = craftItemXP;
            
            // Bonus for complex items
            if (itemName.Contains("legendary") || itemName.Contains("epic"))
            {
                xp = (int)(xp * 3f);
            }
            else if (itemName.Contains("rare"))
            {
                xp = (int)(xp * 2f);
            }

            GiveXP(xp, $"Crafted {itemName}");
            itemsCrafted++;

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("craft", $"Crafted {itemName}");
        }

        // === CUTSCENE COMPLETION REWARDS ===

        /// <summary>
        /// Reward for completing morning routine
        /// </summary>
        public void RewardMorningRoutine()
        {
            int xp = morningRoutineXP;
            
            // Streak bonus
            currentStreak++;
            int streakBonus = Mathf.Min(currentStreak * consecutiveDaysBonus, maxStreakBonus);
            xp += streakBonus;

            GiveXP(xp, $"Morning Routine Complete! (Day {currentStreak} streak)");
            morningRoutinesCompleted++;

            if (streakBonus > 0)
            {
                Debug.Log($"🔥 Streak Bonus: +{streakBonus} XP!");
            }

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("morning_routine", "Completed morning routine");
        }

        /// <summary>
        /// Reward for completing quest preparation
        /// </summary>
        public void RewardQuestPreparation(string questName)
        {
            int xp = questPrepCompleteXP;
            GiveXP(xp, $"Quest Preparation Complete: {questName}");

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("quest_prep", $"Prepared for {questName}");
        }

        /// <summary>
        /// Reward for completing boss preparation
        /// </summary>
        public void RewardBossPreparation(string bossName)
        {
            int xp = bossPrepCompleteXP;
            GiveXP(xp, $"Boss Preparation Complete: {bossName}");

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("boss_prep", $"Prepared for {bossName}");
        }

        /// <summary>
        /// Reward for completing camp setup
        /// </summary>
        public void RewardCampSetup()
        {
            int xp = campSetupXP;
            GiveXP(xp, "Camp Setup Complete");

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("camp_setup", "Set up camp");
        }

        /// <summary>
        /// Reward for full preparation (all stats at 100%)
        /// </summary>
        public void RewardFullPreparation()
        {
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds == null) return;

            // Check if fully prepared
            bool fullyPrepared = playerNeeds.health >= 100f &&
                               playerNeeds.energy >= 100f &&
                               playerNeeds.hunger >= 100f &&
                               playerNeeds.thirst >= 100f &&
                               playerNeeds.creatHealth >= 100f &&
                               playerNeeds.creatEnergy >= 100f &&
                               playerNeeds.creatHunger >= 100f &&
                               playerNeeds.creatHappiness >= 100f;

            if (fullyPrepared)
            {
                GiveXP(fullPreparationBonusXP, "🌟 FULLY PREPARED BONUS!");
                Debug.Log("✨ Perfect preparation! All stats at 100%!");

                GameAnalyticsSystem.Instance?.TrackPreparationChoice("full_prep", "Achieved full preparation");
            }
        }

        // === SPECIAL BONUSES ===

        /// <summary>
        /// Reward for efficient preparation (completed quickly)
        /// </summary>
        public void RewardEfficientPreparation(float timeSpent)
        {
            if (timeSpent < 60f) // Under 1 minute
            {
                int bonus = 50;
                GiveXP(bonus, "⚡ Efficient Preparation Bonus!");
                Debug.Log("Fast and prepared!");
            }
        }

        /// <summary>
        /// Reward for thorough preparation (completed all optional actions)
        /// </summary>
        public void RewardThoroughPreparation()
        {
            int bonus = 75;
            GiveXP(bonus, "🎯 Thorough Preparation Bonus!");
            Debug.Log("Left nothing to chance!");
        }

        /// <summary>
        /// Reward for caring for creat multiple times in one session
        /// </summary>
        public void RewardCreatCareMaster(int actionsCompleted)
        {
            if (actionsCompleted >= 5)
            {
                int bonus = 100;
                GiveXP(bonus, "❤️ Creat Care Master Bonus!");
                Debug.Log("Your creat feels truly loved!");
            }
        }

        // === XP DISTRIBUTION ===

        private void GiveXP(int amount, string reason)
        {
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                gameManager.AddXP(amount);
                totalPrepXPEarned += amount;
                Debug.Log($"💫 +{amount} XP: {reason}");
            }
        }

        // === STREAK MANAGEMENT ===

        /// <summary>
        /// Reset streak if player skips a day
        /// </summary>
        public void CheckStreakReset()
        {
            var timeSystem = TimeSystem.Instance;
            if (timeSystem == null) return;

            // If it's a new day and morning routine wasn't done, reset streak
            if (timeSystem.timeOfDay == "Afternoon" && morningRoutinesCompleted == 0)
            {
                if (currentStreak > 0)
                {
                    Debug.Log($"💔 Streak broken! Was at {currentStreak} days.");
                    currentStreak = 0;
                }
            }
        }

        // === STATISTICS ===

        /// <summary>
        /// Show preparation statistics
        /// </summary>
        public void ShowStats()
        {
            Debug.Log("\n=== PREPARATION STATS ===");
            Debug.Log($"Total Prep XP Earned: {totalPrepXPEarned}");
            Debug.Log($"Morning Routines: {morningRoutinesCompleted}");
            Debug.Log($"Current Streak: {currentStreak} days");
            Debug.Log($"Meals Eaten: {mealsEaten}");
            Debug.Log($"Creat Care Sessions: {creatCareSessions}");
            Debug.Log($"Items Crafted: {itemsCrafted}");
            Debug.Log("========================\n");
        }

        /// <summary>
        /// Get XP breakdown for display
        /// </summary>
        public string GetXPBreakdown()
        {
            return $"Preparation XP Breakdown:\n" +
                   $"• Morning Routine: {morningRoutineXP} XP\n" +
                   $"• Eat Food: {eatFoodXP} XP\n" +
                   $"• Rest: {restXP} XP\n" +
                   $"• Feed Creat: {feedCreatXP} XP\n" +
                   $"• Pet Creat: {petCreatXP} XP\n" +
                   $"• Play with Creat: {playWithCreatXP} XP\n" +
                   $"• Craft Item: {craftItemXP} XP\n" +
                   $"• Quest Prep: {questPrepCompleteXP} XP\n" +
                   $"• Boss Prep: {bossPrepCompleteXP} XP\n" +
                   $"• Camp Setup: {campSetupXP} XP\n" +
                   $"• Full Prep Bonus: {fullPreparationBonusXP} XP\n" +
                   $"• Daily Streak: +{consecutiveDaysBonus} XP per day";
        }
    }
}
