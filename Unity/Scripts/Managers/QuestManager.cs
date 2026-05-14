using UnityEngine;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// QuestManager - Manages all quests in the game
/// </summary>
public class QuestManager : MonoBehaviour
{
    [Header("Quest Data")]
    public List<Quest> allQuests = new List<Quest>();
    
    private List<Quest> activeQuests = new List<Quest>();
    private List<string> completedQuestIds = new List<string>();
    
    void Start()
    {
        InitializeQuests();
        Debug.Log($"📜 Quest Manager initialized with {allQuests.Count} quests");
    }
    
    void InitializeQuests()
    {
        // Main Quest 1: The Egg
        allQuests.Add(new Quest
        {
            id = "main_001",
            name = "The Egg",
            description = "Find the mysterious egg in the forest and bring it to Elder Miriam.",
            type = QuestType.MAIN,
            status = QuestStatus.AVAILABLE,
            level = 1,
            objectives = new List<QuestObjective>
            {
                new QuestObjective { id = "find_egg", description = "Find the mysterious egg", current = 0, required = 1 },
                new QuestObjective { id = "return_egg", description = "Return to Elder Miriam", current = 0, required = 1 }
            },
            rewards = new QuestReward
            {
                xp = 500,
                gold = 100
            }
        });
        
        // Main Quest 2: The Hatching
        allQuests.Add(new Quest
        {
            id = "main_002",
            name = "The Hatching",
            description = "Perform the hatching ritual and bond with your creat.",
            type = QuestType.MAIN,
            status = QuestStatus.LOCKED,
            level = 1,
            prerequisites = new List<string> { "main_001" },
            objectives = new List<QuestObjective>
            {
                new QuestObjective { id = "hatch_egg", description = "Complete the hatching ritual", current = 0, required = 1 },
                new QuestObjective { id = "name_creat", description = "Name your creat", current = 0, required = 1 }
            },
            rewards = new QuestReward
            {
                xp = 1000,
                gold = 200,
                bondIncrease = 10
            }
        });
        
        // Side Quest: Lost Creat
        allQuests.Add(new Quest
        {
            id = "side_lost_creat",
            name = "Lost Creat",
            description = "A farmer has lost their creat. Help find it.",
            type = QuestType.SIDE,
            status = QuestStatus.AVAILABLE,
            level = 3,
            objectives = new List<QuestObjective>
            {
                new QuestObjective { id = "find_creat", description = "Find the lost creat", current = 0, required = 1 },
                new QuestObjective { id = "return_creat", description = "Return creat to farmer", current = 0, required = 1 }
            },
            rewards = new QuestReward
            {
                xp = 500,
                gold = 300
            }
        });
    }
    
    public void StartQuest(string questId)
    {
        Quest quest = allQuests.Find(q => q.id == questId);
        
        if (quest == null)
        {
            Debug.LogError($"❌ Quest not found: {questId}");
            return;
        }
        
        if (quest.status != QuestStatus.AVAILABLE)
        {
            Debug.Log($"⚠️ Quest {quest.name} is not available");
            return;
        }
        
        // Check prerequisites
        if (quest.prerequisites.Any(prereq => !completedQuestIds.Contains(prereq)))
        {
            Debug.Log($"⚠️ Quest {quest.name} has unmet prerequisites");
            return;
        }
        
        quest.status = QuestStatus.ACTIVE;
        activeQuests.Add(quest);
        
        Debug.Log($"📜 Quest Started: {quest.name}");
        Debug.Log($"   {quest.description}");
        
        // Show in UI
        if (GameManager.Instance?.uiManager != null)
        {
            GameManager.Instance.uiManager.ShowQuestNotification(quest.name, "New Quest!");
        }
    }
    
    public void UpdateObjective(string questId, string objectiveId, int amount = 1)
    {
        Quest quest = activeQuests.Find(q => q.id == questId);
        
        if (quest == null)
        {
            Debug.LogWarning($"⚠️ Active quest not found: {questId}");
            return;
        }
        
        QuestObjective objective = quest.objectives.Find(o => o.id == objectiveId);
        
        if (objective == null)
        {
            Debug.LogWarning($"⚠️ Objective not found: {objectiveId}");
            return;
        }
        
        objective.current = Mathf.Min(objective.current + amount, objective.required);
        
        Debug.Log($"✓ {objective.description}: {objective.current}/{objective.required}");
        
        // Check if quest is complete
        if (quest.IsComplete())
        {
            CompleteQuest(questId);
        }
    }
    
    void CompleteQuest(string questId)
    {
        Quest quest = activeQuests.Find(q => q.id == questId);
        
        if (quest == null) return;
        
        quest.status = QuestStatus.COMPLETED;
        activeQuests.Remove(quest);
        completedQuestIds.Add(questId);
        
        Debug.Log($"🎉 Quest Completed: {quest.name}");
        Debug.Log($"   Rewards: {quest.rewards.xp} XP, {quest.rewards.gold}g");
        
        // Give rewards
        if (GameManager.Instance?.player != null)
        {
            GameManager.Instance.player.GainXP(quest.rewards.xp);
            GameManager.Instance.player.AddGold(quest.rewards.gold);
            
            if (quest.rewards.bondIncrease > 0 && GameManager.Instance.playerCreat != null)
            {
                GameManager.Instance.playerCreat.IncreaseBond(quest.rewards.bondIncrease);
            }
        }
        
        // Unlock next quest
        Quest nextQuest = allQuests.Find(q => q.prerequisites.Contains(questId) && q.status == QuestStatus.LOCKED);
        if (nextQuest != null)
        {
            nextQuest.status = QuestStatus.AVAILABLE;
            Debug.Log($"🔓 Quest Unlocked: {nextQuest.name}");
        }
        
        // Show in UI
        if (GameManager.Instance?.uiManager != null)
        {
            GameManager.Instance.uiManager.ShowQuestNotification(quest.name, "Quest Complete!");
        }
    }
    
    public List<Quest> GetActiveQuests()
    {
        return new List<Quest>(activeQuests);
    }
    
    public List<Quest> GetAvailableQuests()
    {
        return allQuests.Where(q => q.status == QuestStatus.AVAILABLE).ToList();
    }
    
    public QuestStats GetStats()
    {
        return new QuestStats
        {
            total = allQuests.Count,
            active = activeQuests.Count,
            completed = completedQuestIds.Count,
            available = GetAvailableQuests().Count
        };
    }
}

[System.Serializable]
public class Quest
{
    public string id;
    public string name;
    public string description;
    public QuestType type;
    public QuestStatus status;
    public int level;
    public List<string> prerequisites = new List<string>();
    public List<QuestObjective> objectives = new List<QuestObjective>();
    public QuestReward rewards;
    
    public bool IsComplete()
    {
        return objectives.All(obj => obj.current >= obj.required);
    }
}

[System.Serializable]
public class QuestObjective
{
    public string id;
    public string description;
    public int current;
    public int required;
}

[System.Serializable]
public class QuestReward
{
    public int xp;
    public int gold;
    public int bondIncrease;
    public int crownShards;
}

public enum QuestType
{
    MAIN,
    SIDE,
    FACTION,
    KINGDOM_RESTORATION,
    DAILY
}

public enum QuestStatus
{
    LOCKED,
    AVAILABLE,
    ACTIVE,
    COMPLETED,
    FAILED
}

public struct QuestStats
{
    public int total;
    public int active;
    public int completed;
    public int available;
}
