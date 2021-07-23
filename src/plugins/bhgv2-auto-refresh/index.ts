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
			key: `${_plugin.prefix}:notification`,
			suffixLabel: '自動更新時發送桌面通知',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
		{
			key: `${_plugin.prefix}:notificationSound`,
			suffixLabel: '提示音',
			dataType: 'boolean',
			inputType: 'checkbox',
			defaultValue: true,
		},
	]

	_plugin.configLayout = [
		[`${_plugin.prefix}:isEnable`, `${_plugin.prefix}:interval`],
		[`${_plugin.prefix}:notification`, `${_plugin.prefix}:notificationSound`],
	]

	const _statusDom = document.createElement('span')
	core.DOM.ConfigPanelStatus?.append(_statusDom)

	let _refreshIntervalObj: NodeJS.Timer | undefined = undefined

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
			const isEnabled = newValue[`${_plugin.prefix}:isEnable`]

			if (isEnabled === false) {
				if (_refreshIntervalObj) {
					clearTimeout(_refreshIntervalObj)
					_refreshIntervalObj = undefined
				}

				_statusDom.style.display = 'none'
			} else if (isEnabled === true) {
				if (_refreshIntervalObj) {
					clearTimeout(_refreshIntervalObj)
					_refreshIntervalObj = undefined
				}

				_statusDom.style.display = 'inline-block'

				const _config = core.getConfig()

				let _interval = parseInt(
					(newValue[`${_plugin.prefix}:interval`] as string) ||
						(_config[`${_plugin.prefix}:interval`] as string)
				)

				if (!_interval || _interval <= 0) {
					_interval = 30
				}

				const _intervalMs = _interval * 1000

				const timeoutFn = async () => {
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

					core.mutateState({ latestComments })

					_refreshIntervalObj = setTimeout(timeoutFn, _intervalMs)
				}

				_refreshIntervalObj = setTimeout(timeoutFn, _intervalMs)

				const _notification =
					newValue[`${_plugin.prefix}:notification`] !== undefined
						? newValue[`${_plugin.prefix}:notification`]
						: _config[`${_plugin.prefix}:notification`]
				const _notificationSound =
					newValue[`${_plugin.prefix}:notificationSound`] !== undefined
						? newValue[`${_plugin.prefix}:notificationSound`]
						: _config[`${_plugin.prefix}:notificationSound`]

				_statusDom.innerHTML = `自動更新中(${[
					`${_interval}s`,
					_notification ? '通知' : undefined,
					_notification && _notificationSound ? '聲音' : undefined,
				]
					.filter((item) => !!item)
					.join(',')})`
			}
		}
	}

	_plugin.onMutateState = (newValue) => {
		if (newValue.isInit || newValue.isUserAction) {
			return
		}

		if (newValue.latestComments !== undefined) {
			const config = core.getConfig()

			if (config[`${_plugin.prefix}:notification`]) {
				// 發送桌面通知
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
