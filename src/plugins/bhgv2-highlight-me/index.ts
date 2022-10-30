/*******************************************************************************************
 *
 *  BHGV2_HighlightMe - 高亮我
 *  高亮你在留言中出現的名字
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types';

const BHGV2_HighlightMe: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_HighlightMe',
		prefix: 'BHGV2_HighlightMe',
		label: '「提及我」高亮',
	};

	_plugin.configs = [
		{
			key: `${_plugin.prefix}-isEnabled`,
			suffixLabel: '高亮提及我的訊息',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-onlyShowHighlighted`,
			suffixLabel: '只顯示高亮的訊息',
			dataType: 'boolean',
			inputType: 'checkbox',
			defaultValue: false,
		},
	];

	_plugin.css = [
		`
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on {
				background: #ffe2c6;
				border-left: 4px solid #fb7f00;
				cursor: pointer;
			}
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on .${_plugin.prefix}-name {
				background: #fb7f00;
				padding: 2px 4px;
				color: #fff;
				font-size: 115%;
			}

			.bhgv2-dark .${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on {
				background: #484027;
			}

			.${_plugin.prefix}-onlyShowHighlighted .bhgv2-comment:not(.${_plugin.prefix}-on) {
				display: none;
			}
		`,
	];

	const _clickEvent = (event: Event) => {
		event.preventDefault();
		const _target = event.currentTarget as HTMLDivElement | undefined;
		if (!_target) {
			return;
		}

		_unhighlightAElement(_target);
	};

	const _highlightAElement = (element: Element) => {
		if (!element.classList.contains(`${_plugin.prefix}-comment`)) {
			return;
		}
		if (element.classList.contains(`${_plugin.prefix}-on`)) {
			return;
		}
		element.classList.toggle(`${_plugin.prefix}-on`, true);
		element.addEventListener('click', _clickEvent);
	};

	const _unhighlightAElement = (element: Element) => {
		if (!element.classList.contains(`${_plugin.prefix}-comment`)) {
			return;
		}
		if (!element.classList.contains(`${_plugin.prefix}-on`)) {
			return;
		}
		element.classList.toggle(`${_plugin.prefix}-on`, false);
		element.removeEventListener('click', _clickEvent);
	};

	const _highlightAll = () => {
		const CommentList = core.DOM.CommentList;
		if (!CommentList) {
			return;
		}

		CommentList.querySelectorAll(`.${_plugin.prefix}-comment`).forEach(
			(element) => _highlightAElement(element)
		);
	};

	const _unhighlightAll = () => {
		const CommentList = core.DOM.CommentList;
		if (!CommentList) {
			return;
		}

		CommentList.querySelectorAll(
			`.${_plugin.prefix}-comment.${_plugin.prefix}-on`
		).forEach((element) => _unhighlightAElement(element));
	};

	const _highlightAllAfterMyLastComment = () => {
		const { userInfo } = core.getState();
		const CommentList = core.DOM.CommentList;
		if (!userInfo || !CommentList) {
			return;
		}

		for (let i = CommentList.children.length - 1; i >= 0; i--) {
			const element = CommentList.children[i];
			_highlightAElement(element);

			if (element.getAttribute('data-userid') === userInfo.id) {
				break;
			}
		}
	};

	const _unhighlightAllBeforeMyLastComment = () => {
		const { userInfo } = core.getState();
		const CommentList = core.DOM.CommentList;
		if (!userInfo || !CommentList) {
			return;
		}

		let myLastCommentFound = false;
		for (let i = CommentList.children.length - 1; i >= 0; i--) {
			const element = CommentList.children[i];
			if (!myLastCommentFound) {
				if (element.getAttribute('data-userid') === userInfo.id) {
					myLastCommentFound = true;
				}
				continue;
			}

			_unhighlightAElement(element);
		}
	};

	const ConfigFormActions = core.DOM.ConfigFormActions;

	const _buttonHighlightAll = document.createElement('a');
	_buttonHighlightAll.setAttribute('href', '#');
	_buttonHighlightAll.classList.add(`${_plugin.prefix}-action`);
	_buttonHighlightAll.innerHTML = '高亮所有提及我的留言';
	_buttonHighlightAll.addEventListener('click', (e) => {
		e.preventDefault();
		_highlightAll();
	});

	const _buttonUnhighlightAll = document.createElement('a');
	_buttonUnhighlightAll.setAttribute('href', '#');
	_buttonUnhighlightAll.classList.add(`${_plugin.prefix}-action`);
	_buttonUnhighlightAll.innerHTML = '取消高亮';
	_buttonUnhighlightAll.addEventListener('click', (e) => {
		e.preventDefault();
		_unhighlightAll();
	});

	const _buttonHighlightAllAfterMyLastComment = document.createElement('a');
	_buttonHighlightAllAfterMyLastComment.setAttribute('href', '#');
	_buttonHighlightAllAfterMyLastComment.classList.add(
		`${_plugin.prefix}-action`
	);
	_buttonHighlightAllAfterMyLastComment.innerHTML = '高亮未讀';
	_buttonHighlightAllAfterMyLastComment.addEventListener('click', (e) => {
		e.preventDefault();
		_highlightAllAfterMyLastComment();
	});

	const _buttonUnhighlightAllBeforeMyLastComment = document.createElement('a');
	_buttonUnhighlightAllBeforeMyLastComment.setAttribute('href', '#');
	_buttonUnhighlightAllBeforeMyLastComment.classList.add(
		`${_plugin.prefix}-action`
	);
	_buttonUnhighlightAllBeforeMyLastComment.innerHTML = '取消高亮已讀';
	_buttonUnhighlightAllBeforeMyLastComment.addEventListener('click', (e) => {
		e.preventDefault();
		_unhighlightAllBeforeMyLastComment();
	});

	ConfigFormActions.append(
		_buttonHighlightAll,
		_buttonUnhighlightAll,
		_buttonHighlightAllAfterMyLastComment,
		_buttonUnhighlightAllBeforeMyLastComment
	);

	_plugin.onMutateState = ({ latestComments, isInit }) => {
		if (latestComments) {
			const { userInfo } = core.getState();

			if (userInfo) {
				latestComments.forEach((comment) => {
					const { element } = comment;
					if (!element) {
						return;
					}

					const allMeAnchors = element.querySelectorAll(
						`.reply-content__cont a[href^="https://home.gamer.com.tw/${userInfo.id}"]`
					);

					if (allMeAnchors.length > 0) {
						allMeAnchors.forEach((_anchorElement) => {
							_anchorElement.classList.add(`${_plugin.prefix}-name`);
						});

						element.classList.add(`${_plugin.prefix}-comment`);

						_highlightAElement(element);
					}
				});
			}
		}
	};

	_plugin.onMutateConfig = (newValue) => {
		['isEnabled', 'onlyShowHighlighted'].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.CommentListOuter;
				if (dom) {
					dom.classList.toggle(
						`${_plugin.prefix}-${key}`,
						newValue[`${_plugin.prefix}-${key}`] as boolean
					);
				}
			}
		});
	};

	return _plugin;
};

export default BHGV2_HighlightMe;
