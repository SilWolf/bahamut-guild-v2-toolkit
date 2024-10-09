import React, { PropsWithChildren } from 'react';
import { BahaCommentsPaginationResult } from '../helpers/api.helper';
import BahaPostCommentContent from './BahaPostCommentContent';
import { renderTime } from '../utils/string.util';
import { PostLayoutOptions } from '../layouts/post.layout';

type Props = PropsWithChildren<{
	avatar: React.ReactNode;
	title: React.ReactNode;
	metadata?: React.ReactNode;
}>;

export default function BahaPostCommentDiv({
	avatar,
	title,
	metadata,
	children,
}: Props) {
	return (
		<div className='tw-flex tw-justify-start tw-items-start tw-gap-x-3'>
			{avatar}
			<div className='bhgtv3-pc-main'>
				<div className='tw-flex tw-justify-between tw-items-center'>
					<p className='tw-font-bold'>{title}</p>
					<div>{metadata}</div>
				</div>
				{/* <p className='tw-whitespace-pre-line'>{comment.text}</p> */}
				<div className='bhgtv3-pc-content'>{children}</div>
			</div>
		</div>
	);
}

export const BahaPostCommentsPagesList = ({
	commentsPages,
	isDesc,
	ctimeFormat,
}: {
	commentsPages: BahaCommentsPaginationResult[];
	isDesc?: boolean;
	ctimeFormat?: PostLayoutOptions['ctime'];
}) => {
	return (
		<div>
			{(isDesc ? commentsPages.toReversed() : commentsPages).map((page) =>
				(isDesc ? page.comments.toReversed() : page.comments).map((comment) => (
					<div key={comment.id} className='bhgtv3-pclist'>
						<BahaPostCommentDiv
							avatar={
								<img
									className='bhgtv3-pc-avatar'
									src={comment.propic}
									alt={comment.userid}
								/>
							}
							title={comment.name}
							metadata={
								<div className='tw-space-x-4'>
									{ctimeFormat !== 'hidden' && (
										<span className='tw-text-xs tw-text-neutral-400'>
											{renderTime(comment.ctime, ctimeFormat)}
										</span>
									)}
									<span className='tw-text-xs tw-text-neutral-400'>
										#{comment.position}
									</span>
								</div>
							}
						>
							<BahaPostCommentContent content={comment.text} />
						</BahaPostCommentDiv>
					</div>
				))
			)}
		</div>
	);
};
