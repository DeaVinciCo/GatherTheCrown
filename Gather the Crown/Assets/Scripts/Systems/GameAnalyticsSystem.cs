using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.Networking;
using System.Collections;

namespace GatherTheCrown.Systems
{
    [System.Serializable]
    public class ChoiceData
    {
        public string choiceId;
        public string choiceName;
        public string category; // quest, story, combat, preparation, etc.
        public int timesChosen;
        public DateTime firstChosen;
        public DateTime lastChosen;
        public List<string> playerIds = new List<string>(); // Anonymous player IDs
    }

    [System.Serializable]
    public class PlayerStats
    {
        public string playerId;
        public DateTime firstPlayed;
        public DateTime lastPlayed;
        public float totalPlayTime;
        public int questsCompleted;
        public int deathCount;
        public int creatEvolutions;
        public int maxBondLevel;
        public string favoriteElement;
        public List<string> choicesMade = new List<string>();
        public Dictionary<string, int> achievements = new Dictionary<string, int>();
    }

    [System.Serializable]
    public class GlobalStats
    {
        public int totalPlayers;
        public int totalQuestsCompleted;
        public int totalDeaths;
        public int totalPlayTimeHours;
        public Dictionary<string, ChoiceData> choices = new Dictionary<string, ChoiceData>();
        public Dictionary<string, int> elementPopularity = new Dictionary<string, int>();
        public Dictionary<string, int> questCompletionRates = new Dictionary<string, int>();
        public Dictionary<string, int> deathLocations = new Dictionary<string, int>();
        public DateTime lastUpdated;
    }

    [System.Serializable]
    public class AnalyticsExport
    {
        public GlobalStats globalStats;
        public List<ChoiceData> topChoices;
        public List<KeyValuePair<string, float>> choicePercentages;
        public string gameVersion;
        public DateTime exportDate;
    }

    public class GameAnalyticsSystem : MonoBehaviour
    {
        private static GameAnalyticsSystem _instance;
        public static GameAnalyticsSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<GameAnalyticsSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("GameAnalyticsSystem");
                        _instance = go.AddComponent<GameAnalyticsSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Settings")]
        public bool trackingEnabled = true;
        public bool sendToServer = false; // Enable when you have a server
        public string serverUrl = "https://your-game-website.com/api/analytics";
        public string gameVersion = "0.1.0";

        [Header("Current Session")]
        public PlayerStats currentPlayer;
        public GlobalStats globalStats;
        public float sessionStartTime;

        [Header("Privacy")]
        public bool anonymousTracking = true; // No personal data
        public bool allowDataSharing = true; // Player can opt-out

        private string playerIdKey = "GTC_PlayerID";
        private string statsFilePath;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            statsFilePath = Application.persistentDataPath + "/analytics.json";
            InitializeAnalytics();
        }

        void OnApplicationQuit()
        {
            SaveAnalytics();
        }

        private void InitializeAnalytics()
        {
            // Generate or load anonymous player ID
            if (!PlayerPrefs.HasKey(playerIdKey))
            {
                PlayerPrefs.SetString(playerIdKey, Guid.NewGuid().ToString());
            }

            // Initialize current player
            currentPlayer = new PlayerStats
            {
                playerId = PlayerPrefs.GetString(playerIdKey),
                firstPlayed = DateTime.Now,
                lastPlayed = DateTime.Now,
                totalPlayTime = 0f
            };

            // Load global stats
            LoadAnalytics();

            sessionStartTime = Time.time;

            Debug.Log($"📊 Analytics initialized. Player ID: {currentPlayer.playerId.Substring(0, 8)}...");
        }

        void Update()
        {
            if (trackingEnabled)
            {
                currentPlayer.totalPlayTime = Time.time - sessionStartTime;
            }
        }

        // === CHOICE TRACKING ===

