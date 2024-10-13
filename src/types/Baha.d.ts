declare const Bahamut = {
	Csrf = class {
		setCookie(): void;
		getFetchHeaders(): Headers;
	},
};

declare const guildPost: {
	loginUser: {
		login: boolean;
		id: string;
		nickname: string;
		avatar: string;
	};
};

declare const Guild: {
	toggleRightSidebar: () => void;
};
