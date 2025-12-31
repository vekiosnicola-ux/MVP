import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background layers (SpaceX-inspired dark grays)
        bg: {
          primary: '#0a0a0a',      // Main background
          secondary: '#141414',    // Cards, panels
          tertiary: '#1f1f1f',     // Elevated elements
          hover: '#2a2a2a',        // Hover states
        },

        // Accent colors (3D motion art-inspired)
        accent: {
          primary: '#3b82f6',      // Blue (primary actions)
          secondary: '#8b5cf6',    // Purple (AI proposals)
          success: '#10b981',      // Green (approved, passing)
          warning: '#f59e0b',      // Orange (awaiting action)
          danger: '#ef4444',       // Red (rejected, failed)
          info: '#06b6d4',         // Cyan (information)
        },

        // Text colors
        text: {
          primary: '#ffffff',      // Main text
          secondary: '#a3a3a3',    // Muted text
          tertiary: '#737373',     // Disabled text
        },

        // Borders
        border: {
          primary: '#262626',      // Subtle borders
          focus: '#3b82f6',        // Focus rings
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        xs: '0.75rem',     // 12px - Labels, badges
        sm: '0.875rem',    // 14px - Secondary text
        base: '1rem',      // 16px - Body text
        lg: '1.125rem',    // 18px - Emphasized text
        xl: '1.25rem',     // 20px - Headings H4
        '2xl': '1.5rem',   // 24px - Headings H3
        '3xl': '1.875rem', // 30px - Headings H2
        '4xl': '2.25rem',  // 36px - Headings H1
      },

      borderRadius: {
        sm: '0.375rem',   // 6px - Small elements
        md: '0.5rem',     // 8px - Cards, buttons
        lg: '0.75rem',    // 12px - Large cards
        xl: '1rem',       // 16px - Modals
      },

      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px rgba(0, 0, 0, 0.5)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)', // Blue glow effect
      },

      screens: {
        'sm': '640px',   // Mobile landscape
        'md': '768px',   // Tablet portrait
        'lg': '1024px',  // Tablet landscape / small desktop
        'xl': '1280px',  // Desktop
        '2xl': '1536px', // Large desktop
      },
    },
  },
  plugins: [],
};

export default config;
