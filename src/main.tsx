import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(
	(() => {
		const app = document.querySelector(
			'.main-container_wall'
		) as HTMLDivElement;
		return app;
	})()
).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);
