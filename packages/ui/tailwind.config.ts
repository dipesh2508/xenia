import { prisma } from "@repo/database";
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			border: '#ffffff',
  			input: '#ffffff',
  			ring: '#ffffff',
  			background: '#ffffff',
  			foreground: '#1b1b20',
  			primary: {
  				'0': '#F9F1F1;',
  				'1': '#E7C5C6',
  				'2': '#D69A9C',
  				'3': '#C46E71',
  				'4': '#AE474A',
  				'5': '#913B3E',
  				'6': '#712E30',
  				'7': '#481E1F',
  				'8': '#3A1819',
  				'9': '#1D0C0C',
  				DEFAULT: '#712e30',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				'0': '#EDE9E9;',
  				'1': '#C8BDBC',
  				'2': '#A3918F',
  				'3': '#87716E',
  				'4': '#705E5C',
  				'5': '#5A4B49',
  				'6': '#433837',
  				'7': '#352C2B',
  				'8': '#221C1C',
  				'9': '#0B0909',
  				DEFAULT: '#352C2B',
  				foreground: '#ffffff'
  			},
  			destructive: {
  				DEFAULT: '#d40014',
  				foreground: '#ffd4d1'
  			},
  			muted: {
  				DEFAULT: '#fff',
  				foreground: '#000'
  			},
  			accent: {
  				DEFAULT: '#8F3131',
  				foreground: '#fff'
  			},
  			popover: {
  				DEFAULT: '#fff',
  				foreground: '#000'
  			},
  			card: {
  				DEFAULT: '#fff',
  				foreground: '#000'
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
			chatroom: {
				background: '#fbfaf6',
				foreground: "#000",
				primary: "#f0ebdf",
				secondary: "#fffeff",
				accent: "#C9B3F6"
			},
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
