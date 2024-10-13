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
	comment: TBGTV3ConfigForCommentV1;
	users: TBGTV3ConfigForUsersV1;
};

export type TBGTV3ConfigForCommentV1 = {
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

export type TBGTV3ConfigForUsersV1 = Record<
	string,
	TBGTV3ConfigForUsersV1Value
>;

export type TBGTV3ConfigForUsersV1Value = {
	id: string;
	name: string;
	avatarSrc: string;
	characterName?: string;
	primaryColor: string;
	colors: {
		light: TBGTV3ConfigForUsersColor;
		dark: TBGTV3ConfigForUsersColor;
	};
};

export type TBGTV3ConfigForUsersColor = {
	textColor: string;
	bgColor: string;
};

export const BGT_V3_COMMENT_CONFIG_DEFAULT_VALUE: TBGTV3ConfigForCommentV1 = {
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
};

export const BGT_V3_USERS_CONFIG_DEFAULT_VALUE: TBGTV3ConfigForUsersV1 = {};
