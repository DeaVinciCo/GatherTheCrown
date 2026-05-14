using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace GatherTheCrown.Systems
{
    public enum QuestType
    {
        Main,
        Side,
        Faction,
        KingdomRestoration,
        Creat,
        Legendary,
        Mystery,
        Daily,
        Weekly
    }

    public enum QuestStatus
    {
        Locked,
        Available,
        Active,
        Completed,
        Failed
    }

    [System.Serializable]
    public class QuestObjective
    {
        public string id;
        public string description;
        public string type; // kill, collect, reach, talk, escort, survive, race, craft
        public string target;
        public int current;
        public int required;
        public bool optional;
    }

    [System.Serializable]
    public class QuestReward
    {
        public int xp;
        public int gold;
        public List<string> items = new List<string>();
        public int crownShards;
        public int bondIncrease;
        public List<string> unlocks = new List<string>();
    }

    [System.Serializable]
    public class QuestChoice
    {
        public string id;
        public string text;
        public string consequence;
        public QuestReward rewards;
        public string nextQuest;
    }

    [System.Serializable]
    public class Quest
    {
        public string id;
        public string questName;
        public string description;
        public QuestType type;
        public QuestStatus status;
        public int level;
        public List<QuestObjective> objectives = new List<QuestObjective>();
        public QuestReward rewards;
        public string giver;
        public string location;
        public float timeLimit; // seconds
        public List<string> prerequisites = new List<string>();
        public string nextQuest;
        public List<QuestChoice> choices = new List<QuestChoice>();

        public bool CanStart(HashSet<string> completedQuests, int playerLevel)
        {
            if (status != QuestStatus.Available) return false;
            if (playerLevel < level) return false;
            return prerequisites.All(prereq => completedQuests.Contains(prereq));
        }

        public void Start()
        {
            if (status == QuestStatus.Available)
            {
                status = QuestStatus.Active;
                Debug.Log($"📜 Quest Started: {questName}");
            }
        }

        public void UpdateObjective(string objectiveId, int amount = 1)
        {
            var objective = objectives.FirstOrDefault(obj => obj.id == objectiveId);
            if (objective != null)
            {
                objective.current = Mathf.Min(objective.current + amount, objective.required);
                Debug.Log($"✓ {objective.description}: {objective.current}/{objective.required}");

                if (IsComplete())
                {
                    Complete();
                }
            }
        }

        public bool IsComplete()
        {
            return objectives.Where(obj => !obj.optional).All(obj => obj.current >= obj.required);
        }

        public void Complete()
        {
            if (status == QuestStatus.Active && IsComplete())
            {
                status = QuestStatus.Completed;
                Debug.Log($"🎉 Quest Completed: {questName}");
                Debug.Log($"Rewards: {rewards.xp} XP, {rewards.gold}g");
            }
        }

        public void Fail()
        {
            status = QuestStatus.Failed;
            Debug.Log($"❌ Quest Failed: {questName}");
        }

        public float GetProgress()
        {
            int totalRequired = objectives.Sum(obj => obj.required);
            int totalCurrent = objectives.Sum(obj => obj.current);
            return totalRequired > 0 ? (float)totalCurrent / totalRequired * 100f : 0f;
        }
    }

    public class QuestManager : MonoBehaviour
    {
        private static QuestManager _instance;
        public static QuestManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<QuestManager>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("QuestManager");
                        _instance = go.AddComponent<QuestManager>();
                    }
                }
                return _instance;
            }
        }

        private Dictionary<string, Quest> quests = new Dictionary<string, Quest>();
        private HashSet<string> activeQuests = new HashSet<string>();
        private HashSet<string> completedQuests = new HashSet<string>();
        private int playerLevel = 1;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeQuests();
        }

        private void InitializeQuests()
        {
            // Main Quest 001: The Egg
            AddQuest(new Quest
            {
                id = "main_001",
                questName = "The Egg",
                description = "Discover the mysterious egg in the forest and bring it to Elder Miriam.",
                type = QuestType.Main,
                status = QuestStatus.Available,
                level = 1,
                giver = "Elder Miriam",
                location = "Home Village",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "find_egg", description = "Find the mysterious egg", type = "reach", target = "forest_shrine", current = 0, required = 1, optional = false },
                    new QuestObjective { id = "return_egg", description = "Return to Elder Miriam", type = "talk", target = "elder_miriam", current = 0, required = 1, optional = false }
                },
                rewards = new QuestReward { xp = 500, gold = 100, unlocks = new List<string> { "creat_hatching" } },
                prerequisites = new List<string>(),
                nextQuest = "main_002"
            });

            // Main Quest 002: The Hatching
            AddQuest(new Quest
            {
                id = "main_002",
                questName = "The Hatching",
                description = "Perform the hatching ritual and bond with your creat.",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 1,
                giver = "Elder Miriam",
                location = "Home Village",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "hatch_egg", description = "Complete the hatching ritual", type = "reach", target = "hatching_altar", current = 0, required = 1, optional = false },
                    new QuestObjective { id = "name_creat", description = "Name your creat", type = "talk", target = "creat", current = 0, required = 1, optional = false }
                },
                rewards = new QuestReward { xp = 1000, gold = 200, bondIncrease = 10, unlocks = new List<string> { "creat_bonding", "combat_training" } },
                prerequisites = new List<string> { "main_001" },
                nextQuest = "main_003"
            });

            // Main Quest 003: Village Under Attack
            AddQuest(new Quest
            {
                id = "main_003",
                questName = "Village Under Attack",
                description = "Defend the village from corrupted creats!",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 2,
                giver = "Elder Miriam",
                location = "Home Village",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "defeat_corrupted", description = "Defeat corrupted creats", type = "kill", target = "corrupted_wolf", current = 0, required = 5, optional = false },
                    new QuestObjective { id = "save_villagers", description = "Save villagers", type = "escort", target = "villagers", current = 0, required = 3, optional = true }
                },
                rewards = new QuestReward { xp = 2000, gold = 500, items = new List<string> { "leather_saddle", "basic_sword" } },
                prerequisites = new List<string> { "main_002" },
                nextQuest = "forest_trial_001"
            });

            // Forest Trials
            AddForestTrialQuests();
            AddChoiceQuest();
        }

        private void AddForestTrialQuests()
        {
            // Forest Trial 001: Movement
            AddQuest(new Quest
            {
                id = "forest_trial_001",
                questName = "Forest Trials: Movement",
                description = "Complete the movement trial to prove your riding skills.",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 3,
                giver = "Trainer Kael",
                location = "Forest Trials",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "complete_course", description = "Complete the obstacle course", type = "race", target = "forest_course", current = 0, required = 1, optional = false },
                    new QuestObjective { id = "time_bonus", description = "Complete in under 2 minutes", type = "race", target = "forest_course_time", current = 0, required = 1, optional = true }
                },
                rewards = new QuestReward { xp = 1500, gold = 300, unlocks = new List<string> { "sprint_ability" } },
                prerequisites = new List<string> { "main_003" }
            });

            // Forest Trial 002: Combat
            AddQuest(new Quest
            {
                id = "forest_trial_002",
                questName = "Forest Trials: Combat",
                description = "Defeat the training dummies and prove your combat prowess.",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 4,
                giver = "Trainer Kael",
                location = "Forest Trials",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "defeat_dummies", description = "Defeat training dummies", type = "kill", target = "training_dummy", current = 0, required = 10, optional = false },
                    new QuestObjective { id = "perfect_combo", description = "Land a 10-hit combo", type = "kill", target = "combo", current = 0, required = 1, optional = true }
                },
                rewards = new QuestReward { xp = 1800, gold = 400, unlocks = new List<string> { "heavy_attack" } },
                prerequisites = new List<string> { "forest_trial_001" }
            });

            // Forest Trial 003: Bonding
            AddQuest(new Quest
            {
                id = "forest_trial_003",
                questName = "Forest Trials: Bonding",
                description = "Strengthen your bond with your creat through care and training.",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 5,
                giver = "Caretaker Elara",
                location = "Forest Trials",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "pet_creat", description = "Pet your creat", type = "talk", target = "creat", current = 0, required = 5, optional = false },
                    new QuestObjective { id = "feed_creat", description = "Feed your creat", type = "talk", target = "creat", current = 0, required = 3, optional = false },
                    new QuestObjective { id = "play_creat", description = "Play with your creat", type = "talk", target = "creat", current = 0, required = 2, optional = false }
                },
                rewards = new QuestReward { xp = 2000, gold = 500, bondIncrease = 20, unlocks = new List<string> { "telepathy" } },
                prerequisites = new List<string> { "forest_trial_002" },
                nextQuest = "choice_home_or_sylvara"
            });
        }

        private void AddChoiceQuest()
        {
            // Choice Quest: Home Base or Sylvara
            AddQuest(new Quest
            {
                id = "choice_home_or_sylvara",
                questName = "The Path Forward",
                description = "Choose your next destination: establish a home base or head straight to Sylvara.",
                type = QuestType.Main,
                status = QuestStatus.Locked,
                level = 6,
                giver = "Zara",
                location = "Forest Trials Exit",
                objectives = new List<QuestObjective>
                {
                    new QuestObjective { id = "make_choice", description = "Choose your path", type = "talk", target = "zara", current = 0, required = 1, optional = false }
                },
                rewards = new QuestReward { xp = 1000, gold = 0 },
                prerequisites = new List<string> { "forest_trial_003" },
                choices = new List<QuestChoice>
                {
                    new QuestChoice
                    {
                        id = "go_home_base",
                        text = "Establish a home base first",
                        consequence = "Unlock home base, crafting, and preparation quests",
                        rewards = new QuestReward { unlocks = new List<string> { "home_base", "crafting_station" } },
                        nextQuest = "home_base_001"
                    },
                    new QuestChoice
                    {
                        id = "go_sylvara",
                        text = "Head straight to Sylvara",
                        consequence = "Skip home base, go directly to first kingdom",
                        rewards = new QuestReward { xp = 500 },
                        nextQuest = "sylvara_001"
                    }
                }
            });
        }

        public void AddQuest(Quest quest)
        {
            if (!quests.ContainsKey(quest.id))
            {
                quests[quest.id] = quest;
            }
        }

        public Quest GetQuest(string questId)
        {
            return quests.ContainsKey(questId) ? quests[questId] : null;
        }

        public bool StartQuest(string questId)
        {
            var quest = GetQuest(questId);
            if (quest != null && quest.CanStart(completedQuests, playerLevel))
            {
                // Check if player is ready
                var playerNeeds = PlayerNeedsSystem.Instance;
                if (playerNeeds != null && !playerNeeds.CanStartQuest())
                {
                    Debug.LogWarning("⚠️ Not ready to start quest! Check your needs.");
                    return false;
                }

                // Create checkpoint before starting quest
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.BeforeQuest,
                    quest.location,
                    $"Before starting: {quest.questName}"
                );

                quest.Start();
                activeQuests.Add(questId);
                return true;
            }
            return false;
        }

        public void UpdateQuestObjective(string questId, string objectiveId, int amount = 1)
        {
            var quest = GetQuest(questId);
            if (quest != null && activeQuests.Contains(questId))
            {
                quest.UpdateObjective(objectiveId, amount);

                if (quest.status == QuestStatus.Completed)
                {
                    CompleteQuest(questId);
                }
            }
        }

        public void CompleteQuest(string questId)
        {
            var quest = GetQuest(questId);
            if (quest != null)
            {
                activeQuests.Remove(questId);
                completedQuests.Add(questId);

                // Create checkpoint after completing quest
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.QuestComplete,
                    quest.location,
                    $"Completed: {quest.questName}"
                );

                // Unlock next quest
                if (!string.IsNullOrEmpty(quest.nextQuest))
                {
                    var nextQuest = GetQuest(quest.nextQuest);
                    if (nextQuest != null)
                    {
                        nextQuest.status = QuestStatus.Available;
                    }
                }
            }
        }

        public List<Quest> GetActiveQuests()
        {
            return activeQuests.Select(id => GetQuest(id)).Where(q => q != null).ToList();
        }

        public List<Quest> GetAvailableQuests()
        {
            return quests.Values.Where(q => q.status == QuestStatus.Available && q.CanStart(completedQuests, playerLevel)).ToList();
        }

        public List<Quest> GetQuestsByType(QuestType type)
        {
            return quests.Values.Where(q => q.type == type).ToList();
        }

        public void SetPlayerLevel(int level)
        {
            playerLevel = level;
        }

        public Dictionary<string, int> GetStats()
        {
            return new Dictionary<string, int>
            {
                { "total", quests.Count },
                { "active", activeQuests.Count },
                { "completed", completedQuests.Count },
                { "available", GetAvailableQuests().Count }
            };
        }
    }
}
