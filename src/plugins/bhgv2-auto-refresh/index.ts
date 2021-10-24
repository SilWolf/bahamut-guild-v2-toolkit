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
					console.log('commentsCount', currentCommentsCount)
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
					const lastCommentCTime =
						latestComments?.[latestComments.length - 1]?.payload?.ctime

					const _config = core.getConfig()
					let _interval =
						parseInt(
							(newValue[`${_plugin.prefix}:interval`] as string) ||
								(_config[`${_plugin.prefix}:interval`] as string)
						) || 30
					let isSlowMode = false

					if (_config[`${_plugin.prefix}:autoSlowDown`] && lastCommentCTime) {
						const commentCTime = new Date(lastCommentCTime).getTime()
						const nowTime = Date.now()

						if (nowTime - commentCTime > 12 * 60 * 60 * 1000) {
							// over 12 hours
							_interval = 3600
							isSlowMode = true
						} else if (nowTime - commentCTime > 15 * 60 * 1000) {
							// over 15 minutes
							_interval = 300
							isSlowMode = true
						}
					}

					const _intervalMs = _interval * 1000

					_statusDom.innerHTML = `${
						_config[`${_plugin.prefix}:autoSlowDown`] && isSlowMode
							? '慢速更新'
							: '自動更新中'
					}(${[
						`${_interval}s`,
						_notification ? '通知' : undefined,
						_notification && _notificationSound ? '聲音' : undefined,
					]
						.filter((item) => !!item)
						.join(',')})`

					_refreshIntervalObj = setTimeout(timeoutFn, _intervalMs)

					core.mutateState({
						latestComments,
						lastCommentCTime,
					})
				}

				_refreshIntervalObj = setTimeout(timeoutFn, 2000)

				const _config = core.getConfig()
				const _notification =
					newValue[`${_plugin.prefix}:notification`] !== undefined
						? newValue[`${_plugin.prefix}:notification`]
						: _config[`${_plugin.prefix}:notification`]
				const _notificationSound =
					newValue[`${_plugin.prefix}:notificationSound`] !== undefined
						? newValue[`${_plugin.prefix}:notificationSound`]
						: _config[`${_plugin.prefix}:notificationSound`]

				_statusDom.innerHTML = `自動更新中(計算中...${[
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

		const config = core.getConfig()

		if (config[`${_plugin.prefix}:notification`] && newValue.latestComments) {
			const _comment = newValue.latestComments[0]
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
