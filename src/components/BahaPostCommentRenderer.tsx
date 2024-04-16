import { Fragment, ReactNode, memo } from 'react';

type Props = {
	content: string;
};

const NODE_REGEXP = /\!?\@?\[([^\]]*)\]\(([^\)]*)\)/g;

const BahaPostCommentRenderer = memo(({ content }: Props) => {
	const lines = content.split('\n').map((line) => {
		const matches = [...line.matchAll(NODE_REGEXP)];

		if (matches.length === 0) {
			return [<span>{line || '　'}</span>];
		}

		const nodes: ReactNode[] = [];
		for (let i = 0; i < matches.length; i++) {
			const textBefore = content.substring(
				matches[i - 1] ? matches[i - 1].index + matches[i - 1].length : 0,
				matches[i].index
			);
			if (textBefore) {
				nodes.push(<span>{textBefore}</span>);
			}

			if (matches[i][0].startsWith('![](') && matches[i][2]) {
				// image
				nodes.push(
					<a target='_blank' href={matches[i][2]}>
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
						target='_blank'
						href={`https://home.gamer.com.tw/homeindex.php?owner=${matches[i][2]}`}
					>
						{matches[i][1]}
					</a>
				);
			} else if (matches[i][0].startsWith('[') && matches[i][2]) {
				// url
				nodes.push(
					<a target='_blank' href={matches[i][2]}>
						{matches[i][2]}
					</a>
				);
			}
		}

		const lastMatch = matches.at(-1);

		if (lastMatch) {
			nodes.push(
				<span>{line.substring(lastMatch.index + lastMatch[0].length)}</span>
			);
		}

		return nodes;
	});

	return (
		<div className='tw-leading-[1.5]'>
			{lines.map((nodes, i) => (
				<div key={i}>
					{nodes.map((node, j) => (
						<Fragment key={j}>{node}</Fragment>
					))}
				</div>
			))}
		</div>
	);
});

export default BahaPostCommentRenderer;
