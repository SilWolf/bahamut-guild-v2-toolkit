import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://api.gamer.com.tw',
	timeout: 10000,
	withCredentials: true,
});

axiosInstance.interceptors.request.use(
	function (config) {
		if (config.method === 'post') {
			const csrf = new Bahamut.Csrf();
			csrf.setCookie();
			csrf
				.getFetchHeaders()
				.entries()
				.forEach(([key, value]) => {
					config.headers[key] = value;
				});
		}

		// Do something before request is sent
		return config;
	},
	function (error) {
		// Do something with request error
		return Promise.reject(error);
	}
);

export default axiosInstance;
