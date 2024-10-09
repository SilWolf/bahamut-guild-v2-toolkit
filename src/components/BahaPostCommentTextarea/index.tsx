import React from 'react';
import { HashtagNode } from '@lexical/hashtag';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
	InitialConfigType,
	LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';

import styles from './index.module.css';
import { MentionNode } from './nodes/MentionNode';
import ControlAndWorkflowPlugin from './plugins/ControlAndWorkflowPlugin';
import EditablePlugin from './plugins/EditablePlugin';
import MentionPlugin from './plugins/MentionPlugin';
import TreeViewPlugin from './plugins/TreeViewPlugin';
import { AutoLinkNode } from '@lexical/link';

const placeholder = '輸入內容…';

const theme = {
	// Theme styling goes here
	//...
};

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onError(error: any) {
	console.error(error);
}

const URL_MATCHER =
	/((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
	(text: string) => {
		const match = URL_MATCHER.exec(text);
		if (match === null) {
			return null;
		}
		const fullMatch = match[0];
		return {
			index: match.index,
			length: fullMatch.length,
			text: fullMatch,
			url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
			// attributes: { rel: 'noreferrer', target: '_blank' }, // Optional link attributes
		};
	},
];

export default function BahaPostCommentTextarea({
	id,
	active,
	value,
	onPressArrowUp,
	onPressArrowDown,
	onPressEsc,
	onPressEnter,
	onBlur,
}: {
	id: string;
	active?: boolean;
	value?: string;
	onPressArrowUp?: (e: KeyboardEvent) => void;
	onPressArrowDown?: (e: KeyboardEvent) => void;
	onPressEsc?: (e: KeyboardEvent) => void;
	onPressEnter?: (e: KeyboardEvent, text: string) => boolean;
	onBlur?: (value: string) => void;
}) {
	const initialConfig: InitialConfigType = {
		namespace: id,
		theme,
		nodes: [HashtagNode, MentionNode, AutoLinkNode],
		onError,
	};

	return (
		<LexicalComposer initialConfig={initialConfig}>
			<div className={styles['editor-container']}>
				<div className={styles['editor-inner']}>
					<PlainTextPlugin
						contentEditable={
							<ContentEditable
								className={styles['editor-input']}
								aria-placeholder={placeholder}
								placeholder={
									<div className={styles['editor-placeholder']}>
										{placeholder}
									</div>
								}
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<HistoryPlugin />
				<AutoFocusPlugin />
				<HashtagPlugin />
				<MentionPlugin />
				<AutoLinkPlugin matchers={MATCHERS} />
				<EditablePlugin active={active} />
				<ControlAndWorkflowPlugin
					onPressArrowUp={onPressArrowUp}
					onPressArrowDown={onPressArrowDown}
					onPressEsc={onPressEsc}
					onPressEnter={onPressEnter}
					onBlur={onBlur}
					value={value}
				/>

				<TreeViewPlugin />
			</div>
		</LexicalComposer>
	);
}
