/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dashboard Palette - Light Mode Only
        background: '#FCFBFF',
        
        // Sidebar gradient colors
        sidebar: {
          from: '#F8F6FF',
          to: '#F0EBFF',
        },
        
        // Card colors
        card: {
          DEFAULT: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.6)',
        },
        
        // Legacy colors (keep for compatibility)
        bg: "#FCFBFF",
        surface: "#FFFFFF",
        primary: {
          DEFAULT: "#A855F7", // Purple
          light: "#C084FC",
        },
        accent: {
          gold: "#F59E0B",
          plum: "#8B5A83",
          purple: "#A855F7",
          pink: "#EC4899",
          rose: "#F43F5E",
          indigo: "#6366F1",
        },
        text: {
          DEFAULT: "#1F2937",
          muted: "#6B7280",
        },
        border: "#E5E7EB",
        
        // Gradient colors for premium effects
        gradient: {
          primary: 'linear-gradient(135deg, #A855F7 0%, #EC4899 50%, #6366F1 100%)',
          secondary: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)',
          tertiary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        },
      },
      
      fontFamily: {
        // Premium typography
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "monospace"],
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      boxShadow: {
        // Premium shadows for glassmorphism and claymorphism
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'clay-light': '6px 6px 16px rgba(163, 177, 198, 0.6), -6px -6px 16px rgba(255, 255, 255, 0.5)',
        'clay-dark': 'inset 6px 6px 16px rgba(163, 177, 198, 0.6), inset -6px -6px 16px rgba(255, 255, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.3)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'bounce-slow': 'bounce 3s ease-in-out infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.6)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
      },
    },
  },
  plugins: [],
};
