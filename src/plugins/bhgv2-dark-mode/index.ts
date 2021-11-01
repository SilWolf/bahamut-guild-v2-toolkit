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

	const _getCookie = (name: string) => {
		const value = '; ' + document.cookie
		const parts = value.split('; ' + name + '=')

		if (parts.length == 2) {
			return parts.pop()?.split(';').shift()
		}
	}

	const darkModeObserver = new MutationObserver(function (mutations) {
		mutations.forEach(() => {
			const body = core.DOM.Body
			if (!body) {
				return
			}
			body.classList.toggle(
				'bhgv2-dark',
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
