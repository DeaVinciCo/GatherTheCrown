export interface InventoryItem {
  id: string;
  name: string;
  equipped?: boolean;
}

export interface InventoryMenuOptions {
  onClose: (items: InventoryItem[]) => void;
  onItemChange?: (item: InventoryItem) => void;
}

export class InventoryMenu {
  private overlay: HTMLDivElement;
  private panel: HTMLDivElement;
  private slotsRoot: HTMLDivElement;
  private items: InventoryItem[];
  private options: InventoryMenuOptions;

  constructor(items: InventoryItem[], options: InventoryMenuOptions) {
    this.items = items;
    this.options = options;

    this.overlay = document.createElement('div');
    Object.assign(this.overlay.style, {
      position: 'absolute',
      inset: '0',
      background: 'rgba(0,0,0,0.5)',
    });
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    this.panel = document.createElement('div');
    this.panel.className = 'inventory-menu';
    Object.assign(this.panel.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.9)',
      color: '#fff',
      padding: '16px',
      border: '1px solid #555',
      minWidth: '240px',
    });

    const title = document.createElement('h3');
    title.style.margin = '0 0 8px';
    title.innerText = 'Inventory';
    this.panel.appendChild(title);

    this.slotsRoot = document.createElement('div');
    this.panel.appendChild(this.slotsRoot);
    this.render();

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    closeBtn.style.display = 'block';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => this.close();
    this.panel.appendChild(closeBtn);

    this.overlay.appendChild(this.panel);
  }

  private notifyChange(item: InventoryItem): void {
    this.options.onItemChange?.(item);
  }

  private render(): void {
    this.slotsRoot.innerHTML = '';
    for (const item of this.items) {
      const slot = document.createElement('div');
      slot.style.margin = '4px 0';

      const label = document.createElement('span');
      label.innerText = item.name;
      slot.appendChild(label);

      const btn = document.createElement('button');
      btn.innerText = item.equipped ? 'Unequip' : 'Equip';
      btn.style.marginLeft = '8px';
      btn.onclick = () => {
        item.equipped = !item.equipped;
        this.notifyChange(item);
        this.render();
      };
      slot.appendChild(btn);

      this.slotsRoot.appendChild(slot);
    }
  }

  /** Returns a snapshot of the current item states */
  snapshot(): InventoryItem[] {
    return this.items.map((i) => ({ ...i }));
  }

  attach(parent: HTMLElement) {
    parent.appendChild(this.overlay);
  }

  close() {
    if (this.overlay.parentElement) {
      this.overlay.parentElement.removeChild(this.overlay);
    }
    this.options.onClose(this.snapshot());
  }
}

