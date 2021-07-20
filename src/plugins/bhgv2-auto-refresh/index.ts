/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

import type { TCore, TPlugin } from '../../types'

const PLUGIN_PREFIX = 'auto-refresh'
const CONFIG_KEY_AUTO_REFRESH = `${PLUGIN_PREFIX}-auto-refresh`

const BHGV2_AutoRefresh: TPlugin = () => ({
	prefix: PLUGIN_PREFIX,
	configurations: [
		{
			label: '自動更新',
			key: CONFIG_KEY_AUTO_REFRESH,
			type: 'boolean',
			defaultValue: false,
		},
	],
})

export default BHGV2_AutoRefresh
