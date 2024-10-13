import React, { CSSProperties, memo, PropsWithChildren, useMemo } from 'react';
import BahaPostCommentContent from '../BahaPostCommentContent';
import { renderTime } from '../../utils/string.util';

import styles from './index.module.css';
import { TBahaComment, TBGTV3Config } from '../../types';

type BahaCommentCSSProperties = CSSProperties & {
	'--bpc-font-size'?: string;
	'--bpc-avatar-border-radius'?: string;
	'--bpc-avatar-size'?: string;
	'--bpc-side-left-display'?: string;
	'--bpc-main-max-width'?: string;
	'--bpc-light-bgcolor'?: string;
	'--bpc-light-bgcolor-odd'?: string;
	'--bpc-light-bgcolor-even'?: string;
	'--bpc-dark-bgcolor'?: string;
	'--bpc-dark-bgcolor-odd'?: string;
	'--bpc-dark-bgcolor-even'?: string;
	'--bpc-light-main-header-title-color'?: string;
	'--bpc-dark-main-header-title-color'?: string;
};

type Props = PropsWithChildren<{
	avatar?: React.ReactNode;
	title?: React.ReactNode;
	metadata?: React.ReactNode;
}>;

export function BahaPostCommentAvatar({
	src,
	userId,
}: {
	src: HTMLImageElement['src'];
	userId: string;
}) {
	return <img className={`bpc-avatar bpc-avatar-${userId}`} src={src} />;
}

export default function BahaPostCommentDivLayout({
	avatar,
	title,
	metadata,
	children,
}: Props) {
	return (
		<div className={styles['baha-post-comment']}>
			<div className='bpc-side-left'>{avatar}</div>
			<div className='bpc-main'>
				{(title || metadata) && (
					<div className='bpc-main-header'>
						<div className='bpc-main-header-title'>{title}</div>
						<div className='bpc-main-header-metadata'>{metadata}</div>
					</div>
				)}
				<div className='bpc-main-body'>{children}</div>
			</div>
		</div>
	);
}

