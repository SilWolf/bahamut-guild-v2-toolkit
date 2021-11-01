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
			defaultValue: false,
		},
	]

	const _colors = [
		{
			light: '#bacff5',
			dark: '#2b3c5a',
		},
		{
			light: '#f5badb',
			dark: '#4c273c',
		},
		{
			light: '#f5f2ba',
			dark: '#44410b',
		},
		{
			light: '#c6f5ba',
			dark: '#103a05',
		},
		{
			light: '#f5e3ba',
			dark: '#423a28',
		},
		{
			light: '#bcbaf5',
			dark: '#272632',
		},
		{
			light: '#bacff5',
			dark: '#061530',
		},
		{
			light: '#d8baf5',
			dark: '#3c2010',
		},
		{
			light: '#8accdb',
			dark: '#073c48',
		},
		{
			light: '#db8ab3',
			dark: '#34081e',
		},
		{
			light: '#dbd48a',
			dark: '#403c0e',
		},
		{
			light: '#8bdb8a',
			dark: '#052805',
		},
	]

	_plugin.css = _colors.map(
		(color, index) =>
			`
			.bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color.light};
			}

			.bhgv2-dark .bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color.dark};
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
