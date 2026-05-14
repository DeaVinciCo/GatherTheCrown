import { getItemById } from '../systems/MasterItemCatalog';
import type { KingdomQuestMenuEntry } from '../systems/KingdomQuestMenuModel';

export class KingdomQuestMenu {
  private root: HTMLDivElement;

  constructor(entries: KingdomQuestMenuEntry[], onClose: () => void) {
    this.root = document.createElement('div');
    this.root.className = 'kingdom-quest-menu';
    Object.assign(this.root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(860px, 95vw)',
      maxHeight: '82vh',
      overflowY: 'auto',
      background: 'rgba(7, 16, 32, 0.8)',
      backdropFilter: 'blur(5px)',
      color: '#e2e8f0',
      border: '1px solid rgba(148, 163, 184, 0.5)',
      borderRadius: '12px',
      padding: '12px',
      zIndex: '140',
      boxShadow: '0 14px 36px rgba(0,0,0,0.45)'
    });

    const title = document.createElement('div');
    title.innerText = 'Kingdom Quest Board';
    Object.assign(title.style, {
      color: '#f8fafc',
      fontWeight: '700',
      fontSize: '20px',
      marginBottom: '8px'
    });
    this.root.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.innerText = 'Door keys unlock structure routes. Royal portal keys unlock castle portal routes.';
    Object.assign(subtitle.style, {
      color: '#bfdbfe',
      fontSize: '12px',
      marginBottom: '12px'
    });
    this.root.appendChild(subtitle);

    for (const entry of entries) {
      const card = document.createElement('div');
      Object.assign(card.style, {
        border: '1px solid rgba(148, 163, 184, 0.35)',
        borderRadius: '10px',
        padding: '10px',
        marginBottom: '10px',
        background: 'rgba(15, 23, 42, 0.65)'
      });

      const heading = document.createElement('div');
      heading.innerText = `${entry.kingdomName} - ${entry.activeStage.title}`;
      Object.assign(heading.style, {
        color: '#fef3c7',
        fontWeight: '700',
        marginBottom: '6px'
      });
      card.appendChild(heading);

      const mode = document.createElement('div');
      mode.innerText = `Stage: ${entry.activeStage.progressionType} | Required key label: ${entry.activeStage.requiredKeyName}`;
      Object.assign(mode.style, {
        color: '#cbd5e1',
        fontSize: '12px',
        marginBottom: '6px'
      });
      card.appendChild(mode);

      const status = document.createElement('div');
      status.innerText = `Door Access: ${entry.hasDoorAccess ? 'Ready' : 'Locked'} | Portal Access: ${entry.hasPortalAccess ? 'Ready' : 'Locked'}`;
      Object.assign(status.style, {
        color: entry.hasDoorAccess && entry.hasPortalAccess ? '#86efac' : '#fca5a5',
        fontSize: '12px',
        marginBottom: '6px'
      });
      card.appendChild(status);

      const objectives = document.createElement('div');
      objectives.innerText = entry.activeStage.objectives.map((objective, index) => `${index + 1}. ${objective}`).join('\n');
      Object.assign(objectives.style, {
        color: '#e2e8f0',
        fontSize: '12px',
        whiteSpace: 'pre-wrap',
        marginBottom: '6px'
      });
      card.appendChild(objectives);

      if (!entry.hasDoorAccess) {
        const missingDoor = document.createElement('div');
        missingDoor.innerText = `Missing door keys: ${entry.missingDoorKeys.map((id) => getItemById(id)?.name ?? id).join(', ')}`;
        Object.assign(missingDoor.style, { color: '#fbbf24', fontSize: '11px' });
        card.appendChild(missingDoor);
      }

      if (!entry.hasPortalAccess) {
        const missingPortal = document.createElement('div');
        missingPortal.innerText = `Missing portal keys: ${entry.missingPortalKeys.map((id) => getItemById(id)?.name ?? id).join(', ')}`;
        Object.assign(missingPortal.style, { color: '#f87171', fontSize: '11px' });
        card.appendChild(missingPortal);
      }

      this.root.appendChild(card);
    }

    const closeBtn = document.createElement('button');
    closeBtn.innerText = 'Close [Q]';
    Object.assign(closeBtn.style, {
      width: '100%',
      padding: '8px',
      borderRadius: '7px',
      border: '1px solid #475569',
      background: '#111827',
      color: '#cbd5e1',
      cursor: 'pointer'
    });
    closeBtn.onclick = onClose;
    this.root.appendChild(closeBtn);
  }

  attach(container: HTMLElement) {
    container.appendChild(this.root);
  }
}
