import { TCore, TPlugin, TPluginConfiguration } from './types'
import { TPluginContent } from './types/plugin.type'

declare var jQuery
declare var $

/**
 * Plugins - 選擇要啟動插件
 */

const DEFAULT_PLUGINS: TPlugin[] = []
const DEFAULT_LIBRARY = {
	jQuery: jQuery,
	$: $,
}

const LOG_WARN = (message: string) => console.warn(`[巴哈插件2.0] ${message}`)

const _plugins: TPluginContent[] = []
const _library = {
	...DEFAULT_LIBRARY,
}
const _configuration: Record<
	string,
	TPluginConfiguration & { value: boolean | number }
> = {}

const CORE: TCore = {
	useLibrary: (name, defaultLibraryIfNotFound) => {
		if (_library[name]) return _library[name]

		_library[name] = defaultLibraryIfNotFound
		return _library[name]
	},

	emit: (eventName, payload) => {
		_plugins.forEach((plugin) => plugin.on?.(eventName, payload))
	},

	getConfig: (name) => {
		return _configuration[name]?.value
	},

	setConfig: (name, value) => {
		if (!_configuration[name]) {
			LOG_WARN(`欲更新的設定 '${name}' 並不存在。`)
			return
		}
		_configuration[name].value = value
	},
}

const Core = () => {
	// 註冊每個插件
	DEFAULT_PLUGINS.forEach((plugin) => {
		const initializedPlugin = plugin(CORE)

		initializedPlugin.configurations.forEach((config) => {
			_configuration[config.key] = {
				...config,
				value: config.defaultValue,
			}
		})

		_plugins.push(initializedPlugin)
	})
}

export default Core
