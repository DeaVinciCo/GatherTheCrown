export interface InventoryItem {
  id: string;
  name: string;
  equipped?: boolean;
}

export class InventoryMenu {
  private root: HTMLDivElement;
  private items: InventoryItem[];
  private onClose: (items: InventoryItem[]) => void;

  constructor(items: InventoryItem[], onClose: (items: InventoryItem[]) => void) {
    this.items = items;
    this.onClose = onClose;
    this.root = document.createElement('div');
    this.root.className = 'inventory-menu';
    Object.assign(this.root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '10px',
      border: '1px solid #555',
    });

    const title = document.createElement('h3');
    title.innerText = 'Inventory';
    this.root.appendChild(title);

    const list = document.createElement('div');
    this.items.forEach((item) => {
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
        btn.innerText = item.equipped ? 'Unequip' : 'Equip';
      };
      slot.appendChild(btn);

      list.appendChild(slot);
    });
    this.root.appendChild(list);

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close';
    closeBtn.style.display = 'block';
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => this.close();
    this.root.appendChild(closeBtn);
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

