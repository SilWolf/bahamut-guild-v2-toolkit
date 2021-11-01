/*******************************************************************************************
 *
 *  BHGV2_Dense - 密集介面
 *  縮小字體、減少間距，增加同時看到的留言數
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_Dense: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_Dense',
		prefix: 'BHGV2_Dense',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}-tradUI`,
			suffixLabel: '仿舊版的介面',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-sizeSmaller`,
			suffixLabel: '縮小字體',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-hideFooter`,
			suffixLabel: '隱藏留言底的GP/BP按鈕及回覆按鈕',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-narrowerGutter`,
			suffixLabel: '更窄的間距',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-smallerImage`,
			suffixLabel: '圖片縮小',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-squareAvatar`,
			suffixLabel: '方型的頭像',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-perfectLayout`,
			suffixLabel: '飛鳥的完美排版',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
		{
			key: `${_plugin.prefix}-hidePreview`,
			suffixLabel: '隱藏串首的連結預覽',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
	]

	_plugin.configLayout = [
		[
			`${_plugin.prefix}-tradUI`,
			`${_plugin.prefix}-sizeSmaller`,
			`${_plugin.prefix}-narrowerGutter`,
		],
		[`${_plugin.prefix}-hideFooter`],
		[`${_plugin.prefix}-smallerImage`, `${_plugin.prefix}-squareAvatar`],
		[`${_plugin.prefix}-perfectLayout`],
		[`${_plugin.prefix}-hidePreview`],
	]

	_plugin.css = [
		`
			.webview_commendlist {
				margin-left: 0;
				margin-right: 0;
			}

			.bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-left: 20px;
				padding-right: 20px;
			}

			.bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				margin-left: 0;
				margin-right: 0;
			}

			.reply-content__user.reply-content__user.reply-content__user {
				color: #0055aa;
			}

			.bhgv2-dark .reply-content__user.reply-content__user.reply-content__user {
				color: #f5f5f5;
			}

			.reply-content__user.reply-content__user.reply-content__user:hover {
				text-decoration: underline;
			}
			
			.${_plugin.prefix}-sizeSmaller .reply-content__user.reply-content__user.reply-content__user,
			.${_plugin.prefix}-sizeSmaller .reply-content__cont.reply-content__cont.reply-content__cont {
				font-size: 12px;
				line-height: 1;
				margin-top: 0;
			}
			
			.${_plugin.prefix}-sizeSmaller .c-reply__editor .reply-input .content-edit {
				font-size: 12px;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer.reply-content__footer {
				display: none;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer__edit.reply-content__footer__edit.reply-content__footer__edit {
				display: flex;
			}

			.${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: #e9f5f4;
				border-bottom: 1px solid #999999;
			}
			
			.bhgv2-dark .${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: transparent;
				border-bottom: 1px solid #999999;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-top: 5px;
				padding-left: 10px;
				padding-right: 10px;
				padding-bottom: 0;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				padding-left: 10px;
				padding-right: 10px;
				padding-bottom: 0;
			}

			.${_plugin.prefix}-narrowerGutter .c-reply__item .reply-content__cont.reply-content__cont.reply-content__cont {
				margin-top: 0;
			}

			.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				margin-left: 14px;
				line-height: 14px;
				display: none;
			}

			.${_plugin.prefix}-hideFooter .${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				display: inline-block;
			}

			.${_plugin.prefix}-smallerImage .reply-content__cont.reply-content__cont.reply-content__cont img {
				margin-bottom: 4px;
				max-width: 100px;
				max-height: 150px;
				width: auto;
				border-radius: 8px;
				vertical-align: middle;
				transition: max-width 0.3s, max-height 0.3s;
			}

			.${_plugin.prefix}-smallerImage .reply-content__cont.reply-content__cont.reply-content__cont img:hover {
				max-width: calc(100% - 20px);
				max-height: 500px;
			}

			.${_plugin.prefix}-smallerImage .reply-content__cont.reply-content__cont.reply-content__cont img {
				margin-bottom: 4px;
				max-width: 100px;
				max-height: 150px;
				width: auto;
				border-radius: 8px;
				vertical-align: middle;
				transition: max-width 0.3s, max-height 0.3s;
			}

			.${_plugin.prefix}-squareAvatar .reply-avatar-img.reply-avatar-img.reply-avatar-img,
			.${_plugin.prefix}-squareAvatar .reply-avatar-img.reply-avatar-img.reply-avatar-img img {
				border-radius: 0;
			}

			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed {
				width: auto;
				max-width: none;
				min-width: 615px;
			}

			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 615px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed {
				min-width: 515px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 515px;
			}

			.${_plugin.prefix}-hidePreview .main-container_wall-post_body .linkbox {
				display: none;
			}
		`,
	]

	_plugin.onMutateState = ({ latestComments }) => {
		if (latestComments) {
			latestComments.forEach((comment) => {
				const { element } = comment
				if (!element) {
					return
				}

				const _tagButton = element.querySelector('button.reply-content__tag')
				const _contentUser = element.querySelector('a.reply-content__user')
				if (!_tagButton || !_contentUser) {
					return
				}

				const _clonedTagButton = _tagButton.cloneNode(false) as HTMLElement
				_clonedTagButton.classList.add(`${_plugin.prefix}-clonedTagButton`)
				_clonedTagButton.innerText = '@'
				_clonedTagButton.setAttribute('title', '回覆他')
				_contentUser.insertAdjacentElement('afterend', _clonedTagButton)
			})
		}
	}

	_plugin.onMutateConfig = (newValue) => {
		;[
			'tradUI',
			'hideFooter',
			'narrowerGutter',
			'smallerImage',
			'squareAvatar',
		].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.CommentListOuter
				if (dom) {
					dom.classList.toggle(
						`${_plugin.prefix}-${key}`,
						newValue[`${_plugin.prefix}-${key}`] as boolean
					)
				}
			}
		})
		;['sizeSmaller', 'perfectLayout', 'hidePreview'].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.Body
				if (dom) {
					dom.classList.toggle(
						`${_plugin.prefix}-${key}`,
						newValue[`${_plugin.prefix}-${key}`] as boolean
					)
				}
			}
		})
	}

	return _plugin
}

export default BHGV2_Dense
