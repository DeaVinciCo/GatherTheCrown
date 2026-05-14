type ChatChannel = 'global' | 'faction' | 'party' | 'pm' | 'system' | 'announcement';
type AnnouncementPriority = 'low' | 'medium' | 'high' | 'critical';

type RegistryLike = {
  get: (key: string) => unknown;
  set?: (key: string, value: unknown) => void;
};

interface AnnouncementEvent {
  channel: ChatChannel;
  priority: AnnouncementPriority;
  text: string;
  color: string;
}

interface PmThread {
  id: string;
  display: string;
  unread: number;
  messages: Array<{ from: 'you' | 'them'; text: string }>;
}

interface ChatState {
  activeChannel: ChatChannel;
  activePmId: string;
  doNotDisturb: boolean;
  muted: Set<string>;
  blocked: Set<string>;
  threads: PmThread[];
  announcementQueue: AnnouncementEvent[];
  lastAnnouncementAt: number;
  seenAnnouncements: Set<string>;
  log: Array<{
    channel: ChatChannel;
    text: string;
    color: string;
    priority?: AnnouncementPriority;
    isAnnouncement?: boolean;
    isGameWideAlert?: boolean;
  }>;
}

export interface GameChatOverlayOptions {
  container: HTMLElement;
  sceneLabel: string;
  scopeKey: string;
  registry: RegistryLike;
}

const CHAT_STATE = new Map<string, ChatState>();

const CHAT_TOKENS = {
  bg: 'rgba(2, 6, 23, 0.9)',
  panel: '#0b1220',
  border: '#334155',
  text: '#e2e8f0',
  mutedText: '#94a3b8',
  global: '#93c5fd',
  faction: '#22c55e',
  party: '#34d399',
  pm: '#e879f9',
  system: '#22d3ee',
  announcement: '#f97316',
  priorityLow: '#a3a3a3',
  priorityMedium: '#f59e0b',
  priorityHigh: '#f97316',
  priorityCritical: '#ef4444',
};

const CHAT_TYPOGRAPHY = {
  titleSize: '18px',
  titleWeight: '700',
  sectionSize: '12px',
  sectionWeight: '700',
  channelSize: '11px',
  channelWeight: '700',
  messageSize: '13px',
  messageWeight: '500',
  metaSize: '11px',
  metaWeight: '500',
  announcementSize: '12px',
  announcementWeight: '700',
  nameWeight: '700',
  gameWideWeight: '800',
  gameWideStyle: 'italic',
};

const FACTION_COLORS: Record<string, string> = {
  neutral: '#94a3b8',
  dawn: '#f59e0b',
  tide: '#38bdf8',
  verdant: '#22c55e',
  ember: '#ef4444',
  umbral: '#a78bfa',
};

const MAJOR_LEVEL_ANNOUNCEMENT = 20;

function getFactionName(registry: RegistryLike) {
  const raw = String(registry.get('playerFaction') || registry.get('faction') || registry.get('heroFaction') || 'Neutral').trim();
  return raw || 'Neutral';
}

function getFactionColor(factionName: string) {
  return FACTION_COLORS[factionName.toLowerCase()] || FACTION_COLORS.neutral;
}

function getState(scopeKey: string): ChatState {
  const existing = CHAT_STATE.get(scopeKey);
  if (existing) return existing;

  const state: ChatState = {
    activeChannel: 'faction',
    activePmId: 'quartermaster',
    doNotDisturb: false,
    muted: new Set<string>(),
    blocked: new Set<string>(),
    announcementQueue: [],
    lastAnnouncementAt: 0,
    seenAnnouncements: new Set<string>(),
    threads: [
      {
        id: 'quartermaster',
        display: 'Quartermaster Lin',
        unread: 1,
        messages: [
          { from: 'them', text: 'Supply check before your next route?' }
        ]
      },
      {
        id: 'scout',
        display: 'Scout Jae',
        unread: 2,
        messages: [
          { from: 'them', text: 'Fishers Walk is clear by dusk.' },
          { from: 'them', text: 'Need eyes on Towne Lane?' }
        ]
      },
      {
        id: 'mentor',
        display: 'Mentor Rowan',
        unread: 0,
        messages: [
          { from: 'them', text: 'Steady footing beats flashy rushing.' }
        ]
      }
    ],
    log: []
  };

  CHAT_STATE.set(scopeKey, state);
  return state;
}

