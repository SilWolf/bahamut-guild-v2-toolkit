import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: Infinity,
		},
	},
});

ReactDOM.createRoot(
	(() => {
		const oldApp = document.getElementsByClassName('inboxfeed')[0];
		if (!oldApp) {
			throw new Error('初始化失敗：找不到原有介面');
		}

		const appContainer = oldApp.parentElement;
		oldApp.remove();

		const app = document.createElement('div');
		app.classList.add('tw-w-full');
		appContainer!.prepend(app);

		return app;
	})()
).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	</React.StrictMode>
);
