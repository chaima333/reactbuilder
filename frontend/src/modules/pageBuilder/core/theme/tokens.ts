// frontend/src/modules/pageBuilder/core/theme/tokens.ts

export const tokens = {
  // ========================
  // 1. SPACING
  // ========================
  spacing: {
    xxs: "2px",
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "48px",
    xxl: "80px",
    xxxl: "120px"
  },

  // ========================
  // 2. SIZES
  // ========================
  sizes: {
    full: "100%",
    half: "50%",
    third: "33.333%",
    quarter: "25%",
    threeQuarters: "75%",
    twoThirds: "66.666%"
  },

  // ========================
  // 3. TYPOGRAPHY
  // ========================
  typography: {
    displayXL: {
      fontSize: "clamp(48px, 8vw, 72px)",
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.02em"
    },
    displayLG: {
      fontSize: "clamp(38px, 6vw, 56px)",
      fontWeight: 700,
      lineHeight: 1.15,
      letterSpacing: "-0.01em"
    },
    displayMD: {
      fontSize: "clamp(32px, 5vw, 48px)",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.01em"
    },
    displaySM: {
      fontSize: "clamp(28px, 4vw, 36px)",
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: "-0.01em"
    },
    headingXL: {
      fontSize: "clamp(24px, 3.5vw, 32px)",
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "-0.01em"
    },
    headingLG: {
      fontSize: "clamp(20px, 3vw, 28px)",
      fontWeight: 600,
      lineHeight: 1.35,
      letterSpacing: "-0.005em"
    },
    headingMD: {
      fontSize: "clamp(18px, 2.5vw, 24px)",
      fontWeight: 600,
      lineHeight: 1.4
    },
    headingSM: {
      fontSize: "clamp(16px, 2vw, 20px)",
      fontWeight: 600,
      lineHeight: 1.4
    },
    headingXS: {
      fontSize: "clamp(14px, 1.8vw, 18px)",
      fontWeight: 600,
      lineHeight: 1.4
    },
    bodyXL: {
      fontSize: "clamp(18px, 2vw, 24px)",
      lineHeight: 1.6,
      fontWeight: 400
    },
    bodyLG: {
      fontSize: "clamp(16px, 1.8vw, 20px)",
      lineHeight: 1.6,
      fontWeight: 400
    },
    bodyMD: {
      fontSize: "clamp(14px, 1.5vw, 16px)",
      lineHeight: 1.5,
      fontWeight: 400
    },
    bodySM: {
      fontSize: "clamp(12px, 1.2vw, 14px)",
      lineHeight: 1.5,
      fontWeight: 400
    },
    bodyXS: {
      fontSize: "clamp(10px, 1vw, 12px)",
      lineHeight: 1.5,
      fontWeight: 400
    },
    labelLG: {
      fontSize: "clamp(14px, 1.5vw, 16px)",
      fontWeight: 600,
      lineHeight: 1.4
    },
    labelMD: {
      fontSize: "clamp(12px, 1.2vw, 14px)",
      fontWeight: 600,
      lineHeight: 1.4
    },
    labelSM: {
      fontSize: "clamp(10px, 1vw, 12px)",
      fontWeight: 600,
      lineHeight: 1.4
    }
  },

  // ========================
  // 4. COLORS
  // ========================
  colors: {
    primary: "#00C49A",
    surface: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",

    // Primary
    primaryLight: "#E6F9F4",
    primaryDark: "#009B7A",
    primaryHover: "#00A889",
    primaryActive: "#008A6E",

    // Secondary
    secondary: "#6366F1",
    secondaryLight: "#EEF2FF",
    secondaryDark: "#4F46E5",
    secondaryHover: "#5B5BD6",
    secondaryActive: "#4338CA",

    // Status
    success: "#10B981",
    successLight: "#D1FAE5",
    successDark: "#059669",

    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    warningDark: "#D97706",

    danger: "#EF4444",
    dangerLight: "#FEE2E2",
    dangerDark: "#DC2626",

    info: "#3B82F6",
    infoLight: "#DBEAFE",
    infoDark: "#2563EB",

    // Neutral scale
    neutral: {
      50: "#F8FAFC",
      100: "#F1F5F9",
      200: "#E2E8F0",
      300: "#CBD5E1",
      400: "#94A3B8",
      500: "#64748B",
      600: "#475569",
      700: "#334155",
      800: "#1E293B",
      900: "#0F172A",
      950: "#020617"
    },

    // Surfaces (nested)
    surfaces: {
      primary: "#FFFFFF",
      secondary: "#F8FAFC",
      tertiary: "#F1F5F9",
      muted: "#F1F5F9",
      hover: "#F1F5F9",
      active: "#E2E8F0",
      disabled: "#F1F5F9",
      inverse: "#0F172A"
    },

    // Text colors (nested)
    textColors: {
      primary: "#0F172A",
      secondary: "#334155",
      muted: "#64748B",
      light: "#94A3B8",
      inverse: "#FFFFFF",
      disabled: "#94A3B8",
      link: "#00C49A",
      linkHover: "#009B7A"
    },

    // Borders (nested)
    borders: {
      light: "#E2E8F0",
      medium: "#CBD5E1",
      dark: "#94A3B8",
      focus: "#00C49A",
      error: "#EF4444",
      success: "#10B981"
    }
  },

  // ========================
  // 5. RADIUS
  // ========================
  radius: {
    none: "0px",
    xs: "4px",
    sm: "6px",
    md: "12px",
    lg: "20px",
    xl: "28px",
    xxl: "36px",
    full: "9999px"
  },

  // ========================
  // 6. SHADOWS
  // ========================
  shadows: {
    none: "none",
    xs: "0 1px 2px rgba(0,0,0,0.05)",
    sm: "0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06)",
    lg: "0 10px 15px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.05)",
    xl: "0 20px 25px rgba(0,0,0,0.08), 0 10px 10px rgba(0,0,0,0.04)",
    xxl: "0 25px 50px rgba(0,0,0,0.12)",
    inner: "inset 0 2px 4px rgba(0,0,0,0.06)",
    outline: "0 0 0 3px rgba(0,196,154,0.5)",
    primary: "0 4px 14px rgba(0,196,154,0.25)",
    secondary: "0 4px 14px rgba(99,102,241,0.25)"
  },

  // ========================
  // 7. BREAKPOINTS
  // ========================
  breakpoints: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    xxl: 1536
  },

  // ========================
  // 8. CONTAINER
  // ========================
  container: {
    maxWidth: "1180px",
    wideMaxWidth: "1360px",
    paddingDesktop: "40px",
    paddingTablet: "28px",
    paddingMobile: "18px"
  },

  // ========================
  // 9. Z-INDEX
  // ========================
  zIndex: {
    auto: "auto",
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    overlay: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
    max: 9999
  },

  // ========================
  // 10. TRANSITIONS
  // ========================
  transitions: {
    fast: "150ms ease-in-out",
    normal: "250ms ease-in-out",
    slow: "350ms ease-in-out",
    slower: "500ms ease-in-out",
    bounce: "500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "300ms cubic-bezier(0.4, 0, 0.2, 1)"
  },

  // ========================
  // 11. OPACITY
  // ========================
  opacity: {
    disabled: 0.5,
    loading: 0.7,
    hover: 0.8,
    active: 0.9,
    visible: 1,
    invisible: 0
  },

  // ========================
  // 12. FONTS
  // ========================
  fonts: {
    sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    mono: "Menlo, Monaco, 'Courier New', monospace",
    brand: "'Poppins', Inter, sans-serif"
  },

  // ========================
  // 13. GRID
  // ========================
  grid: {
    columns: 12,
    gutter: "24px",
    margin: "16px"
  }
};

