/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/

const BHGV2_PluginTemplate = (core) => {
	const _PREFIX = 'pluginTemplate'

	return {
		prefix: _PREFIX,
		configurations: [
			// {
			// 	label: '自動更新',
			// 	key: 'auto-refresh:auto-refresh',
			// 	type: 'boolean',
			// 	defaultValue: false,
			// },
		],
		onMutateConfig: (name, value) => {
			switch (name) {
			}
			return value
		},
		onMutateState: (name, value) => {
			switch (name) {
			}
			return value
		},
	}
}
