/** @type {import('tailwindcss').Config} */
export default {
	prefix: 'tw-',
	corePlugins: { preflight: false },
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	darkMode: [['html[data-theme="dark"]']],
	theme: {
		extend: {
			colors: {
				baha: {
					DEFAULT: '#117e96',
				},
				bg1: {
					DEFAULT: 'var(--color-bg-default, #FFFFFF)',
				},
				bg2: {
					DEFAULT: 'var(--color-bg2-default, #F0F0F0)',
				},
			},
		},
	},
	plugins: [],
};
