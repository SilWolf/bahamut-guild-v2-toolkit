/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

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
			defaultValue: false,
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

	return _plugin
}

export default BHGV2_AutoRefresh
