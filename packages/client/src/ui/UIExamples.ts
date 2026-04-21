/**
 * Integration Examples: How to Use New UI + 3D Foundation
 */

// ============================================
// EXAMPLE 1: Using the Modern UI System
// ============================================

import { createButton, createPanel, createMenu, createInput, createBadge } from './ui/UIComponents';
import { ModernChatUI } from './ui/ModernChatUI';
import { UITheme } from './ui/UITheme';

export function exampleModernUI() {
  // Create a game menu panel
  const menuPanel = createPanel({
    title: '🎮 Main Menu',
    width: 400,
    height: 300,
    draggable: true,
    closeable: true,
  });

  // Get the content area
  const content = menuPanel.querySelector('div:last-child') as HTMLDivElement;

  // Add buttons
  const startButton = createButton({
    text: '▶️ Start Game',
    onClick: () => console.log('Game started!'),
    variant: 'primary',
    size: 'lg',
  });

  const settingsButton = createButton({
    text: '⚙️ Settings',
    onClick: () => console.log('Settings opened'),
    variant: 'secondary',
    size: 'lg',
  });

  const quitButton = createButton({
    text: '✕ Quit',
    onClick: () => menuPanel.remove(),
    variant: 'danger',
    size: 'lg',
  });

  // Style the buttons
  [startButton, settingsButton, quitButton].forEach((btn) => {
    btn.style.width = '100%';
    btn.style.marginBottom = UITheme.spacing.md;
  });

  content.appendChild(startButton);
  content.appendChild(settingsButton);
  content.appendChild(quitButton);

  return menuPanel;
}

// ============================================
// EXAMPLE 2: Using the Chat System
// ============================================

export function exampleModernChat() {
  const chatContainer = document.createElement('div');
  chatContainer.id = 'game-chat';
  chatContainer.style.width = '350px';
  chatContainer.style.height = '400px';
  chatContainer.style.position = 'fixed';
  chatContainer.style.bottom = '20px';
  chatContainer.style.right = '20px';
  chatContainer.style.zIndex = '200';
  document.body.appendChild(chatContainer);

  // Create chat UI
  const chat = new ModernChatUI(chatContainer, { maxMessages: 50 });

  // Set up event listener
  chat.onSend((message) => {
    console.log('User sent:', message);

    // Add user's message to chat
    chat.addMessage({
      player: 'You',
      text: message,
      type: 'player',
      timestamp: new Date(),
    });

    // Simulate server response
    setTimeout(() => {
      chat.addMessage({
        player: 'System',
        text: 'Message received!',
        type: 'system',
        timestamp: new Date(),
      });
    }, 500);
  });

  // Add some welcome messages
  chat.addMessage({
    player: 'System',
    text: 'Welcome to Gather The Crown!',
    type: 'system',
    timestamp: new Date(),
  });

  chat.addMessage({
    player: 'Hero',
    text: 'Let\'s defeat the dragon!',
    type: 'player',
    timestamp: new Date(),
  });

  // Update online count
  chat.setOnlineCount(5);

  return chat;
}

// ============================================
// EXAMPLE 3: Context Menu (Right-Click)
// ============================================

export function exampleContextMenu() {
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // Create context menu
    const menu = createMenu({
      items: [
        { id: 'attack', label: '⚔️ Attack', icon: '⚔️' },
        { id: 'defend', label: '🛡️ Defend', icon: '🛡️' },
        { id: 'cast', label: '✨ Cast Spell', icon: '✨' },
        { divider: true },
        { id: 'inventory', label: '🎒 Inventory', icon: '🎒' },
        { id: 'map', label: '🗺️ Map', icon: '🗺️' },
        { divider: true },
        { id: 'flee', label: '🏃 Flee', icon: '🏃', disabled: false },
      ],
      x: e.clientX,
      y: e.clientY,
      onItemClick: (itemId) => {
        console.log('Clicked:', itemId);
      },
    });

    document.body.appendChild(menu);
  });
}

// ============================================
// EXAMPLE 4: Inventory Panel
// ============================================

