using UnityEngine;

namespace GatherTheCrown.Systems
{
    /// <summary>
    /// Manages day/night cycle and time-based events
    /// </summary>
    public class TimeSystem : MonoBehaviour
    {
        private static TimeSystem _instance;
        public static TimeSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<TimeSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("TimeSystem");
                        _instance = go.AddComponent<TimeSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("Time Settings")]
        public float timeScale = 60f; // 1 real second = 1 game minute
        public float currentTime = 480f; // Start at 8:00 AM (480 minutes from midnight)

        [Header("Day/Night Cycle")]
        public float dayStartTime = 360f;   // 6:00 AM
        public float nightStartTime = 1200f; // 8:00 PM (20:00)
        public float duskStartTime = 1080f;  // 6:00 PM (18:00)
        public float dawnStartTime = 300f;   // 5:00 AM

        [Header("Current State")]
        public int currentDay = 1;
        public string timeOfDay = "Morning";
        public bool isNight = false;

        [Header("Lighting")]
        public Light directionalLight;
        public Color dayColor = new Color(1f, 0.95f, 0.8f);
        public Color duskColor = new Color(1f, 0.6f, 0.3f);
        public Color nightColor = new Color(0.2f, 0.2f, 0.4f);

        private bool hasWarnedNightfall = false;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            if (directionalLight == null)
            {
                directionalLight = FindObjectOfType<Light>();
            }
        }

        void Update()
        {
            UpdateTime();
            UpdateLighting();
            CheckNightfallWarning();
        }

        private void UpdateTime()
        {
            currentTime += Time.deltaTime * timeScale;

            // New day
            if (currentTime >= 1440f) // 24 hours = 1440 minutes
            {
                currentTime -= 1440f;
                currentDay++;
                Debug.Log($"🌅 Day {currentDay} begins!");

                // Auto-checkpoint at start of new day
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.RestPoint,
                    "New Day",
                    $"Day {currentDay} started"
                );
            }

            // Update time of day
            UpdateTimeOfDay();
        }

        private void UpdateTimeOfDay()
        {
            if (currentTime >= nightStartTime || currentTime < dawnStartTime)
            {
                timeOfDay = "Night";
                isNight = true;
            }
            else if (currentTime >= duskStartTime)
            {
                timeOfDay = "Dusk";
                isNight = false;
            }
            else if (currentTime >= 720f) // Noon
            {
                timeOfDay = "Afternoon";
                isNight = false;
            }
            else if (currentTime >= dayStartTime)
            {
                timeOfDay = "Morning";
                isNight = false;
                hasWarnedNightfall = false; // Reset warning for next night
            }
            else
            {
                timeOfDay = "Dawn";
                isNight = false;
            }
        }

        private void UpdateLighting()
        {
            if (directionalLight == null) return;

            if (isNight)
            {
                directionalLight.color = Color.Lerp(directionalLight.color, nightColor, Time.deltaTime * 0.5f);
                directionalLight.intensity = Mathf.Lerp(directionalLight.intensity, 0.3f, Time.deltaTime * 0.5f);
            }
            else if (timeOfDay == "Dusk" || timeOfDay == "Dawn")
            {
                directionalLight.color = Color.Lerp(directionalLight.color, duskColor, Time.deltaTime * 0.5f);
                directionalLight.intensity = Mathf.Lerp(directionalLight.intensity, 0.6f, Time.deltaTime * 0.5f);
            }
            else
            {
                directionalLight.color = Color.Lerp(directionalLight.color, dayColor, Time.deltaTime * 0.5f);
                directionalLight.intensity = Mathf.Lerp(directionalLight.intensity, 1f, Time.deltaTime * 0.5f);
            }

            // Rotate sun
            float sunAngle = (currentTime / 1440f) * 360f - 90f;
            directionalLight.transform.rotation = Quaternion.Euler(sunAngle, -30f, 0f);
        }

        private void CheckNightfallWarning()
        {
            // Warn player when night is approaching
            if (currentTime >= duskStartTime && currentTime < nightStartTime && !hasWarnedNightfall)
            {
                hasWarnedNightfall = true;
                Debug.Log("🌙 Night is approaching! Consider finding shelter or resting.");

                var playerNeeds = PlayerNeedsSystem.Instance;
                if (playerNeeds != null && playerNeeds.ShouldAutoRest())
                {
                    Debug.Log("💤 You and your creat are tired. Rest is recommended.");
                }
            }
        }

        public bool IsNight()
        {
            return isNight;
        }

        public string GetTimeString()
        {
            int hours = Mathf.FloorToInt(currentTime / 60f);
            int minutes = Mathf.FloorToInt(currentTime % 60f);
            string period = hours >= 12 ? "PM" : "AM";
            int displayHours = hours > 12 ? hours - 12 : (hours == 0 ? 12 : hours);
            return $"{displayHours:00}:{minutes:00} {period}";
        }

        public string GetFullTimeString()
        {
            return $"Day {currentDay}, {GetTimeString()} ({timeOfDay})";
        }

        public void AdvanceTime(float minutes)
        {
            currentTime += minutes;
            Debug.Log($"⏰ Time advanced by {minutes} minutes. Now: {GetTimeString()}");
        }

        public void RestUntilMorning()
        {
            if (isNight || currentTime > nightStartTime)
            {
                // Sleep until 8 AM next day
                float sleepTime = (1440f - currentTime) + 480f;
                currentTime = 480f;
                currentDay++;

                Debug.Log($"😴 Slept until morning. Day {currentDay}, {GetTimeString()}");

                // Restore player and creat
                var playerNeeds = PlayerNeedsSystem.Instance;
                if (playerNeeds != null)
                {
                    playerNeeds.Rest(8f);
                    playerNeeds.RestCreat(8f);
                }

                // Create checkpoint after rest
                CheckpointSystem.Instance?.CreateCheckpoint(
                    CheckpointType.RestPoint,
                    "Morning Rest",
                    "Slept until morning"
                );
            }
            else
            {
                Debug.Log("It's not night yet. Rest during evening or night.");
            }
        }
    }
}
