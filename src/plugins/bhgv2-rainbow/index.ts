/*******************************************************************************************
 *
 *  BHGV2_Rainbow - 彩虹留言
 *  給自己以外的玩家留言填上顏色
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_Rainbow: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_Rainbow',
		prefix: 'BHGV2_Rainbow',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}:isEnable`,
			suffixLabel: '改變留言的底色',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
	]

	const _colors = [
		'#bacff5',
		'#f5badb',
		'#f5f2ba',
		'#c6f5ba',
		'#f5e3ba',
		'#bcbaf5',
		'#d8baf5',
		'#8accdb',
		'#db8ab3',
		'#dbd48a',
		'#8bdb8a',
	]

	_plugin.css = _colors.map(
		(color, index) =>
			`
			.bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color};
			}
		`
	)

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
			const dom = core.DOM.CommentList
			if (dom) {
				dom.classList.toggle(
					'bhgv2-color-comment-enabled',
					newValue[`${_plugin.prefix}:isEnable`] as boolean
				)
			}
		}
	}

	const _cachedUserId: Record<string, number> = {}

	_plugin.onMutateState = (newValue) => {
		if (newValue.latestComments !== undefined) {
			// 高亮其他人的訊息
			const { userInfo } = core.getState()
			const myId = userInfo?.id

			newValue.latestComments.forEach((comment) => {
				const commentElement = comment.element
				if (!commentElement) {
					return
				}

				const commentUserId = commentElement?.getAttribute('data-userid')
				if (!commentUserId) {
					return
				}

				if (commentUserId === myId) {
					return
				}

				let colorIndex = _cachedUserId[commentUserId]
				if (colorIndex === undefined) {
					colorIndex = Object.keys(_cachedUserId).length % _colors.length
					_cachedUserId[commentUserId] = colorIndex
				}

				commentElement.classList.add(`bhgv2-color-comment-${colorIndex}`)
			})
		}
	}

	return _plugin
}

export default BHGV2_Rainbow
