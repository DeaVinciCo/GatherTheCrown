using System;
using System.Collections.Generic;
using UnityEngine;

namespace GatherTheCrown.Systems
{
    public enum CheckpointType
    {
        Manual,              // Player manually saved
        BeforeQuest,         // Auto-save before starting quest
        BeforeCutscene,      // Auto-save before cutscene plays
        QuestComplete,       // Auto-save after quest completion
        AreaDiscovered,      // Auto-save when entering new area
        BeforeBoss,          // Auto-save before boss fight
        AfterBoss,           // Auto-save after boss defeated
        KingdomCleared,      // Auto-save after clearing kingdom vault
        LevelUp,             // Auto-save on level up
        Evolution,           // Auto-save when creat evolves
        RestPoint,           // Save at camp/inn/home base
        ShopVisit,           // Save after shopping
        CraftingComplete,    // Save after crafting items
        ImportantChoice      // Save before major story choice
    }

    [System.Serializable]
    public class Checkpoint
    {
        public string id;
        public CheckpointType type;
        public DateTime timestamp;
        public string location;
        public string description;
        
        // Player state
        public int playerLevel;
        public int playerXP;
        public float playerHP;
        public float playerEnergy;
        public float playerHunger;
        
        // Creat state
        public string creatName;
        public int creatLevel;
        public int creatBondLevel;
        public float creatHP;
        public string creatStage;
        
        // Progress
        public List<string> completedQuests;
        public List<string> activeQuests;
        public List<string> discoveredAreas;
        public List<string> clearedKingdoms;
        
        // Inventory
        public int gold;
        public Dictionary<string, int> inventory;
        
        // Time
        public float gameTime;
        public bool isNight;
    }

    public class CheckpointSystem : MonoBehaviour
    {
        private static CheckpointSystem _instance;
        public static CheckpointSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<CheckpointSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("CheckpointSystem");
                        _instance = go.AddComponent<CheckpointSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Settings")]
        public bool autoSaveEnabled = true;
        public float autoSaveInterval = 300f; // 5 minutes
        public int maxCheckpoints = 10;

        [Header("Current State")]
        public Checkpoint lastCheckpoint;
        public List<Checkpoint> checkpointHistory = new List<Checkpoint>();

        private float autoSaveTimer = 0f;

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
            if (autoSaveEnabled)
            {
                autoSaveTimer += Time.deltaTime;
                if (autoSaveTimer >= autoSaveInterval)
                {
                    autoSaveTimer = 0f;
                    CreateCheckpoint(CheckpointType.Manual, "Auto-save", "Periodic auto-save");
                }
            }
        }

        /// <summary>
        /// Create a checkpoint at current game state
        /// </summary>
        public Checkpoint CreateCheckpoint(CheckpointType type, string location, string description)
        {
            var checkpoint = new Checkpoint
            {
                id = Guid.NewGuid().ToString(),
                type = type,
                timestamp = DateTime.Now,
                location = location,
                description = description,
                completedQuests = new List<string>(),
                activeQuests = new List<string>(),
                discoveredAreas = new List<string>(),
                clearedKingdoms = new List<string>(),
                inventory = new Dictionary<string, int>()
            };

            // Capture current game state
            CaptureGameState(checkpoint);

            // Add to history
            checkpointHistory.Add(checkpoint);
            lastCheckpoint = checkpoint;

            // Limit checkpoint history
            if (checkpointHistory.Count > maxCheckpoints)
            {
                checkpointHistory.RemoveAt(0);
            }

            // Save to disk
            SaveCheckpointToDisk(checkpoint);

            Debug.Log($"💾 Checkpoint Created: {type} - {description}");
            return checkpoint;
        }

