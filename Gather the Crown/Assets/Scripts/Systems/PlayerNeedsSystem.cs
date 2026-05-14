using UnityEngine;

namespace GatherTheCrown.Systems
{
    /// <summary>
    /// Manages player and creat needs: health, energy, hunger, rest
    /// </summary>
    public class PlayerNeedsSystem : MonoBehaviour
    {
        private static PlayerNeedsSystem _instance;
        public static PlayerNeedsSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<PlayerNeedsSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("PlayerNeedsSystem");
                        _instance = go.AddComponent<PlayerNeedsSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Player Stats")]
        [Range(0, 100)] public float health = 100f;
        [Range(0, 100)] public float energy = 100f;
        [Range(0, 100)] public float hunger = 100f;
        [Range(0, 100)] public float thirst = 100f;

        [Header("Creat Stats")]
        [Range(0, 100)] public float creatHealth = 100f;
        [Range(0, 100)] public float creatEnergy = 100f;
        [Range(0, 100)] public float creatHunger = 100f;
        [Range(0, 100)] public float creatHappiness = 100f;

        [Header("Depletion Rates (per minute)")]
        public float energyDepletionRate = 2f;
        public float hungerDepletionRate = 1.5f;
        public float thirstDepletionRate = 2.5f;
        public float creatEnergyDepletionRate = 1.5f;
        public float creatHungerDepletionRate = 1f;

        [Header("Warning Thresholds")]
        public float lowEnergyThreshold = 25f;
        public float lowHungerThreshold = 30f;
        public float criticalThreshold = 15f;

        [Header("Status")]
        public bool needsRest = false;
        public bool needsFood = false;
        public bool needsDrink = false;
        public bool creatNeedsCare = false;

        private float updateTimer = 0f;
        private float updateInterval = 1f; // Update every second

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
            updateTimer += Time.deltaTime;
            if (updateTimer >= updateInterval)
            {
                updateTimer = 0f;
                UpdateNeeds(updateInterval);
            }

            CheckWarnings();
        }

        private void UpdateNeeds(float deltaTime)
        {
            // Deplete player needs over time
            float minutesPassed = deltaTime / 60f;

            energy = Mathf.Max(0, energy - energyDepletionRate * minutesPassed);
            hunger = Mathf.Max(0, hunger - hungerDepletionRate * minutesPassed);
            thirst = Mathf.Max(0, thirst - thirstDepletionRate * minutesPassed);

            // Deplete creat needs
            creatEnergy = Mathf.Max(0, creatEnergy - creatEnergyDepletionRate * minutesPassed);
            creatHunger = Mathf.Max(0, creatHunger - creatHungerDepletionRate * minutesPassed);

            // Low stats affect health
            if (hunger < criticalThreshold || thirst < criticalThreshold)
            {
                health = Mathf.Max(0, health - 0.5f * minutesPassed);
            }

            if (creatHunger < criticalThreshold)
            {
                creatHealth = Mathf.Max(0, creatHealth - 0.3f * minutesPassed);
                creatHappiness = Mathf.Max(0, creatHappiness - 1f * minutesPassed);
            }
        }

        private void CheckWarnings()
        {
            needsRest = energy < lowEnergyThreshold;
            needsFood = hunger < lowHungerThreshold;
            needsDrink = thirst < lowHungerThreshold;
            creatNeedsCare = creatHunger < lowHungerThreshold || creatEnergy < lowEnergyThreshold;

            // Critical warnings
            if (energy < criticalThreshold && Time.frameCount % 300 == 0)
            {
                Debug.LogWarning("⚠️ CRITICAL: Energy very low! Rest immediately!");
            }

            if (hunger < criticalThreshold && Time.frameCount % 300 == 0)
            {
                Debug.LogWarning("⚠️ CRITICAL: Hunger very low! Eat food!");
            }

            if (creatHunger < criticalThreshold && Time.frameCount % 300 == 0)
            {
                Debug.LogWarning("⚠️ CRITICAL: Creat is starving! Feed your creat!");
            }
        }

        // === PLAYER ACTIONS ===

