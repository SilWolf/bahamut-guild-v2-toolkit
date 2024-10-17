export type TDiceRollConfig = {
	version: 1;
	histories: TDiceRollItem[];
};

export type TDiceRollItem = {
	id: string;
	params: {
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
	result: {
		record: number[];
		total: number;
		hashcode: string;
	};
};
