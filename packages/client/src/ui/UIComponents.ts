/**
 * Modern UI Components - Buttons, Panels, Menus
 */

import { UITheme } from './UITheme';

export interface ButtonOptions {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: string;
}

export interface PanelOptions {
  title?: string;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  draggable?: boolean;
  closeable?: boolean;
  onClose?: () => void;
}

export interface MenuOptions {
  items: MenuItem[];
  x?: number;
  y?: number;
  onItemClick?: (itemId: string) => void;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface IconCardOptions {
  title: string;
  subtitle?: string;
  value?: string;
  iconUrl: string;
  badgeLabel?: string;
  accent?: 'primary' | 'secondary' | 'warning' | 'error';
}

export interface RoundIconBadgeOptions {
  iconUrl: string;
  value: string;
  label: string;
  size?: number;
}

/**
 * Creates a styled button element
 */
export function createButton(options: ButtonOptions): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = options.text;
  button.onclick = options.onClick;
  button.disabled = options.disabled || false;

  // Apply variant styles
  const variant = options.variant || 'primary';
  const size = options.size || 'md';

  // Base styles
  button.style.cssText = `
    font-family: ${UITheme.typography.fontFamily};
    font-weight: ${UITheme.typography.weights.medium};
    border: none;
    border-radius: ${UITheme.borderRadius.md};
    cursor: pointer;
    transition: ${UITheme.transitions.fast};
    display: flex;
    align-items: center;
    gap: ${UITheme.spacing.sm};
    font-size: ${UITheme.typography.sizes.base};
    padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
  `;

  // Variant colors
  const variantStyles = {
    primary: {
      bg: UITheme.colors.primary,
      text: '#fff',
      hover: UITheme.colors.primaryDark,
    },
    secondary: {
      bg: UITheme.colors.bg.surface,
      text: UITheme.colors.text.primary,
      hover: UITheme.colors.bg.active,
      border: `1px solid ${UITheme.colors.border}`,
    },
    danger: {
      bg: UITheme.colors.text.error,
      text: '#fff',
      hover: '#E6525A',
    },
    success: {
      bg: UITheme.colors.text.success,
      text: '#fff',
      hover: '#009970',
    },
  };

  const styles = variantStyles[variant];
  button.style.backgroundColor = styles.bg;
  button.style.color = styles.text;
  if (styles.border) button.style.border = styles.border;

  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = styles.hover;
    button.style.boxShadow = UITheme.shadows.md;
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = styles.bg;
    button.style.boxShadow = 'none';
  });

  if (options.icon) {
    const iconContainer = document.createElement('span');
    iconContainer.style.display = 'inline-flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.width = '18px';
    iconContainer.style.height = '18px';

    if (options.icon.startsWith('/') || options.icon.endsWith('.svg') || options.icon.endsWith('.png')) {
      const iconImage = document.createElement('img');
      iconImage.src = options.icon;
      iconImage.alt = '';
      iconImage.style.width = '18px';
      iconImage.style.height = '18px';
      iconImage.style.display = 'block';
      iconContainer.appendChild(iconImage);
    } else {
      iconContainer.textContent = options.icon;
    }

    button.prepend(iconContainer);
  }

  if (options.disabled) {
    button.style.opacity = '0.5';
    button.style.cursor = 'not-allowed';
  }

  return button;
}

/**
 * Creates a styled panel/window
 */
export function createPanel(options: PanelOptions): HTMLDivElement {
  const panel = document.createElement('div');

  const width = options.width || 400;
  const height = options.height || 300;
  const x = options.x || 50;
  const y = options.y || 50;

  panel.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${width}px;
    min-height: ${height}px;
    background: linear-gradient(135deg, ${UITheme.colors.bg.surface}, ${UITheme.colors.bg.darker});
    border: 1px solid ${UITheme.colors.borderLight};
    border-radius: ${UITheme.borderRadius.lg};
    box-shadow: ${UITheme.shadows.xl}, ${UITheme.shadows.glow};
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: ${UITheme.typography.fontFamily};
    z-index: ${UITheme.zIndex.modal};
  `;

  // Header
  if (options.title) {
    const header = document.createElement('div');
    header.style.cssText = `
      padding: ${UITheme.spacing.lg};
      border-bottom: 1px solid ${UITheme.colors.border};
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(108, 92, 231, 0.1);
    `;

    const title = document.createElement('h3');
    title.textContent = options.title;
    title.style.cssText = `
      margin: 0;
      color: ${UITheme.colors.text.primary};
      font-size: ${UITheme.typography.sizes.lg};
      font-weight: ${UITheme.typography.weights.semibold};
    `;

    header.appendChild(title);

    // Close button
    if (options.closeable !== false) {
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        color: ${UITheme.colors.text.secondary};
        cursor: pointer;
        font-size: ${UITheme.typography.sizes.xl};
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: ${UITheme.transitions.fast};
      `;

      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = UITheme.colors.text.primary;
      });

      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = UITheme.colors.text.secondary;
      });

      closeBtn.onclick = () => {
        panel.remove();
        options.onClose?.();
      };

      header.appendChild(closeBtn);
    }

    panel.appendChild(header);
  }

  // Content area
  const content = document.createElement('div');
  content.style.cssText = `
    flex: 1;
    padding: ${UITheme.spacing.lg};
    overflow-y: auto;
  `;
  panel.appendChild(content);

  // Make draggable
  if (options.draggable !== false && options.title) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const header = panel.querySelector('div');
    if (header) {
      header.style.cursor = 'move';

      header.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = (e as MouseEvent).clientX - panel.offsetLeft;
        offsetY = (e as MouseEvent).clientY - panel.offsetTop;
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          panel.style.left = e.clientX - offsetX + 'px';
          panel.style.top = e.clientY - offsetY + 'px';
        }
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
      });
    }
  }

  return panel;
}

