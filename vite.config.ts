import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		monkey({
			entry: 'src/main.tsx',
			userscript: {
				icon: 'https://vitejs.dev/logo.svg',
				namespace: 'npm/vite-plugin-monkey',
				match: ['https://guild.gamer.com.tw/post_detail.php*'],
			},
			build: {
				externalGlobals: {
					react: cdn.jsdelivr('React', 'umd/react.production.min.js'),
					'react-dom': cdn.jsdelivr(
						'ReactDOM',
						'umd/react-dom.production.min.js'
					),
					axios: cdn.jsdelivr('axios', 'dist/axios.min.js'),
					dayjs: cdn.jsdelivr('dayjs', 'dayjs.min.js'),
					'dayjs/locale/zh-tw': cdn.jsdelivr('dayjs', 'locale/zh-tw.js'),
					dayjsRelativeTime: cdn.jsdelivr('dayjs', 'plugin/relativeTime.js'),
					useLocalStorage: cdn.jsdelivr('react-use', 'lib/useLocalStorage.js'),
					// bootstrap: cdn.jsdelivr('Bootstrap', 'dist/js/bootstrap.min.js'),
				},
				// externalResource: {
				// 	'bootstrap/dist/css/bootstrap.min.css': cdn.jsdelivr(),
				// },
			},
		}),
	],
});