        /// <summary>
        /// Track a player choice
        /// </summary>
        public void TrackChoice(string choiceId, string choiceName, string category)
        {
            if (!trackingEnabled || !allowDataSharing) return;

            Debug.Log($"📊 Tracking choice: {choiceName}");

            // Add to player's choices
            if (!currentPlayer.choicesMade.Contains(choiceId))
            {
                currentPlayer.choicesMade.Add(choiceId);
            }

            // Update global stats
            if (!globalStats.choices.ContainsKey(choiceId))
            {
                globalStats.choices[choiceId] = new ChoiceData
                {
                    choiceId = choiceId,
                    choiceName = choiceName,
                    category = category,
                    timesChosen = 0,
                    firstChosen = DateTime.Now
                };
            }

            var choice = globalStats.choices[choiceId];
            choice.timesChosen++;
            choice.lastChosen = DateTime.Now;
            
            if (!choice.playerIds.Contains(currentPlayer.playerId))
            {
                choice.playerIds.Add(currentPlayer.playerId);
            }

            // Auto-save periodically
            if (choice.timesChosen % 10 == 0)
            {
                SaveAnalytics();
            }
        }

        /// <summary>
        /// Track quest choice (Home Base vs Sylvara, etc.)
        /// </summary>
        public void TrackQuestChoice(string questId, string choiceId, string choiceText)
        {
            TrackChoice($"quest_{questId}_{choiceId}", choiceText, "quest");
        }

        /// <summary>
        /// Track story choice
        /// </summary>
        public void TrackStoryChoice(string choiceId, string choiceText)
        {
            TrackChoice($"story_{choiceId}", choiceText, "story");
        }

        /// <summary>
        /// Track combat choice (strategy, tactics)
        /// </summary>
        public void TrackCombatChoice(string choiceId, string choiceText)
        {
            TrackChoice($"combat_{choiceId}", choiceText, "combat");
        }

        /// <summary>
        /// Track preparation choice
        /// </summary>
        public void TrackPreparationChoice(string choiceId, string choiceText)
        {
            TrackChoice($"prep_{choiceId}", choiceText, "preparation");
        }

        // === GAMEPLAY TRACKING ===

        /// <summary>
        /// Track quest completion
        /// </summary>
        public void TrackQuestComplete(string questId)
        {
            if (!trackingEnabled) return;

            currentPlayer.questsCompleted++;
            globalStats.totalQuestsCompleted++;

            if (!globalStats.questCompletionRates.ContainsKey(questId))
            {
                globalStats.questCompletionRates[questId] = 0;
            }
            globalStats.questCompletionRates[questId]++;

            Debug.Log($"📊 Quest completed: {questId}");
        }

        /// <summary>
        /// Track player death
        /// </summary>
        public void TrackDeath(string location, string cause)
        {
            if (!trackingEnabled) return;

            currentPlayer.deathCount++;
            globalStats.totalDeaths++;

            string deathKey = $"{location}_{cause}";
            if (!globalStats.deathLocations.ContainsKey(deathKey))
            {
                globalStats.deathLocations[deathKey] = 0;
            }
            globalStats.deathLocations[deathKey]++;

            Debug.Log($"📊 Death tracked: {location} - {cause}");
        }

        /// <summary>
        /// Track creat element choice
        /// </summary>
        public void TrackCreatElement(string element)
        {
            if (!trackingEnabled) return;

            currentPlayer.favoriteElement = element;

            if (!globalStats.elementPopularity.ContainsKey(element))
            {
                globalStats.elementPopularity[element] = 0;
            }
            globalStats.elementPopularity[element]++;

            TrackChoice($"element_{element}", $"Chose {element} element", "creat");
        }

        /// <summary>
        /// Track creat evolution
        /// </summary>
        public void TrackCreatEvolution(string fromStage, string toStage)
        {
            if (!trackingEnabled) return;

            currentPlayer.creatEvolutions++;
            Debug.Log($"📊 Evolution tracked: {fromStage} → {toStage}");
        }

