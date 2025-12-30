/**
 * Qetta Design Tokens
 * HEPHAITOS Design System Integration
 *
 * Dark Mode + Glass Morphism + Linear Purple
 *
 * @version 3.0.0
 * @date 2025-12-30
 */

// ============================================
// Primary Colors (Linear Purple - HEPHAITOS style)
// ============================================
export const colors = {
  primary: {
    50: '#F0F1FA',
    100: '#E1E3F5',
    200: '#C3C7EB',
    300: '#A5ABE1',
    400: '#7C8AEA',  // Accent
    500: '#5E6AD2',  // Main Primary
    600: '#4B56C8',  // Hover
    700: '#3A44A8',
    800: '#2E3688',
    900: '#232968',
    DEFAULT: '#5E6AD2',
  },

  // Background (Dark theme)
  background: {
    primary: '#0D0D0F',    // Main dark background
    secondary: '#0A0A0A',  // Section background
    card: '#111111',       // Card background
    cardHover: '#141414',  // Card hover
    elevated: '#1A1A1A',   // Elevated elements
  },

  // Status colors
  status: {
    success: '#22C55E',
    successBg: 'rgba(34, 197, 94, 0.1)',
    warning: '#F59E0B',
    warningBg: 'rgba(245, 158, 11, 0.1)',
    error: '#EF4444',
    errorBg: 'rgba(239, 68, 68, 0.1)',
    info: '#3B82F6',
    infoBg: 'rgba(59, 130, 246, 0.1)',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: '#E5E5E5',
    muted: '#A3A3A3',
    subtle: '#737373',
    disabled: '#525252',
  },
} as const

// ============================================
// Glass Morphism Styles
// ============================================
export const GLASS = {
  // Standard glass card
  card: 'bg-white/[0.04] backdrop-blur-xl border border-white/[0.06]',
  // Raised glass card
  cardRaised: 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.08]',
  // Input field
  input: 'bg-white/[0.02] backdrop-blur-md border border-white/[0.06]',
  // Header/Nav
  header: 'bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06]',
  // Subtle overlay
  overlay: 'bg-black/40 backdrop-blur-sm',
} as const

// ============================================
// Background Color Classes
// ============================================
export const BG_COLORS = {
  primary: 'bg-[#0D0D0F]',
  secondary: 'bg-[#0A0A0A]',
  card: 'bg-[#111111]',
  cardHover: 'bg-[#141414]',
  elevated: 'bg-[#1A1A1A]',
  input: 'bg-zinc-900/50',
} as const

// ============================================
// Border Color Classes
// ============================================
export const BORDER_COLORS = {
  default: 'border-white/[0.06]',
  hover: 'border-white/[0.12]',
  subtle: 'border-zinc-800',
  subtleHover: 'border-zinc-700',
  focus: 'border-[#5E6AD2]',
} as const

// ============================================
// Text Color Classes
// ============================================
export const TEXT_COLORS = {
  primary: 'text-white',
  secondary: 'text-zinc-100',
  muted: 'text-zinc-400',
  subtle: 'text-zinc-500',
  disabled: 'text-zinc-600',
  accent: 'text-[#5E6AD2]',
} as const

// ============================================
// Button Styles
// ============================================
export const BUTTON_STYLES = {
  // Primary CTA - Gradient
  primary: 'bg-gradient-to-r from-[#5E6AD2] to-[#4B56C8] hover:from-[#4B56C8] hover:to-[#3A44A8] text-white font-semibold shadow-lg shadow-[#5E6AD2]/20 hover:shadow-xl hover:shadow-[#5E6AD2]/30 transition-all duration-200',

  // Secondary - Glass
  secondary: 'bg-white/[0.06] backdrop-blur-xl border border-white/[0.12] text-white font-semibold hover:bg-white/[0.10] transition-colors',

  // Ghost
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors',
} as const

// ============================================
// Status Colors (for Bid matching)
// ============================================
export const STATUS_COLORS = {
  bid: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  review: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  skip: {
    bg: 'bg-zinc-500/10',
    text: 'text-zinc-400',
    border: 'border-zinc-500/30',
  },
  new: {
    bg: 'bg-[#5E6AD2]/10',
    text: 'text-[#5E6AD2]',
    border: 'border-[#5E6AD2]/30',
  },
} as const

// ============================================
// Score Colors (0-100%)
// ============================================
export function getScoreColor(score: number) {
  if (score >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500' }
  if (score >= 60) return { text: 'text-amber-400', bg: 'bg-amber-500' }
  if (score >= 40) return { text: 'text-[#5E6AD2]', bg: 'bg-[#5E6AD2]' }
  return { text: 'text-zinc-400', bg: 'bg-zinc-500' }
}

// ============================================
// Grid Background Pattern
// ============================================
export const GRID_PATTERN = "bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"

// ============================================
// Typography
// ============================================
export const typography = {
  fontFamily: {
    sans: ['var(--font-noto-sans-kr)', 'Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['var(--font-ibm-plex-mono)', 'IBM Plex Mono', 'JetBrains Mono', 'SF Mono', 'Consolas', 'monospace'],
  },
  fontSize: {
    '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1.15' }],
    '6xl': ['3.75rem', { lineHeight: '1.1' }],
    '7xl': ['4.5rem', { lineHeight: '1.05' }],
  },
} as const

// ============================================
// Shadows (Dark theme)
// ============================================
export const shadows = {
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
  DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
  glow: {
    primary: '0 0 20px rgba(94, 106, 210, 0.2)',
    primaryLg: '0 0 40px rgba(94, 106, 210, 0.3)',
    success: '0 0 20px rgba(34, 197, 94, 0.2)',
    error: '0 0 20px rgba(239, 68, 68, 0.2)',
  },
  glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
} as const

// ============================================
// Border Radius
// ============================================
export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.625rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.25rem',
  '3xl': '1.5rem',
  full: '9999px',
} as const

// ============================================
// Animation
// ============================================
export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ============================================
// Spacing
// ============================================
export const spacing = {
  section: {
    sm: '4rem',
    md: '6rem',
    lg: '8rem',
  },
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// ============================================
// Common Component Classes
// ============================================
export const COMPONENT_CLASSES = {
  // Section container
  section: `py-24 ${BG_COLORS.secondary}`,

  // Glass card
  card: `${GLASS.card} rounded-2xl p-6`,

  // Badge
  badge: 'inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5E6AD2]/10 border border-[#5E6AD2]/20',

  // Headline
  headline: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white',

  // Subheadline
  subheadline: 'text-xl sm:text-2xl text-zinc-400',

  // Stats grid
  statsGrid: 'grid grid-cols-2 lg:grid-cols-4 gap-4',

  // Stat card
  statCard: `${GLASS.card} rounded-xl p-4`,
}

// ============================================
// Exports
// ============================================
export const tokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animation,
} as const

export default tokens
