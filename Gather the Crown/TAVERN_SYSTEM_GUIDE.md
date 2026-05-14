# 🍺 Tavern & Social System Guide

## 🎯 Overview

The Tavern is your game's social hub - open 24/7 for players from all time zones to interact, play mini-games, bet gold, make friends, and rest between adventures!

## ✨ Key Features

### 1. **Open 24 Hours** ⏰
- Always accessible regardless of time zone
- Players from around the world can meet
- No "closing time" - tavern never sleeps
- Perfect for overnight stays (2-3 nights)

### 2. **Social Hub** 👥
- Meet other players
- Make friends
- Send private messages
- Trade items
- Form parties
- Join guilds

### 3. **Mini-Games & Betting** 🎲
- Darts (10-100g bets)
- Card games (20-200g bets)
- Arm wrestling (15-150g bets)
- Creat racing spectating
- Win real gold coins!

### 4. **Food & Drink** 🍖
- Order from tavern menu
- Restore hunger/thirst
- Social XP bonus (1.5x)
- Premium feasts available

### 5. **Overnight Stays** 🛏️
- Rent rooms (50g/night)
- Stay 1-3 nights
- Full restoration
- Advance time
- Bonus XP for rest

### 6. **Chat System** 💬
- Slide-out UI (Press Enter)
- Multiple channels
- Private messages
- Friend system
- Block users
- Emotes

## 🎮 How to Use

### Entering the Tavern
```csharp
// After completing quest or returning to home base
TavernSystem.Instance.EnterTavern("Home Base Tavern");

// Shows menu:
// 1. Order Food & Drink
// 2. Play Darts
// 3. Play Cards
// 4. Arm Wrestling
// 5. Watch Races
// 6. Tell Stories
// 7. Trade
// 8. View Players
// 9. Open Chat (Enter)
// 0. Leave
```

### Opening Chat
```
Press Enter → Chat slides in from right
Type message → Press Enter to send
Press Enter again → Chat slides out to right
```

## 🍖 Food & Drink Menu

| Item | Cost | Effect |
|------|------|--------|
| Ale | 5g | +30% thirst, +10% energy |
| Mead | 10g | +30% thirst, +15% energy |
| Bread | 5g | +20% hunger |
| Roasted Meat | 15g | +40% hunger |
| Stew | 20g | +50% hunger |
| Cheese Platter | 12g | +35% hunger |
| Fruit Bowl | 8g | +25% hunger |
| Premium Feast | 50g | +80% hunger, +20% energy |

**Bonus:** All food/drink in tavern gives 1.5x XP (social bonus)!

## 🎯 Mini-Games

### Darts 🎯
**How to Play:**
1. Choose bet amount (10-100g)
2. Press Space to throw
3. Score based on accuracy + player level
4. 80+ score = Bullseye = Win!

**Rewards:**
- Winner takes pot (2x bet)
- XP based on bet amount
- Tracked in analytics

### Card Game 🃏
**How to Play:**
1. Choose bet amount (20-200g)
2. Draw random hand (1-21)
3. Compare with opponent
4. Higher hand wins!

**Rewards:**
- Winner gets 2x bet
- Draw returns bet
- XP for playing

### Arm Wrestling 💪
**How to Play:**
1. Choose bet amount (15-150g)
2. Mash Space to win
3. Strength = Level + Bond/2
4. Beat opponent's strength

**Rewards:**
- Winner gets 2x bet
- XP for participation
- Builds reputation

## 💬 Chat System

### Opening/Closing
- **Press Enter** - Toggle chat open/close
- **Slides from right** - Smooth animation
- **Type & Enter** - Send message
- **Enter again** - Close chat

### Channels
- **Global** - Everyone in game (white)
- **Tavern** - Only tavern players (gold)
- **Party** - Your party members (cyan)
- **Whisper** - Private messages (magenta)
- **Trade** - Trading channel (green)
- **Guild** - Guild members (light blue)

### Commands
```
/help - Show all commands
/w [player] [msg] - Whisper to player
/channel [name] - Switch channel
/friend [player] - Add friend
/block [player] - Block user
/unblock [player] - Unblock user
/clear - Clear chat
/emote [text] - Send emote
```

### Examples
```
/w Player123 Hey, want to trade?
/channel tavern
/friend Player456
/emote waves at everyone
```

## 🛏️ Overnight Stays

### Renting a Room
```csharp
TavernSystem.Instance.RentRoom(2); // 2 nights
```

**Cost:** 50g per night

**Benefits:**
- Full restoration (all stats to 100%)
- Advance time (24 hours per night)
- Bonus XP (100 XP per night)
- Auto-checkpoint
- Wake up refreshed

**Perfect For:**
- After long quests
- Before major battles
- Waiting for friends
- Time zone coordination
- Multi-day events

## 👥 Social Features

### View Players in Tavern
```
Shows:
• Player name
• Level
• Creat element
• Current activity
• Online status
```

### Add Friends
```
/friend PlayerName
→ Sends friend request
→ Can PM anytime
→ See when online
→ Join their games
```

### Private Messages
```
/w PlayerName Hey!
→ Sends whisper
→ Only they see it
→ Stored in PM history
→ Can reply easily
```

### Block Users
```
/block AnnoyingPlayer
→ Can't see their messages
→ Can't join their games
→ Can't send you PMs
→ Can unblock anytime
```

## 📖 Storytelling

### Tell Stories
```csharp
TavernSystem.Instance.TellStory();
```

**Rewards:**
- Base: 50 XP
- +10 XP per player listening
- Increases creat happiness (+10%)
- Builds reputation
- Fun roleplay opportunity

