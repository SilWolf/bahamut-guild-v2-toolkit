import React, { Fragment, ReactNode } from 'react';

type Props = {
	content: string;
};

const NODE_REGEXP = /!?@?\[([^\]]*)\]\(([^)]*)\)/g;

const BahaPostCommentContent = ({ content }: Props) => {
	const splittedContent = content.split('\n');
	const lines: ReactNode[][] = [];
	let firstYoutubeUrl: string | null = null;

	for (const line of splittedContent) {
		const matches = [...line.matchAll(NODE_REGEXP)];

		if (matches.length === 0) {
			lines.push([<span key='empty'>{line || '　'}</span>]);
			continue;
		}

		const nodes: ReactNode[] = [];
		for (let i = 0; i < matches.length; i++) {
			const textBefore = content.substring(
				matches[i - 1] ? matches[i - 1].index + matches[i - 1][0].length : 0,
				matches[i].index
			);
			if (textBefore) {
				nodes.push(<span>{textBefore}</span>);
			}

			if (matches[i][0].startsWith('![](') && matches[i][2]) {
				// image
				nodes.push(
					<a target='_blank' href={matches[i][2]} rel='noreferrer'>
						<img
							className='tw-h-auto tw-max-h-[164px] tw-rounded-lg'
							src={matches[i][2]}
						/>
					</a>
				);
			} else if (
				matches[i][0].startsWith('@[') &&
				matches[i][1] &&
				matches[i][1]
			) {
				// url
				nodes.push(
					<a
						className='bhgtv3-comment-mention'
						target='_blank'
						href={`https://home.gamer.com.tw/homeindex.php?owner=${matches[i][2]}`}
						rel='noreferrer'
					>
						{matches[i][1]}
					</a>
				);
			} else if (matches[i][0].startsWith('[') && matches[i][2]) {
				// url
				nodes.push(
					<a target='_blank' href={matches[i][2]} rel='noreferrer'>
						{matches[i][2]}
					</a>
				);

				if (
					!firstYoutubeUrl &&
					matches[i][2].match(
						/http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-_]*)(&(amp;)?[\w?=]*)?/
					)
				) {
					firstYoutubeUrl = matches[i][2];
				}
			}
		}

		const lastMatch = matches.at(-1);

		if (lastMatch) {
			const remainText = line.substring(lastMatch.index + lastMatch[0].length);
			if (remainText) {
				nodes.push(
					<span>{line.substring(lastMatch.index + lastMatch[0].length)}</span>
				);
			}
		}

		lines.push(nodes);
	}

	if (firstYoutubeUrl) {
		lines.push([
			<div
				key='youtube-frame'
				className='tw-aspect-video tw-relative tw-w-full'
			>
				<iframe
					loading='lazy'
					style={{ position: 'absolute', width: '100%', height: '100%' }}
					src='https://www.youtube.com/embed/t8dhw1TFQLI'
					frameBorder='0'
					allowFullScreen={true}
				></iframe>
			</div>,
		]);
	}

	return (
		<div>
			{lines.map((nodes, i) => (
				<div key={i}>
					{nodes.map((node, j) => (
						<Fragment key={j}>{node}</Fragment>
					))}
				</div>
			))}
		</div>
	);
};

export default BahaPostCommentContent;
