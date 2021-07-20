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

	_plugin.config = {
		[`${_plugin.prefix}:isEnable`]: {
			key: `${_plugin.prefix}:isEnable`,
			suffixLabel: '自動更新',
			type: 'boolean',
			defaultValue: false,
		},
		[`${_plugin.prefix}:interval`]: {
			key: `${_plugin.prefix}:interval`,
			suffixLabel: '秒',
			type: 'number',
			defaultValue: false,
		},
	}
	_plugin.configLayout = [
		[`${_plugin.prefix}:isEnable`, `${_plugin.prefix}:interval`],
	]

	return _plugin
}

export default BHGV2_AutoRefresh