**Example:**
```
"I tell the tale of how I defeated the Shadow Treant..."
→ 5 players listening
→ 50 + (5 × 10) = 100 XP!
→ Crowd loves it!
```

## 🎲 Betting & Gambling

### Stakes
- **Low Stakes:** 10-20g (casual fun)
- **Medium Stakes:** 50-100g (competitive)
- **High Stakes:** 150-200g (serious players)

### Win/Loss Tracking
- Analytics track all bets
- Win rate displayed
- Leaderboards (coming soon)
- Achievements for wins

### Fair Play
- Random + skill-based
- Level affects outcomes
- Bond level matters
- No pay-to-win

## 🌐 Cross-Time Zone Features

### Why 24/7 Matters
1. **Global Player Base** - Players from all time zones
2. **Overnight Stays** - Rent room, wake up to new day
3. **Async Multiplayer** - Leave messages, trade offers
4. **Event Coordination** - Schedule meetups
5. **Always Active** - Never empty

### Example Scenarios

**Scenario 1: Different Time Zones**
```
Player A (USA, 10 PM): Enters tavern, plays darts
Player B (Japan, 2 PM): Also in tavern, joins game
→ Both play together despite 14-hour difference!
```

**Scenario 2: Overnight Stay**
```
Player finishes quest at 11 PM
Too tired to continue
Rents room for 2 nights (100g)
Logs off
Next day: Wakes up fully restored
Time advanced 48 hours in-game
Ready for next adventure!
```

**Scenario 3: Waiting for Friends**
```
Player A arrives at tavern at 8 PM
Friend B won't be online until 9 PM
Player A: Orders food, plays darts, chats
Friend B arrives: "Ready for that dungeon?"
Both leave tavern together
```

## 💰 Economy Integration

### Earning Gold in Tavern
- Win mini-games (2x bet)
- Tell stories (XP + tips)
- Trade with players
- Complete tavern quests

### Spending Gold in Tavern
- Food & drink (5-50g)
- Mini-game bets (10-200g)
- Room rental (50g/night)
- Tips to performers
- Trade purchases

### Gold Sinks (Prevent Inflation)
- Room rental
- Food/drink
- Lost bets
- Trade fees
- Keeps economy balanced

## 📊 Analytics Tracking

### What Gets Tracked
- Most popular mini-game
- Average bet amounts
- Win/loss ratios
- Most ordered food
- Peak tavern hours
- Average stay duration
- Chat activity
- Friend connections

### Website Display
```
Tavern Statistics:
━━━━━━━━━━━━━━━━━━━━
Most Popular Game: Darts (45%)
Average Bet: 47g
Most Ordered: Ale (38%)
Peak Hours: 8-10 PM EST
Average Stay: 23 minutes
Total Gold Wagered: 1.2M
```

## 🎨 UI/UX Design

### Chat Panel
```
┌─────────────────────────┐
│ [Global] [Tavern] [PM]  │ ← Channel tabs
├─────────────────────────┤
│ 20:15 [Global] Player1: │
│   Hey everyone!         │
│                         │
│ 20:16 [Tavern] Player2: │
│   Anyone for darts?     │
│                         │
│ 20:17 [Whisper] You:    │
│   Sure, I'm in!         │
├─────────────────────────┤
│ Type message...    [Send]│ ← Input field
└─────────────────────────┘
     ↑
Slides in from right (Enter)
Slides out to right (Enter)
```

### Tavern Menu
```
🍺 TAVERN MENU
━━━━━━━━━━━━━━━━━━━━
1. 🍖 Order Food
2. 🎯 Play Darts
3. 🃏 Card Game
4. 💪 Arm Wrestling
5. 🏁 Watch Races
6. 📖 Tell Story
7. 🤝 Trade
8. 👥 View Players (12/50)
9. 💬 Chat (Press Enter)
0. 🚪 Leave Tavern
━━━━━━━━━━━━━━━━━━━━
```

## 🎯 Integration with Game Systems

### With Quest System
- Return to tavern after quests
- Meet quest givers in tavern
- Hear rumors about quests
- Form parties for quests

### With Checkpoint System
- Auto-checkpoint on entry
- Checkpoint after room rental
- Checkpoint after major wins
- Safe place to save

### With Time System
- Tavern open 24/7
- Room rental advances time
- Day/night doesn't matter
- Always welcoming

### With Preparation System
- Food/drink restore stats
- Room rental = full restore
- Social XP bonus
- Creat care available

## 🚀 Future Enhancements

### Planned Features
- [ ] Live music performances
- [ ] Tavern brawls (friendly PvP)
- [ ] Cooking competitions
- [ ] Creat shows
- [ ] Guild recruitment
- [ ] Auction house
- [ ] Quest board
- [ ] Bounty board
- [ ] Marriage ceremonies
- [ ] Holiday events

### Advanced Mini-Games
- [ ] Poker tournaments
- [ ] Chess
- [ ] Dice games
- [ ] Trivia contests
- [ ] Karaoke
- [ ] Dance-offs

## 📝 Implementation Status

### ✅ Complete
- Tavern entry/exit
- Food & drink menu
- Mini-games (darts, cards, arm wrestling)
- Chat system with slide animation
- Friend system
- Block system
- Room rental
- Storytelling
- Player viewing
- Analytics tracking

### 🎨 Needs UI
- Chat panel visual
- Tavern menu visual
- Mini-game interfaces
- Player list display
- Friend list UI

### 🌐 Needs Multiplayer
- Real player connections
- Live chat sync
- Multiplayer mini-games
- Trade system
- Party formation

---

**The tavern is your game's beating heart - where adventures begin and friendships are forged!** 🍺✨