/**
 * Creates a styled context menu
 */
export function createMenu(options: MenuOptions): HTMLDivElement {
  const menu = document.createElement('div');

  menu.style.cssText = `
    position: fixed;
    left: ${options.x || 0}px;
    top: ${options.y || 0}px;
    background: ${UITheme.colors.bg.surface};
    border: 1px solid ${UITheme.colors.borderLight};
    border-radius: ${UITheme.borderRadius.md};
    box-shadow: ${UITheme.shadows.lg};
    z-index: ${UITheme.zIndex.dropdown};
    min-width: 200px;
    font-family: ${UITheme.typography.fontFamily};
    overflow: hidden;
  `;

  options.items.forEach((item) => {
    if (item.divider) {
      const divider = document.createElement('div');
      divider.style.cssText = `
        height: 1px;
        background: ${UITheme.colors.border};
        margin: ${UITheme.spacing.xs} 0;
      `;
      menu.appendChild(divider);
      return;
    }

    const menuItem = document.createElement('div');
    menuItem.style.cssText = `
      padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
      color: ${item.disabled ? UITheme.colors.text.muted : UITheme.colors.text.primary};
      cursor: ${item.disabled ? 'not-allowed' : 'pointer'};
      transition: ${UITheme.transitions.fast};
      display: flex;
      align-items: center;
      gap: ${UITheme.spacing.md};
      font-size: ${UITheme.typography.sizes.base};
    `;

    if (!item.disabled) {
      menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = UITheme.colors.bg.hover;
      });

      menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
      });

      menuItem.addEventListener('click', () => {
        item.onClick?.();
        options.onItemClick?.(item.id);
        menu.remove();
      });
    }

    if (item.icon) {
      const icon = document.createElement('span');
      icon.textContent = item.icon;
      menuItem.appendChild(icon);
    }

    const label = document.createElement('span');
    label.textContent = item.label;
    menuItem.appendChild(label);

    menu.appendChild(menuItem);
  });

  // Close menu on outside click
  setTimeout(() => {
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target as Node) && menu.parentElement) {
        menu.remove();
      }
    });
  }, 0);

  return menu;
}

/**
 * Creates a styled input field
 */
export function createInput(placeholder?: string): HTMLInputElement {
  const input = document.createElement('input');
  input.placeholder = placeholder || '';

  input.style.cssText = `
    width: 100%;
    padding: ${UITheme.spacing.md} ${UITheme.spacing.lg};
    background: ${UITheme.colors.bg.darker};
    border: 1px solid ${UITheme.colors.border};
    border-radius: ${UITheme.borderRadius.md};
    color: ${UITheme.colors.text.primary};
    font-family: ${UITheme.typography.fontFamily};
    font-size: ${UITheme.typography.sizes.base};
    transition: ${UITheme.transitions.fast};
    box-sizing: border-box;
  `;

  input.addEventListener('focus', () => {
    input.style.borderColor = UITheme.colors.primary;
    input.style.boxShadow = `0 0 8px ${UITheme.colors.primary}40`;
  });

  input.addEventListener('blur', () => {
    input.style.borderColor = UITheme.colors.border;
    input.style.boxShadow = 'none';
  });

  return input;
}

/**
 * Creates a styled badge/label
 */
