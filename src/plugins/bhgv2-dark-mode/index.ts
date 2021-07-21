/*******************************************************************************************
 *
 *  BHGV2_DarkMode - 黑闇模式
 *  當啟動巴哈的黑闇模式時，使插件介面也跟著黑闇起來
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_DarkMode: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_DarkMode',
		prefix: 'BHGV2_DarkMode',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}:isEnable`,
			suffixLabel: '巴哈開啟黑闇模式時切換介面顏色',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: true,
		},
	]

	_plugin.css = [
		`
			.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark {
				background-color: rgba(0, 0, 0, 0.9) !important;
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5) !important;
			}

			.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark .bhgv2-config-panel {
				background: #222222;
			}

			.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark .bhgv2-config-panel input {
				color: #c7c6cb;
			}
		`,
	]

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
			const dom = core.DOM.EditorContainer
			if (dom) {
				dom.classList.toggle(
					'bhgv2-dark-mode-enabled',
					newValue[`${_plugin.prefix}:isEnable`] as boolean
				)
			}
		}
	}

	const _getCookie = (name: string) => {
		const value = '; ' + document.cookie
		const parts = value.split('; ' + name + '=')

		if (parts.length == 2) {
			return parts.pop()?.split(';').shift()
		}
	}

	const darkModeObserver = new MutationObserver(function (mutations) {
		mutations.forEach(() => {
			//檢查c-reply__editor是否存在，避免不必要的error觸發
			const editorContainer = core.DOM.EditorContainer
			if (!editorContainer) {
				return
			}
			editorContainer.classList.toggle(
				'dark',
				_getCookie('ckForumDarkTheme') == 'yes'
			)
		})
	})

	var target = core.DOM.Head
	darkModeObserver.observe(target, {
		attributes: true,
		childList: true,
		subtree: true,
	})

	return _plugin
}

export default BHGV2_DarkMode
