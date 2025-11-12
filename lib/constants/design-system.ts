/**
 * Design System Constants - "Illumination" Theme
 * Library Nexus Design System
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Primary Colors
  primary: {
    teal: '#00798C',      // Brand Core - Admin active states, Member hero
    gold: '#E8A24C',      // Discovery/Member Accent - Fun, engaging elements
  },

  // Neutral Colors
  neutral: {
    50: '#FAFAFA',
    100: '#F7F7F7',       // Main page background
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Admin Theme
  admin: {
    dark: '#1F2937',      // Admin sidebar (slate-800)
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1F2937',
      900: '#0F172A',
    },
  },

  // Semantic Colors
  semantic: {
    success: {
      light: '#D1FAE5',
      DEFAULT: '#10B981',
      dark: '#065F46',
    },
    warning: {
      light: '#FEF3C7',
      DEFAULT: '#F59E0B',
      dark: '#92400E',
    },
    error: {
      light: '#FEE2E2',
      DEFAULT: '#EF4444',
      dark: '#991B1B',
    },
    info: {
      light: '#DBEAFE',
      DEFAULT: '#3B82F6',
      dark: '#1E40AF',
    },
  },

  // UI Colors
  ui: {
    cardWhite: '#FFFFFF',
    deepText: '#212529',
    border: '#E5E7EB',
    inputBg: '#F9FAFB',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  fonts: {
    sans: ['Inter', 'sans-serif'],        // Body, Admin, Forms
    display: ['Poppins', 'sans-serif'],   // Member App Headers
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },

  sizes: {
    // Headers
    h1: '2.5rem',     // 40px
    h2: '2rem',       // 32px
    h3: '1.5rem',     // 24px
    h4: '1.25rem',    // 20px
    h5: '1.125rem',   // 18px
    h6: '1rem',       // 16px

    // Body
    base: '1rem',     // 16px
    sm: '0.875rem',   // 14px
    xs: '0.75rem',    // 12px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
  },

  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================================================
// LAYOUT
// ============================================================================

export const LAYOUT = {
  sidebar: {
    width: '16rem',        // 256px
    collapsedWidth: '4rem', // 64px
  },

  header: {
    height: '3.5rem',      // 56px
  },

  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',

  // Special - Floating Book Cards
  bookCard: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  bookCardHover: '0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const RADIUS = {
  none: '0',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const TRANSITIONS = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  timing: {
    ease: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// COMPONENT SPECIFIC
// ============================================================================

export const COMPONENTS = {
  // Stat Cards (Dashboard)
  statCard: {
    colors: {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
      },
    },
  },

  // Category Cards (Member App)
  categoryCard: {
    colors: {
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
      },
      pink: {
        bg: 'bg-pink-100',
        text: 'text-pink-600',
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
      },
    },
  },

  // Book Tags
  bookTag: {
    base: 'px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-medium',
  },
} as const;

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export const DESIGN_SYSTEM = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: SHADOWS,
  radius: RADIUS,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  components: COMPONENTS,
} as const;

export default DESIGN_SYSTEM;