        private void CaptureGameState(Checkpoint checkpoint)
        {
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                checkpoint.playerLevel = gameManager.playerLevel;
                checkpoint.playerXP = gameManager.playerXP;

                if (gameManager.playerCreat != null)
                {
                    var creat = gameManager.playerCreat;
                    checkpoint.creatName = creat.creatName;
                    checkpoint.creatLevel = creat.level;
                    checkpoint.creatBondLevel = creat.bondLevel;
                    checkpoint.creatHP = creat.stats.hp;
                    checkpoint.creatStage = creat.stage.ToString();
                }
            }

            var questManager = QuestManager.Instance;
            if (questManager != null)
            {
                var activeQuests = questManager.GetActiveQuests();
                foreach (var quest in activeQuests)
                {
                    checkpoint.activeQuests.Add(quest.id);
                }
            }

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                checkpoint.playerHP = playerNeeds.health;
                checkpoint.playerEnergy = playerNeeds.energy;
                checkpoint.playerHunger = playerNeeds.hunger;
            }

            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                checkpoint.gameTime = timeSystem.currentTime;
                checkpoint.isNight = timeSystem.IsNight();
            }
        }

        /// <summary>
        /// Load a checkpoint and restore game state
        /// </summary>
        public void LoadCheckpoint(Checkpoint checkpoint)
        {
            if (checkpoint == null)
            {
                Debug.LogWarning("Cannot load null checkpoint");
                return;
            }

            Debug.Log($"📂 Loading Checkpoint: {checkpoint.description}");

            // Restore game state
            RestoreGameState(checkpoint);

            lastCheckpoint = checkpoint;
            Debug.Log("✅ Checkpoint loaded successfully");
        }

        private void RestoreGameState(Checkpoint checkpoint)
        {
            var gameManager = GameManager.Instance;
            if (gameManager != null)
            {
                gameManager.playerLevel = checkpoint.playerLevel;
                gameManager.playerXP = checkpoint.playerXP;

                if (gameManager.playerCreat != null)
                {
                    var creat = gameManager.playerCreat;
                    creat.creatName = checkpoint.creatName;
                    creat.level = checkpoint.creatLevel;
                    creat.bondLevel = checkpoint.creatBondLevel;
                    creat.stats.hp = checkpoint.creatHP;
                }
            }

            var playerNeeds = PlayerNeedsSystem.Instance;
            if (playerNeeds != null)
            {
                playerNeeds.health = checkpoint.playerHP;
                playerNeeds.energy = checkpoint.playerEnergy;
                playerNeeds.hunger = checkpoint.playerHunger;
            }

            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null)
            {
                timeSystem.currentTime = checkpoint.gameTime;
            }
        }

        private void SaveCheckpointToDisk(Checkpoint checkpoint)
        {
            string json = JsonUtility.ToJson(checkpoint, true);
            string path = Application.persistentDataPath + $"/checkpoint_{checkpoint.id}.json";
            System.IO.File.WriteAllText(path, json);
            Debug.Log($"Saved to: {path}");
        }

        public Checkpoint LoadCheckpointFromDisk(string checkpointId)
        {
            string path = Application.persistentDataPath + $"/checkpoint_{checkpointId}.json";
            if (System.IO.File.Exists(path))
            {
                string json = System.IO.File.ReadAllText(path);
                return JsonUtility.FromJson<Checkpoint>(json);
            }
            return null;
        }

        /// <summary>
        /// Get the most recent checkpoint
        /// </summary>
        public Checkpoint GetLastCheckpoint()
        {
            return lastCheckpoint;
        }

        /// <summary>
        /// Quick save - creates manual checkpoint
        /// </summary>
        public void QuickSave()
        {
            CreateCheckpoint(CheckpointType.Manual, "Quick Save", "Player quick save");
        }

        /// <summary>
        /// Quick load - loads last checkpoint
        /// </summary>
        public void QuickLoad()
        {
            if (lastCheckpoint != null)
            {
                LoadCheckpoint(lastCheckpoint);
            }
            else
            {
                Debug.LogWarning("No checkpoint to load");
            }
        }
    }
}