export function createBadge(text: string, variant: 'primary' | 'success' | 'warning' | 'error' = 'primary'): HTMLSpanElement {
  const badge = document.createElement('span');
  badge.textContent = text;

  const variantColors = {
    primary: { bg: UITheme.colors.primary, text: '#fff' },
    success: { bg: UITheme.colors.text.success, text: '#fff' },
    warning: { bg: UITheme.colors.text.warning, text: '#000' },
    error: { bg: UITheme.colors.text.error, text: '#fff' },
  };

  const colors = variantColors[variant];

  badge.style.cssText = `
    display: inline-block;
    padding: ${UITheme.spacing.xs} ${UITheme.spacing.md};
    background: ${colors.bg};
    color: ${colors.text};
    border-radius: ${UITheme.borderRadius.full};
    font-size: ${UITheme.typography.sizes.xs};
    font-weight: ${UITheme.typography.weights.semibold};
    font-family: ${UITheme.typography.fontFamily};
  `;

  return badge;
}

/**
 * Creates a decorative icon card useful for artifact, gem, or hero status panels.
 */
export function createIconCard(options: IconCardOptions): HTMLDivElement {
  const card = document.createElement('div');
  card.style.cssText = `
    display: flex;
    gap: ${UITheme.spacing.lg};
    align-items: center;
    padding: ${UITheme.spacing.lg};
    border-radius: ${UITheme.borderRadius.xl};
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(15, 20, 25, 0.95));
    border: 1px solid rgba(108, 92, 231, 0.16);
    box-shadow: ${UITheme.shadows.lg};
    min-width: 320px;
    font-family: ${UITheme.typography.fontFamily};
  `;

  const iconWrapper = document.createElement('div');
  iconWrapper.style.cssText = `
    width: 72px;
    height: 72px;
    min-width: 72px;
    border-radius: ${UITheme.borderRadius.xl};
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(108, 92, 231, 0.12);
  `;

  const iconImage = document.createElement('img');
  iconImage.src = options.iconUrl;
  iconImage.alt = options.title;
  iconImage.style.width = '48px';
  iconImage.style.height = '48px';
  iconWrapper.appendChild(iconImage);

  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: ${UITheme.spacing.xs};
    color: ${UITheme.colors.text.primary};
  `;

  const title = document.createElement('div');
  title.textContent = options.title;
  title.style.cssText = `
    font-size: ${UITheme.typography.sizes.xl};
    font-weight: ${UITheme.typography.weights.semibold};
  `;

  const subtitle = document.createElement('div');
  subtitle.textContent = options.subtitle || '';
  subtitle.style.cssText = `
    color: ${UITheme.colors.text.secondary};
    font-size: ${UITheme.typography.sizes.sm};
  `;

  content.appendChild(title);
  if (options.subtitle) content.appendChild(subtitle);

  if (options.value) {
    const value = document.createElement('div');
    value.textContent = options.value;
    value.style.cssText = `
      color: ${UITheme.colors.primary};
      font-size: ${UITheme.typography.sizes['2xl']};
      font-weight: ${UITheme.typography.weights.bold};
    `;
    content.appendChild(value);
  }

  if (options.badgeLabel) {
    const badge = createBadge(options.badgeLabel, options.accent || 'primary');
    badge.style.marginTop = UITheme.spacing.sm;
    badge.style.alignSelf = 'flex-start';
    content.appendChild(badge);
  }

  card.appendChild(iconWrapper);
  card.appendChild(content);
  return card;
}

/**
 * Creates a round badge with an icon and status value.
 */
export function createRoundIconBadge(options: RoundIconBadgeOptions): HTMLDivElement {
  const badge = document.createElement('div');
  const size = options.size || 80;
  badge.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    min-width: ${size}px;
    border-radius: 50%;
    background: linear-gradient(145deg, rgba(39, 41, 63, 0.95), rgba(28, 31, 48, 0.75));
    border: 1px solid rgba(108, 92, 231, 0.24);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${UITheme.spacing.xs};
    box-shadow: ${UITheme.shadows.md};
    padding: ${UITheme.spacing.sm};
  `;

  const icon = document.createElement('img');
  icon.src = options.iconUrl;
  icon.alt = options.label;
  icon.style.width = `${Math.max(24, size * 0.45)}px`;
  icon.style.height = `${Math.max(24, size * 0.45)}px`;
  badge.appendChild(icon);

  const value = document.createElement('div');
  value.textContent = options.value;
  value.style.cssText = `
    color: ${UITheme.colors.text.primary};
    font-size: ${UITheme.typography.sizes.sm};
    font-weight: ${UITheme.typography.weights.semibold};
  `;

  const label = document.createElement('div');
  label.textContent = options.label;
  label.style.cssText = `
    color: ${UITheme.colors.text.secondary};
    font-size: ${UITheme.typography.sizes.xs};
    text-align: center;
  `;

  badge.appendChild(value);
  badge.appendChild(label);
  return badge;
}
