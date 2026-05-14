using UnityEngine;

namespace GatherTheCrown.Core
{
    public enum CreatElement
    {
        Fire,
        Water,
        Air,
        Earth,
        Ice,
        Poison,
        Light,
        Shadow
    }

    public enum CreatStage
    {
        Egg,
        Hatchling,
        Juvenile,
        Adult,
        Elder
    }

    [System.Serializable]
    public class CreatStats
    {
        public float hp;
        public float maxHp;
        public float attack;
        public float defense;
        public float speed;
        public float stamina;
        public float elementPower;
    }

    public class Creat : MonoBehaviour
    {
        [Header("Identity")]
        public string creatName;
        public CreatElement element;
        public CreatStage stage = CreatStage.Hatchling;

        [Header("Progression")]
        public int level = 1;
        public int bondLevel = 10;

        [Header("Stats")]
        public CreatStats stats;

        [Header("Movement")]
        public Vector3 velocity;

        private GameObject visualMesh;

        void Awake()
        {
            if (stats == null)
            {
                stats = CalculateStats();
            }
        }

        void Start()
        {
            CreateVisualMesh();
        }

        void Update()
        {
            UpdateMovement(Time.deltaTime);
        }

        private CreatStats CalculateStats()
        {
            var baseStats = GetBaseStatsByElement();
            float stageMultiplier = GetStageMultiplier();

            return new CreatStats
            {
                maxHp = (100 + level * 10) * stageMultiplier,
                hp = (100 + level * 10) * stageMultiplier,
                attack = baseStats.attack + level * 3,
                defense = baseStats.defense + level * 2,
                speed = baseStats.speed + level * 2,
                stamina = 50 + level * 5,
                elementPower = 10 + level * 4
            };
        }

        private CreatStats GetBaseStatsByElement()
        {
            switch (element)
            {
                case CreatElement.Fire:
                    return new CreatStats { attack = 80, speed = 180, defense = 40 };
                case CreatElement.Water:
                    return new CreatStats { attack = 60, speed = 160, defense = 70 };
                case CreatElement.Air:
                    return new CreatStats { attack = 70, speed = 200, defense = 30 };
                case CreatElement.Earth:
                    return new CreatStats { attack = 90, speed = 140, defense = 100 };
                case CreatElement.Ice:
                    return new CreatStats { attack = 75, speed = 170, defense = 60 };
                case CreatElement.Poison:
                    return new CreatStats { attack = 85, speed = 165, defense = 50 };
                case CreatElement.Light:
                    return new CreatStats { attack = 80, speed = 185, defense = 55 };
                case CreatElement.Shadow:
                    return new CreatStats { attack = 95, speed = 175, defense = 45 };
                default:
                    return new CreatStats { attack = 70, speed = 160, defense = 50 };
            }
        }

        private float GetStageMultiplier()
        {
            switch (stage)
            {
                case CreatStage.Egg: return 0.5f;
                case CreatStage.Hatchling: return 1f;
                case CreatStage.Juvenile: return 1.5f;
                case CreatStage.Adult: return 2f;
                case CreatStage.Elder: return 3f;
                default: return 1f;
            }
        }

        private void CreateVisualMesh()
        {
            visualMesh = new GameObject("CreatVisual");
            visualMesh.transform.SetParent(transform);
            visualMesh.transform.localPosition = Vector3.zero;

            // Body
            GameObject body = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            body.transform.SetParent(visualMesh.transform);
            body.transform.localPosition = Vector3.zero;
            body.transform.localScale = new Vector3(1f, 1.5f, 1f);
            body.GetComponent<Renderer>().material.color = GetElementColor();

            // Glow effect
            GameObject glow = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            glow.transform.SetParent(visualMesh.transform);
            glow.transform.localPosition = new Vector3(0, 1f, 0);
            glow.transform.localScale = Vector3.one * 0.6f;
            var glowMat = glow.GetComponent<Renderer>().material;
            glowMat.color = GetElementColor();
            glowMat.SetFloat("_Metallic", 0.5f);

            // Rider
            GameObject rider = new GameObject("Rider");
            rider.transform.SetParent(visualMesh.transform);
            rider.transform.localPosition = new Vector3(0, 2f, 0);

            GameObject riderBody = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            riderBody.transform.SetParent(rider.transform);
            riderBody.transform.localScale = new Vector3(0.4f, 0.6f, 0.4f);
            riderBody.GetComponent<Renderer>().material.color = new Color(0.29f, 0.56f, 0.89f);

            GameObject riderHead = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            riderHead.transform.SetParent(rider.transform);
            riderHead.transform.localPosition = new Vector3(0, 0.5f, 0);
            riderHead.transform.localScale = Vector3.one * 0.5f;
            riderHead.GetComponent<Renderer>().material.color = new Color(1f, 0.86f, 0.67f);
        }

        private Color GetElementColor()
        {
            switch (element)
            {
                case CreatElement.Fire: return new Color(1f, 0.27f, 0f);
                case CreatElement.Water: return new Color(0.12f, 0.56f, 1f);
                case CreatElement.Air: return new Color(0.53f, 0.81f, 0.92f);
                case CreatElement.Earth: return new Color(0.55f, 0.27f, 0.07f);
                case CreatElement.Ice: return new Color(0f, 1f, 1f);
                case CreatElement.Poison: return new Color(0.58f, 0f, 0.83f);
                case CreatElement.Light: return new Color(1f, 0.84f, 0f);
                case CreatElement.Shadow: return new Color(0.29f, 0f, 0.51f);
                default: return Color.white;
            }
        }

        private void UpdateMovement(float deltaTime)
        {
            transform.position += velocity * deltaTime;

            // Animate glow
            if (visualMesh != null && visualMesh.transform.childCount > 1)
            {
                Transform glow = visualMesh.transform.GetChild(1);
                glow.Rotate(0, 50f * deltaTime, 0);
                float scale = 1f + Mathf.Sin(Time.time * 3f) * 0.2f;
                glow.localScale = Vector3.one * 0.6f * scale;
            }
        }

        public void TakeDamage(float amount)
        {
            stats.hp = Mathf.Max(0, stats.hp - amount);
            Debug.Log($"{creatName} took {amount} damage. HP: {stats.hp}/{stats.maxHp}");
        }

        public void Heal(float amount)
        {
            stats.hp = Mathf.Min(stats.maxHp, stats.hp + amount);
            Debug.Log($"{creatName} healed {amount}. HP: {stats.hp}/{stats.maxHp}");
        }

        public void IncreaseBond(int amount)
        {
            bondLevel = Mathf.Min(100, bondLevel + amount);
            Debug.Log($"Bond with {creatName} increased to {bondLevel}");
        }

        public void LevelUp()
        {
            level++;
            stats = CalculateStats();
            Debug.Log($"{creatName} leveled up to {level}!");
        }

        public bool Evolve()
        {
            CreatStage[] stages = { CreatStage.Egg, CreatStage.Hatchling, CreatStage.Juvenile, CreatStage.Adult, CreatStage.Elder };
            int currentIndex = System.Array.IndexOf(stages, stage);

            if (currentIndex < stages.Length - 1)
            {
                stage = stages[currentIndex + 1];
                stats = CalculateStats();
                Debug.Log($"{creatName} evolved to {stage}!");
                return true;
            }

            return false;
        }
    }
}
