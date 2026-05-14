using UnityEngine;

/// <summary>
/// Player - The rider character
/// Attach this to your player GameObject
/// </summary>
[RequireComponent(typeof(CharacterController))]
public class Player : MonoBehaviour
{
    [Header("Player Info")]
    public string playerName = "Rider";
    public int level = 1;
    public int xp = 0;
    public int xpToNextLevel = 1000;
    
    [Header("Stats")]
    public int hp = 100;
    public int maxHp = 100;
    public int stamina = 5;
    public int maxStamina = 5;
    
    [Header("Currency")]
    public int gold = 1247;
    public int crownShards = 12;
    
    [Header("Movement")]
    public float walkSpeed = 5f;
    public float sprintSpeed = 8f;
    public float jumpHeight = 2f;
    public float gravity = -9.81f;
    
    [Header("Creat")]
    public Creat bondedCreat;
    
    private CharacterController controller;
    private Vector3 velocity;
    private bool isGrounded;
    private float currentSpeed;
    
    void Start()
    {
        controller = GetComponent<CharacterController>();
        currentSpeed = walkSpeed;
        
        Debug.Log($"👤 Player {playerName} (Level {level}) ready!");
    }
    
    void Update()
    {
        HandleMovement();
        HandleInput();
        
        // Regenerate stamina
        if (stamina < maxStamina)
        {
            stamina = Mathf.Min(maxStamina, stamina + (int)(Time.deltaTime * 0.5f));
        }
    }
    
    void HandleMovement()
    {
        // Ground check
        isGrounded = controller.isGrounded;
        if (isGrounded && velocity.y < 0)
        {
            velocity.y = -2f;
        }
        
        // Get input
        float horizontal = Input.GetAxis("Horizontal");
        float vertical = Input.GetAxis("Vertical");
        
        // Calculate movement
        Vector3 move = transform.right * horizontal + transform.forward * vertical;
        
        // Sprint
        if (Input.GetKey(KeyCode.LeftShift) && stamina > 0)
        {
            currentSpeed = sprintSpeed;
            stamina = Mathf.Max(0, stamina - (int)(Time.deltaTime * 2f));
        }
        else
        {
            currentSpeed = walkSpeed;
        }
        
        controller.Move(move * currentSpeed * Time.deltaTime);
        
        // Jump
        if (Input.GetButtonDown("Jump") && isGrounded)
        {
            velocity.y = Mathf.Sqrt(jumpHeight * -2f * gravity);
        }
        
        // Apply gravity
        velocity.y += gravity * Time.deltaTime;
        controller.Move(velocity * Time.deltaTime);
    }
    
    void HandleInput()
    {
        // Interact with creat
        if (bondedCreat != null)
        {
            if (Input.GetKeyDown(KeyCode.P))
            {
                bondedCreat.Pet();
            }
            
            if (Input.GetKeyDown(KeyCode.F))
            {
                bondedCreat.Feed();
            }
            
            if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
            {
                bondedCreat.Play();
            }
        }
        
        // Use potion
        if (Input.GetKeyDown(KeyCode.H))
        {
            UseHealthPotion();
        }
    }
    
    public void TakeDamage(int damage)
    {
        hp = Mathf.Max(0, hp - damage);
        Debug.Log($"💥 {playerName} took {damage} damage! HP: {hp}/{maxHp}");
        
        if (hp <= 0)
        {
            Die();
        }
    }
    
    public void Heal(int amount)
    {
        hp = Mathf.Min(maxHp, hp + amount);
        Debug.Log($"💚 {playerName} healed {amount} HP! HP: {hp}/{maxHp}");
    }
    
    void UseHealthPotion()
    {
        // Check if player has potions (implement inventory later)
        Heal(50);
        Debug.Log("🧪 Used Health Potion!");
    }
    
    void Die()
    {
        Debug.Log($"💀 {playerName} died!");
        // Respawn logic
        Invoke(nameof(Respawn), 3f);
    }
    
    void Respawn()
    {
        hp = maxHp;
        transform.position = Vector3.zero; // Respawn at origin
        Debug.Log($"✨ {playerName} respawned!");
    }
    
    public void GainXP(int amount)
    {
        xp += amount;
        Debug.Log($"⭐ Gained {amount} XP! ({xp}/{xpToNextLevel})");
        
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
        maxStamina += 1;
        stamina = maxStamina;
        
        Debug.Log($"🎉 Level Up! Now level {level}!");
        Debug.Log($"Stats - HP: {maxHp}, Stamina: {maxStamina}");
    }
    
    public void AddGold(int amount)
    {
        gold += amount;
        Debug.Log($"💰 +{amount}g! Total: {gold}g");
    }
    
    public void AddCrownShards(int amount)
    {
        crownShards += amount;
        Debug.Log($"👑 +{amount} Crown Shards! Total: {crownShards}");
    }
    
    public bool SpendGold(int amount)
    {
        if (gold >= amount)
        {
            gold -= amount;
            Debug.Log($"💸 Spent {amount}g. Remaining: {gold}g");
            return true;
        }
        
        Debug.Log($"❌ Not enough gold! Need {amount}g, have {gold}g");
        return false;
    }
}
