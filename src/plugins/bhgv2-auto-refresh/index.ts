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
			label: '自動更新',
			type: 'boolean',
			defaultValue: false,
		},
	}

	return _plugin
}

export default BHGV2_AutoRefresh
