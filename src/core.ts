import {
	TCore,
	TCoreConfig,
	TCoreConstructor,
	TCoreState,
	TLibrary,
	TPlugin,
	TPluginConfig,
	TPluginConstructor,
} from './types'

import BHGV2_AutoRefresh from './plugins/bhgv2-auto-refresh'

import pageStyleString from './css/global.css'
import postStyle_post_detail from './css/postDetail.css'

declare var guild: { gsn: number }
declare var guildPost: any
declare var jQuery: any
declare var $: any

/** 等待DOM準備完成 */

const BHGV2Core: TCoreConstructor = ({ plugins, library }) => {
	const LOG = (message: string, type: 'log' | 'warn' | 'error' = 'log') => {
		;(console[type] || console.log)(`[巴哈插件2.0] ${message}`)
	}

	const _plugins: TPlugin[] = []
	const _library: Record<string, TLibrary> = {
		...library,
	}
	const _config: TCoreConfig = {}
	const _state: TCoreState = {}

	const CORE_STATE_KEY = {
		COMMENTS: 'comments',
		GSN: 'gsn',
		SN: 'sn',
		POST_API_URL: 'postApiUrl',
		COMMENTS_API_URL: 'commentsApiUrl',
		USER_INFO: 'userInfo',
	}

	const CORE: TCore = {
		getConfig: () => _config,
		getConfigByNames: (...names) => {
			return names.reduce<TCoreConfig>((prev, key) => {
				if (_config[key] !== undefined) {
					prev[key] = _config[key]
				}
				return prev
			}, {})
		},
		mutateConfig: (newValue) => {
			_plugins.forEach((plugin) => plugin.onMutateConfig?.(newValue))
			Object.entries(newValue).forEach(([key, value]) => {
				_config[key] = value
			})
		},

		getState: () => _state,
		getStateByNames: (...names) => {
			return names.reduce<TCoreState>((prev, key) => {
				if (_state[key] !== undefined) {
					prev[key] = _state[key]
				}
				return prev
			}, {})
		},
		mutateState: (newValue) => {
			_plugins.forEach((plugin) => plugin.onMutateState?.(newValue))
			Object.entries(newValue).forEach(([key, value]) => {
				_state[key] = value
			})
		},

		useLibrary: (name, defaultLibraryIfNotFound) => {
			if (_library[name]) return _library[name]

			_library[name] = defaultLibraryIfNotFound
			return _library[name]
		},
		emit: (eventName, payload) => {
			_plugins.forEach((plugin) => plugin.onEvent?.(eventName, payload))
		},
		log: LOG,
		DOM: {},
		STATE_KEY: CORE_STATE_KEY,
	}

	const _CorePlugin: TPluginConstructor = (core) => {
		const _plugin: TPlugin = {
			pluginName: 'BHGV2Core',
			prefix: 'BHGV2Core',
		}

		_plugin.onMutateState = (newValue) => {
			if (
				newValue[core.STATE_KEY.GSN] !== undefined ||
				newValue[core.STATE_KEY.SN] !== undefined
			) {
				const oldValue = core.getStateByNames(
					core.STATE_KEY.GSN,
					core.STATE_KEY.SN
				)
				const gsn = newValue[core.STATE_KEY.GSN] || oldValue[core.STATE_KEY.GSN]
				const sn = newValue[core.STATE_KEY.SN] || oldValue[core.STATE_KEY.SN]

				if (gsn && sn) {
					newValue[
						core.STATE_KEY.POST_API_URL
					] = `https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`
					newValue[
						core.STATE_KEY.COMMENTS_API_URL
					] = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`
				}
			}

			return newValue
		}

		_plugin.css = [pageStyleString]
		if (location && location.href.includes('post_detail.php')) {
			_plugin.css.push(postStyle_post_detail)
		}

		return _plugin
	}

	// ====================================================================================================
	// 主程序
	// ====================================================================================================

	// 初始化 DOM 元件
	const _dom = CORE.DOM

	_dom.Head = document.getElementsByTagName('head')[0]

	_dom.HeadStyle = document.createElement('style')
	_dom.Head.appendChild(_dom.HeadStyle)

	if (_dom.Head) {
		_dom.HeadStyle = document.createElement('style')
		_dom.HeadStyle.innerHTML = pageStyleString
		if (location && location.href.includes('post_detail.php')) {
			_dom.HeadStyle.innerHTML += postStyle_post_detail
		}
		_dom.Head.appendChild(_dom.HeadStyle)
	}

	_dom.CommentList = document.getElementsByClassName(
		'webview_commendlist'
	)[0] as HTMLElement
	_dom.CommentList.classList.add('bhgv2-comment-list')

	_dom.EditorContainer = _dom.CommentList.getElementsByClassName(
		'c-reply__editor'
	)[0] as HTMLElement
	_dom.EditorContainer.classList.add('bhgv2-editor-container')

	_dom.Editor = _dom.EditorContainer.getElementsByClassName(
		'reply-input'
	)[0] as HTMLElement
	_dom.Editor.classList.add('bhgv2-editor')

	_dom.EditorTextarea = _dom.Editor.getElementsByTagName(
		'textarea'
	)[0] as HTMLElement
	_dom.EditorTextarea.classList.add('bhgv2-editor-textarea')

	_dom.EditorContainerFooter = document.createElement('div')
	_dom.EditorContainerFooter.classList.add('bhgv2-editor-container-footer')
	_dom.EditorContainer.appendChild(_dom.EditorContainerFooter)

	_dom.ConfigPanelStatus = document.createElement('div')
	_dom.ConfigPanelStatus.classList.add('bhgv2-config-status')

	_dom.ConfigPanelSwitch = document.createElement('a')
	_dom.ConfigPanelSwitch.classList.add('bhgv2-config-switch')
	_dom.ConfigPanelSwitch.innerHTML = '插件設定'
	_dom.ConfigPanelSwitch.setAttribute('href', '#')

	_dom.EditorContainerFooter.appendChild(_dom.ConfigPanelStatus)
	_dom.EditorContainerFooter.appendChild(_dom.ConfigPanelSwitch)

	_dom.ConfigPanel = document.createElement('div')
	_dom.ConfigPanel.classList.add('bhgv2-config-panel')
	_dom.EditorContainer.append(_dom.ConfigPanel)

	_dom.ConfigForm = document.createElement('form')
	_dom.ConfigForm.classList.add('bhgv2-config-form')
	_dom.ConfigPanel.append(_dom.ConfigForm)

	// 添加動作給 DOM
	_dom.ConfigPanelSwitch.addEventListener('click', (event) => {
		event.preventDefault()
		_dom.ConfigPanel.classList.toggle('active')
	})

	// 初始化每個插件
	;[_CorePlugin, ...plugins].forEach((plugin) => {
		try {
			const _plugin = plugin(CORE)

			// 初始化config
			Object.entries(_plugin.config || {}).forEach(([key, config]) => {
				_config[key] = config.defaultValue
				if (config.defaultValue === undefined) {
					LOG(
						`插件 ${_plugin.pluginName}　的設定 ${key} 的 defaultValue 為空，請設定。`
					)
				}
			})

			_plugins.push(_plugin)
		} catch (e) {
			LOG(`載入插件失敗, ${e.toString()}`, 'error')
		}
	})

	// 將所有插件的css塞進HeadStyle中
	_dom.HeadStyle.innerHTML = _plugins
		.reduce<string[]>((prev, _plugin) => [...prev, ...(_plugin.css || [])], [])
		.join('\n\n')

	// 更新設定版面
	_dom.ConfigForm.innerHTML = ''
	_plugins.forEach(({ config, configLayout }) => {
		if (!config) {
			return
		}
		const _configLayout = configLayout || [Object.keys(config)]

		for (const row of _configLayout) {
			const rowElement = document.createElement('div')
			rowElement.classList.add('bhgv2-config-form-row')

			for (const col of row) {
				const configItem = config[col]
				if (!configItem) {
					return
				}

				const colElement = document.createElement('div')
				colElement.classList.add('bhgv2-config-form-col')

				const prefixLabel = document.createElement('span')
				prefixLabel.innerHTML = configItem.prefixLabel || ''

				let inputElement: HTMLElement = document.createElement('div')
				switch (configItem.type) {
					case 'number':
					case 'text':
						inputElement = document.createElement('input')
						inputElement.setAttribute('type', configItem.type)
						inputElement.setAttribute('data-field', configItem.key)
						inputElement.setAttribute('data-type', configItem.type)
						break

					case 'boolean':
						inputElement = document.createElement('label')
						inputElement.classList.add('switch')

						const _checkbox = document.createElement('input')
						_checkbox.setAttribute('type', 'checkbox')
						_checkbox.setAttribute('data-field', configItem.key)
						_checkbox.setAttribute('data-type', configItem.type)

						const _slider = document.createElement('span')
						_slider.classList.add('slider')

						inputElement.append(_checkbox, _slider)
						break
				}

				const suffixLabel = document.createElement('span')
				suffixLabel.innerHTML = configItem.suffixLabel || ''

				colElement.append(prefixLabel, inputElement, suffixLabel)

				rowElement.append(colElement)
			}

			_dom.ConfigForm.append(rowElement)
		}
	})

	// 初始化 state (gsn, sn, comments, userInfo)
	_state[CORE.STATE_KEY.GSN] = guild.gsn
	if (location && location.href.includes('post_detail.php')) {
		const re =
			/https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm
		var url = document.URL
		var urlMatch = re.exec(url)

		_state[CORE.STATE_KEY.SN] = urlMatch?.[2]
	}
	_state[CORE.STATE_KEY.COMMENTS] = []
	_state[CORE.STATE_KEY.USER_INFO] = guildPost.loginUser

	// 觸發一次所有插件的 onMutateConfig
	CORE.mutateConfig(_config)

	// 觸發一次所有插件的 onMutateState
	CORE.mutateState(_state)

	// // 初始化設定介面
	// const _configPanelHTML = (config) => `
	// 	<div class="bhgv2-config-panel">
	// 		${Object.values(config)}
	// 	</div>
	// `

	//　初始化設定面板

	// const storedConfig = loadConfigFromLocalStorage()
	// setConfig(storedConfig)
	// fillFormConfig(storedConfig)
	// runConfigApply()
}

const _waitForElm = (selector: string) => {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector))
		}

		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector))
				observer.disconnect()
			}
		})

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		})
	})
}

;(function () {
	let hasTakenOver = false
	_waitForElm('.webview_commendlist .c-reply__editor').then(() => {
		if (!hasTakenOver) {
			BHGV2Core({
				plugins: [BHGV2_AutoRefresh],
				library: {
					jQuery,
					$,
				},
			})
			hasTakenOver = true
		}
	})
})()
