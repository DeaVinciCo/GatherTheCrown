import { MASTER_ITEM_CATALOG, getItemById, type ItemRarity, type ItemCategory } from '../systems/MasterItemCatalog';

export interface InventoryItem {
  id: string;
  name: string;
  equipped?: boolean;
  favorite?: boolean;
  collectedAt?: number;
  neededForQuest?: boolean;
  neededForCrafting?: boolean;
}

interface InventoryMenuOptions {
  playerLevel?: number;
}

type InventoryViewCategory =
  | 'all'
  | 'favorites'
  | 'weapons'
  | 'armor'
  | 'clothing-outerwear'
  | 'consumables'
  | 'food-water'
  | 'materials'
  | 'crafting'
  | 'quest-items'
  | 'key-items'
  | 'relics'
  | 'creat-care'
  | 'riding-gear'
  | 'recent'
  | 'need-quest'
  | 'need-crafting';

interface ItemSpecView {
  category: ItemCategory | 'unknown';
  rarity: ItemRarity | 'common';
  description: string;
  tags: string[];
}

export class InventoryMenu {
  private root: HTMLDivElement;
  private items: InventoryItem[];
  private onClose: (items: InventoryItem[]) => void;
  private playerLevel: number;
  private activeCategory: InventoryViewCategory = 'all';
  private list!: HTMLDivElement;
  private summaryText!: HTMLDivElement;

  constructor(items: InventoryItem[], onClose: (items: InventoryItem[]) => void, options?: InventoryMenuOptions) {
    this.items = items;
    this.onClose = onClose;
    this.playerLevel = Math.max(1, Math.floor(options?.playerLevel || 1));
    this.normalizeItemMeta();

    this.root = document.createElement('div');
    this.root.className = 'inventory-menu';
    Object.assign(this.root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(760px, 94vw)',
      maxHeight: '78vh',
      overflowY: 'auto',
      background: 'rgba(7, 16, 32, 0.72)',
      backdropFilter: 'blur(6px)',
      color: '#e2e8f0',
      padding: '12px',
      border: '1px solid rgba(148, 163, 184, 0.45)',
      borderRadius: '12px',
      boxShadow: '0 14px 36px rgba(0,0,0,0.4)',
      zIndex: '110',
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px',
      paddingBottom: '8px',
      borderBottom: '1px solid rgba(148, 163, 184, 0.25)'
    });

    const title = document.createElement('h3');
    title.innerText = 'Inventory';
    Object.assign(title.style, {
      margin: '0',
      color: '#f8fafc',
      fontSize: '19px',
      letterSpacing: '0.4px'
    });

    const subtitle = document.createElement('div');
    subtitle.innerText = `Level ${this.playerLevel} pack`;
    Object.assign(subtitle.style, {
      color: '#93c5fd',
      fontSize: '12px',
      fontWeight: '600'
    });

    header.appendChild(title);
    header.appendChild(subtitle);
    this.root.appendChild(header);

    this.summaryText = document.createElement('div');
    Object.assign(this.summaryText.style, {
      color: '#bfdbfe',
      fontSize: '12px',
      marginBottom: '10px'
    });
    this.root.appendChild(this.summaryText);

    const tabRow = document.createElement('div');
    Object.assign(tabRow.style, {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '10px'
    });

    const tabs: Array<{ id: InventoryViewCategory; label: string }> = [
      { id: 'all', label: 'All' },
      { id: 'favorites', label: 'Favorites' },
      { id: 'weapons', label: 'Weapons' },
      { id: 'armor', label: 'Armor' },
      { id: 'clothing-outerwear', label: 'Clothing' },
      { id: 'consumables', label: 'Consumables' },
      { id: 'food-water', label: 'Food & Water' },
      { id: 'materials', label: 'Materials' },
      { id: 'crafting', label: 'Crafting' },
      { id: 'quest-items', label: 'Quest Items' },
      { id: 'key-items', label: 'Key Items' },
      { id: 'relics', label: 'Relics' },
      { id: 'creat-care', label: 'Creat Care' },
      { id: 'riding-gear', label: 'Riding Gear' },
      { id: 'recent', label: 'Recent' },
      { id: 'need-quest', label: 'Needed Now' },
      { id: 'need-crafting', label: 'Needed Crafting' }
    ];

