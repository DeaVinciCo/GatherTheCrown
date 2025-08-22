export interface Achievement {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default class AchievementPanel {
  private root: HTMLDivElement;

  constructor(private achievements: Achievement[]) {
    this.root = document.createElement('div');
    this.root.style.position = 'absolute';
    this.root.style.top = '10%';
    this.root.style.left = '10%';
    this.root.style.right = '10%';
    this.root.style.bottom = '10%';
    this.root.style.background = '#222';
    this.root.style.padding = '20px';
    this.root.style.border = '1px solid #555';
    this.root.style.color = '#fff';
    this.root.style.overflowY = 'auto';
    this.root.style.display = 'none';

    const title = document.createElement('h2');
    title.innerText = 'Achievements';
    this.root.appendChild(title);

    this.buildSection('Completed', this.achievements.filter((a) => a.completed));
    this.buildSection('Pending', this.achievements.filter((a) => !a.completed));

    const close = document.createElement('button');
    close.innerText = 'Close';
    close.onclick = () => this.hide();
    this.root.appendChild(close);
  }

  private buildSection(label: string, list: Achievement[]) {
    const header = document.createElement('h3');
    header.innerText = label;
    this.root.appendChild(header);

    const ul = document.createElement('ul');
    if (list.length === 0) {
      const li = document.createElement('li');
      li.innerText = 'None';
      ul.appendChild(li);
    } else {
      for (const a of list) {
        const li = document.createElement('li');
        li.innerText = a.title;
        ul.appendChild(li);
      }
    }
    this.root.appendChild(ul);
  }

  attach(parent: HTMLElement) {
    parent.appendChild(this.root);
  }

  show() {
    this.root.style.display = 'block';
  }

  hide() {
    this.root.style.display = 'none';
  }
}
