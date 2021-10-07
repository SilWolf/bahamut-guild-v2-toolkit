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
			key: `${_plugin.prefix}:autoSlowDown`,
			suffixLabel:
				'如果串最後更新時間超過15分鐘，自動進入低頻率更新模式(建議開啟)',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
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
		[`${_plugin.prefix}:autoSlowDown`],
		[`${_plugin.prefix}:notification`, `${_plugin.prefix}:notificationSound`],
	]

	const _statusDom = document.createElement('span')
	core.DOM.ConfigPanelStatus?.append(_statusDom)

	const notifyAudio = new Audio(
		'https://github.com/SilWolf/bahamut-guild-v2-toolkit/blob/main/src/plugins/bhgv2-auto-refresh/notify_2.mp3?raw=true'
	)

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

				let _interval = 30

				if (_config[`${_plugin.prefix}:slowMode`] === 2) {
					_interval = 60 * 60
				} else if (_config[`${_plugin.prefix}:slowMode`] === 1) {
					_interval = 5 * 60
				} else {
					_interval = parseInt(
						(newValue[`${_plugin.prefix}:interval`] as string) ||
							(_config[`${_plugin.prefix}:interval`] as string)
					)
				}

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
							position: _comment.position,
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
								position: _comment.position,
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

		if (!newValue.latestComments) {
			return
		}

		const _comment = newValue.latestComments[0]

		// Check if enter Slow-down mode
		if (_comment.payload?.ctime) {
			const commentCTime = new Date(_comment.payload?.ctime).getTime()
			const nowTime = Date.now()

			if (nowTime - commentCTime > 12 * 60 * 60 * 1000) {
				// over 12 hours
				core.mutateConfig({
					[`${_plugin.prefix}:slowMode`]: 2,
				})
			} else if (nowTime - commentCTime > 15 * 60 * 1000) {
				// over 15 minutes
				core.mutateConfig({
					[`${_plugin.prefix}:slowMode`]: 1,
				})
			} else {
				core.mutateConfig({
					[`${_plugin.prefix}:slowMode`]: undefined,
				})
			}
		}

		const config = core.getConfig()
		if (config[`${_plugin.prefix}:notification`]) {
			let text = '[如果你看到這句話，代表有東西爆炸了，請聯絡月月處理……]'
			if (_comment.payload) {
				const _payload = _comment.payload
				text = `(#${_payload.position}) ${
					_payload.name
				}：${_payload.text.substr(0, 50)}`
			} else if (_comment.element) {
				const _element = _comment.element
				const _name = _element.getAttribute('data-user')
				const _position = _element.getAttribute('data-position')
				const _text =
					_comment.element.querySelector('.reply-content__cont')?.textContent ||
					''
				text = `(#${_position}) ${_name}：${_text.substr(0, 50)}`
			}

			// 發送桌面通知
			createNotification({
				title: '有新的通知',
				text: text,
				silent: !config[`${_plugin.prefix}:notificationSound`],
				timeout: 5000,
			})

			// 播放通知音
			if (config[`${_plugin.prefix}:notification`]) {
				notifyAudio.play()
			}
		}
	}

	return _plugin
}

export default BHGV2_AutoRefresh
