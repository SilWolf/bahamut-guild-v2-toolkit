import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

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
		</QueryClientProvider>
	</React.StrictMode>
);