export function exampleInventoryPanel() {
  const inventory = createPanel({
    title: '🎒 Inventory',
    width: 500,
    height: 600,
    x: 100,
    y: 100,
    draggable: true,
    closeable: true,
  });

  const content = inventory.querySelector('div:last-child') as HTMLDivElement;

  // Add inventory grid
  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: ${UITheme.spacing.md};
  `;

  // Sample items
  const items = [
    { name: 'Sword', rarity: 'rare' },
    { name: 'Shield', rarity: 'uncommon' },
    { name: 'Health Potion', rarity: 'common' },
    { name: 'Mana Potion', rarity: 'common' },
  ];

  items.forEach((item) => {
    const itemSlot = document.createElement('div');
    itemSlot.style.cssText = `
      aspect-ratio: 1;
      background: ${UITheme.colors.bg.surface};
      border: 2px solid ${UITheme.colors.border};
      border-radius: ${UITheme.borderRadius.md};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: ${UITheme.transitions.fast};
      padding: ${UITheme.spacing.md};
      text-align: center;
    `;

    const rarityColors: { [key: string]: string } = {
      common: UITheme.colors.text.secondary,
      uncommon: UITheme.colors.secondary,
      rare: UITheme.colors.primary,
      epic: UITheme.colors.accent,
    };

    const nameEl = document.createElement('span');
    nameEl.textContent = item.name;
    nameEl.style.cssText = `
      color: ${rarityColors[item.rarity] || UITheme.colors.text.primary};
      font-weight: ${UITheme.typography.weights.semibold};
      font-size: ${UITheme.typography.sizes.sm};
    `;

    const rarityEl = document.createElement('span');
    rarityEl.textContent = item.rarity;
    rarityEl.style.cssText = `
      color: ${UITheme.colors.text.muted};
      font-size: ${UITheme.typography.sizes.xs};
      margin-top: ${UITheme.spacing.xs};
    `;

    itemSlot.appendChild(nameEl);
    itemSlot.appendChild(rarityEl);

    itemSlot.addEventListener('mouseenter', () => {
      itemSlot.style.backgroundColor = UITheme.colors.bg.hover;
      itemSlot.style.borderColor = UITheme.colors.primary;
      itemSlot.style.boxShadow = UITheme.shadows.md;
    });

    itemSlot.addEventListener('mouseleave', () => {
      itemSlot.style.backgroundColor = UITheme.colors.bg.surface;
      itemSlot.style.borderColor = UITheme.colors.border;
      itemSlot.style.boxShadow = 'none';
    });

    grid.appendChild(itemSlot);
  });

  content.appendChild(grid);
  return inventory;
}

// ============================================
// EXAMPLE 5: Status HUD (Health, Mana, Stats)
// ============================================

export function exampleStatusHUD() {
  const hud = document.createElement('div');
  hud.style.cssText = `
    position: fixed;
    top: ${UITheme.spacing.lg};
    left: ${UITheme.spacing.lg};
    background: ${UITheme.colors.bg.surface};
    border: 1px solid ${UITheme.colors.borderLight};
    border-radius: ${UITheme.borderRadius.lg};
    padding: ${UITheme.spacing.lg};
    width: 300px;
    box-shadow: ${UITheme.shadows.lg};
    font-family: ${UITheme.typography.fontFamily};
  `;

  // Player name and level
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${UITheme.spacing.md};
  `;

  const playerName = document.createElement('h3');
  playerName.textContent = 'Hero';
  playerName.style.cssText = `
    margin: 0;
    color: ${UITheme.colors.text.primary};
    font-size: ${UITheme.typography.sizes.lg};
  `;

  const level = document.createElement('span');
  level.appendChild(createBadge('Lvl 5', 'primary'));
  header.appendChild(playerName);
  header.appendChild(level);
  hud.appendChild(header);

  // Health bar
  const healthSection = document.createElement('div');
  healthSection.style.marginBottom = UITheme.spacing.md;

  const healthLabel = document.createElement('div');
  healthLabel.textContent = 'Health: 75 / 100';
  healthLabel.style.cssText = `
    font-size: ${UITheme.typography.sizes.sm};
    color: ${UITheme.colors.text.secondary};
    margin-bottom: ${UITheme.spacing.xs};
  `;

  const healthBar = document.createElement('div');
  healthBar.style.cssText = `
    width: 100%;
    height: 20px;
    background: ${UITheme.colors.bg.darker};
    border-radius: ${UITheme.borderRadius.sm};
    border: 1px solid ${UITheme.colors.border};
    overflow: hidden;
  `;

  const healthFill = document.createElement('div');
  healthFill.style.cssText = `
    width: 75%;
    height: 100%;
    background: linear-gradient(90deg, ${UITheme.colors.text.error}, ${UITheme.colors.text.warning});
    transition: width 0.5s ease;
  `;
  healthBar.appendChild(healthFill);
  healthSection.appendChild(healthLabel);
  healthSection.appendChild(healthBar);
  hud.appendChild(healthSection);

  // Mana bar
  const manaSection = document.createElement('div');
  const manaLabel = document.createElement('div');
  manaLabel.textContent = 'Mana: 60 / 100';
  manaLabel.style.cssText = `
    font-size: ${UITheme.typography.sizes.sm};
    color: ${UITheme.colors.text.secondary};
    margin-bottom: ${UITheme.spacing.xs};
  `;

  const manaBar = document.createElement('div');
  manaBar.style.cssText = `
    width: 100%;
    height: 20px;
    background: ${UITheme.colors.bg.darker};
    border-radius: ${UITheme.borderRadius.sm};
    border: 1px solid ${UITheme.colors.border};
    overflow: hidden;
  `;

  const manaFill = document.createElement('div');
  manaFill.style.cssText = `
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, ${UITheme.colors.primary}, ${UITheme.colors.primaryLight});
    transition: width 0.5s ease;
  `;
  manaBar.appendChild(manaFill);
  manaSection.appendChild(manaLabel);
  manaSection.appendChild(manaBar);
  hud.appendChild(manaSection);

  return hud;
}

