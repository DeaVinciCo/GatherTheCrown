using UnityEngine;
using System.Collections.Generic;
using System.Linq;

/// <summary>
/// KingdomManager - Manages all 8 kingdoms and their restoration
/// </summary>
public class KingdomManager : MonoBehaviour
{
    [Header("Kingdoms")]
    public List<Kingdom> kingdoms = new List<Kingdom>();
    
    void Start()
    {
        InitializeKingdoms();
        Debug.Log($"🏰 Kingdom Manager initialized with {kingdoms.Count} kingdoms");
    }
    
    void InitializeKingdoms()
    {
        kingdoms.Clear();
        
        // 1. Sylvara - Nature Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "sylvara",
            name = "Sylvara",
            element = KingdomElement.NATURE,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A thriving woodland empire corrupted by Shadow cultists"
        });
        
        // 2. Pyrrathia - Fire Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "pyrrathia",
            name = "Pyrrathia",
            element = KingdomElement.FIRE,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A volcanic empire destroyed by catastrophic Water flood"
        });
        
        // 3. Frostvale - Ice Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "frostvale",
            name = "Frostvale",
            element = KingdomElement.ICE,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A crystalline ice kingdom frozen by Eternal Winter spell"
        });
        
        // 4. Zerath Dunes - Desert Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "zerath_dunes",
            name = "Zerath Dunes",
            element = KingdomElement.DESERT,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A golden desert empire buried by massive sandstorms"
        });
        
        // 5. Mor'gahl Fen - Poison Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "morgahl_fen",
            name = "Mor'gahl Fen",
            element = KingdomElement.POISON,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A mysterious swamp civilization destroyed by poison disaster"
        });
        
        // 6. Luminaris - Light Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "luminaris",
            name = "Luminaris",
            element = KingdomElement.LIGHT,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A radiant crystal kingdom shattered by light explosion"
        });
        
        // 7. Umbral Reach - Shadow Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "umbral_reach",
            name = "Umbral Reach",
            element = KingdomElement.SHADOW,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "A dark kingdom pulled into void dimension"
        });
        
        // 8. Crown Convergence - Final Kingdom
        kingdoms.Add(new Kingdom
        {
            id = "crown_convergence",
            name = "Crown Convergence",
            element = KingdomElement.UNIFIED,
            status = KingdomStatus.FALLEN,
            restorationProgress = 0f,
            lore = "The original kingdom where the Crown was forged"
        });
    }
    
    public Kingdom GetKingdom(string kingdomId)
    {
        return kingdoms.Find(k => k.id == kingdomId);
    }
    
    public void DiscoverKingdom(string kingdomId)
    {
        Kingdom kingdom = GetKingdom(kingdomId);
        
        if (kingdom == null)
        {
            Debug.LogError($"❌ Kingdom not found: {kingdomId}");
            return;
        }
        
        if (kingdom.status == KingdomStatus.FALLEN)
        {
            kingdom.status = KingdomStatus.DISCOVERED;
            Debug.Log($"🏰 Discovered {kingdom.name}!");
            Debug.Log($"   {kingdom.lore}");
            
            // Show notification
            if (GameManager.Instance?.uiManager != null)
            {
                GameManager.Instance.uiManager.ShowKingdomNotification(kingdom.name, "Kingdom Discovered!");
            }
        }
    }
    
    public void ClearVault(string kingdomId)
    {
        Kingdom kingdom = GetKingdom(kingdomId);
        
        if (kingdom == null) return;
        
        if (!kingdom.vaultCleared)
        {
            kingdom.vaultCleared = true;
            kingdom.status = KingdomStatus.VAULT_CLEARED;
            kingdom.restorationProgress = 33f;
            
            Debug.Log($"👑 {kingdom.name} vault cleared!");
            Debug.Log($"   Restoration: {kingdom.restorationProgress}%");
            
            // Give rewards
            if (GameManager.Instance?.player != null)
            {
                GameManager.Instance.player.GainXP(5000);
                GameManager.Instance.player.AddGold(2000);
                GameManager.Instance.player.AddCrownShards(1);
            }
            
            // Show notification
            if (GameManager.Instance?.uiManager != null)
            {
                GameManager.Instance.uiManager.ShowKingdomNotification(kingdom.name, "Vault Cleared!");
            }
        }
    }
    
    public void RestoreKingdom(string kingdomId, float amount)
    {
        Kingdom kingdom = GetKingdom(kingdomId);
        
        if (kingdom == null) return;
        
        kingdom.restorationProgress = Mathf.Min(100f, kingdom.restorationProgress + amount);
        
        if (kingdom.restorationProgress >= 100f && kingdom.status != KingdomStatus.RESTORED)
        {
            kingdom.status = KingdomStatus.RESTORED;
            Debug.Log($"✨ {kingdom.name} fully restored!");
            
            // Show notification
            if (GameManager.Instance?.uiManager != null)
            {
                GameManager.Instance.uiManager.ShowKingdomNotification(kingdom.name, "Kingdom Restored!");
            }
        }
        else if (kingdom.restorationProgress > 0)
        {
            kingdom.status = KingdomStatus.RESTORING;
            Debug.Log($"🔨 {kingdom.name} restoration: {kingdom.restorationProgress:F1}%");
        }
    }
    
    public KingdomStats GetStats()
    {
        return new KingdomStats
        {
            total = kingdoms.Count,
            discovered = kingdoms.Count(k => k.status != KingdomStatus.FALLEN),
            vaultsCleared = kingdoms.Count(k => k.vaultCleared),
            restored = kingdoms.Count(k => k.status == KingdomStatus.RESTORED),
            progress = kingdoms.Average(k => k.restorationProgress)
        };
    }
    
    public bool IsCrownConvergenceUnlocked()
    {
        // Crown Convergence unlocks after clearing 7 other kingdoms
        return kingdoms.Count(k => k.vaultCleared && k.id != "crown_convergence") >= 7;
    }
}

[System.Serializable]
public class Kingdom
{
    public string id;
    public string name;
    public KingdomElement element;
    public KingdomStatus status;
    public float restorationProgress;
    public bool vaultCleared;
    public bool cutsceneWatched;
    public string lore;
    
    public Color GetColor()
    {
        switch (element)
        {
            case KingdomElement.NATURE: return new Color(0.18f, 0.8f, 0.44f);
            case KingdomElement.FIRE: return new Color(0.91f, 0.3f, 0.24f);
            case KingdomElement.ICE: return new Color(0.2f, 0.6f, 0.86f);
            case KingdomElement.DESERT: return new Color(0.95f, 0.61f, 0.07f);
            case KingdomElement.POISON: return new Color(0.61f, 0.35f, 0.71f);
            case KingdomElement.LIGHT: return new Color(0.93f, 0.94f, 0.95f);
            case KingdomElement.SHADOW: return new Color(0.2f, 0.29f, 0.37f);
            case KingdomElement.UNIFIED: return Color.white;
            default: return Color.gray;
        }
    }
}

public enum KingdomElement
{
    NATURE,
    FIRE,
    ICE,
    DESERT,
    POISON,
    LIGHT,
    SHADOW,
    UNIFIED
}

public enum KingdomStatus
{
    FALLEN,
    DISCOVERED,
    VAULT_CLEARED,
    RESTORING,
    RESTORED
}

public struct KingdomStats
{
    public int total;
    public int discovered;
    public int vaultsCleared;
    public int restored;
    public float progress;
}
