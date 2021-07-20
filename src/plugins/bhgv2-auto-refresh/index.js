/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

const BHGV2_AutoRefresh = (core) => ({
	prefix: 'auto-refresh',
	configurations: [
		{
			label: '自動更新',
			key: 'auto-refresh:auto-refresh',
			type: 'boolean',
			defaultValue: false,
		},
	],
})