        /// <summary>
        /// Track bond level milestone
        /// </summary>
        public void TrackBondMilestone(int bondLevel)
        {
            if (!trackingEnabled) return;

            if (bondLevel > currentPlayer.maxBondLevel)
            {
                currentPlayer.maxBondLevel = bondLevel;
                Debug.Log($"📊 New max bond level: {bondLevel}");
            }
        }

        // === STATISTICS & PERCENTAGES ===

        /// <summary>
        /// Get percentage of players who made a choice
        /// </summary>
        public float GetChoicePercentage(string choiceId)
        {
            if (!globalStats.choices.ContainsKey(choiceId))
                return 0f;

            var choice = globalStats.choices[choiceId];
            int uniquePlayers = choice.playerIds.Count;
            
            if (globalStats.totalPlayers == 0)
                return 0f;

            return (float)uniquePlayers / globalStats.totalPlayers * 100f;
        }

        /// <summary>
        /// Get choice comparison (for A vs B choices)
        /// </summary>
        public Dictionary<string, float> GetChoiceComparison(string choiceA, string choiceB)
        {
            float percentA = GetChoicePercentage(choiceA);
            float percentB = GetChoicePercentage(choiceB);

            return new Dictionary<string, float>
            {
                { choiceA, percentA },
                { choiceB, percentB }
            };
        }

        /// <summary>
        /// Get most popular choices in a category
        /// </summary>
        public List<ChoiceData> GetTopChoices(string category, int count = 10)
        {
            return globalStats.choices.Values
                .Where(c => c.category == category)
                .OrderByDescending(c => c.playerIds.Count)
                .Take(count)
                .ToList();
        }

        /// <summary>
        /// Get element popularity ranking
        /// </summary>
        public Dictionary<string, float> GetElementPopularity()
        {
            var result = new Dictionary<string, float>();
            int total = globalStats.elementPopularity.Values.Sum();

            if (total == 0) return result;

            foreach (var kvp in globalStats.elementPopularity)
            {
                result[kvp.Key] = (float)kvp.Value / total * 100f;
            }

            return result.OrderByDescending(x => x.Value).ToDictionary(x => x.Key, x => x.Value);
        }

        /// <summary>
        /// Get quest completion rates
        /// </summary>
        public Dictionary<string, float> GetQuestCompletionRates()
        {
            var result = new Dictionary<string, float>();
            
            foreach (var kvp in globalStats.questCompletionRates)
            {
                float rate = (float)kvp.Value / globalStats.totalPlayers * 100f;
                result[kvp.Key] = rate;
            }

            return result.OrderByDescending(x => x.Value).ToDictionary(x => x.Key, x => x.Value);
        }

        /// <summary>
        /// Get death statistics
        /// </summary>
        public Dictionary<string, int> GetDeathStatistics()
        {
            return globalStats.deathLocations
                .OrderByDescending(x => x.Value)
                .Take(10)
                .ToDictionary(x => x.Key, x => x.Value);
        }

        // === EXPORT & DISPLAY ===

        /// <summary>
        /// Export analytics for website display
        /// </summary>
        public string ExportToJSON()
        {
            var export = new AnalyticsExport
            {
                globalStats = globalStats,
                topChoices = globalStats.choices.Values.OrderByDescending(c => c.playerIds.Count).Take(20).ToList(),
                choicePercentages = new List<KeyValuePair<string, float>>(),
                gameVersion = gameVersion,
                exportDate = DateTime.Now
            };

            // Calculate percentages for all choices
            foreach (var choice in globalStats.choices.Values)
            {
                float percentage = GetChoicePercentage(choice.choiceId);
                export.choicePercentages.Add(new KeyValuePair<string, float>(choice.choiceName, percentage));
            }

            return JsonUtility.ToJson(export, true);
        }

