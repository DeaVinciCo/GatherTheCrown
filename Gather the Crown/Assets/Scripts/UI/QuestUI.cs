using UnityEngine;
using UnityEngine.UI;
using TMPro;
using GatherTheCrown.Systems;
using System.Linq;

namespace GatherTheCrown.UI
{
    public class QuestUI : MonoBehaviour
    {
        [Header("UI References")]
        public TextMeshProUGUI questTitleText;
        public TextMeshProUGUI questDescriptionText;
        public TextMeshProUGUI objectivesText;
        public TextMeshProUGUI statsText;

        private QuestManager questManager;

        void Start()
        {
            questManager = QuestManager.Instance;
            InvokeRepeating(nameof(UpdateUI), 0f, 0.5f);
        }

        void UpdateUI()
        {
            if (questManager == null) return;

            var activeQuests = questManager.GetActiveQuests();
            
            if (activeQuests.Count > 0)
            {
                var quest = activeQuests[0];
                
                if (questTitleText != null)
                    questTitleText.text = $"📜 {quest.questName}";
                
                if (questDescriptionText != null)
                    questDescriptionText.text = quest.description;
                
                if (objectivesText != null)
                {
                    string objectives = "Objectives:\n";
                    foreach (var obj in quest.objectives)
                    {
                        string check = obj.current >= obj.required ? "✓" : "○";
                        string optional = obj.optional ? " (Optional)" : "";
                        objectives += $"{check} {obj.description}: {obj.current}/{obj.required}{optional}\n";
                    }
                    objectivesText.text = objectives;
                }
            }
            else
            {
                if (questTitleText != null)
                    questTitleText.text = "No Active Quest";
                
                if (questDescriptionText != null)
                    questDescriptionText.text = "Press Q to start a quest";
                
                if (objectivesText != null)
                    objectivesText.text = "";
            }

            // Update stats
            if (statsText != null)
            {
                var stats = questManager.GetStats();
                statsText.text = $"Quests: {stats["completed"]}/{stats["total"]} | Active: {stats["active"]} | Available: {stats["available"]}";
            }
        }
    }
}
