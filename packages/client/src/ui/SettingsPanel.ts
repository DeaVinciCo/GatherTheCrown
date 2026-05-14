import AudioManager from '../audio/AudioManager';

/**
 * SettingsPanel — DOM overlay for audio settings, controls reference,
 * and basic accessibility options. Matches the openMapMenu visual style
 * used elsewhere in Haven. Call open() to show, and it self-removes on close.
 */
export class SettingsPanel {
  private root: HTMLDivElement | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement | null) {
    this.container = container ?? document.body;
  }

  /** Open the panel. Returns false if already open. */
  open(): boolean {
    if (this.container.querySelector('#gtc-settings-panel')) return false;
    this.root = this.build();
    this.container.appendChild(this.root);
    return true;
  }

  /** Close and remove the panel. */
  close() {
    this.root?.remove();
    this.root = null;
  }

  isOpen(): boolean {
    return !!this.root;
  }

  private build(): HTMLDivElement {
    const settings = AudioManager.getSettings();

    const root = document.createElement('div') as HTMLDivElement;
    root.id = 'gtc-settings-panel';
    Object.assign(root.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(8, 12, 24, 0.97)',
      backdropFilter: 'blur(6px)',
      color: '#d1d5db',
      border: '1px solid #334155',
      borderRadius: '12px',
      width: '380px',
      maxHeight: '92%',
      overflowY: 'auto',
      padding: '20px 24px 16px',
      zIndex: '200',
      boxShadow: '0 16px 40px rgba(0,0,0,0.65)',
      fontFamily: 'inherit',
    });

    // ── Title ─────────────────────────────────────────────────────────
    const title = document.createElement('div');
    title.innerText = '⚙  Settings';
    Object.assign(title.style, {
      color: '#fbbf24',
      fontWeight: 'bold',
      fontSize: '18px',
      marginBottom: '14px',
      borderBottom: '1px solid #1f2937',
      paddingBottom: '8px',
    });
    root.appendChild(title);

    // ── Audio ─────────────────────────────────────────────────────────
    root.appendChild(this.sectionHeader('Audio'));
    root.appendChild(this.makeToggle('Music', settings.musicEnabled, (v) => AudioManager.setMusicEnabled(v)));
    root.appendChild(this.makeSlider('Music Volume', settings.musicVolume, (v) => AudioManager.setMusicVolume(v)));
    root.appendChild(this.makeToggle('Sound Effects', settings.sfxEnabled, (v) => AudioManager.setSfxEnabled(v)));
    root.appendChild(this.makeSlider('SFX Volume', settings.sfxVolume, (v) => AudioManager.setSfxVolume(v)));

    // ── Controls reference ────────────────────────────────────────────
    root.appendChild(this.divider());
    root.appendChild(this.sectionHeader('Controls'));

    const controls: [string, string][] = [
      ['WASD / Arrows', 'Move'],
      ['E', 'Interact / Talk'],
      ['F', 'Fish (Fishing Spots)'],
      ['M', 'World Map  (Haven)'],
      ['I', 'Inventory  (Haven)'],
      ['A', 'Achievements  (Haven)'],
      ['Shift', 'Chat Log  (Haven)'],
      ['O', 'Settings  (anywhere)'],
      ['ESC', 'Return / Back'],
    ];
    const ctrlGrid = document.createElement('div');
    Object.assign(ctrlGrid.style, {
      display: 'grid',
      gridTemplateColumns: 'auto 1fr',
      gap: '4px 14px',
      fontSize: '12px',
      marginBottom: '4px',
    });
    for (const [key, action] of controls) {
      const keyEl = document.createElement('span');
      keyEl.innerText = key;
      Object.assign(keyEl.style, { color: '#fde68a', fontWeight: 'bold', whiteSpace: 'nowrap' });
      ctrlGrid.appendChild(keyEl);

      const actEl = document.createElement('span');
      actEl.innerText = action;
      Object.assign(actEl.style, { color: '#94a3b8' });
      ctrlGrid.appendChild(actEl);
    }
    root.appendChild(ctrlGrid);

    // ── Accessibility ─────────────────────────────────────────────────
    root.appendChild(this.divider());
    root.appendChild(this.sectionHeader('Accessibility'));
    root.appendChild(this.makeToggle(
      'Reduce Motion',
      settings.reduceMotion,
      (v) => AudioManager.setReduceMotion(v),
      'Disables decorative tweens and idle animations'
    ));

    // ── Close button ──────────────────────────────────────────────────
    root.appendChild(this.divider());
    const closeBtn = document.createElement('button');
    closeBtn.innerText = '← Close  [O / ESC]';
    Object.assign(closeBtn.style, {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #475569',
      background: '#1f2937',
      color: '#e5e7eb',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
    });
    closeBtn.onmouseenter = () => { closeBtn.style.background = '#374151'; };
    closeBtn.onmouseleave = () => { closeBtn.style.background = '#1f2937'; };
    closeBtn.onclick = () => this.close();
    root.appendChild(closeBtn);

    return root;
  }

  private sectionHeader(text: string): HTMLElement {
    const el = document.createElement('div');
    el.innerText = text.toUpperCase();
    Object.assign(el.style, {
      color: '#64748b',
      fontSize: '10px',
      fontWeight: 'bold',
      letterSpacing: '1.5px',
      marginBottom: '8px',
    });
    return el;
  }

  private divider(): HTMLElement {
    const el = document.createElement('div');
    Object.assign(el.style, { borderTop: '1px solid #1f2937', margin: '12px 0 10px' });
    return el;
  }

  private makeToggle(
    label: string,
    initial: boolean,
    onChange: (v: boolean) => void,
    hint?: string
  ): HTMLElement {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: hint ? '4px' : '8px',
    });

    const left = document.createElement('div');
    const lbl = document.createElement('span');
    lbl.innerText = label;
    Object.assign(lbl.style, { fontSize: '13px', color: '#cbd5e1' });
    left.appendChild(lbl);
    if (hint) {
      const hintEl = document.createElement('div');
      hintEl.innerText = hint;
      Object.assign(hintEl.style, { fontSize: '10px', color: '#475569', marginBottom: '4px' });
      left.appendChild(hintEl);
    }

    let state = initial;
    const btn = document.createElement('button');
    const refresh = () => {
      btn.innerText = state ? 'ON' : 'OFF';
      Object.assign(btn.style, {
        padding: '3px 12px',
        borderRadius: '4px',
        border: 'none',
        background: state ? '#15803d' : '#374151',
        color: state ? '#bbf7d0' : '#9ca3af',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold',
        minWidth: '46px',
        transition: 'background 0.15s',
      });
    };
    refresh();
    btn.onclick = () => { state = !state; onChange(state); refresh(); };

    row.appendChild(left);
    row.appendChild(btn);
    return row;
  }

  private makeSlider(label: string, initial: number, onChange: (v: number) => void): HTMLElement {
    const wrap = document.createElement('div');
    Object.assign(wrap.style, { marginBottom: '10px' });

    const header = document.createElement('div');
    Object.assign(header.style, { display: 'flex', justifyContent: 'space-between', marginBottom: '3px' });

    const lbl = document.createElement('span');
    lbl.innerText = label;
    Object.assign(lbl.style, { fontSize: '13px', color: '#cbd5e1' });

    const valEl = document.createElement('span');
    valEl.innerText = `${Math.round(initial * 100)}%`;
    Object.assign(valEl.style, { fontSize: '12px', color: '#fbbf24', minWidth: '36px', textAlign: 'right' });

    header.appendChild(lbl);
    header.appendChild(valEl);
    wrap.appendChild(header);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = String(Math.round(initial * 100));
    Object.assign(slider.style, { width: '100%', accentColor: '#fbbf24', cursor: 'pointer', margin: '2px 0' });
    slider.oninput = () => {
      const v = parseInt(slider.value) / 100;
      valEl.innerText = `${slider.value}%`;
      onChange(v);
    };

    wrap.appendChild(slider);
    return wrap;
  }
}
