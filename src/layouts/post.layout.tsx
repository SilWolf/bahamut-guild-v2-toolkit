import { variants } from 'classname-variants';
import { tw } from 'classname-variants/react';
import { PropsWithChildren } from 'react';

export type PostLayoutOptions = {
	mainWidth?: 'unlimited' | 'guildV2' | 'guildV1';
	avatarSize?: 'small' | 'medium' | 'large' | 'hidden';
	avatarShape?: 'circle' | 'rounded' | 'square';
	avatarRingColor?: 'none' | string;
	fontSize?: 'small' | 'medium' | 'large';
	nameColor?: 'none' | 'playerColor';
	bgColor?: 'none' | 'striped';
	order?: 'asc' | 'desc';
	ctime?: 'full' | 'short' | 'relative' | 'hidden';
	gpbpButtons?: 'visible' | 'hidden';
};

export const POST_LAYOUT_OPTIONS_DEFAULT_VALUES: PostLayoutOptions = {
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

const cn = variants({
	base: tw`tw-mb-8 tw-mx-auto tw-w-[calc(var(--bhgtv3-pc-main-width)+var(--bhgtv3-pc-avatar-size)+44px)]`,
	variants: {
		bgColor: {
			none: tw``,
			striped: tw`[&_.bhgtv3-pclist]:even:tw-bg-neutral-100`,
		},
		fontSize: {
			small: tw`tw-text-[12px]`,
			medium: tw`tw-text-[15px]`,
			large: tw`tw-text-[18px]`,
		},
		avatarSize: {
			small: tw`[--bhgtv3-pc-avatar-size:28px]`,
			medium: tw`[--bhgtv3-pc-avatar-size:36px]`,
			large: tw`[--bhgtv3-pc-avatar-size:48px]`,
			hidden: tw`[--bhgtv3-pc-avatar-size:-16px] [&_.bhgtv3-pc-avatar]:tw-hidden`,
		},
		avatarShape: {
			circle: tw`[&_.bhgtv3-pc-avatar]:tw-rounded-full`,
			rounded: tw`[&_.bhgtv3-pc-avatar]:tw-rounded-lg`,
			square: tw``,
		},
		mainWidth: {
			unlimited: '',
			guildV2: '[--bhgtv3-pc-main-width:31em]',
			guildV1: '[--bhgtv3-pc-main-width:37em]',
		},
	},
	defaultVariants: {
		bgColor: 'striped',
		fontSize: 'medium',
		avatarSize: 'medium',
		avatarShape: 'circle',
		mainWidth: 'guildV1',
	},
});

const PostLayout = ({
	options,
	children,
}: PropsWithChildren<{ options: PostLayoutOptions }>) => {
	return <div className={cn(options)}>{children}</div>;
};

export default PostLayout;