    for (const tab of tabs) {
      const btn = document.createElement('button');
      btn.innerText = tab.label;
      Object.assign(btn.style, {
        padding: '6px 8px',
        borderRadius: '7px',
        border: '1px solid #334155',
        background: tab.id === this.activeCategory ? '#0f766e' : '#111827',
        color: tab.id === this.activeCategory ? '#ecfeff' : '#cbd5e1',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: '700'
      });
      btn.onclick = () => {
        this.activeCategory = tab.id;
        Array.from(tabRow.querySelectorAll('button')).forEach((b) => {
          const isActive = (b as HTMLButtonElement).innerText === tab.label;
          (b as HTMLButtonElement).style.background = isActive ? '#0f766e' : '#111827';
          (b as HTMLButtonElement).style.color = isActive ? '#ecfeff' : '#cbd5e1';
        });
        this.renderItems();
      };
      tabRow.appendChild(btn);
    }

    this.root.appendChild(tabRow);

    this.list = document.createElement('div');
    Object.assign(this.list.style, {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '8px'
    });

    this.root.appendChild(this.list);
    this.renderItems();

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    closeBtn.style.display = 'block';
    closeBtn.style.marginTop = '12px';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '8px';
    closeBtn.style.borderRadius = '7px';
    closeBtn.style.border = '1px solid #475569';
    closeBtn.style.background = '#111827';
    closeBtn.style.color = '#cbd5e1';
    closeBtn.style.cursor = 'pointer';
    closeBtn.onclick = () => this.close();
    this.root.appendChild(closeBtn);
  }

  private normalizeItemMeta() {
    for (const item of this.items) {
      if (typeof item.favorite !== 'boolean') item.favorite = false;
      if (!item.collectedAt) {
        const inferred = this.inferCollectedAtFromId(item.id);
        item.collectedAt = inferred ?? Date.now();
      }
    }
  }

  private inferCollectedAtFromId(id: string): number | null {
    const parts = id.split('-');
    for (let i = parts.length - 1; i >= 0; i -= 1) {
      const value = Number(parts[i]);
      if (!Number.isFinite(value)) continue;
      if (value > 1000000000000 && value < 9999999999999) return value;
    }
    return null;
  }

  private renderItems() {
    this.list.innerHTML = '';
    const compact = window.innerWidth <= 640;

    const unlockedSlots = this.getUnlockedSlots();
    const usedSlots = this.items.length;
    const freeSlots = Math.max(0, unlockedSlots - usedSlots);
    const lockedSlots = Math.max(0, this.getMaxSlots() - unlockedSlots);
    const keyCount = this.items.filter((item) => this.isKeyItem(item)).length;
    const questCount = this.items.filter((item) => this.isQuestItem(item)).length;
    const neededNowCount = this.items.filter((item) => this.isNeededNow(item)).length;

    const filtered = this.getFilteredItems();
    this.summaryText.innerText = `View: ${this.prettyView(this.activeCategory)} (${filtered.length})  |  Slots: ${usedSlots}/${unlockedSlots} unlocked  |  ${freeSlots} free  |  ${lockedSlots} locked  |  Key: ${keyCount}  Quest: ${questCount}  Needed Now: ${neededNowCount}`;
    this.summaryText.style.fontSize = compact ? '11px' : '12px';

    filtered.forEach((item) => {
      const slot = document.createElement('div');
      Object.assign(slot.style, {
        margin: '0',
        padding: '10px',
        borderRadius: '10px',
        border: item.equipped ? '1px solid rgba(34, 197, 94, 0.75)' : '1px solid rgba(148, 163, 184, 0.3)',
        background: item.equipped ? 'rgba(21, 128, 61, 0.26)' : 'rgba(15, 23, 42, 0.55)'
      });

      const spec = this.getItemSpec(item);

      const topRow = document.createElement('div');
      Object.assign(topRow.style, {
        display: 'flex',
        flexWrap: compact ? 'wrap' : 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '10px'
      });

      const label = document.createElement('span');
      label.innerText = `${item.favorite ? '? ' : ''}${item.name}`;
      Object.assign(label.style, {
        fontWeight: '700',
        color: '#f8fafc',
        fontSize: compact ? '13px' : '14px'
      });

      const badges = document.createElement('span');
      badges.innerText = `${this.prettyCategory(spec.category)}  |  ${this.prettyRarity(spec.rarity)}`;
      Object.assign(badges.style, {
        fontSize: compact ? '10px' : '11px',
        color: this.rarityColor(spec.rarity),
        fontWeight: '700',
        whiteSpace: compact ? 'normal' : 'nowrap'
      });

      topRow.appendChild(label);
      topRow.appendChild(badges);
      slot.appendChild(topRow);

      const markerRow = document.createElement('div');
      Object.assign(markerRow.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: compact ? '7px' : '6px',
        marginTop: '4px'
      });

      const addMarker = (text: string, color: string, bg: string) => {
        const chip = document.createElement('span');
        chip.innerText = text;
        Object.assign(chip.style, {
          padding: compact ? '3px 8px' : '2px 6px',
          borderRadius: '999px',
          fontSize: compact ? '11px' : '10px',
          fontWeight: '700',
          color,
          background: bg,
          border: `1px solid ${color}`
        });
        markerRow.appendChild(chip);
      };

      if (this.isKeyItem(item)) addMarker('KEY ITEM', '#fbbf24', 'rgba(120, 53, 15, 0.35)');
      if (this.isQuestItem(item)) addMarker('QUEST ITEM', '#a78bfa', 'rgba(76, 29, 149, 0.32)');
      if (this.isNeededNow(item)) addMarker('NEEDED NOW', '#22d3ee', 'rgba(8, 47, 73, 0.35)');

      if (markerRow.childElementCount > 0) {
        slot.appendChild(markerRow);
      }

      const tagLine = document.createElement('div');
      tagLine.innerText = spec.tags.length ? spec.tags.slice(0, 5).join(' � ') : 'untagged';
      Object.assign(tagLine.style, {
        marginTop: '2px',
        color: '#94a3b8',
        fontSize: '11px'
      });
      slot.appendChild(tagLine);

      const desc = document.createElement('div');
      desc.innerText = spec.description;
      Object.assign(desc.style, {
        marginTop: '4px',
        marginBottom: '8px',
        color: '#cbd5e1',
        fontSize: '12px',
        lineHeight: '1.35'
      });
      slot.appendChild(desc);

      const buttonRow = document.createElement('div');
      Object.assign(buttonRow.style, {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
      });

      const equipBtn = document.createElement('button');
      equipBtn.innerText = item.equipped ? 'Unequip' : 'Equip';
      Object.assign(equipBtn.style, {
        minWidth: '112px',
        padding: '7px',
        borderRadius: '7px',
        border: item.equipped ? '1px solid #65a30d' : '1px solid #475569',
        background: item.equipped ? '#166534' : '#1e293b',
        color: item.equipped ? '#dcfce7' : '#e2e8f0',
        cursor: 'pointer',
        fontWeight: '600'
      });
      equipBtn.onclick = () => {
        item.equipped = !item.equipped;
        equipBtn.innerText = item.equipped ? 'Unequip' : 'Equip';
        slot.style.border = item.equipped ? '1px solid rgba(34, 197, 94, 0.75)' : '1px solid rgba(148, 163, 184, 0.3)';
        slot.style.background = item.equipped ? 'rgba(21, 128, 61, 0.26)' : 'rgba(15, 23, 42, 0.55)';
        equipBtn.style.border = item.equipped ? '1px solid #65a30d' : '1px solid #475569';
        equipBtn.style.background = item.equipped ? '#166534' : '#1e293b';
        equipBtn.style.color = item.equipped ? '#dcfce7' : '#e2e8f0';
      };
      buttonRow.appendChild(equipBtn);

      const favoriteBtn = document.createElement('button');
      favoriteBtn.innerText = item.favorite ? 'Unfavorite' : 'Favorite';
      Object.assign(favoriteBtn.style, {
        minWidth: '112px',
        padding: '7px',
        borderRadius: '7px',
        border: '1px solid #475569',
        background: item.favorite ? '#854d0e' : '#1e293b',
        color: item.favorite ? '#fef3c7' : '#e2e8f0',
        cursor: 'pointer',
        fontWeight: '600'
      });
      favoriteBtn.onclick = () => {
        item.favorite = !item.favorite;
        favoriteBtn.innerText = item.favorite ? 'Unfavorite' : 'Favorite';
        favoriteBtn.style.background = item.favorite ? '#854d0e' : '#1e293b';
        favoriteBtn.style.color = item.favorite ? '#fef3c7' : '#e2e8f0';
        this.renderItems();
      };
      buttonRow.appendChild(favoriteBtn);

      slot.appendChild(buttonRow);
      this.list.appendChild(slot);
    });

    const visibleEmptySlots = Math.min(4, freeSlots);
    for (let i = 0; i < visibleEmptySlots; i += 1) {
      const emptySlot = document.createElement('div');
      Object.assign(emptySlot.style, {
        padding: '10px',
        borderRadius: '10px',
        border: '1px dashed rgba(148, 163, 184, 0.4)',
        background: 'rgba(15, 23, 42, 0.32)',
        color: '#94a3b8',
        fontSize: '12px'
      });
      emptySlot.innerText = 'Empty slot';
      this.list.appendChild(emptySlot);
    }

    const visibleLockedSlots = Math.min(4, lockedSlots);
    for (let i = 0; i < visibleLockedSlots; i += 1) {
      const locked = document.createElement('div');
      Object.assign(locked.style, {
        padding: '10px',
        borderRadius: '10px',
        border: '1px dashed rgba(239, 68, 68, 0.45)',
        background: 'rgba(30, 41, 59, 0.45)',
        color: '#fca5a5',
        fontSize: '12px'
      });
      locked.innerText = `Locked slot (unlock at level ${this.playerLevel + 1})`;
      this.list.appendChild(locked);
    }

    if (usedSlots > unlockedSlots) {
      const warning = document.createElement('div');
      Object.assign(warning.style, {
        marginTop: '8px',
        color: '#fde68a',
        fontSize: '12px',
        fontWeight: '700'
      });
      warning.innerText = 'Use your discernment: inventory overflowing from past journeys. Level up to expand your capacity.';
      this.list.appendChild(warning);
    }
  }

  private getFilteredItems() {
    let result = this.items.filter((item) => this.matchesView(item));
    if (this.activeCategory === 'recent') {
      result = [...result].sort((a, b) => (b.collectedAt || 0) - (a.collectedAt || 0));
    }
    return result;
  }

  private matchesView(item: InventoryItem) {
    if (this.activeCategory === 'all') return true;

    const spec = this.getItemSpec(item);
    const tags = new Set(spec.tags);

    if (this.activeCategory === 'favorites') return !!item.favorite;
    if (this.activeCategory === 'recent') return true;
    if (this.activeCategory === 'need-quest') {
      return !!item.neededForQuest;
    }
    if (this.activeCategory === 'need-crafting') {
      return !!item.neededForCrafting || spec.category === 'material' || tags.has('crafting') || tags.has('alchemy');
    }

    // New granular equipment categories
    if (this.activeCategory === 'weapons') {
      return spec.category === 'weapon' || tags.has('weapon') || tags.has('sword') || tags.has('staff') || tags.has('bow') || tags.has('shield');
    }
    if (this.activeCategory === 'armor') {
      return spec.category === 'armor' || tags.has('armor') || tags.has('helmet') || tags.has('chest-armor') || tags.has('gauntlets') || tags.has('boots') || tags.has('elemental-cloak');
    }
    if (this.activeCategory === 'clothing-outerwear') {
      return spec.category === 'clothing' || tags.has('clothing') || tags.has('coat') || tags.has('scarf') || tags.has('hood') || tags.has('weather-gear') || tags.has('cosmetic-outfit');
    }
    
    if (this.activeCategory === 'consumables') {
      return spec.category === 'potion' || tags.has('consumable') || tags.has('potion');
    }
    
    // Merged food category (includes fish and water)
    if (this.activeCategory === 'food-water') {
      return spec.category === 'food' || tags.has('food') || tags.has('fishing') || tags.has('fish') || tags.has('water') || tags.has('drink') || tags.has('tea') || item.name.toLowerCase().includes('fish');
    }
    
    if (this.activeCategory === 'materials') {
      return spec.category === 'material' || tags.has('material') || tags.has('ore') || tags.has('bark') || tags.has('resin') || tags.has('scales') || tags.has('fibers') || tags.has('crystals') || tags.has('wood') || tags.has('sap');
    }
    
    if (this.activeCategory === 'crafting') {
      return tags.has('crafting') || tags.has('alchemy') || tags.has('potion-base') || tags.has('refined-cloth') || tags.has('forged-alloy') || tags.has('treated-leather') || tags.has('trap-kit') || tags.has('spell-catalyst');
    }
    
    if (this.activeCategory === 'quest-items') {
      return spec.category === 'quest-item' || tags.has('quest-item') || tags.has('quest-start');
    }
    
    if (this.activeCategory === 'key-items') {
      return spec.category === 'key' || tags.has('key') || tags.has('door-key') || tags.has('treasure-key');
    }
    
    if (this.activeCategory === 'relics') {
      return spec.rarity === 'epic' || spec.rarity === 'legendary' || tags.has('crown') || tags.has('sigil') || tags.has('relic');
    }
    
    if (this.activeCategory === 'creat-care') {
      return tags.has('creat-care') || tags.has('creat-food') || spec.category === 'creat-armor' || tags.has('creat-essence');
    }
    
    if (this.activeCategory === 'riding-gear') {
      return tags.has('riding-gear') || spec.category === 'riding-gear' || tags.has('saddle') || tags.has('bridle') || tags.has('mount-armor');
    }

    return true;
  }

  private isKeyItem(item: InventoryItem) {
    const spec = this.getItemSpec(item);
    return spec.category === 'key' || spec.tags.includes('key') || spec.tags.includes('door-key') || spec.tags.includes('treasure-key');
  }

  private isQuestItem(item: InventoryItem) {
    const spec = this.getItemSpec(item);
    return spec.category === 'quest-item' || spec.tags.includes('quest-item') || spec.tags.includes('quest-start');
  }

  private isNeededNow(item: InventoryItem) {
    return !!item.neededForQuest || !!item.neededForCrafting;
  }

  private getUnlockedSlots() {
    return Math.min(this.getMaxSlots(), 12 + (this.playerLevel - 1) * 2);
  }

  private getMaxSlots() {
    return 72;
  }

  private getItemSpec(item: InventoryItem): ItemSpecView {
    const exact = getItemById(item.id);
    if (exact) {
      return { category: exact.category, rarity: exact.rarity, description: exact.description, tags: exact.tags || [] };
    }

    const base = MASTER_ITEM_CATALOG.find((entry) => item.id.startsWith(`${entry.id}-`) || item.id === entry.id);
    if (base) {
      return { category: base.category, rarity: base.rarity, description: base.description, tags: base.tags || [] };
    }

    return {
      category: 'unknown',
      rarity: 'common',
      description: 'Field item used during exploration, crafting, or combat preparation.',
      tags: []
    };
  }

  private prettyCategory(category: ItemCategory | 'unknown') {
    if (category === 'unknown') return 'Unknown';
    return category
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private prettyRarity(rarity: ItemRarity | 'common') {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  }

  private prettyView(view: InventoryViewCategory) {
    return view
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private rarityColor(rarity: ItemRarity | 'common') {
    if (rarity === 'legendary') return '#fbbf24';
    if (rarity === 'epic') return '#c084fc';
    if (rarity === 'rare') return '#60a5fa';
    if (rarity === 'uncommon') return '#4ade80';
    return '#cbd5e1';
  }

  attach(parent: HTMLElement) {
    parent.appendChild(this.root);
  }

  close() {
    if (this.root.parentElement) {
      this.root.parentElement.removeChild(this.root);
    }
    this.onClose(this.items);
  }
}
