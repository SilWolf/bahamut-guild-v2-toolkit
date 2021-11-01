/*******************************************************************************************
 *
 *  BHGV2_CommentsReverse - 顛倒哈拉串
 *  顛倒哈拉串
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_CommentsReverse: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_CommentsReverse',
		prefix: 'BHGV2_CommentsReverse',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}-isEnable`,
			suffixLabel: '顛倒哈拉串',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}-editorSticky`,
			suffixLabel: '輸入框貼在上邊沿',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
	]

	_plugin.css = [
		`
			.bhgv2-comment-list-outer {
				display: flex;
				flex-direction: column;
			}
			.bhgv2-comment-list {
				display: flex;
				flex-direction: column;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-isEnable {
				flex-direction: column-reverse;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-isEnable .bhgv2-comment-list {
				flex-direction: column-reverse;
				justify-content: flex-end;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				position: sticky;
				top: 80px;
				margin-left: -20px;
				margin-right: -20px;
				padding-left: 20px;
				padding-right: 20px;
				background-color: rgba(180, 180, 180, 0.9);
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
			}

			.bhgv2-dark .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				background-color: #272728;
			}
			
			.bhgv2-comment-list > div.bhgv2-editor-container {
				flex-direction: column;
			}

			.BHGV2_MasterLayout-hideTabMenu .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				top: 35px;
			}

			@media screen and (max-width: 769px) {
				.BHGV2_MasterLayout-hideTabMenu .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
					top: 44px;
				}
			}
		`,
	]

	_plugin.onMutateConfig = (newValue) => {
		;['isEnable', 'editorSticky'].forEach((key) => {
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
	}

	return _plugin
}

export default BHGV2_CommentsReverse
