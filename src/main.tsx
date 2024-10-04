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
		const originalApp = document.querySelector(
			'.main-container_wall'
		) as HTMLDivElement;

		const app = document.createElement('div');
		app.classList.add('tw-w-full');
		originalApp.prepend(app);
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
