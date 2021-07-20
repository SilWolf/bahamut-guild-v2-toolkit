/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

const BHGV2_AutoRefresh = (core) => {
	const _plugin = {
		pluginName = 'BHGV2_AutoRefresh',
		prefix: 'BHGV2_AutoRefresh'
	}

	_plugin.config = {
		[`${_plugin.prefix}:isEnable`]: {
			label: '自動更新',
			type: 'boolean',
			defaultValue: false
		}
	}

	return _plugin
}