// ============================================
// EXAMPLE 6: 3D Scene (Future Integration)
// ============================================

import { BabylonGameEngine, Creature3D, Item3D } from './scenes/3D/BabylonGameEngine';

export function example3DScene() {
  // Note: Babylon.js needs to be imported in your main.ts first
  // This is just an example of how to use it

  /*
  const engine = new BabylonGameEngine('gameCanvas');
  
  // Create player
  engine.createPlayer({ x: 0, y: 1, z: 0 });
  
  // Create creatures
  const creature: Creature3D = {
    id: 'dragon-1',
    name: 'Fire Dragon',
    position: { x: 10, y: 1, z: 10 },
    health: 100,
    maxHealth: 100,
    isAlive: true,
  };
  engine.createCreature(creature);
  
  // Create items
  const item: Item3D = {
    id: 'gold-1',
    name: 'Gold Coins',
    position: { x: 5, y: 0.5, z: 5 },
    type: 'gold',
  };
  engine.createItem(item);
  
  // Start rendering
  engine.start();
  
  // Update positions over time
  setInterval(() => {
    engine.updatePlayerPosition({ x: 0, y: 1, z: 5 });
  }, 100);
  */
}

// ============================================
// EXAMPLE 7: Full Game UI Layout
// ============================================

export function exampleFullGameUI() {
  // Create HUD
  const hud = exampleStatusHUD();

  // Create chat
  const chat = exampleModernChat();

  // Create a simple button to open inventory
  const inventoryBtn = createButton({
    text: '🎒 Inventory',
    onClick: () => {
      const inv = exampleInventoryPanel();
      document.body.appendChild(inv);
    },
    variant: 'secondary',
    size: 'md',
  });

  inventoryBtn.style.cssText = `
    position: fixed;
    bottom: ${UITheme.spacing.lg};
    left: ${UITheme.spacing.lg};
  `;

  document.body.appendChild(inventoryBtn);

  // Add context menu
  exampleContextMenu();

  console.log('Full game UI loaded!');
}

// ============================================
// STARTUP
// ============================================

// Uncomment to test:
// exampleFullGameUI();
