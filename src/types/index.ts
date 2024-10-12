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
	image?: [];
	mentions?: BahaCommentMention[];
	tags?: [];
	time?: string;
	ctime?: string;
	editable?: boolean;
	deletable?: boolean;
	position?: number;

	_isPending?: boolean;
	_listingItemId?: string;
};

export type BahaCommentMention = {
	id: string;
	offset: string;
	length: string;
};

export type TBahaCommentConfig = {
	version: 1;
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
	userColorMap: Record<string, { light: TBahaUserColor; dark: TBahaUserColor }>;
};

export type TBahaUserColor = {
	textColor: string;
	bgColor: string;
};

export const BAHA_COMMENT_CONFIG_DEFAULT_VALUES: TBahaCommentConfig = {
	version: 1,
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
	userColorMap: {},
};
