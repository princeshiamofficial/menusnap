import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			spacing: {
				'4.5': '1.125rem',
			},
			backgroundImage: {
				'watermark': `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3e%3ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='24' fill='rgba(0,0,0,0.06)' text-anchor='middle' dominant-baseline='middle' transform='rotate(-30, 150, 100)'%3eCOLOR HUT%3c/text%3e%3c/svg%3e")`,
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				surface: '#ffffff',
				cream: '#fafaf8',
				ink: '#111111',
				'accent-deep': '#e6482a',
				'accent-soft': '#ffeee9',
				night: '#101010',
				'night-soft': '#1a1a1a',
				line: '#ecebe6',
				'line-dark': '#2b2b2b',
				success: '#16a34a'
			},
			boxShadow: {
				card: '0 1px 2px rgb(17 17 17 / 0.05), 0 12px 32px -16px rgb(17 17 17 / 0.14)',
				lift: '0 2px 6px rgb(17 17 17 / 0.06), 0 28px 56px -20px rgb(17 17 17 / 0.25)',
				pop: '0 0 0 1px rgb(255 90 54 / 0.14), 0 16px 48px -12px rgb(255 90 54 / 0.45)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				shimmer: {
					'0%': { 'background-position': '-200% 0' },
					'100%': { 'background-position': '200% 0' },
				},
				glow: {
					'0%, 100%': {
						boxShadow: '0 0 5px -1px hsl(var(--primary))'
					},
					'50%': {
						boxShadow: '0 0 10px 2px hsl(var(--primary))'
					}
				},
				'float-y': {
					from: { transform: 'translateY(0)' },
					to: { transform: 'translateY(-9px)' },
				},
				'pulse-ring': {
					'0%': { transform: 'scale(1)', opacity: '0.5' },
					'100%': { transform: 'scale(1.9)', opacity: '0' },
				},
				'pop-in': {
					'0%': { transform: 'scale(0.92)', opacity: '0' },
					'60%': { transform: 'scale(1.04)' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				'slide-up': {
					from: { transform: 'translateY(14px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				'caret-blink': {
					'0%, 45%': { opacity: '1' },
					'50%, 100%': { opacity: '0' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				shimmer: 'shimmer 1.5s infinite linear',
				glow: 'glow 3s ease-in-out infinite',
				float: 'float-y 5.5s ease-in-out infinite alternate',
				'pulse-ring': 'pulse-ring 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite',
				'pop-in': 'pop-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
				'slide-up': 'slide-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
				caret: 'caret-blink 1s steps(1) infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
