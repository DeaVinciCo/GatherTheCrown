/**
 * Modern Dark RPG UI Theme
 * Consistent color palette, typography, and component styles
 */

export const UITheme = {
  // Color Palette
  colors: {
    // Primary
    primary: '#6C5CE7',      // Purple
    primaryDark: '#5F3DC4',
    primaryLight: '#A29BFE',

    // Secondary
    secondary: '#00B894',    // Green (Accent)
    secondaryDark: '#009970',

    // Backgrounds
    bg: {
      dark: '#0F1419',       // Main background
      darker: '#0A0D12',     // Overlay background
      surface: '#1A1F2E',    // Card/Panel background
      hover: '#252E42',      // Hover state
      active: '#2D3E5F',     // Active state
    },

    // Text
    text: {
      primary: '#E8EAED',    // Main text
      secondary: '#A8AEB7',  // Secondary text
      muted: '#7A8195',      // Muted text
      success: '#00B894',
      warning: '#FDCB6E',
      error: '#FF7675',
      info: '#6C5CE7',
    },

    // Borders & Accents
    border: '#2D3E5F',
    borderLight: '#3D4E6F',
    accent: '#FF6B6B',
    accentGold: '#FFD700',

    // Chat specific
    chat: {
      playerMessage: '#6C5CE7',   // Purple
      systemMessage: '#7A8195',   // Gray
      errorMessage: '#FF7675',    // Red
      successMessage: '#00B894',  // Green
    },
  },

  // Typography
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    sizes: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '32px',
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(108, 92, 231, 0.3)',
  },

  // Z-Index
  zIndex: {
    base: 1,
    dropdown: 100,
    modal: 200,
    tooltip: 300,
    notification: 400,
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
};

// CSS Variable Generator
export function generateCSSVariables(): string {
  const vars: string[] = [':root {'];

  // Colors
  Object.entries(UITheme.colors).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars.push(`  --color-${key}: ${value};`);
    } else {
      Object.entries(value).forEach(([subKey, subValue]) => {
        vars.push(`  --color-${key}-${subKey}: ${subValue};`);
      });
    }
  });

  // Typography
  Object.entries(UITheme.typography.sizes).forEach(([key, value]) => {
    vars.push(`  --font-size-${key}: ${value};`);
  });

  // Spacing
  Object.entries(UITheme.spacing).forEach(([key, value]) => {
    vars.push(`  --spacing-${key}: ${value};`);
  });

  // Border Radius
  Object.entries(UITheme.borderRadius).forEach(([key, value]) => {
    vars.push(`  --radius-${key}: ${value};`);
  });

  vars.push('}');
  return vars.join('\n');
}
