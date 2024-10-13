export type BahaPostDetail = {
	time: string;
	ctime: string;
	id: string;
	content: string;
	publisher: {
		name: string;
		id: string;
		propic: string;
	};
};

export type TBahaCommentsPage = {
	nextPage: number;
	totalPage: number;
	commentCount: number;
	comments: TBahaComment[];
};

export type TBahaComment = {
	id: string;
	name: string;
	userid: string;
	propic: string;
	text: string;
	position: number;
	image?: [];
	mentions?: BahaCommentMention[];
	tags?: [];
	time?: string;
	ctime?: string;
	editable?: boolean;
	deletable?: boolean;

	_isPending?: boolean;
};

export type BahaCommentMention = {
	id: string;
	offset: string;
	length: string;
};

export type TBGTV3Config = {
	version: 1;
	comment: TBGTV3ConfigCommentV1;
	userColorMap: Record<string, { light: TBahaUserColor; dark: TBahaUserColor }>;
};

export type TBGTV3ConfigCommentV1 = {
	mainWidth: 'unlimited' | 'guildV2' | 'guildV1';
	avatarSize: 'small' | 'medium' | 'large' | 'hidden';
	avatarShape: 'circle' | 'rounded' | 'square';
	avatarRingColor: 'none' | string;
	fontSize: 'small' | 'medium' | 'large';
	nameColor: 'none' | 'userColor';
	bgColor: 'none' | 'striped' | 'userColor';
	order: 'asc' | 'desc';
	ctime: 'full' | 'short' | 'relative' | 'hidden';
	gpbpButtons: 'visible' | 'hidden';
};

export type TBahaUserColor = {
	textColor: string;
	bgColor: string;
};

export const BGT_V3_DEFAULT_VALUES: TBGTV3Config = {
	version: 1,
	comment: {
		mainWidth: 'guildV2',
		avatarSize: 'medium',
		avatarShape: 'circle',
		avatarRingColor: 'none',
		fontSize: 'medium',
		nameColor: 'none',
		bgColor: 'none',
		order: 'asc',
		ctime: 'full',
		gpbpButtons: 'hidden',
	},
	userColorMap: {},
};
