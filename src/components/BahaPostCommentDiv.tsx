import { CSSProperties, memo } from 'react';
import {
	BahaComment,
	BahaCommentsPaginationResult,
} from '../helpers/api.helper';
import BahaPostCommentContent from './BahaPostCommentContent';
import { renderTime } from '../utils/string.util';
import { PostLayoutOptions } from '../layouts/post.layout';

type Props = {
	comment: BahaComment;
	ctimeFormat?: PostLayoutOptions['ctime'];
};

const BahaPostCommentDiv = memo(({ comment, ctimeFormat }: Props) => {
	return (
		<div className='tw-flex tw-justify-start tw-items-start tw-gap-x-3'>
			<img
				className='bhgtv3-pc-avatar'
				src={comment.propic}
				alt={comment.userid}
			/>
			<div className='bhgtv3-pc-main'>
				<div className='tw-flex tw-justify-between tw-items-center'>
					<p className='tw-font-bold'>{comment.name}</p>
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
				</div>
				{/* <p className='tw-whitespace-pre-line'>{comment.text}</p> */}
				<div className='bhgtv3-pc-content'>
					<BahaPostCommentContent content={comment.text} />
				</div>
			</div>
		</div>
	);
});

export default BahaPostCommentDiv;

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
			{(isDesc ? commentsPages.toReversed() : commentsPages).map((page, i) =>
				(isDesc ? page.comments.toReversed() : page.comments).map((comment) => (
					<div key={comment.id} className='bhgtv3-pclist'>
						<BahaPostCommentDiv comment={comment} ctimeFormat={ctimeFormat} />
					</div>
				))
			)}
		</div>
	);
};
