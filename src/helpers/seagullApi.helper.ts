import axios from 'axios';

const seagullAxiosInstance = axios.create({
	baseURL: 'https://www.isaka.idv.tw',
	timeout: 10000,
});

export type TDiceRollPostBody = {
	user: string;
	nickname: string;
	reason: string;
	channel: string;
	size: number;
	addnumber: number;
	count: number;
	ispool: boolean;
	isrepeat: boolean;
	pool: string[];
};

type TDiceRollPostResponse = {
	responseCode: number;
	requestData: TDiceRollPostBody;
	result: {
		record: number[];
		total: number;
		hashcode: string;
	};
};

export const postDiceRoll = (body: TDiceRollPostBody) => {
	return seagullAxiosInstance
		.post<TDiceRollPostResponse>('https://www.isaka.idv.tw/dice-api/dice', body)
		.then((res) => res.data);
};
