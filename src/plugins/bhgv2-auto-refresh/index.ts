/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

import { createNotification } from '../../helpers/notification.helper'
import {
	TCommentsListApiResponse,
	TCoreStateComment,
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

	let _refreshIntervalObj: NodeJS.Timer | undefined = undefined

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
			const isEnabled = newValue[`${_plugin.prefix}:isEnable`]

			if (isEnabled === false) {
				if (_refreshIntervalObj) {
					clearTimeout(_refreshIntervalObj)
					_refreshIntervalObj = undefined
				}
			} else if (isEnabled === true) {
				if (_refreshIntervalObj) {
					clearTimeout(_refreshIntervalObj)
					_refreshIntervalObj = undefined
				}

				const intervalMs =
					(parseInt(newValue[`${_plugin.prefix}:interval`] as string) || 30) *
					1000

				const timeoutFn = async () => {
					console.log('timeoutFn')
					const { commentListApi } = core.getState()
					if (!commentListApi) {
						return
					}

					const { comments, commentCount: newCommentsCount } = await fetch(
						commentListApi,
						{
							credentials: 'include',
						}
					)
						.then((res) => res.json())
						.then((res: TCommentsListApiResponse) => res.data)

					const { commentsCount: currentCommentsCount } = core.getState()
					const latestComments: TCoreStateComment[] = [
						...comments.map((_comment) => ({
							id: _comment.id,
							payload: _comment,
						})),
					]
					const expectedNewCommentsCount =
						newCommentsCount - (currentCommentsCount || 0)

					let page = 0
					while (
						latestComments.length < expectedNewCommentsCount &&
						page < 999
					) {
						page++

						const { comments: anotherComments } = await fetch(
							commentListApi + `&page=${page}`,
							{
								credentials: 'include',
							}
						)
							.then((res) => res.json())
							.then((res: TCommentsListApiResponse) => res.data)

						latestComments.push(
							...anotherComments.map((_comment) => ({
								id: _comment.id,
								payload: _comment,
							}))
						)
					}

					console.log(latestComments)

					core.mutateState({ latestComments })

					_refreshIntervalObj = setTimeout(timeoutFn, intervalMs)
				}

				_refreshIntervalObj = setTimeout(timeoutFn, intervalMs)
			}
		}
	}

	_plugin.onMutateState = (newValue) => {
		if (newValue.latestComments !== undefined) {
			const config = core.getConfigByNames(
				`${_plugin.prefix}:desktopNotification`,
				`${_plugin.prefix}:desktopNotificationSound`
			)

			if (config[`${_plugin.prefix}:desktopNotification`]) {
				// 發送桌面通知
				console.log('send notification')
				createNotification({
					title: '測試用通知',
					text: '測試用通知',
				})
			}
		}
	}

	return _plugin
}

export default BHGV2_AutoRefresh
