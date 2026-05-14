using System.Collections.Generic;
using UnityEngine;

namespace GatherTheCrown.Systems
{
    public enum TavernActivity
    {
        Eating,
        Drinking,
        Darts,
        CardGame,
        DiceGame,
        ArmWrestling,
        CreatRacing,
        Storytelling,
        Trading,
        Socializing
    }

    [System.Serializable]
    public class TavernPlayer
    {
        public string playerId;
        public string playerName;
        public int level;
        public string creatElement;
        public bool isOnline;
        public TavernActivity currentActivity;
        public int gold;
        public Vector3 position;
    }

    [System.Serializable]
    public class MiniGame
    {
        public string gameId;
        public TavernActivity type;
        public int entryFee;
        public int maxPlayers;
        public List<string> currentPlayers = new List<string>();
        public int potTotal;
        public bool inProgress;
    }

    public class TavernSystem : MonoBehaviour
    {
        private static TavernSystem _instance;
        public static TavernSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<TavernSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("TavernSystem");
                        _instance = go.AddComponent<TavernSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Tavern State")]
        public bool isInTavern = false;
        public string currentTavernLocation = "Home Base Tavern";
        public List<TavernPlayer> playersInTavern = new List<TavernPlayer>();
        public List<MiniGame> activeGames = new List<MiniGame>();

        [Header("Settings")]
        public bool open24Hours = true;
        public int maxPlayersPerTavern = 50;
        public float activityXPMultiplier = 1.5f; // Bonus XP in tavern

        [Header("Menu & Food")]
        public Dictionary<string, int> foodMenu = new Dictionary<string, int>
        {
            { "Ale", 5 },
            { "Mead", 10 },
            { "Roasted Meat", 15 },
            { "Stew", 20 },
            { "Bread", 5 },
            { "Cheese Platter", 12 },
            { "Fruit Bowl", 8 },
            { "Premium Feast", 50 }
        };

        [Header("Mini-Game Stakes")]
        public int dartsMinBet = 10;
        public int dartsMaxBet = 100;
        public int cardGameMinBet = 20;
        public int cardGameMaxBet = 200;
        public int armWrestleMinBet = 15;
        public int armWrestleMaxBet = 150;

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

        // === TAVERN ENTRY/EXIT ===

        /// <summary>
        /// Enter the tavern
        /// </summary>
        public void EnterTavern(string tavernLocation = "Home Base Tavern")
        {
            isInTavern = true;
            currentTavernLocation = tavernLocation;

            Debug.Log($"🍺 Entered {tavernLocation}");
            Debug.Log("Welcome! The tavern is open 24 hours for travelers from all time zones!");
            
            // Add player to tavern
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                var player = new TavernPlayer
                {
                    playerId = SystemInfo.deviceUniqueIdentifier,
                    playerName = "Player", // Would come from profile
                    level = gameManager.playerLevel,
                    creatElement = gameManager.playerCreat?.element.ToString() ?? "None",
                    isOnline = true,
                    currentActivity = TavernActivity.Socializing,
                    position = Vector3.zero
                };
                playersInTavern.Add(player);
            }

            // Show tavern menu
            ShowTavernMenu();

