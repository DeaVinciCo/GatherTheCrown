using UnityEngine;
using UnityEngine.UI;
using TMPro;
using System.Collections;

/// <summary>
/// UIManager - Manages all UI elements
/// </summary>
public class UIManager : MonoBehaviour
{
    [Header("HUD Elements")]
    public TextMeshProUGUI playerHPText;
    public TextMeshProUGUI creatHPText;
    public TextMeshProUGUI goldText;
    public TextMeshProUGUI shardsText;
    public TextMeshProUGUI levelText;
    public Slider playerHPBar;
    public Slider creatHPBar;
    
    [Header("Notifications")]
    public GameObject notificationPanel;
    public TextMeshProUGUI notificationTitle;
    public TextMeshProUGUI notificationText;
    
    [Header("Quest UI")]
    public GameObject questPanel;
    public TextMeshProUGUI questListText;
    
    [Header("Pause Menu")]
    public GameObject pauseMenu;
    
    [Header("Mode Display")]
    public TextMeshProUGUI modeText;
    
    void Update()
    {
        UpdateHUD();
    }
    
    void UpdateHUD()
    {
        if (GameManager.Instance == null) return;
        
        Player player = GameManager.Instance.player;
        Creat creat = GameManager.Instance.playerCreat;
        
        // Update player stats
        if (player != null)
        {
            if (playerHPText) playerHPText.text = $"{player.hp}/{player.maxHp}";
            if (playerHPBar) playerHPBar.value = (float)player.hp / player.maxHp;
            if (goldText) goldText.text = $"{player.gold}g";
            if (shardsText) shardsText.text = $"{player.crownShards}";
            if (levelText) levelText.text = $"Lv.{player.level}";
        }
        
        // Update creat stats
        if (creat != null)
        {
            if (creatHPText) creatHPText.text = $"{creat.hp}/{creat.maxHp}";
            if (creatHPBar) creatHPBar.value = (float)creat.hp / creat.maxHp;
        }
    }
    
    public void ShowNotification(string title, string message, float duration = 3f)
    {
        if (notificationPanel == null) return;
        
        notificationPanel.SetActive(true);
        
        if (notificationTitle) notificationTitle.text = title;
        if (notificationText) notificationText.text = message;
        
        StartCoroutine(HideNotificationAfterDelay(duration));
    }
    
    IEnumerator HideNotificationAfterDelay(float delay)
    {
        yield return new WaitForSeconds(delay);
        if (notificationPanel) notificationPanel.SetActive(false);
    }
    
    public void ShowQuestNotification(string questName, string status)
    {
        ShowNotification(status, questName, 3f);
    }
    
    public void ShowKingdomNotification(string kingdomName, string status)
    {
        ShowNotification(status, kingdomName, 4f);
    }
    
    public void ShowPauseMenu(bool show)
    {
        if (pauseMenu) pauseMenu.SetActive(show);
    }
    
    public void UpdateModeUI(GameMode mode)
    {
        if (modeText) modeText.text = $"Mode: {mode}";
    }
    
    public void ShowQuestLog()
    {
        if (questPanel == null || GameManager.Instance?.questManager == null) return;
        
        questPanel.SetActive(!questPanel.activeSelf);
        
        if (questPanel.activeSelf)
        {
            UpdateQuestLog();
        }
    }
    
    void UpdateQuestLog()
    {
        if (questListText == null || GameManager.Instance?.questManager == null) return;
        
        var activeQuests = GameManager.Instance.questManager.GetActiveQuests();
        
        string questText = "📜 ACTIVE QUESTS\n\n";
        
        if (activeQuests.Count == 0)
        {
            questText += "No active quests";
        }
        else
        {
            foreach (var quest in activeQuests)
            {
                questText += $"<b>{quest.name}</b>\n";
                questText += $"{quest.description}\n";
                
                foreach (var obj in quest.objectives)
                {
                    string check = obj.current >= obj.required ? "✓" : "○";
                    questText += $"  {check} {obj.description} ({obj.current}/{obj.required})\n";
                }
                
                questText += "\n";
            }
        }
        
        questListText.text = questText;
    }
    
    // Button callbacks
    public void OnResumeButton()
    {
        if (GameManager.Instance) GameManager.Instance.TogglePause();
    }
    
    public void OnQuitButton()
    {
        if (GameManager.Instance) GameManager.Instance.QuitGame();
    }
    
    public void OnSaveButton()
    {
        if (GameManager.Instance)
        {
            GameManager.Instance.SaveGame();
            ShowNotification("Game Saved", "Your progress has been saved", 2f);
        }
    }
    
    public void OnLoadButton()
    {
        if (GameManager.Instance)
        {
            GameManager.Instance.LoadGame();
            ShowNotification("Game Loaded", "Your progress has been loaded", 2f);
        }
    }
}
