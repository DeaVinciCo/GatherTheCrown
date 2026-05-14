using UnityEngine;
using System;

/// <summary>
/// Creat - Your bonded companion creature
/// Attach this to your creat GameObject
/// </summary>
public class Creat : MonoBehaviour
{
    [Header("Basic Info")]
    public string creatName = "Ember";
    public CreatElement element = CreatElement.FIRE;
    public CreatStage stage = CreatStage.HATCHLING;
    
    [Header("Stats")]
    public int level = 1;
    public int hp = 100;
    public int maxHp = 100;
    public int attack = 10;
    public int defense = 5;
    public int speed = 8;
    
    [Header("Bond System")]
    [Range(0, 100)]
    public int bondLevel = 0;
    [Range(0, 100)]
    public int hunger = 100;
    [Range(0, 100)]
    public int happiness = 100;
    
    [Header("Evolution")]
    public int xp = 0;
    public int xpToNextLevel = 100;
    public bool canEvolve = false;
    
    [Header("Components")]
    private Animator animator;
    private AudioSource audioSource;
    
    // Events
    public event Action<int> OnBondChanged;
    public event Action<CreatStage> OnEvolved;
    public event Action<int> OnLevelUp;
    
    void Start()
    {
        animator = GetComponent<Animator>();
        audioSource = GetComponent<AudioSource>();
        
        // Initialize
        hp = maxHp;
        Debug.Log($"🐉 {creatName} ({element}) is ready!");
    }
    
    void Update()
    {
        // Decrease hunger over time (1 point per 10 seconds)
        hunger = Mathf.Max(0, hunger - (int)(Time.deltaTime * 0.1f));
        
        // Update happiness based on hunger and bond
        if (hunger < 30)
        {
            happiness = Mathf.Max(0, happiness - (int)(Time.deltaTime * 0.5f));
        }
        else if (bondLevel > 50)
        {
            happiness = Mathf.Min(100, happiness + (int)(Time.deltaTime * 0.1f));
        }
    }
    
    #region Bonding Actions
    
    public void Feed(int amount = 30)
    {
        hunger = Mathf.Min(100, hunger + amount);
        IncreaseBond(3);
        
        if (animator) animator.SetTrigger("Eat");
        PlaySound("Eat");
        
        Debug.Log($"🍖 Fed {creatName}! Hunger: {hunger}");
    }
    
    public void Pet()
    {
        IncreaseBond(5);
        happiness = Mathf.Min(100, happiness + 10);
        
        if (animator) animator.SetTrigger("Happy");
        PlaySound("Happy");
        
        Debug.Log($"💝 Petted {creatName}! Bond: {bondLevel}");
    }
    
    public void Play()
    {
        IncreaseBond(8);
        happiness = Mathf.Min(100, happiness + 20);
        
        if (animator) animator.SetTrigger("Play");
        PlaySound("Play");
        
        Debug.Log($"🎮 Played with {creatName}! Happiness: {happiness}");
    }
    
    public void IncreaseBond(int amount)
    {
        int oldBond = bondLevel;
        bondLevel = Mathf.Min(100, bondLevel + amount);
        
        OnBondChanged?.Invoke(bondLevel);
        
        // Check for evolution unlock
        if (bondLevel >= 60 && stage == CreatStage.JUVENILE && !canEvolve)
        {
            canEvolve = true;
            Debug.Log($"✨ {creatName} can now evolve!");
        }
        
        // Unlock telepathy at bond 60
        if (oldBond < 60 && bondLevel >= 60)
        {
            Debug.Log($"💭 Telepathic bond unlocked with {creatName}!");
        }
    }
    
    #endregion
    
    #region Combat
    
    public void TakeDamage(int damage)
    {
        int actualDamage = Mathf.Max(1, damage - defense);
        hp = Mathf.Max(0, hp - actualDamage);
        
        if (animator) animator.SetTrigger("Hit");
        PlaySound("Hit");
        
        Debug.Log($"💥 {creatName} took {actualDamage} damage! HP: {hp}/{maxHp}");
        
        if (hp <= 0)
        {
            Die();
        }
    }
    
    public int Attack()
    {
        if (animator) animator.SetTrigger("Attack");
        PlaySound("Attack");
        
        // Calculate damage with bond bonus
        float bondBonus = 1f + (bondLevel / 100f);
        int damage = (int)(attack * bondBonus);
        
        Debug.Log($"⚔️ {creatName} attacks for {damage} damage!");
        return damage;
    }
    
