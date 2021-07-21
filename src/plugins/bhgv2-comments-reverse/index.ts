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
			key: `${_plugin.prefix}:isEnable`,
			suffixLabel: '顛倒哈拉串',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
	]

	_plugin.css = [
		`
			.bhgv2-comment-list {
				display: flex;
				flex-direction: column;
			}
			.bhgv2-comment-list > div {
				display: flex;
				flex-direction: column;
			}

			.bhgv2-comment-list.bhgv2-comments-reverse-enabled {
				flex-direction: column-reverse;
			}

			.bhgv2-comment-list.bhgv2-comments-reverse-enabled > div {
				flex-direction: column-reverse;
			}
			
			.bhgv2-comment-list > div.bhgv2-editor-container {
				flex-direction: column;
			}
		`,
	]

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
			const dom = core.DOM.CommentList
			if (dom) {
				dom.classList.toggle(
					'bhgv2-comments-reverse-enabled',
					newValue[`${_plugin.prefix}:isEnable`] as boolean
				)
			}
		}
	}

	return _plugin
}

export default BHGV2_CommentsReverse