export const BahaPostCommentDiv = memo(
	function BahaPostCommentDiv({
		comment,
		ctimeFormat,
	}: {
		comment: TBahaComment;
		ctimeFormat?: TBGTV3Config['comment']['ctime'];
	}) {
		return (
			<BahaPostCommentDivLayout
				avatar={
					<BahaPostCommentAvatar src={comment.propic} userId={comment.userid} />
				}
				title={comment.name}
				metadata={
					<div className='tw-space-x-4 tw-opacity-80 tw-text-xs'>
						{comment.ctime && (
							<span>{renderTime(comment.ctime, ctimeFormat)}</span>
						)}
						{comment.position && <span>#{comment.position || '???'}</span>}
					</div>
				}
			>
				<BahaPostCommentContent content={comment.text} />
			</BahaPostCommentDivLayout>
		);
	},
	(a, b) => a.comment.id === b.comment.id && a.comment.ctime === b.comment.ctime
);

const listingCSSProperties = (config: TBGTV3Config) => {
	const cssVariables: BahaCommentCSSProperties = {};
	switch (config.comment.avatarShape) {
		case 'circle':
			cssVariables['--bpc-avatar-border-radius'] = '24px';
			break;
		case 'rounded':
			cssVariables['--bpc-avatar-border-radius'] = '6px';
			break;
		case 'square':
			cssVariables['--bpc-avatar-border-radius'] = '0px';
			break;
	}

	switch (config.comment.avatarSize) {
		case 'small':
			cssVariables['--bpc-avatar-size'] = '28px';
			break;
		case 'medium':
			cssVariables['--bpc-avatar-size'] = '36px';
			break;
		case 'large':
			cssVariables['--bpc-avatar-size'] = '48px';
			break;
		case 'hidden':
			cssVariables['--bpc-side-left-display'] = 'none';
			break;
	}

	switch (config.comment.fontSize) {
		case 'small':
			cssVariables['--bpc-font-size'] = '12px';
			break;
		case 'medium':
			cssVariables['--bpc-font-size'] = '15px';
			break;
		case 'large':
			cssVariables['--bpc-font-size'] = '18px';
			break;
	}

	switch (config.comment.mainWidth) {
		case 'unlimited':
			cssVariables['--bpc-main-max-width'] = '100%';
			break;
		case 'guildV1':
			cssVariables['--bpc-main-max-width'] = '37em';
			break;
		case 'guildV2':
			cssVariables['--bpc-main-max-width'] = '31em';
			break;
	}

	switch (config.comment.bgColor) {
		case 'none':
			cssVariables['--bpc-light-bgcolor'] = 'transparent';
			cssVariables['--bpc-dark-bgcolor'] = 'transparent';
			break;
		case 'striped':
			cssVariables['--bpc-light-bgcolor-odd'] = 'transparent';
			cssVariables['--bpc-light-bgcolor-even'] = 'rgba(0, 0, 0, 0.1)';
			cssVariables['--bpc-dark-bgcolor-odd'] = 'transparent';
			cssVariables['--bpc-dark-bgcolor-even'] = 'rgba(255, 255, 255, 0.1)';
			break;
	}

	switch (config.comment.nameColor) {
		case 'none':
			cssVariables['--bpc-light-main-header-title-color'] = 'inherit';
			cssVariables['--bpc-dark-main-header-title-color'] = 'inherit';
			break;
	}

	return cssVariables;
};

const commentMapFn = (config: TBGTV3Config) => (comment: TBahaComment) => {
	const cssVariables: BahaCommentCSSProperties = {};

	if (
		config.comment.bgColor === 'userColor' ||
		config.comment.nameColor === 'userColor'
	) {
		const colorConfig = config.users[comment.userid]?.colors;
		if (colorConfig) {
			switch (config.comment.bgColor) {
				case 'userColor':
					if (colorConfig) {
						cssVariables['--bpc-light-bgcolor'] =
							colorConfig.light.bgColor ?? 'transparent';
						cssVariables['--bpc-dark-bgcolor'] =
							colorConfig.dark.bgColor ?? 'transparent';
					}
					break;
			}

			switch (config.comment.nameColor) {
				case 'userColor':
					if (colorConfig) {
						cssVariables['--bpc-light-main-header-title-color'] =
							colorConfig.light.textColor ?? 'inherit';
						cssVariables['--bpc-dark-main-header-title-color'] =
							colorConfig.dark.textColor ?? 'inherit';
					}
					break;
			}
		}
	}

	if (comment._isPending) {
		cssVariables.opacity = '0.5';
	}

	return { comment, cssVariables };
};

export const BahaPostCommentsListingDivForEditor = ({
	config,
	children,
	avatarSrc,
}: PropsWithChildren<{
	config: TBGTV3Config;
	avatarSrc: string;
}>) => {
	const listingStyle = useMemo(() => listingCSSProperties(config), [config]);

	return (
		<div className={styles['baha-post-comments-listing']} style={listingStyle}>
			<div className='bpcl-item'>
				<BahaPostCommentDivLayout
					avatar={<BahaPostCommentAvatar src={avatarSrc} userId='me' />}
				>
					{children}
				</BahaPostCommentDivLayout>
			</div>
		</div>
	);
};

export const BahaPostCommentsListingDiv = ({
	comments,
	config,
}: {
	comments: TBahaComment[];
	config: TBGTV3Config;
}) => {
	const listingStyle = useMemo(() => listingCSSProperties(config), [config]);

	const commentAndStyles = useMemo(() => {
		return (
			config.comment.order === 'desc' ? comments.toReversed() : comments
		).map(commentMapFn(config));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [comments[comments.length - 1]?.id, config]);

	return (
		<div className={styles['baha-post-comments-listing']} style={listingStyle}>
			{commentAndStyles.map(({ comment, cssVariables }) => (
				<div key={comment.position} className='bpcl-item-animator'>
					<div className='bpcl-item' style={cssVariables}>
						<BahaPostCommentDiv comment={comment} />
					</div>
				</div>
			))}
		</div>
	);
};
