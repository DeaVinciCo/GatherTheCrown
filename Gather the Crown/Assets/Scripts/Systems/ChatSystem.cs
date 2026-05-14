using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace GatherTheCrown.Systems
{
    public enum ChatChannel
    {
        Global,
        Tavern,
        Party,
        Whisper,
        Trade,
        Guild
    }

    [System.Serializable]
    public class ChatMessage
    {
        public string senderId;
        public string senderName;
        public string message;
        public ChatChannel channel;
        public System.DateTime timestamp;
        public Color messageColor;
    }

    public class ChatSystem : MonoBehaviour
    {
        private static ChatSystem _instance;
        public static ChatSystem Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<ChatSystem>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("ChatSystem");
                        _instance = go.AddComponent<ChatSystem>();
                    }
                }
                return _instance;
            }
        }

        [Header("UI References")]
        public GameObject chatPanel;
        public RectTransform chatContainer;
        public InputField chatInput;
        public Text chatDisplay;
        public ScrollRect chatScrollRect;

        [Header("Settings")]
        public bool isChatOpen = false;
        public ChatChannel currentChannel = ChatChannel.Global;
        public int maxMessages = 100;
        public float slideSpeed = 500f;

        [Header("State")]
        public List<ChatMessage> messageHistory = new List<ChatMessage>();
        public Dictionary<string, List<ChatMessage>> privateMessages = new Dictionary<string, List<ChatMessage>>();
        public List<string> friendsList = new List<string>();
        public List<string> blockedUsers = new List<string>();

        [Header("Slide Animation")]
        private Vector2 openPosition = new Vector2(0, 0);
        private Vector2 closedPosition = new Vector2(400, 0); // Off-screen right
        private bool isAnimating = false;

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
            // Toggle chat with Enter key
            if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
            {
                if (isChatOpen)
                {
                    CloseChat();
                }
                else
                {
                    OpenChat();
                }
            }

            // Send message with Enter when typing
            if (isChatOpen && chatInput != null && chatInput.isFocused)
            {
                if (Input.GetKeyDown(KeyCode.Return) || Input.GetKeyDown(KeyCode.KeypadEnter))
                {
                    SendMessage(chatInput.text);
                    chatInput.text = "";
                    chatInput.ActivateInputField();
                }
            }

            // Animate slide
            if (isAnimating && chatContainer != null)
            {
                Vector2 targetPos = isChatOpen ? openPosition : closedPosition;
                chatContainer.anchoredPosition = Vector2.MoveTowards(
                    chatContainer.anchoredPosition,
                    targetPos,
                    slideSpeed * Time.deltaTime
                );

                if (Vector2.Distance(chatContainer.anchoredPosition, targetPos) < 1f)
                {
                    chatContainer.anchoredPosition = targetPos;
                    isAnimating = false;
                }
            }
        }

        // === CHAT OPEN/CLOSE ===

        /// <summary>
        /// Open chat (slide in from right)
        /// </summary>
        public void OpenChat()
        {
            if (isChatOpen) return;

            isChatOpen = true;
            isAnimating = true;

            if (chatPanel != null)
            {
                chatPanel.SetActive(true);
            }

            if (chatInput != null)
            {
                chatInput.ActivateInputField();
            }

            Debug.Log("💬 Chat opened (Press Enter to close)");
        }

        /// <summary>
        /// Close chat (slide out to right)
        /// </summary>
        public void CloseChat()
        {
            if (!isChatOpen) return;

            isChatOpen = false;
            isAnimating = true;

            if (chatInput != null)
            {
                chatInput.DeactivateInputField();
            }

            Debug.Log("💬 Chat closed");
        }

        // === SENDING MESSAGES ===

        /// <summary>
        /// Send a chat message
        /// </summary>
        public void SendMessage(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return;

            // Check for commands
            if (text.StartsWith("/"))
            {
                ProcessCommand(text);
                return;
            }

            // Create message
            var message = new ChatMessage
            {
                senderId = SystemInfo.deviceUniqueIdentifier,
                senderName = "Player", // Would come from profile
                message = text,
                channel = currentChannel,
                timestamp = System.DateTime.Now,
                messageColor = GetChannelColor(currentChannel)
            };

            // Add to history
            messageHistory.Add(message);
            if (messageHistory.Count > maxMessages)
            {
                messageHistory.RemoveAt(0);
            }

            // Display message
            DisplayMessage(message);

            Debug.Log($"[{currentChannel}] {message.senderName}: {text}");

            // Track analytics
            GameAnalyticsSystem.Instance?.TrackPreparationChoice($"chat_{currentChannel}", "Sent message");
        }

        /// <summary>
        /// Send private message
        /// </summary>
        public void SendWhisper(string targetPlayerId, string text)
        {
            var message = new ChatMessage
            {
                senderId = SystemInfo.deviceUniqueIdentifier,
                senderName = "Player",
                message = text,
                channel = ChatChannel.Whisper,
                timestamp = System.DateTime.Now,
                messageColor = Color.magenta
            };

            // Store in private messages
            if (!privateMessages.ContainsKey(targetPlayerId))
            {
                privateMessages[targetPlayerId] = new List<ChatMessage>();
            }
            privateMessages[targetPlayerId].Add(message);

            DisplayMessage(message, $"[Whisper to {targetPlayerId}]");
            Debug.Log($"📨 Whisper sent to {targetPlayerId}: {text}");
        }

        // === DISPLAY ===

        private void DisplayMessage(ChatMessage message, string prefix = "")
        {
            if (chatDisplay == null) return;

            string timestamp = message.timestamp.ToString("HH:mm");
            string channelTag = $"[{message.channel}]";
            string fullMessage = $"{timestamp} {channelTag} {prefix} {message.senderName}: {message.message}\n";

            chatDisplay.text += fullMessage;

            // Auto-scroll to bottom
            if (chatScrollRect != null)
            {
                Canvas.ForceUpdateCanvases();
                chatScrollRect.verticalNormalizedPosition = 0f;
            }
        }

        private Color GetChannelColor(ChatChannel channel)
        {
            switch (channel)
            {
                case ChatChannel.Global: return Color.white;
                case ChatChannel.Tavern: return new Color(1f, 0.8f, 0.4f); // Gold
                case ChatChannel.Party: return Color.cyan;
                case ChatChannel.Whisper: return Color.magenta;
                case ChatChannel.Trade: return Color.green;
                case ChatChannel.Guild: return new Color(0.5f, 0.5f, 1f); // Light blue
                default: return Color.white;
            }
        }

        // === COMMANDS ===

        private void ProcessCommand(string command)
        {
            string[] parts = command.Split(' ');
            string cmd = parts[0].ToLower();

            switch (cmd)
            {
                case "/help":
                    ShowHelp();
                    break;

                case "/w":
                case "/whisper":
                    if (parts.Length >= 3)
                    {
                        string target = parts[1];
                        string message = string.Join(" ", parts, 2, parts.Length - 2);
                        SendWhisper(target, message);
                    }
                    else
                    {
                        Debug.Log("Usage: /w [player] [message]");
                    }
                    break;

                case "/channel":
                case "/ch":
                    if (parts.Length >= 2)
                    {
                        SwitchChannel(parts[1]);
                    }
                    else
                    {
                        Debug.Log($"Current channel: {currentChannel}");
                    }
                    break;

                case "/friend":
                case "/f":
                    if (parts.Length >= 2)
                    {
                        AddFriend(parts[1]);
                    }
                    break;

                case "/block":
                    if (parts.Length >= 2)
                    {
                        BlockUser(parts[1]);
                    }
                    break;

                case "/unblock":
                    if (parts.Length >= 2)
                    {
                        UnblockUser(parts[1]);
                    }
                    break;

                case "/clear":
                    ClearChat();
                    break;

                case "/emote":
                case "/e":
                    if (parts.Length >= 2)
                    {
                        string emote = string.Join(" ", parts, 1, parts.Length - 1);
                        SendEmote(emote);
                    }
                    break;

                default:
                    Debug.Log($"Unknown command: {cmd}. Type /help for commands.");
                    break;
            }
        }

        private void ShowHelp()
        {
            Debug.Log("\n=== 💬 CHAT COMMANDS ===");
            Debug.Log("/help - Show this help");
            Debug.Log("/w [player] [msg] - Whisper to player");
            Debug.Log("/channel [name] - Switch channel (global, tavern, party, trade)");
            Debug.Log("/friend [player] - Add friend");
            Debug.Log("/block [player] - Block user");
            Debug.Log("/unblock [player] - Unblock user");
            Debug.Log("/clear - Clear chat");
            Debug.Log("/emote [text] - Send emote");
            Debug.Log("========================\n");
        }

        private void SwitchChannel(string channelName)
        {
            switch (channelName.ToLower())
            {
                case "global":
                    currentChannel = ChatChannel.Global;
                    break;
                case "tavern":
                    currentChannel = ChatChannel.Tavern;
                    break;
                case "party":
                    currentChannel = ChatChannel.Party;
                    break;
                case "trade":
                    currentChannel = ChatChannel.Trade;
                    break;
                case "guild":
                    currentChannel = ChatChannel.Guild;
                    break;
                default:
                    Debug.Log($"Unknown channel: {channelName}");
                    return;
            }

            Debug.Log($"📻 Switched to {currentChannel} channel");
        }

        private void SendEmote(string emote)
        {
            var message = new ChatMessage
            {
                senderId = SystemInfo.deviceUniqueIdentifier,
                senderName = "Player",
                message = $"*{emote}*",
                channel = currentChannel,
                timestamp = System.DateTime.Now,
                messageColor = Color.yellow
            };

            messageHistory.Add(message);
            DisplayMessage(message);
        }

        // === FRIENDS & BLOCKING ===

        private void AddFriend(string playerId)
        {
            if (!friendsList.Contains(playerId))
            {
                friendsList.Add(playerId);
                Debug.Log($"✅ Added {playerId} as friend");
                
                // Send friend request (would integrate with multiplayer)
                TavernSystem.Instance?.SendFriendRequest(playerId);
            }
            else
            {
                Debug.Log($"{playerId} is already your friend");
            }
        }

        private void BlockUser(string playerId)
        {
            if (!blockedUsers.Contains(playerId))
            {
                blockedUsers.Add(playerId);
                Debug.Log($"🚫 Blocked {playerId}");
            }
        }

        private void UnblockUser(string playerId)
        {
            if (blockedUsers.Contains(playerId))
            {
                blockedUsers.Remove(playerId);
                Debug.Log($"✅ Unblocked {playerId}");
            }
        }

        private void ClearChat()
        {
            if (chatDisplay != null)
            {
                chatDisplay.text = "";
            }
            Debug.Log("💬 Chat cleared");
        }

        // === UTILITY ===

        /// <summary>
        /// Check if user is blocked
        /// </summary>
        public bool IsBlocked(string playerId)
        {
            return blockedUsers.Contains(playerId);
        }

        /// <summary>
        /// Check if user is friend
        /// </summary>
        public bool IsFriend(string playerId)
        {
            return friendsList.Contains(playerId);
        }

        /// <summary>
        /// Get chat history for channel
        /// </summary>
        public List<ChatMessage> GetChannelHistory(ChatChannel channel)
        {
            return messageHistory.FindAll(m => m.channel == channel);
        }
    }
}