function pushLog(state: ChatState, channel: ChatChannel, text: string, color: string) {
  const lowered = text.toLowerCase();
  const isGameWideAlert =
    (channel === 'global' || channel === 'announcement' || channel === 'system') &&
    (lowered.includes('notice') || lowered.includes('warning') || lowered.includes('notif') || lowered.includes('update') || lowered.includes('restriction'));

  state.log.push({
    channel,
    text,
    color,
    isAnnouncement: channel === 'announcement',
    isGameWideAlert,
  });
  if (state.log.length > 80) state.log.shift();
}

function pushAnnouncementLog(state: ChatState, event: AnnouncementEvent) {
  const lowered = event.text.toLowerCase();
  const isGameWideAlert =
    event.priority === 'critical' ||
    lowered.includes('notice') ||
    lowered.includes('warning') ||
    lowered.includes('update') ||
    lowered.includes('restriction');

  state.log.push({
    channel: event.channel,
    text: event.text,
    color: isGameWideAlert ? CHAT_TOKENS.priorityCritical : event.color,
    priority: event.priority,
    isAnnouncement: true,
    isGameWideAlert,
  });
  if (state.log.length > 80) state.log.shift();
}

function getPriorityRank(priority: AnnouncementPriority) {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function enqueueAnnouncements(state: ChatState, events: AnnouncementEvent[]) {
  for (const event of events) {
    const dedupeKey = `${event.channel}|${event.priority}|${event.text}`;
    if (state.seenAnnouncements.has(dedupeKey)) continue;
    state.announcementQueue.push(event);
    state.seenAnnouncements.add(dedupeKey);
  }

  state.announcementQueue.sort((a, b) => getPriorityRank(b.priority) - getPriorityRank(a.priority));
}

function flushAnnouncementQueue(state: ChatState) {
  if (state.announcementQueue.length === 0) return;

  const now = Date.now();
  const FIVE_SECONDS = 5000;
  const next = state.announcementQueue[0];

  // DND keeps non-critical items queued until disabled.
  if (state.doNotDisturb && next.priority !== 'critical') return;

  if (state.lastAnnouncementAt > 0 && now - state.lastAnnouncementAt < FIVE_SECONDS) return;

  const event = state.announcementQueue.shift();
  if (!event) return;
  pushAnnouncementLog(state, event);
  state.lastAnnouncementAt = now;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function ensurePmThread(state: ChatState, rawHandle: string): PmThread {
  const clean = rawHandle.replace(/^[@$]/, '').trim();
  const id = clean.toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'unknown';
  const display = clean || 'Unknown';

  let thread = state.threads.find((t) => t.id === id);
  if (!thread) {
    thread = { id, display, unread: 0, messages: [] };
    state.threads.unshift(thread);
  }
  return thread;
}

function formatChatLineHtml(entry: { text: string; channel: ChatChannel }) {
  const escaped = escapeHtml(entry.text);

  const bracketPrefix = escaped.match(/^\[([^\]]+)\]\s*(.*)$/);
  if (bracketPrefix) {
    const [, prefix, rest] = bracketPrefix;
    return `<span style=\"font-weight:${CHAT_TYPOGRAPHY.nameWeight};\">[${prefix}]</span> ${rest}`;
  }

  const colonPrefix = escaped.match(/^([^:]{2,32}):\s*(.*)$/);
  if (colonPrefix) {
    const [, name, rest] = colonPrefix;
    return `<span style=\"font-weight:${CHAT_TYPOGRAPHY.nameWeight};\">${name}:</span> ${rest}`;
  }

  return escaped;
}

function routeAnnouncement(priority: AnnouncementPriority, type: 'achievement' | 'game-news' | 'change' | 'restriction'): ChatChannel {
  if (type === 'game-news' || type === 'change' || type === 'restriction') return 'global';
  if (priority === 'high' || priority === 'critical') return 'global';
  return 'faction';
}

function buildAnnouncementRules(registry: RegistryLike, factionName: string, factionColor: string, scopeKey: string): AnnouncementEvent[] {
  const events: AnnouncementEvent[] = [];
  const heroLevel = Number(registry.get('currentCrownLevel') || registry.get('playerLevel') || registry.get('level') || 1);
  const achievementCount = Number(registry.get('achievementCount') || 0);

  const prevCountKey = `gtc_chat_prev_achievement_count_${scopeKey}`;
  const prevLevelGlobalKey = `gtc_chat_level20_global_${scopeKey}`;
  const restrictionNoticeKey = `gtc_chat_restriction_notice_${scopeKey}`;
  const prevCount = Number(localStorage.getItem(prevCountKey) || '0');
  const alreadyPostedGlobalLevel = localStorage.getItem(prevLevelGlobalKey) === '1';
  const alreadyPostedRestrictionNotice = localStorage.getItem(restrictionNoticeKey) === '1';

  if (achievementCount > prevCount) {
    const added = achievementCount - prevCount;
    events.push({
      channel: routeAnnouncement('medium', 'achievement'),
      priority: 'medium',
      text: `[Faction Achievement] ${added} new achievement${added > 1 ? 's' : ''} unlocked by a ${factionName} rider.`,
      color: factionColor,
    });
    localStorage.setItem(prevCountKey, String(achievementCount));
  }

  if (heroLevel >= MAJOR_LEVEL_ANNOUNCEMENT && !alreadyPostedGlobalLevel) {
    events.push({
      channel: routeAnnouncement('high', 'achievement'),
      priority: 'high',
      text: `[Major Milestone] Rider reached Level ${MAJOR_LEVEL_ANNOUNCEMENT}.`,
      color: CHAT_TOKENS.priorityHigh,
    });
    localStorage.setItem(prevLevelGlobalKey, '1');
  }

  if (!alreadyPostedRestrictionNotice) {
    events.push({
      channel: routeAnnouncement('critical', 'restriction'),
      priority: 'critical',
      text: '[Global Notice] Patch restrictions and emergency service updates post here only.',
      color: CHAT_TOKENS.priorityCritical,
    });
    localStorage.setItem(restrictionNoticeKey, '1');
  }

  return events;
}

export function openGameChatOverlay(options: GameChatOverlayOptions) {
  const existing = options.container.querySelector('.chat-menu') as HTMLElement | null;
  if (existing) {
    existing.remove();
    return;
  }

  const state = getState(options.scopeKey);
  const factionName = getFactionName(options.registry);
  const factionColor = getFactionColor(factionName);
  const channelColors: Record<ChatChannel, string> = {
    global: CHAT_TOKENS.global,
    faction: factionColor,
    party: CHAT_TOKENS.party,
    pm: CHAT_TOKENS.pm,
    system: CHAT_TOKENS.system,
    announcement: CHAT_TOKENS.announcement,
  };

  const root = document.createElement('div');
  root.className = 'chat-menu';
  Object.assign(root.style, {
    position: 'absolute',
    left: '16px',
    bottom: '16px',
    width: '740px',
    maxWidth: 'calc(100vw - 32px)',
    background: CHAT_TOKENS.bg,
    backdropFilter: 'blur(6px)',
    border: `1px solid ${CHAT_TOKENS.border}`,
    borderRadius: '10px',
    color: CHAT_TOKENS.text,
    padding: '10px',
    zIndex: '99',
    boxShadow: '0 16px 40px rgba(0,0,0,0.45)',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '10px',
  });

  const left = document.createElement('div');
  const right = document.createElement('div');
  Object.assign(right.style, {
    borderLeft: `1px solid ${CHAT_TOKENS.border}`,
    paddingLeft: '10px',
  });

  const title = document.createElement('div');
  title.innerText = `${options.sceneLabel} Chat`;
  Object.assign(title.style, {
    color: '#f8fafc',
    fontSize: CHAT_TYPOGRAPHY.titleSize,
    fontWeight: CHAT_TYPOGRAPHY.titleWeight,
    marginBottom: '6px',
  });
  left.appendChild(title);

  const subtitle = document.createElement('div');
  subtitle.innerText = `Faction: ${factionName} · Faction-only achievements stay in faction channel.`;
  Object.assign(subtitle.style, {
    color: factionColor,
    fontSize: CHAT_TYPOGRAPHY.metaSize,
    fontWeight: CHAT_TYPOGRAPHY.metaWeight,
    marginBottom: '8px',
  });
  left.appendChild(subtitle);

  const channelsRow = document.createElement('div');
  Object.assign(channelsRow.style, {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '8px',
  });

  const channels: ChatChannel[] = ['global', 'faction', 'party', 'pm', 'announcement', 'system'];
  const totalPmUnread = state.threads.reduce((sum, thread) => sum + thread.unread, 0);
  for (const channel of channels) {
    const chip = document.createElement('button');
    let chipLabel = channel.toUpperCase();
    if (channel === 'pm') chipLabel = `PM / DM${totalPmUnread > 0 ? ` (${totalPmUnread})` : ''}`;
    chip.innerText = chipLabel;
    Object.assign(chip.style, {
      borderRadius: '999px',
      border: `1px solid ${channelColors[channel]}`,
      background: state.activeChannel === channel ? `${channelColors[channel]}22` : '#0f172a',
      color: channelColors[channel],
      padding: '4px 8px',
      cursor: 'pointer',
      fontSize: CHAT_TYPOGRAPHY.channelSize,
      fontWeight: CHAT_TYPOGRAPHY.channelWeight,
      letterSpacing: '0.04em',
    });
    chip.onclick = () => {
      state.activeChannel = channel;
      root.remove();
      openGameChatOverlay(options);
    };
    channelsRow.appendChild(chip);
  }
  left.appendChild(channelsRow);

  const announcementBox = document.createElement('div');
  Object.assign(announcementBox.style, {
    border: `1px solid ${CHAT_TOKENS.border}`,
    borderRadius: '8px',
    background: CHAT_TOKENS.panel,
    padding: '6px',
    marginBottom: '8px',
  });

  const annTitle = document.createElement('div');
  annTitle.innerText = 'Announcement Rules';
  Object.assign(annTitle.style, {
    color: CHAT_TOKENS.announcement,
    fontSize: CHAT_TYPOGRAPHY.sectionSize,
    fontWeight: CHAT_TYPOGRAPHY.sectionWeight,
    marginBottom: '4px',
  });
  announcementBox.appendChild(annTitle);

  const ruleLines = [
    'Names are bold. Announcement lines are italicized.',
    'Global notice/warning/update lines are red, bold, and italic.',
    'Announcements stack by priority and post 1 at a time every 5 seconds.',
    'Low/Medium achievements route to faction channel only.',
    `Major milestones (Level ${MAJOR_LEVEL_ANNOUNCEMENT}+) can route to global.`,
    'Game news, changes, and restrictions route to global only.',
    'Direct Shout: /p username message (also /pm or /dm).',
  ];
  for (const line of ruleLines) {
    const row = document.createElement('div');
    row.innerText = line;
    Object.assign(row.style, {
      color: CHAT_TOKENS.mutedText,
      fontSize: CHAT_TYPOGRAPHY.metaSize,
      marginBottom: '2px',
    });
    announcementBox.appendChild(row);
  }
  left.appendChild(announcementBox);

  enqueueAnnouncements(state, buildAnnouncementRules(options.registry, factionName, factionColor, options.scopeKey));
  flushAnnouncementQueue(state);

  if (state.log.length === 0) {
    pushLog(state, 'system', '[System] Chat initialized.', channelColors.system);
  }

  const log = document.createElement('div');
  Object.assign(log.style, {
    height: '220px',
    overflowY: 'auto',
    fontSize: CHAT_TYPOGRAPHY.messageSize,
    border: `1px solid ${CHAT_TOKENS.border}`,
    borderRadius: '8px',
    padding: '8px',
    background: '#020617',
    marginBottom: '8px',
  });

  const visibleMessages = state.log.filter((entry) => state.activeChannel === 'global'
    ? entry.channel === 'global' || entry.channel === 'announcement' || entry.channel === 'system'
    : state.activeChannel === 'faction'
      ? entry.channel === 'faction' || entry.channel === 'system'
      : entry.channel === state.activeChannel || entry.channel === 'system');

  for (const entry of visibleMessages) {
    const row = document.createElement('div');

    const prefix = `<span style=\"font-weight:${CHAT_TYPOGRAPHY.nameWeight};\">[${entry.channel.toUpperCase()}]</span> `;
    row.innerHTML = `${prefix}${formatChatLineHtml(entry)}`;

    const announcementItalic = entry.channel === 'announcement' || entry.isAnnouncement;
    const gameWideAlert = !!entry.isGameWideAlert;
    Object.assign(row.style, {
      color: gameWideAlert ? CHAT_TOKENS.priorityCritical : entry.color,
      marginBottom: '4px',
      fontSize: entry.channel === 'announcement' ? CHAT_TYPOGRAPHY.announcementSize : CHAT_TYPOGRAPHY.messageSize,
      fontWeight: gameWideAlert
        ? CHAT_TYPOGRAPHY.gameWideWeight
        : entry.channel === 'announcement'
          ? CHAT_TYPOGRAPHY.announcementWeight
          : CHAT_TYPOGRAPHY.messageWeight,
      fontStyle: gameWideAlert
        ? CHAT_TYPOGRAPHY.gameWideStyle
        : announcementItalic
          ? 'italic'
          : 'normal',
      lineHeight: '1.35',
    });
    log.appendChild(row);
  }
  left.appendChild(log);

  const input = document.createElement('input');
  input.placeholder = state.activeChannel === 'pm'
    ? 'Type PM/DM quick reply... or /p username message'
    : `Send to ${state.activeChannel}... (Direct Shout: /p username message)`;
  Object.assign(input.style, {
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: '6px',
    padding: '8px',
    borderRadius: '6px',
    border: `1px solid ${CHAT_TOKENS.border}`,
    background: '#0f172a',
    color: '#e2e8f0',
  });
  left.appendChild(input);

  const send = document.createElement('button');
  send.innerText = 'Send';
  Object.assign(send.style, {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: `1px solid ${channelColors[state.activeChannel]}`,
    background: '#111827',
    color: channelColors[state.activeChannel],
    cursor: 'pointer',
    marginBottom: '6px',
  });

  const postMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const directShout = trimmed.match(/^\/(p|pm|dm)\s+([^\s]+)\s*(.*)$/i);
    if (directShout) {
      const [, , rawUser, body] = directShout;
      const thread = ensurePmThread(state, rawUser);
      state.activePmId = thread.id;
      state.activeChannel = 'pm';

      if (!body.trim()) {
        pushLog(state, 'system', `[System] Direct Shout target set to ${thread.display}. Type your message or run /p ${thread.display} <message>.`, channelColors.system);
        return;
      }

      if (state.blocked.has(thread.id)) {
        pushLog(state, 'system', `[System] ${thread.display} is blocked. Unblock to send PMs.`, channelColors.system);
        return;
      }
      if (state.muted.has(thread.id)) {
        pushLog(state, 'system', `[System] ${thread.display} is muted. Unmute to continue PMs.`, channelColors.system);
        return;
      }

      thread.messages.push({ from: 'you', text: body.trim() });
      pushLog(state, 'pm', `[PM to ${thread.display}] ${body.trim()}`, channelColors.pm);
      return;
    }

    const dndToggle = trimmed.match(/^\/dnd(?:\s+(on|off))?$/i);
    if (dndToggle) {
      const mode = dndToggle[1]?.toLowerCase();
      state.doNotDisturb = mode ? mode === 'on' : !state.doNotDisturb;
      pushLog(state, 'system', `[System] Do Not Disturb ${state.doNotDisturb ? 'enabled' : 'disabled'}.`, channelColors.system);
      flushAnnouncementQueue(state);
      return;
    }

    if (state.activeChannel === 'global') {
      pushLog(state, 'global', `[You] ${trimmed}`, channelColors.global);
    } else if (state.activeChannel === 'faction') {
      pushLog(state, 'faction', `[You · ${factionName}] ${trimmed}`, factionColor);
    } else if (state.activeChannel === 'pm') {
      const thread = state.threads.find((t) => t.id === state.activePmId);
      if (!thread) return;
      if (state.blocked.has(thread.id)) {
        pushLog(state, 'system', `[System] ${thread.display} is blocked. Unblock to send PMs.`, channelColors.system);
      } else if (state.muted.has(thread.id)) {
        pushLog(state, 'system', `[System] ${thread.display} is muted. Unmute to continue PMs.`, channelColors.system);
      } else {
        thread.messages.push({ from: 'you', text: trimmed });
        pushLog(state, 'pm', `[PM to ${thread.display}] ${trimmed}`, channelColors.pm);
      }
    } else {
      pushLog(state, state.activeChannel, `[You] ${trimmed}`, channelColors[state.activeChannel]);
    }
  };

  send.onclick = () => {
    postMessage(input.value);
    input.value = '';
    root.remove();
    openGameChatOverlay(options);
  };
  input.addEventListener('keydown', (evt) => {
    if (evt.key !== 'Enter') return;
    send.click();
  });
  left.appendChild(send);

  const close = document.createElement('button');
  close.innerText = 'Close [Shift+C]';
  Object.assign(close.style, {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: `1px solid ${CHAT_TOKENS.border}`,
    background: '#1e293b',
    color: '#cbd5e1',
    cursor: 'pointer',
  });
  close.onclick = () => root.remove();
  left.appendChild(close);

  const inboxTitle = document.createElement('div');
  inboxTitle.innerText = 'PM / DM Inbox';
  Object.assign(inboxTitle.style, {
    color: CHAT_TOKENS.pm,
    fontSize: CHAT_TYPOGRAPHY.sectionSize,
    fontWeight: CHAT_TYPOGRAPHY.sectionWeight,
    marginBottom: '4px',
  });
  right.appendChild(inboxTitle);

  const unreadCount = state.threads.reduce((sum, thread) => sum + thread.unread, 0);
  const unread = document.createElement('div');
  unread.innerText = `Unread: ${unreadCount}`;
  Object.assign(unread.style, {
    color: unreadCount > 0 ? '#facc15' : CHAT_TOKENS.mutedText,
    fontSize: CHAT_TYPOGRAPHY.metaSize,
    marginBottom: '6px',
  });
  right.appendChild(unread);

  const threadList = document.createElement('div');
  Object.assign(threadList.style, {
    maxHeight: '122px',
    overflowY: 'auto',
    border: `1px solid ${CHAT_TOKENS.border}`,
    borderRadius: '8px',
    background: CHAT_TOKENS.panel,
    marginBottom: '8px',
    padding: '4px',
  });

  for (const thread of state.threads) {
    const row = document.createElement('button');
    row.innerText = `${thread.display}${thread.unread ? ` (${thread.unread})` : ''}`;
    Object.assign(row.style, {
      width: '100%',
      textAlign: 'left',
      marginBottom: '4px',
      padding: '6px',
      borderRadius: '6px',
      border: `1px solid ${thread.id === state.activePmId ? CHAT_TOKENS.pm : CHAT_TOKENS.border}`,
      background: thread.id === state.activePmId ? '#3b0764' : '#111827',
      color: '#e2e8f0',
      cursor: 'pointer',
      fontSize: CHAT_TYPOGRAPHY.metaSize,
    });
    row.onclick = () => {
      state.activePmId = thread.id;
      thread.unread = 0;
      state.activeChannel = 'pm';
      root.remove();
      openGameChatOverlay(options);
    };
    threadList.appendChild(row);
  }
  right.appendChild(threadList);

  const activeThread = state.threads.find((t) => t.id === state.activePmId);
  const pmLog = document.createElement('div');
  Object.assign(pmLog.style, {
    minHeight: '90px',
    maxHeight: '90px',
    overflowY: 'auto',
    border: `1px solid ${CHAT_TOKENS.border}`,
    borderRadius: '8px',
    background: '#020617',
    marginBottom: '8px',
    padding: '6px',
  });

  if (activeThread) {
    for (const msg of activeThread.messages.slice(-5)) {
      const row = document.createElement('div');
      row.innerText = `${msg.from === 'you' ? 'You' : activeThread.display}: ${msg.text}`;
      row.style.color = msg.from === 'you' ? '#e2e8f0' : CHAT_TOKENS.pm;
      row.style.fontSize = CHAT_TYPOGRAPHY.metaSize;
      row.style.marginBottom = '3px';
      pmLog.appendChild(row);
    }
  }
  right.appendChild(pmLog);

  const quickReplyRow = document.createElement('div');
  Object.assign(quickReplyRow.style, { display: 'grid', gridTemplateColumns: '1fr', gap: '4px', marginBottom: '8px' });
  for (const quick of ['On my way.', 'Need details?', 'Thanks - handled.']) {
    const btn = document.createElement('button');
    btn.innerText = `Quick Reply: ${quick}`;
    Object.assign(btn.style, {
      width: '100%',
      padding: '6px',
      borderRadius: '6px',
      border: `1px solid ${CHAT_TOKENS.pm}`,
      background: '#3b0764',
      color: '#f5d0fe',
      cursor: 'pointer',
      fontSize: CHAT_TYPOGRAPHY.metaSize,
    });
    btn.onclick = () => {
      state.activeChannel = 'pm';
      postMessage(quick);
      root.remove();
      openGameChatOverlay(options);
    };
    quickReplyRow.appendChild(btn);
  }
  right.appendChild(quickReplyRow);

  const controls = document.createElement('div');
  Object.assign(controls.style, { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' });

  const muteBtn = document.createElement('button');
  const blockedBtn = document.createElement('button');
  const activeId = activeThread?.id;
  const isMuted = !!activeId && state.muted.has(activeId);
  const isBlocked = !!activeId && state.blocked.has(activeId);

  muteBtn.innerText = isMuted ? 'Unmute' : 'Mute';
  Object.assign(muteBtn.style, {
    padding: '7px',
    borderRadius: '6px',
    border: '1px solid #64748b',
    background: '#1f2937',
    color: '#cbd5e1',
    cursor: 'pointer',
  });
  muteBtn.onclick = () => {
    if (!activeId) return;
    if (state.muted.has(activeId)) state.muted.delete(activeId);
    else state.muted.add(activeId);
    root.remove();
    openGameChatOverlay(options);
  };

  const dndBtn = document.createElement('button');
  dndBtn.innerText = state.doNotDisturb ? 'DND: ON' : 'DND: OFF';
  Object.assign(dndBtn.style, {
    padding: '7px',
    borderRadius: '6px',
    border: `1px solid ${state.doNotDisturb ? '#f59e0b' : '#475569'}`,
    background: state.doNotDisturb ? '#78350f' : '#1e293b',
    color: state.doNotDisturb ? '#fde68a' : '#cbd5e1',
    cursor: 'pointer',
  });
  dndBtn.onclick = () => {
    state.doNotDisturb = !state.doNotDisturb;
    pushLog(state, 'system', `[System] Do Not Disturb ${state.doNotDisturb ? 'enabled' : 'disabled'}.`, channelColors.system);
    flushAnnouncementQueue(state);
    root.remove();
    openGameChatOverlay(options);
  };

  blockedBtn.innerText = isBlocked ? 'Unblock' : 'Block';
  Object.assign(blockedBtn.style, {
    padding: '7px',
    borderRadius: '6px',
    border: '1px solid #7f1d1d',
    background: '#450a0a',
    color: '#fecaca',
    cursor: 'pointer',
  });
  blockedBtn.onclick = () => {
    if (!activeId) return;
    if (state.blocked.has(activeId)) state.blocked.delete(activeId);
    else state.blocked.add(activeId);
    root.remove();
    openGameChatOverlay(options);
  };

  controls.appendChild(muteBtn);
  controls.appendChild(blockedBtn);
  controls.appendChild(dndBtn);
  right.appendChild(controls);

  root.appendChild(left);
  root.appendChild(right);
  options.container.appendChild(root);
  input.focus();
}