export const defaultTokens = tokens;

export type Tokens = typeof tokens;
export type Spacing = typeof tokens.spacing;
export type Sizes = typeof tokens.sizes;
export type Typography = typeof tokens.typography;
export type Colors = typeof tokens.colors;
export type Radius = typeof tokens.radius;
export type Shadows = typeof tokens.shadows;
export type Breakpoints = typeof tokens.breakpoints;
export type Container = typeof tokens.container;
export type ZIndex = typeof tokens.zIndex;
export type Transitions = typeof tokens.transitions;
export type Opacity = typeof tokens.opacity;
export type Fonts = typeof tokens.fonts;
export type Grid = typeof tokens.grid;

export const getToken = <
  TCategory extends keyof Tokens,
  TKey extends keyof Tokens[TCategory]
>(
  category: TCategory,
  key: TKey
): Tokens[TCategory][TKey] => {
  return tokens[category][key];
};

export const getColor = (colorPath: string): string => {
  const path = colorPath.split('.');
  let current: any = tokens.colors;
  
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      if (path.length === 1 && key in tokens.colors) {
        return (tokens.colors as any)[key];
      }
      return colorPath;
    }
  }
  
  return typeof current === 'string' ? current : colorPath;
};

export const breakpointsToPx = (): Record<string, string> => {
  return Object.entries(tokens.breakpoints).reduce((acc, [key, value]) => {
    acc[key] = `${value}px`;
    return acc;
  }, {} as Record<string, string>);
};

export const mq = Object.entries(tokens.breakpoints).reduce((acc, [key, value]) => {
  acc[key] = `@media (min-width: ${value}px)`;
  return acc;
}, {} as Record<string, string>);

export const legacyColors = {
  primary: tokens.colors.primary,
  surface: tokens.colors.surface,
  text: tokens.colors.text,
  muted: tokens.colors.muted,
  border: tokens.colors.border
};

export const getSurfaceColor = (variant: keyof typeof tokens.colors.surfaces = 'primary'): string => {
  return tokens.colors.surfaces[variant];
};

export const getTextColor = (variant: keyof typeof tokens.colors.textColors = 'primary'): string => {
  return tokens.colors.textColors[variant];
};

export const getBorderColor = (variant: keyof typeof tokens.colors.borders = 'light'): string => {
  return tokens.colors.borders[variant];
};