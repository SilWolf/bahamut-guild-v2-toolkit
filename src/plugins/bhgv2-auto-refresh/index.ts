/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

import {
	TCommentsListApiResponse,
	TPlugin,
	TPluginConstructor,
} from '../../types'

const BHGV2_AutoRefresh: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_AutoRefresh',
		prefix: 'BHGV2_AutoRefresh',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}:isEnable`,
			suffixLabel: '自動更新',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}:interval`,
			suffixLabel: '秒',
			dataType: 'number',
			inputType: 'number',
			defaultValue: 30,
		},
		{
			key: `${_plugin.prefix}:desktopNotification`,
			suffixLabel: '自動更新時發送桌面通知',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
		{
			key: `${_plugin.prefix}:desktopNotificationSound`,
			suffixLabel: '提示音',
			dataType: 'boolean',
			inputType: 'checkbox',
			defaultValue: false,
		},
	]

	_plugin.configLayout = [
		[`${_plugin.prefix}:isEnable`, `${_plugin.prefix}:interval`],
		[
			`${_plugin.prefix}:desktopNotification`,
			`${_plugin.prefix}:desktopNotificationSound`,
		],
	]

	// let _refreshIntervalObj: NodeJS.Timer | undefined = undefined

	// const _fetchLatestComment = () => {
	// 	const state = core.getStateByNames(core.co)

	// 	if (state.commentListApi) {
	// 		return
	// 	}

	// 	fetch(state[core.STATE_KEY.COMMENTS_API_URL] as string, {
	// 		credentials: 'include',
	// 	})
	// 		.then((res) => res.json())
	// 		.then((res: TCommentsListApiResponse) => {
	// 			const { comments, commentCount, nextPage } = res.data
	// 			const currentCommentsCount = CommentList.childElementCount

	// 			const expectedNewCommentsCount = currentCommentsCount - commentCount
	// 			if (expectedNewCommentsCount < 0) {
	// 				const newComments = await fetchAllComments().then(
	// 					(response) => response.data.comments
	// 				)
	// 				clearComments()
	// 				appendNewComments(newComments)
	// 				return
	// 			}
	// 			const newComments =

	// 		})

	// 	const CommentList = core.DOM.CommentList
	// 	if (!CommentList) {
	// 		return
	// 	}

	// }

	// _plugin.onMutateConfig = (newValue) => {
	// 	if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
	// 		const isEnabled = newValue[`${_plugin.prefix}:isEnable`]

	// 		if (isEnabled === false) {
	// 			if (_refreshIntervalObj) {
	// 				clearInterval(_refreshIntervalObj)
	// 				_refreshIntervalObj = undefined
	// 			}
	// 		} else if (isEnabled === true) {
	// 			if (_refreshIntervalObj) {
	// 				clearInterval(_refreshIntervalObj)
	// 				_refreshIntervalObj = undefined
	// 			}

	// 			const intervalMs =
	// 				(parseInt(newValue[`${_plugin.prefix}:interval`] as string) || 30) *
	// 				1000
	// 			_refreshIntervalObj = setInterval(() => {}, intervalMs)
	// 		}
	// 	}
	// }

	return _plugin
}

export default BHGV2_AutoRefresh
