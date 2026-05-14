using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>
/// GameManager - Central game controller (Singleton)
/// Manages game state, scene loading, and global systems
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }
    
    [Header("References")]
    public Player player;
    public Creat playerCreat;
    
    [Header("Game State")]
    public GameMode currentMode = GameMode.EXPLORATION;
    public bool isPaused = false;
    
    void Awake()
    {
        // Singleton pattern
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
        }
        else
        {
            Destroy(gameObject);
            return;
        }
        
        InitializeGame();
    }
    
    void InitializeGame()
    {
        Debug.Log("👑 Gather the Crown: Creats & Foes");
        Debug.Log("🎮 Game Initialized!");
    }
    
    void Update()
    {
        // Pause menu
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            TogglePause();
        }
        
        // Quick stats
        if (Input.GetKeyDown(KeyCode.Tab))
        {
            ShowStats();
        }
    }
    
    public void TogglePause()
    {
        isPaused = !isPaused;
        Time.timeScale = isPaused ? 0f : 1f;
        
        Debug.Log(isPaused ? "⏸️ Game Paused" : "▶️ Game Resumed");
    }
    
    public void ShowStats()
    {
        Debug.Log("═══════════════════════════════════");
        Debug.Log("📊 GAME STATISTICS");
        Debug.Log("═══════════════════════════════════");
        
        if (player != null)
        {
            Debug.Log($"👤 Player: {player.playerName} (Level {player.level})");
            Debug.Log($"   HP: {player.hp}/{player.maxHp}");
            Debug.Log($"   Gold: {player.gold}g");
            Debug.Log($"   Crown Shards: {player.crownShards}");
        }
        
        if (playerCreat != null)
        {
            Debug.Log($"\n🐉 Creat: {playerCreat.creatName} ({playerCreat.element})");
            Debug.Log($"   Stage: {playerCreat.stage}");
            Debug.Log($"   Level: {playerCreat.level}");
            Debug.Log($"   Bond: {playerCreat.bondLevel}/100");
            Debug.Log($"   HP: {playerCreat.hp}/{playerCreat.maxHp}");
        }
        
        Debug.Log("═══════════════════════════════════\n");
    }
    
    public void ChangeMode(GameMode newMode)
    {
        currentMode = newMode;
        Debug.Log($"🎮 Mode changed to: {newMode}");
    }
    
    public void LoadScene(string sceneName)
    {
        Debug.Log($"🌍 Loading scene: {sceneName}");
        SceneManager.LoadScene(sceneName);
    }
    
    public void QuitGame()
    {
        Debug.Log("👋 Quitting game...");
        
        #if UNITY_EDITOR
        UnityEditor.EditorApplication.isPlaying = false;
        #else
        Application.Quit();
        #endif
    }
    
    // Save/Load (basic implementation)
    public void SaveGame()
    {
        PlayerPrefs.SetString("PlayerName", player.playerName);
        PlayerPrefs.SetInt("PlayerLevel", player.level);
        PlayerPrefs.SetInt("PlayerGold", player.gold);
        PlayerPrefs.SetInt("PlayerShards", player.crownShards);
        
        if (playerCreat != null)
        {
            PlayerPrefs.SetString("CreatName", playerCreat.creatName);
            PlayerPrefs.SetInt("CreatLevel", playerCreat.level);
            PlayerPrefs.SetInt("CreatBond", playerCreat.bondLevel);
        }
        
        PlayerPrefs.Save();
        Debug.Log("💾 Game Saved!");
    }
    
    public void LoadGame()
    {
        if (PlayerPrefs.HasKey("PlayerName"))
        {
            player.playerName = PlayerPrefs.GetString("PlayerName");
            player.level = PlayerPrefs.GetInt("PlayerLevel");
            player.gold = PlayerPrefs.GetInt("PlayerGold");
            player.crownShards = PlayerPrefs.GetInt("PlayerShards");
            
            if (playerCreat != null && PlayerPrefs.HasKey("CreatName"))
            {
                playerCreat.creatName = PlayerPrefs.GetString("CreatName");
                playerCreat.level = PlayerPrefs.GetInt("CreatLevel");
                playerCreat.bondLevel = PlayerPrefs.GetInt("CreatBond");
            }
            
            Debug.Log("📂 Game Loaded!");
        }
        else
        {
            Debug.Log("❌ No save file found!");
        }
    }
}

public enum GameMode
{
    EXPLORATION,
    COMBAT,
    RACING,
    BONDING,
    VAULT,
    DIALOGUE
}