        /// <summary>
        /// Display analytics in console (for testing)
        /// </summary>
        public void DisplayAnalytics()
        {
            Debug.Log("\n=== GAME ANALYTICS ===");
            Debug.Log($"Total Players: {globalStats.totalPlayers}");
            Debug.Log($"Total Quests Completed: {globalStats.totalQuestsCompleted}");
            Debug.Log($"Total Deaths: {globalStats.totalDeaths}");
            Debug.Log($"Total Play Time: {globalStats.totalPlayTimeHours} hours");

            Debug.Log("\n--- Element Popularity ---");
            var elementStats = GetElementPopularity();
            foreach (var kvp in elementStats)
            {
                Debug.Log($"{kvp.Key}: {kvp.Value:F1}%");
            }

            Debug.Log("\n--- Top Choices ---");
            var topChoices = GetTopChoices("quest", 5);
            foreach (var choice in topChoices)
            {
                float percent = GetChoicePercentage(choice.choiceId);
                Debug.Log($"{choice.choiceName}: {percent:F1}% ({choice.playerIds.Count} players)");
            }

            Debug.Log("\n--- Quest Completion Rates ---");
            var questRates = GetQuestCompletionRates();
            foreach (var kvp in questRates.Take(5))
            {
                Debug.Log($"{kvp.Key}: {kvp.Value:F1}%");
            }

            Debug.Log("======================\n");
        }

        /// <summary>
        /// Show choice comparison (like in-game stats screen)
        /// </summary>
        public void ShowChoiceComparison(string choiceA, string choiceB, string choiceAName, string choiceBName)
        {
            var comparison = GetChoiceComparison(choiceA, choiceB);
            
            Debug.Log($"\n--- Choice Comparison ---");
            Debug.Log($"{choiceAName}: {comparison[choiceA]:F1}%");
            Debug.Log($"{choiceBName}: {comparison[choiceB]:F1}%");
            Debug.Log("========================\n");
        }

        // === SAVE/LOAD ===

        private void SaveAnalytics()
        {
            globalStats.lastUpdated = DateTime.Now;
            globalStats.totalPlayTimeHours = currentPlayer.totalPlayTime / 3600f;

            string json = JsonUtility.ToJson(globalStats, true);
            System.IO.File.WriteAllText(statsFilePath, json);
            
            Debug.Log($"📊 Analytics saved to: {statsFilePath}");
        }

        private void LoadAnalytics()
        {
            if (System.IO.File.Exists(statsFilePath))
            {
                string json = System.IO.File.ReadAllText(statsFilePath);
                globalStats = JsonUtility.FromJson<GlobalStats>(json);
                Debug.Log("📊 Analytics loaded from disk");
            }
            else
            {
                globalStats = new GlobalStats
                {
                    totalPlayers = 1,
                    choices = new Dictionary<string, ChoiceData>(),
                    elementPopularity = new Dictionary<string, int>(),
                    questCompletionRates = new Dictionary<string, int>(),
                    deathLocations = new Dictionary<string, int>()
                };
                Debug.Log("📊 New analytics created");
            }
        }

        // === SERVER SYNC (Optional) ===

        /// <summary>
        /// Send analytics to server (for website display)
        /// </summary>
        public void SyncToServer()
        {
            if (!sendToServer || string.IsNullOrEmpty(serverUrl))
            {
                Debug.LogWarning("Server sync disabled or no URL configured");
                return;
            }

            StartCoroutine(SendAnalyticsToServer());
        }

        private IEnumerator SendAnalyticsToServer()
        {
            string json = ExportToJSON();
            
            using (UnityWebRequest request = UnityWebRequest.Post(serverUrl, json, "application/json"))
            {
                yield return request.SendWebRequest();

                if (request.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("📊 Analytics synced to server successfully!");
                }
                else
                {
                    Debug.LogWarning($"📊 Failed to sync analytics: {request.error}");
                }
            }
        }

        /// <summary>
        /// Export analytics to file for manual upload
        /// </summary>
        public void ExportToFile(string filename = "analytics_export.json")
        {
            string path = Application.persistentDataPath + "/" + filename;
            string json = ExportToJSON();
            System.IO.File.WriteAllText(path, json);
            Debug.Log($"📊 Analytics exported to: {path}");
        }
    }
}
