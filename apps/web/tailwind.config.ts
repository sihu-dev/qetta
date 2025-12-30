import type { Config } from 'tailwindcss';

/**
 * Qetta Tailwind Configuration
 * HEPHAITOS Design System Integration
 *
 * Primary: #5E6AD2 (Linear Purple)
 * Background: #0D0D0F (Dark Mode)
 * Glass Morphism + Dark Theme
 */

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Color Palette (HEPHAITOS Dark Theme)
      colors: {
        // Primary Brand (Linear Purple - HEPHAITOS style)
        primary: {
          DEFAULT: '#5E6AD2', // Linear Purple
          50: '#F0F1FA',
          100: '#E1E3F5',
          200: '#C3C7EB',
          300: '#A5ABE1',
          400: '#7C8AEA', // Accent
          500: '#5E6AD2', // Main
          600: '#4B56C8', // Hover
          700: '#3A44A8',
          800: '#2E3688',
          900: '#232968',
        },

        // Accent (Purple tints)
        accent: {
          DEFAULT: '#7C8AEA',
          light: '#9BA6F0',
          dark: '#4B56C8',
          hover: '#6E7AE2',
          muted: 'rgba(94, 106, 210, 0.1)',
        },

        // Background (HEPHAITOS Dark)
        background: {
          primary: '#0D0D0F',    // Main dark background
          secondary: '#0A0A0A',  // Section background
          tertiary: '#111111',   // Card background
          elevated: '#1A1A1A',   // Elevated elements
          hover: '#141414',      // Hover state
        },

        // Surface (Glass Morphism)
        surface: {
          DEFAULT: 'rgba(255, 255, 255, 0.04)',
          raised: 'rgba(255, 255, 255, 0.06)',
          overlay: 'rgba(255, 255, 255, 0.02)',
          glass: 'rgba(255, 255, 255, 0.04)',
        },

        // Border (Dark theme)
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          light: 'rgba(255, 255, 255, 0.04)',
          medium: 'rgba(255, 255, 255, 0.08)',
          focus: '#5E6AD2',
        },

        // Status
        success: {
          DEFAULT: '#10B981',
          bg: 'rgba(16, 185, 129, 0.08)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: 'rgba(245, 158, 11, 0.08)',
        },
        error: {
          DEFAULT: '#EF4444',
          bg: 'rgba(239, 68, 68, 0.08)',
        },
        info: {
          DEFAULT: '#3B82F6',
          bg: 'rgba(59, 130, 246, 0.08)',
        },
      },

      // Typography
      fontFamily: {
        sans: [
          'var(--font-noto-sans-kr)',
          'Noto Sans KR',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-ibm-plex-mono)',
          'IBM Plex Mono',
          'JetBrains Mono',
          'SF Mono',
          'Consolas',
          'monospace',
        ],
      },

      // Font Size
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }], // 10px
      },

      // Border Radius
      borderRadius: {
        '4xl': '2rem',
      },

      // Box Shadow (HEPHAITOS Dark Theme - Glow effects)
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.5), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        'glow-primary': '0 0 20px rgba(94, 106, 210, 0.2)',
        'glow-primary-lg': '0 0 40px rgba(94, 106, 210, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.2)',
        'glow-error': '0 0 20px rgba(239, 68, 68, 0.2)',
        card: '0 4px 20px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4)',
      },

      // Backdrop Blur
      backdropBlur: {
        xs: '2px',
      },

      // Animation
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        float: 'float 3s ease-in-out infinite',
      },

      // Keyframes
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-10px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(94, 106, 210, 0.15)' },
          to: { boxShadow: '0 0 40px rgba(94, 106, 210, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },

      // Z-Index
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },

      // Transition Duration
      transitionDuration: {
        '400': '400ms',
      },

      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },

      // Width
      width: {
        '88': '22rem',
        '128': '32rem',
      },

      // Max Width
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};

export default config;
