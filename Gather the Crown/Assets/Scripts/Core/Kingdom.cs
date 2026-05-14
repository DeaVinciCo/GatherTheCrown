using UnityEngine;

namespace GatherTheCrown.Core
{
    public enum KingdomElement
    {
        Nature,
        Fire,
        Ice,
        Desert,
        Poison,
        Light,
        Shadow,
        Unified
    }

    public enum KingdomStatus
    {
        Fallen,
        Discovered,
        VaultCleared,
        Restoring,
        Restored
    }

    [System.Serializable]
    public class KingdomLore
    {
        public string description;
        public string downfall;
        public string vaultLocation;
    }

    public class Kingdom : MonoBehaviour
    {
        [Header("Identity")]
        public string kingdomId;
        public string kingdomName;
        public KingdomElement element;

        [Header("Status")]
        public KingdomStatus status = KingdomStatus.Fallen;
        [Range(0, 100)]
        public float restorationProgress = 0f;
        public bool vaultCleared = false;
        public bool cutsceneWatched = false;

        [Header("Lore")]
        public KingdomLore lore;

        public void Initialize(string id, string name, KingdomElement elem, KingdomLore kingdomLore)
        {
            kingdomId = id;
            kingdomName = name;
            element = elem;
            lore = kingdomLore;
            status = KingdomStatus.Fallen;
            restorationProgress = 0f;
            vaultCleared = false;
            cutsceneWatched = false;
        }

        public void Discover()
        {
            if (status == KingdomStatus.Fallen)
            {
                status = KingdomStatus.Discovered;
                Debug.Log($"🏰 Discovered {kingdomName}!");
            }
        }

        public void ClearVault()
        {
            if (!vaultCleared)
            {
                vaultCleared = true;
                status = KingdomStatus.VaultCleared;
                restorationProgress = 33f;
                Debug.Log($"👑 {kingdomName} vault cleared!");
            }
        }

        public void Restore(float amount)
        {
            restorationProgress = Mathf.Min(100f, restorationProgress + amount);

            if (restorationProgress >= 100f && status != KingdomStatus.Restored)
            {
                status = KingdomStatus.Restored;
                Debug.Log($"✨ {kingdomName} fully restored!");
            }
            else if (restorationProgress > 0)
            {
                status = KingdomStatus.Restoring;
            }
        }

        public void WatchCutscene()
        {
            cutsceneWatched = true;
            Debug.Log($"🎬 Watched {kingdomName} cutscene");
        }

        public Color GetColor()
        {
            switch (element)
            {
                case KingdomElement.Nature: return new Color(0.18f, 0.8f, 0.44f);
                case KingdomElement.Fire: return new Color(0.91f, 0.3f, 0.24f);
                case KingdomElement.Ice: return new Color(0.2f, 0.6f, 0.86f);
                case KingdomElement.Desert: return new Color(0.95f, 0.61f, 0.07f);
                case KingdomElement.Poison: return new Color(0.61f, 0.35f, 0.71f);
                case KingdomElement.Light: return new Color(0.93f, 0.94f, 0.95f);
                case KingdomElement.Shadow: return new Color(0.2f, 0.29f, 0.37f);
                case KingdomElement.Unified: return Color.white;
                default: return Color.gray;
            }
        }

        public bool IsAccessible()
        {
            return status != KingdomStatus.Fallen;
        }

        public string GetStatusText()
        {
            switch (status)
            {
                case KingdomStatus.Fallen:
                    return "Fallen - Not yet discovered";
                case KingdomStatus.Discovered:
                    return "Discovered - Vault awaits";
                case KingdomStatus.VaultCleared:
                    return $"Restoring - {restorationProgress:F0}%";
                case KingdomStatus.Restoring:
                    return $"Restoring - {restorationProgress:F0}%";
                case KingdomStatus.Restored:
                    return "Fully Restored";
                default:
                    return "Unknown";
            }
        }
    }
}
