import type { Config } from 'tailwindcss';

import { fontFamily } from 'tailwindcss/defaultTheme';

import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';

const config: Config = {
    content: ['../../{bases,shared,src}/**/*.{js,ts,jsx,tsx,mdx}'],

    plugins: [animate, typography],

    darkMode: ['class'],
    prefix: '',

    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },

        extend: {
            fontFamily: {
                sans: ['Inter Variable', ...fontFamily.sans],
                nunito: ['Nunito', 'sans-serif'],
                quicksand: ['Quicksand', 'sans-serif'],
            },

            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },

                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground':
                        'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground':
                        'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },

                // ABA-themed color palette for hand-drawn design system
                blue: {
                    50: '#EFF6FF',
                    100: '#DBEAFE',
                    200: '#BFDBFE',
                    300: '#93C5FD',
                    400: '#60A5FA',
                    500: '#3B82F6',
                },
                purple: {
                    50: '#FAF5FF',
                    100: '#F3E8FF',
                    200: '#E9D5FF',
                    300: '#D8B4FE',
                    400: '#C084FC',
                    500: '#A855F7',
                },
                green: {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    200: '#BBF7D0',
                    300: '#86EFAC',
                    400: '#4ADE80',
                    500: '#22C55E',
                },
                orange: {
                    50: '#FFF7ED',
                    100: '#FED7AA',
                    200: '#FDBA74',
                    300: '#FB923C',
                    400: '#F97316',
                    500: '#EA580C',
                },
                yellow: {
                    50: '#FEFCE8',
                    100: '#FEF3C7',
                    200: '#FDE68A',
                    300: '#FCD34D',
                    400: '#F59E0B',
                    500: '#D97706',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            boxShadow: {
                floating:
                    'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 1px 6px 24px 0px',
                'hand-drawn': '0 4px 12px rgba(0, 0, 0, 0.15)',
                'hand-drawn-lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                'gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-2px)' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'gentle-bounce': 'gentle-bounce 2s ease-in-out infinite',
            },
            // Enhanced scale utilities for hover effects
            scale: {
                '102': '1.02',
                '105': '1.05',
            },
            // Very subtle rotation values for decorative elements only
            rotate: {
                '0.1': '0.1deg',
                '0.2': '0.2deg',
                '-0.1': '-0.1deg',
                '-0.2': '-0.2deg',
            },
            // Additional spacing for hand-drawn layouts
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
            },
        },
    },
} satisfies Config;

export default config;
