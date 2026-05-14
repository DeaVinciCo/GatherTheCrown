using UnityEngine;
using GatherTheCrown.Core;
using GatherTheCrown.Systems;

namespace GatherTheCrown
{
    public class GameManager : MonoBehaviour
    {
        private static GameManager _instance;
        public static GameManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<GameManager>();
                }
                return _instance;
            }
        }

        [Header("Player")]
        public Creat playerCreat;
        public int playerLevel = 1;
        public int playerXP = 0;

        [Header("References")]
        public QuestManager questManager;

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

        void Start()
        {
            InitializeGame();
        }

        void Update()
        {
            // Quest controls
            if (Input.GetKeyDown(KeyCode.Q))
            {
                TestStartQuest();
            }

            if (Input.GetKeyDown(KeyCode.E))
            {
                TestUpdateObjective();
            }

            // Creat controls
            if (Input.GetKeyDown(KeyCode.L))
            {
                if (playerCreat != null)
                {
                    playerCreat.LevelUp();
                }
            }

            if (Input.GetKeyDown(KeyCode.B))
            {
                if (playerCreat != null)
                {
                    playerCreat.IncreaseBond(10);
                }
            }

            // Preparation controls
            if (Input.GetKeyDown(KeyCode.P))
            {
                EnterPreparation();
            }

            // Needs controls
            if (Input.GetKeyDown(KeyCode.Alpha1))
            {
                PreparationSystem.Instance?.EatFood("bread");
            }

            if (Input.GetKeyDown(KeyCode.Alpha2))
            {
                PreparationSystem.Instance?.DrinkWater();
            }

            if (Input.GetKeyDown(KeyCode.Alpha3))
            {
                PreparationSystem.Instance?.Rest(1f);
            }

            if (Input.GetKeyDown(KeyCode.Alpha4))
            {
                PreparationSystem.Instance?.FeedCreat();
            }

            if (Input.GetKeyDown(KeyCode.Alpha5))
            {
                PreparationSystem.Instance?.PetCreat();
            }

            // Save/Load controls
            if (Input.GetKeyDown(KeyCode.F5))
            {
                CheckpointSystem.Instance?.QuickSave();
            }

            if (Input.GetKeyDown(KeyCode.F9))
            {
                CheckpointSystem.Instance?.QuickLoad();
            }

            // Status
            if (Input.GetKeyDown(KeyCode.Tab))
            {
                PreparationSystem.Instance?.ShowStatus();
            }

            // Time controls
            if (Input.GetKeyDown(KeyCode.T))
            {
                var timeSystem = TimeSystem.Instance;
                if (timeSystem != null)
                {
                    Debug.Log(timeSystem.GetFullTimeString());
                }
            }

            if (Input.GetKeyDown(KeyCode.N))
            {
                TimeSystem.Instance?.RestUntilMorning();
            }

            // Interactive Cutscene controls
            if (Input.GetKeyDown(KeyCode.M))
            {
                InteractiveCutsceneSystem.Instance?.PlayMorningRoutine();
            }

            if (Input.GetKeyDown(KeyCode.C))
            {
                InteractiveCutsceneSystem.Instance?.PlayCampSetup();
            }

            if (Input.GetKeyDown(KeyCode.R))
            {
                var activeQuests = questManager?.GetActiveQuests();
                if (activeQuests != null && activeQuests.Count > 0)
                {
                    InteractiveCutsceneSystem.Instance?.PlayQuestPreparation(activeQuests[0].questName);
                }
                else
                {
                    InteractiveCutsceneSystem.Instance?.PlayQuestPreparation("Next Quest");
                }
            }

            // Tavern controls
            if (Input.GetKeyDown(KeyCode.V))
            {
                var tavern = TavernSystem.Instance;
                if (tavern != null)
                {
                    if (tavern.isInTavern)
                    {
                        tavern.LeaveTavern();
                    }
                    else
                    {
                        tavern.EnterTavern();
                    }
                }
            }

            // Chat is handled by ChatSystem (Enter key)
        }

        private void InitializeGame()
        {
            Debug.Log("🎮 Gather the Crown: Creats and Foes - Initializing...");

            // Get or create QuestManager
            questManager = QuestManager.Instance;

            // Create player creat if not assigned
            if (playerCreat == null)
            {
                CreatePlayerCreat();
            }

            Debug.Log("✅ Game initialized! Press Q to start first quest, E to update objectives");
            Debug.Log("Press L to level up creat, B to increase bond");
            Debug.Log("Press P for Preparation Menu");
            Debug.Log("Press 1-5 for quick actions (Eat/Drink/Rest/Feed/Pet)");
            Debug.Log("Press F5 to Quick Save, F9 to Quick Load");
            Debug.Log("Press Tab for Status, T for Time, N to Rest Until Morning");
            Debug.Log("Press M for Morning Routine, C for Camp Setup, R for Quest Prep");
            Debug.Log("Press V to Enter Tavern, Enter to Open Chat");
        }

        private void CreatePlayerCreat()
        {
            GameObject creatObj = new GameObject("PlayerCreat");
            playerCreat = creatObj.AddComponent<Creat>();
            playerCreat.creatName = "Starter";
            playerCreat.element = CreatElement.Fire;
            playerCreat.stage = CreatStage.Hatchling;
            playerCreat.level = 1;
            playerCreat.bondLevel = 10;

            // Position in front of camera
            creatObj.transform.position = new Vector3(0, 1, 5);

            Debug.Log($"🐉 Created {playerCreat.creatName} - {playerCreat.element} element");
        }

        private void TestStartQuest()
        {
            if (questManager != null)
            {
                var availableQuests = questManager.GetAvailableQuests();
                if (availableQuests.Count > 0)
                {
                    var quest = availableQuests[0];
                    questManager.StartQuest(quest.id);
                    Debug.Log($"Started quest: {quest.questName}");
                }
                else
                {
                    Debug.Log("No available quests");
                }
            }
        }

        private void TestUpdateObjective()
        {
            if (questManager != null)
            {
                var activeQuests = questManager.GetActiveQuests();
                if (activeQuests.Count > 0)
                {
                    var quest = activeQuests[0];
                    if (quest.objectives.Count > 0)
                    {
                        var objective = quest.objectives[0];
                        questManager.UpdateQuestObjective(quest.id, objective.id, 1);
                    }
                }
                else
                {
                    Debug.Log("No active quests");
                }
            }
        }

        public void AddXP(int amount)
        {
            playerXP += amount;
            Debug.Log($"Gained {amount} XP. Total: {playerXP}");

            // Simple level up system
            int xpNeeded = playerLevel * 1000;
            if (playerXP >= xpNeeded)
            {
                playerLevel++;
                playerXP -= xpNeeded;
                Debug.Log($"🎉 Level Up! Now level {playerLevel}");

                if (questManager != null)
                {
                    questManager.SetPlayerLevel(playerLevel);
                }

                if (playerCreat != null)
                {
                    playerCreat.LevelUp();
                }
            }
        }

        public void ShowQuestStats()
        {
            if (questManager != null)
            {
                var stats = questManager.GetStats();
                Debug.Log($"📊 Quest Stats:");
                Debug.Log($"  Total: {stats["total"]}");
                Debug.Log($"  Active: {stats["active"]}");
                Debug.Log($"  Completed: {stats["completed"]}");
                Debug.Log($"  Available: {stats["available"]}");
            }
        }

        public void EnterPreparation()
        {
            var prep = PreparationSystem.Instance;
            if (prep != null)
            {
                prep.EnterPreparationMode("Camp");
            }
        }
    }
}
