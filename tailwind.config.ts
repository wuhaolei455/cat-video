import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      // Safari兼容性增强
      screens: {
        'safari': {'raw': '(-webkit-min-device-pixel-ratio: 1)'},
      },
      // 确保所有渐变在Safari中正常工作
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Safari特殊动画
      animation: {
        'safari-fade-in': 'safari-fade-in 0.3s ease-in-out',
      },
      keyframes: {
        'safari-fade-in': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [
    // Safari兼容性插件
    function({ addUtilities, addComponents }: { addUtilities: any; addComponents: any }) {
      // Safari特殊工具类
      addUtilities({
        '.safari-smooth': {
          '-webkit-font-smoothing': 'antialiased',
          '-moz-osx-font-smoothing': 'grayscale',
        },
        '.safari-hw-accel': {
          '-webkit-transform': 'translateZ(0)',
          'transform': 'translateZ(0)',
          '-webkit-backface-visibility': 'hidden',
          'backface-visibility': 'hidden',
        },
        '.safari-scroll': {
          '-webkit-overflow-scrolling': 'touch',
        },
        // 修复Safari的100vh问题
        '.safari-vh-fix': {
          'height': '-webkit-fill-available',
        },
        '.safari-min-vh-fix': {
          'min-height': '-webkit-fill-available',
        },
      })

      // Safari特殊组件
      addComponents({
        '.safari-flex': {
          'display': 'flex',
        },
        '.safari-flex-col': {
          '-webkit-box-orient': 'vertical',
          '-webkit-box-direction': 'normal',
          '-webkit-flex-direction': 'column',
          '-ms-flex-direction': 'column',
          'flex-direction': 'column',
        },
        '.safari-gradient': {
          'background': '-webkit-linear-gradient(135deg, var(--tw-gradient-stops))',
        },
      })
    },
  ],
}

export default config