    public void Heal(int amount)
    {
        hp = Mathf.Min(maxHp, hp + amount);
        Debug.Log($"💚 {creatName} healed {amount} HP! HP: {hp}/{maxHp}");
    }
    
    void Die()
    {
        if (animator) animator.SetTrigger("Die");
        PlaySound("Die");
        
        Debug.Log($"💀 {creatName} fainted!");
        
        // Respawn after 3 seconds
        Invoke(nameof(Respawn), 3f);
    }
    
    void Respawn()
    {
        hp = maxHp / 2;
        Debug.Log($"✨ {creatName} respawned with {hp} HP!");
    }
    
    #endregion
    
    #region Progression
    
    public void GainXP(int amount)
    {
        xp += amount;
        Debug.Log($"⭐ {creatName} gained {amount} XP! ({xp}/{xpToNextLevel})");
        
        while (xp >= xpToNextLevel)
        {
            LevelUp();
        }
    }
    
    void LevelUp()
    {
        level++;
        xp -= xpToNextLevel;
        xpToNextLevel = (int)(xpToNextLevel * 1.5f);
        
        // Increase stats
        maxHp += 10;
        hp = maxHp;
        attack += 2;
        defense += 1;
        speed += 1;
        
        if (animator) animator.SetTrigger("LevelUp");
        PlaySound("LevelUp");
        
        OnLevelUp?.Invoke(level);
        
        Debug.Log($"🎉 {creatName} leveled up to {level}!");
        Debug.Log($"Stats - HP: {maxHp}, ATK: {attack}, DEF: {defense}, SPD: {speed}");
    }
    
    public void Evolve()
    {
        if (!canEvolve)
        {
            Debug.Log($"❌ {creatName} cannot evolve yet!");
            return;
        }
        
        CreatStage oldStage = stage;
        
        switch (stage)
        {
            case CreatStage.EGG:
                stage = CreatStage.HATCHLING;
                break;
            case CreatStage.HATCHLING:
                stage = CreatStage.JUVENILE;
                break;
            case CreatStage.JUVENILE:
                stage = CreatStage.ADULT;
                break;
            case CreatStage.ADULT:
                stage = CreatStage.ELDER;
                break;
            case CreatStage.ELDER:
                Debug.Log($"❌ {creatName} is already at max evolution!");
                return;
        }
        
        canEvolve = false;
        
        // Massive stat boost
        maxHp += 50;
        hp = maxHp;
        attack += 10;
        defense += 5;
        speed += 3;
        
        if (animator) animator.SetTrigger("Evolve");
        PlaySound("Evolve");
        
        OnEvolved?.Invoke(stage);
        
        Debug.Log($"✨✨✨ {creatName} evolved from {oldStage} to {stage}! ✨✨✨");
        Debug.Log($"New Stats - HP: {maxHp}, ATK: {attack}, DEF: {defense}, SPD: {speed}");
    }
    
    #endregion
    
    #region Helpers
    
    void PlaySound(string soundName)
    {
        if (audioSource)
        {
            // Load sound from Resources folder
            AudioClip clip = Resources.Load<AudioClip>($"Sounds/Creat/{soundName}");
            if (clip)
            {
                audioSource.PlayOneShot(clip);
            }
        }
    }
    
    public Color GetElementColor()
    {
        switch (element)
        {
            case CreatElement.FIRE: return new Color(0.91f, 0.3f, 0.24f);
            case CreatElement.WATER: return new Color(0.2f, 0.6f, 0.86f);
            case CreatElement.EARTH: return new Color(0.55f, 0.4f, 0.27f);
            case CreatElement.AIR: return new Color(0.8f, 0.9f, 0.95f);
            case CreatElement.ICE: return new Color(0.6f, 0.85f, 0.95f);
            case CreatElement.POISON: return new Color(0.61f, 0.35f, 0.71f);
            case CreatElement.LIGHT: return new Color(0.93f, 0.94f, 0.95f);
            case CreatElement.SHADOW: return new Color(0.2f, 0.29f, 0.37f);
            default: return Color.white;
        }
    }
    
    public string GetEmotionText()
    {
        if (hunger < 30) return "Hungry 😢";
        if (happiness < 30) return "Sad 😔";
        if (happiness > 80) return "Happy 😊";
        if (bondLevel > 80) return "Loving 💖";
        return "Content 😌";
    }
    
    #endregion
}

public enum CreatElement
{
    FIRE,
    WATER,
    EARTH,
    AIR,
    ICE,
    POISON,
    LIGHT,
    SHADOW
}

public enum CreatStage
{
    EGG,
    HATCHLING,
    JUVENILE,
    ADULT,
    ELDER
}
