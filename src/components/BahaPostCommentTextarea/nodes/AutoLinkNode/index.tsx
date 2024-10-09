import { $createTextNode } from 'lexical';
import { type TextMatchTransformer } from '@lexical/markdown';
import { $createLinkNode, $isLinkNode, LinkNode } from '@lexical/link';

export const LinkNodeTransformer: TextMatchTransformer = {
	dependencies: [LinkNode],
	export: (node) => {
		if (!$isLinkNode(node)) {
			return null;
		}

		return node.getURL();
	},
	importRegExp:
		/(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))/,
	regExp:
		/(?:\[([^[]+)\])(?:\((?:([^()\s]+)(?:\s"((?:[^"]*\\")*[^"]*)"\s*)?)\))$/,
	replace: (textNode, match) => {
		const [, linkText, linkUrl, linkTitle] = match;
		const linkNode = $createLinkNode(linkUrl, { title: linkTitle });
		const linkTextNode = $createTextNode(linkText);
		linkNode.append(linkTextNode);
		textNode.replace(linkNode);
	},
	type: 'text-match',
};