            // Create checkpoint
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.RestPoint,
                tavernLocation,
                "Entered tavern"
            );
        }

        /// <summary>
        /// Leave the tavern
        /// </summary>
        public void LeaveTavern()
        {
            if (!isInTavern) return;

            Debug.Log($"👋 Left {currentTavernLocation}");
            isInTavern = false;

            // Remove player from tavern
            playersInTavern.RemoveAll(p => p.playerId == SystemInfo.deviceUniqueIdentifier);
        }

        private void ShowTavernMenu()
        {
            Debug.Log("\n=== 🍺 TAVERN MENU ===");
            Debug.Log("1. Order Food & Drink");
            Debug.Log("2. Play Darts (Bet gold)");
            Debug.Log("3. Play Card Game (Bet gold)");
            Debug.Log("4. Arm Wrestling (Bet gold)");
            Debug.Log("5. Watch Creat Races");
            Debug.Log("6. Tell Stories (Earn XP)");
            Debug.Log("7. Trade with Players");
            Debug.Log("8. View Players in Tavern");
            Debug.Log("9. Open Chat (Press Enter)");
            Debug.Log("0. Leave Tavern");
            Debug.Log("======================\n");
        }

        // === FOOD & DRINK ===

        /// <summary>
        /// Order food or drink
        /// </summary>
        public void OrderItem(string itemName)
        {
            if (!isInTavern)
            {
                Debug.LogWarning("You must be in a tavern to order!");
                return;
            }

            if (!foodMenu.ContainsKey(itemName))
            {
                Debug.LogWarning($"{itemName} not on menu!");
                return;
            }

            int cost = foodMenu[itemName];
            var prep = PreparationSystem.Instance;
            
            if (prep == null || prep.gold < cost)
            {
                Debug.LogWarning($"Not enough gold! Need {cost}g");
                return;
            }

            // Pay for item
            prep.gold -= cost;

            // Apply effects based on item
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                if (itemName.Contains("Ale") || itemName.Contains("Mead"))
                {
                    playerNeeds.Drink(itemName, 30f);
                    playerNeeds.energy = Mathf.Min(100, playerNeeds.energy + 10f);
                }
                else
                {
                    playerNeeds.Eat(itemName, 40f);
                }
            }

            // Bonus XP for eating in tavern (social bonus)
            int xp = (int)(cost * activityXPMultiplier);
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                gameManager.AddXP(xp);
            }

            Debug.Log($"🍺 Ordered {itemName} for {cost}g (+{xp} XP social bonus!)");

            // Track analytics
            GameAnalyticsSystem.Instance?.TrackPreparationChoice($"tavern_order_{itemName}", $"Ordered {itemName}");
        }

        /// <summary>
        /// Show food menu
        /// </summary>
        public void ShowFoodMenu()
        {
            Debug.Log("\n=== 🍖 FOOD & DRINK MENU ===");
            foreach (var item in foodMenu)
            {
                Debug.Log($"{item.Key}: {item.Value}g");
            }
            Debug.Log("============================\n");
        }

        // === MINI-GAMES ===

        /// <summary>
        /// Start a darts game
        /// </summary>
        public void StartDartsGame(int betAmount)
        {
            if (!isInTavern) return;

            if (betAmount < dartsMinBet || betAmount > dartsMaxBet)
            {
                Debug.LogWarning($"Bet must be between {dartsMinBet}g and {dartsMaxBet}g");
                return;
            }

            var prep = PreparationSystem.Instance;
            if (prep == null || prep.gold < betAmount)
            {
                Debug.LogWarning("Not enough gold!");
                return;
            }

            // Create game
            var game = new MiniGame
            {
                gameId = System.Guid.NewGuid().ToString(),
                type = TavernActivity.Darts,
                entryFee = betAmount,
                maxPlayers = 4,
                potTotal = betAmount
            };
            game.currentPlayers.Add(SystemInfo.deviceUniqueIdentifier);
            activeGames.Add(game);

            // Pay entry fee
            prep.gold -= betAmount;

            Debug.Log($"🎯 Started Darts game! Bet: {betAmount}g");
            Debug.Log("Waiting for other players to join...");
            Debug.Log("Press Space to throw dart!");

            // Track analytics
            GameAnalyticsSystem.Instance?.TrackPreparationChoice("tavern_darts", $"Played darts, bet {betAmount}g");
        }

        /// <summary>
        /// Play darts (simple skill-based game)
        /// </summary>
        public void ThrowDart()
        {
            // Simple random with skill factor
            int score = Random.Range(0, 100);
            
            // Player level affects accuracy
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                score += gameManager.playerLevel * 2;
            }

            Debug.Log($"🎯 Dart Score: {score}");

            if (score >= 80)
            {
                Debug.Log("🏆 Bullseye! You win!");
                WinMiniGame(TavernActivity.Darts);
            }
            else if (score >= 60)
            {
                Debug.Log("👍 Good throw!");
            }
            else
            {
                Debug.Log("😅 Better luck next time!");
            }
        }

        /// <summary>
        /// Start card game
        /// </summary>
        public void StartCardGame(int betAmount)
        {
            if (!isInTavern) return;

            if (betAmount < cardGameMinBet || betAmount > cardGameMaxBet)
            {
                Debug.LogWarning($"Bet must be between {cardGameMinBet}g and {cardGameMaxBet}g");
                return;
            }

            var prep = PreparationSystem.Instance;
            if (prep == null || prep.gold < betAmount)
            {
                Debug.LogWarning("Not enough gold!");
                return;
            }

            prep.gold -= betAmount;

            Debug.Log($"🃏 Started Card game! Bet: {betAmount}g");
            Debug.Log("Drawing cards...");

            // Simple card game simulation
            int playerHand = Random.Range(1, 21);
            int opponentHand = Random.Range(1, 21);

            Debug.Log($"Your hand: {playerHand}");
            Debug.Log($"Opponent: {opponentHand}");

            if (playerHand > opponentHand)
            {
                int winnings = betAmount * 2;
                prep.gold += winnings;
                Debug.Log($"🏆 You win {winnings}g!");
                
                // Bonus XP
                var gameManager = GameManager.Instance;
                if (gameManager != null)
                {
                    gameManager.AddXP(betAmount / 2);
                }
            }
            else if (playerHand == opponentHand)
            {
                prep.gold += betAmount;
                Debug.Log("🤝 Draw! Bet returned.");
            }
            else
            {
                Debug.Log("😞 You lose!");
            }

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("tavern_cards", $"Played cards, bet {betAmount}g");
        }

        /// <summary>
        /// Arm wrestling challenge
        /// </summary>
        public void ArmWrestle(int betAmount)
        {
            if (!isInTavern) return;

            var prep = PreparationSystem.Instance;
            if (prep == null || prep.gold < betAmount)
            {
                Debug.LogWarning("Not enough gold!");
                return;
            }

            prep.gold -= betAmount;

            Debug.Log($"💪 Arm Wrestling! Bet: {betAmount}g");
            Debug.Log("Mash Space to win!");

            // Strength based on player level and creat bond
            var gameManager = GameManager.Instance;
            int strength = Random.Range(1, 100);
            
            if (gameManager != null)
            {
                strength += gameManager.playerLevel * 3;
                if (gameManager.playerCreat != null)
                {
                    strength += gameManager.playerCreat.bondLevel / 2;
                }
            }

            int opponentStrength = Random.Range(50, 150);

            if (strength > opponentStrength)
            {
                int winnings = betAmount * 2;
                prep.gold += winnings;
                Debug.Log($"💪 You win! +{winnings}g");
            }
            else
            {
                Debug.Log("😓 You lose!");
            }

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("tavern_armwrestle", $"Arm wrestled, bet {betAmount}g");
        }

        private void WinMiniGame(TavernActivity gameType)
        {
            var game = activeGames.Find(g => g.type == gameType && !g.inProgress);
            if (game != null)
            {
                var prep = PreparationSystem.Instance;
                if (prep != null)
                {
                    prep.gold += game.potTotal;
                    Debug.Log($"💰 Won {game.potTotal}g from the pot!");
                }
                activeGames.Remove(game);
            }
        }

        // === SOCIAL FEATURES ===

        /// <summary>
        /// Tell a story to other players (earn XP)
        /// </summary>
        public void TellStory()
        {
            if (!isInTavern) return;

            Debug.Log("📖 You tell an epic tale of your adventures...");
            
            // Earn XP based on player level and audience
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                int audienceSize = playersInTavern.Count;
                int xp = 50 + (audienceSize * 10);
                gameManager.AddXP(xp);
                Debug.Log($"✨ The crowd loves it! +{xp} XP");
            }

            // Increase creat happiness
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.creatHappiness = Mathf.Min(100, playerNeeds.creatHappiness + 10f);
            }

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("tavern_story", "Told story");
        }

        /// <summary>
        /// View players currently in tavern
        /// </summary>
        public void ViewPlayers()
        {
            Debug.Log($"\n=== Players in {currentTavernLocation} ({playersInTavern.Count}/{maxPlayersPerTavern}) ===");
            
            foreach (var player in playersInTavern)
            {
                string activity = player.currentActivity.ToString();
                Debug.Log($"• {player.playerName} (Lv.{player.level}) - {player.creatElement} - {activity}");
            }
            
            Debug.Log("=================================\n");
        }

        /// <summary>
        /// Send friend request
        /// </summary>
        public void SendFriendRequest(string targetPlayerId)
        {
            Debug.Log($"📨 Friend request sent to player {targetPlayerId}");
            // Would integrate with multiplayer system
        }

        // === OVERNIGHT STAY ===

        /// <summary>
        /// Rent a room for the night (2-3 nights)
        /// </summary>
        public void RentRoom(int nights = 1)
        {
            if (!isInTavern) return;

            int costPerNight = 50;
            int totalCost = costPerNight * nights;

            var prep = PreparationSystem.Instance;
            if (prep == null || prep.gold < totalCost)
            {
                Debug.LogWarning($"Not enough gold! Need {totalCost}g");
                return;
            }

            prep.gold -= totalCost;

            Debug.Log($"🛏️ Rented room for {nights} night(s) - {totalCost}g");
            Debug.Log("You and your creat rest comfortably...");

            // Full restoration
            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.FullRestore();
            }

            // Advance time
            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                timeSystem.AdvanceTime(nights * 1440f); // 24 hours per night
            }

            // Bonus XP for good rest
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                int xp = 100 * nights;
                gameManager.AddXP(xp);
                Debug.Log($"💫 Well rested! +{xp} XP");
            }

            // Create checkpoint
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.RestPoint,
                currentTavernLocation,
                $"Rested {nights} night(s) at tavern"
            );

            GameAnalyticsSystem.Instance?.TrackPreparationChoice("tavern_room", $"Rented room for {nights} nights");
        }

        // === STATISTICS ===

        /// <summary>
        /// Get tavern statistics
        /// </summary>
        public void ShowTavernStats()
        {
            Debug.Log("\n=== 🍺 TAVERN STATS ===");
            Debug.Log($"Location: {currentTavernLocation}");
            Debug.Log($"Players Online: {playersInTavern.Count}");
            Debug.Log($"Active Games: {activeGames.Count}");
            Debug.Log($"Open 24/7: {(open24Hours ? "Yes" : "No")}");
            Debug.Log("=======================\n");
        }
    }
}
