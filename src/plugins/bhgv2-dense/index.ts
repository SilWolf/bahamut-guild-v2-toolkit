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
			suffixLabel: '仿舊版的配色',
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
	]

	_plugin.configLayout = [
		[
			`${_plugin.prefix}-tradUI`,
			`${_plugin.prefix}-sizeSmaller`,
			`${_plugin.prefix}-narrowerGutter`,
		],
		[`${_plugin.prefix}-hideFooter`],
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
			
			.${_plugin.prefix}-sizeSmaller .reply-content__user.reply-content__user.reply-content__user,
			.${_plugin.prefix}-sizeSmaller .reply-content__cont.reply-content__cont.reply-content__cont {
				font-size: 12px;
				line-height: 1;
				margin-top: 0;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer.reply-content__footer {
				display: none;
			}

			.${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: #e9f5f4;
				border: 1px solid #daebe9;
				margin-top: 3px;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-top: 6px;
				padding-bottom: 6px;
				padding-left: 10px;
				padding-right: 10px;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				padding-left: 10px;
				padding-right: 10px;
			}

			.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				margin-left: 20px;
				display: none;
			}

			.${_plugin.prefix}-hideFooter .${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				display: inline-block;
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
		;['tradUI', 'sizeSmaller', 'hideFooter', 'narrowerGutter'].forEach(
			(key) => {
				if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
					const dom = core.DOM.CommentListOuter
					if (dom) {
						dom.classList.toggle(
							`${_plugin.prefix}-${key}`,
							newValue[`${_plugin.prefix}-${key}`] as boolean
						)
					}
				}
			}
		)
	}

	return _plugin
}

export default BHGV2_Dense
