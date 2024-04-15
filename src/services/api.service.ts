import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://api.gamer.com.tw',
	timeout: 10000,
	withCredentials: true,
});

export default axiosInstance;
