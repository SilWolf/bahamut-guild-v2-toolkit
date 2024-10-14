import React, { useRef } from 'react';
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
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';

import styles from './index.module.css';
import { MentionNode } from './nodes/MentionNode';
import ControlAndWorkflowPlugin from './plugins/ControlAndWorkflowPlugin';
import EditablePlugin from './plugins/EditablePlugin';
import MentionPlugin from './plugins/MentionPlugin';
// import TreeViewPlugin from './plugins/TreeViewPlugin';
import { AutoLinkNode } from '@lexical/link';
import { $createParagraphNode, $createTextNode, LexicalEditor } from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';

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

export class BahaPostCommentTextareaController {
	_editor: LexicalEditor | null;

	constructor() {
		this._editor = null;
	}

	getEditor() {
		return this._editor;
	}

	setEditor(newEditor: LexicalEditor) {
		this._editor = newEditor;
	}
}

export const useCommentEditorRef = () => {
	return useRef<LexicalEditor>();
};

type Props = {
	controller?: BahaPostCommentTextareaController;
	id: string;
	active?: boolean;
	value?: string;
	onPressArrowUp?: (e: KeyboardEvent) => void;
	onPressArrowDown?: (e: KeyboardEvent) => void;
	onPressEsc?: (e: KeyboardEvent) => void;
	onPressEnter?: (e: KeyboardEvent, text: string) => boolean;
	onBlur?: (value: string) => void;
	editorRef?: React.MutableRefObject<LexicalEditor | null | undefined>;
};

export default function BahaPostCommentTextarea({
	controller,
	id,
	active,
	value,
	onPressArrowUp,
	onPressArrowDown,
	onPressEsc,
	onPressEnter,
	onBlur,
	editorRef,
}: Props) {
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
					controller={controller}
					onPressArrowUp={onPressArrowUp}
					onPressArrowDown={onPressArrowDown}
					onPressEsc={onPressEsc}
					onPressEnter={onPressEnter}
					onBlur={onBlur}
					value={value}
				/>

				{typeof editorRef !== 'undefined' && (
					<EditorRefPlugin editorRef={editorRef} />
				)}

				{/* <TreeViewPlugin /> */}
			</div>
		</LexicalComposer>
	);
}

export const insertTextFn = (newText: string) => () => {
	const paragraphNode = $createParagraphNode();
	const textNode = $createTextNode(newText);
	paragraphNode.append(textNode);
	$insertNodeToNearestRoot(paragraphNode);
};
