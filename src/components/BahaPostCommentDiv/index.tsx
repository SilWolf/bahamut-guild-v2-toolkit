import React, { CSSProperties, PropsWithChildren, useMemo } from 'react';
import BahaPostCommentContent from '../BahaPostCommentContent';
import { renderTime } from '../../utils/string.util';

import styles from './index.module.css';
import { TBahaComment, TBahaCommentConfig } from '../../types';

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
	avatarSrc?: string | null | undefined;
	title: React.ReactNode;
	metadata?: React.ReactNode;
}>;

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
				<div className='bpc-main-header'>
					<div className='bpc-main-top-title'>{title}</div>
					<div className='bpc-main-top-metadata'>{metadata}</div>
				</div>
				<div className='bpc-main-body'>{children}</div>
			</div>
		</div>
	);
}

export function BahaPostCommentDiv({
	comment,
	ctimeFormat,
}: {
	comment: TBahaComment;
	ctimeFormat?: TBahaCommentConfig['ctime'];
}) {
	return (
		<BahaPostCommentDivLayout
			avatar={
				<img className='bpc-avatar' src={comment.propic} alt={comment.name} />
			}
			title={comment.name}
			metadata={renderTime(comment.ctime, ctimeFormat)}
		>
			<BahaPostCommentContent content={comment.text} />
		</BahaPostCommentDivLayout>
	);
}

const commentMapFn =
	(config: TBahaCommentConfig) => (comment: TBahaComment) => {
		const cssVariables: BahaCommentCSSProperties = {};
		switch (config.avatarShape) {
			case 'circle':
				cssVariables['--bpc-avatar-border-radius'] = '9999px';
				break;
			case 'rounded':
				cssVariables['--bpc-avatar-border-radius'] = '4px';
				break;
			case 'square':
				cssVariables['--bpc-avatar-border-radius'] = '0px';
				break;
		}

		switch (config.avatarSize) {
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

		switch (config.fontSize) {
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

		switch (config.mainWidth) {
			case 'unlimited':
				cssVariables['--bpc-main-max-width'] = '100%';
				break;
			case 'guildV1':
				cssVariables['--bpc-main-max-width'] = '31em';
				break;
			case 'guildV2':
				cssVariables['--bpc-main-max-width'] = '37em';
				break;
		}

		switch (config.bgColor) {
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
			case 'userColor':
				cssVariables['--bpc-light-bgcolor'] =
					config.userColorMap[comment.userid].light.bgColor ?? 'transparent';
				cssVariables['--bpc-dark-bgcolor'] =
					config.userColorMap[comment.userid].dark.bgColor ?? 'transparent';
				break;
		}

		switch (config.nameColor) {
			case 'none':
				cssVariables['--bpc-light-main-header-title-color'] = 'inherit';
				cssVariables['--bpc-dark-main-header-title-color'] = 'inherit';
				break;
			case 'userColor':
				cssVariables['--bpc-light-main-header-title-color'] =
					config.userColorMap[comment.userid].light.textColor ?? 'inherit';
				cssVariables['--bpc-dark-main-header-title-color'] =
					config.userColorMap[comment.userid].dark.textColor ?? 'inherit';
				break;
		}

		return { comment, cssVariables };
	};

export const BahaPostCommentsListingDiv = ({
	comments,
	config,
}: {
	comments: TBahaComment[];
	config: TBahaCommentConfig;
}) => {
	const commentAndStyles = useMemo(() => {
		return comments.map(commentMapFn(config));
	}, [comments, config]);

	return (
		<div className={styles['baha-post-comments-listing']}>
			{commentAndStyles.map(({ comment, cssVariables }) => (
				<div key={comment.id} className='bpcl-item' style={cssVariables}>
					<BahaPostCommentDiv comment={comment} />
				</div>
			))}
		</div>
	);
};