        public void Eat(string foodType, float amount)
        {
            hunger = Mathf.Min(100, hunger + amount);
            Debug.Log($"🍖 Ate {foodType}. Hunger: {hunger:F0}%");

            // Create checkpoint after eating if was critical
            if (hunger > criticalThreshold)
            {
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.RestPoint,
                    "Eating",
                    "Restored hunger"
                );
            }
        }

        public void Drink(string drinkType, float amount)
        {
            thirst = Mathf.Min(100, thirst + amount);
            Debug.Log($"💧 Drank {drinkType}. Thirst: {thirst:F0}%");
        }

        public void Rest(float hours)
        {
            float restAmount = hours * 20f; // 5 hours = full energy
            energy = Mathf.Min(100, energy + restAmount);
            health = Mathf.Min(100, health + hours * 5f);
            
            Debug.Log($"😴 Rested for {hours} hours. Energy: {energy:F0}%, Health: {health:F0}%");

            // Auto-checkpoint after resting
            CheckpointSystem.Instance?.CreateCheckpoint(
                CheckpointType.RestPoint,
                "Rest Area",
                $"Rested for {hours} hours"
            );
        }

        public void UsePotion(string potionType, float healthAmount, float energyAmount)
        {
            health = Mathf.Min(100, health + healthAmount);
            energy = Mathf.Min(100, energy + energyAmount);
            Debug.Log($"🧪 Used {potionType}. Health: {health:F0}%, Energy: {energy:F0}%");
        }

        // === CREAT ACTIONS ===

        public void FeedCreat(string foodType, float amount)
        {
            creatHunger = Mathf.Min(100, creatHunger + amount);
            creatHappiness = Mathf.Min(100, creatHappiness + 5f);
            Debug.Log($"🍖 Fed creat {foodType}. Hunger: {creatHunger:F0}%, Happiness: {creatHappiness:F0}%");

            var gameManager = GameManager.Instance;
            if (gameManager?.playerCreat != null)
            {
                gameManager.playerCreat.IncreaseBond(2);
            }
        }

        public void RestCreat(float hours)
        {
            float restAmount = hours * 25f;
            creatEnergy = Mathf.Min(100, creatEnergy + restAmount);
            creatHealth = Mathf.Min(100, creatHealth + hours * 8f);
            creatHappiness = Mathf.Min(100, creatHappiness + hours * 3f);
            
            Debug.Log($"😴 Creat rested for {hours} hours. Energy: {creatEnergy:F0}%");
        }

        public void PetCreat()
        {
            creatHappiness = Mathf.Min(100, creatHappiness + 3f);
            Debug.Log($"❤️ Pet creat. Happiness: {creatHappiness:F0}%");

            var gameManager = GameManager.Instance;
            if (gameManager?.playerCreat != null)
            {
                gameManager.playerCreat.IncreaseBond(1);
            }
        }

        public void PlayWithCreat(float minutes)
        {
            creatHappiness = Mathf.Min(100, creatHappiness + minutes * 2f);
            creatEnergy = Mathf.Max(0, creatEnergy - minutes * 0.5f);
            energy = Mathf.Max(0, energy - minutes * 0.3f);
            
            Debug.Log($"🎾 Played with creat for {minutes} minutes. Happiness: {creatHappiness:F0}%");

            var gameManager = GameManager.Instance;
            if (gameManager?.playerCreat != null)
            {
                gameManager.playerCreat.IncreaseBond(5);
            }
        }

        // === CHECKS ===

        public bool CanStartQuest()
        {
            if (energy < 20f)
            {
                Debug.LogWarning("⚠️ Too tired to start quest! Rest first.");
                return false;
            }

            if (hunger < 20f)
            {
                Debug.LogWarning("⚠️ Too hungry to start quest! Eat first.");
                return false;
            }

            if (creatEnergy < 20f)
            {
                Debug.LogWarning("⚠️ Creat is too tired! Let them rest first.");
                return false;
            }

            return true;
        }

        public bool ShouldAutoRest()
        {
            var timeSystem = TimeSystem.Instance;
            if (timeSystem != null && timeSystem.IsNight())
            {
                if (energy < 50f || creatEnergy < 50f)
                {
                    return true;
                }
            }
            return false;
        }

        public void FullRestore()
        {
            health = 100f;
            energy = 100f;
            hunger = 100f;
            thirst = 100f;
            creatHealth = 100f;
            creatEnergy = 100f;
            creatHunger = 100f;
            creatHappiness = 100f;
            Debug.Log("✨ Fully restored player and creat!");
        }
    }
}
