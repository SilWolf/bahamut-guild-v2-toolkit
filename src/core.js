/** 等待DOM準備完成 */
const _waitForElm = (selector) => {
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

const BHGV2Core = ({ plugins, library }) => {
	const LOG = (message, type = 'log') => {
		;(console[type] || console.log)(`[巴哈插件2.0] ${message}`)
	},

	const _plugins = []
	const _library = {
		...library,
	}
	const _config = {}
	const _state = {}
	const _configPanelElements = []

	const CORE_STATE_KEY = {
		COMMENTS: 'comments',
		GSN: 'gsn',
		SN: 'sn',
		POST_API_URL: 'postApiUrl',
		COMMENTS_API_URL: 'commentsApiUrl'
	}

	const CORE = {
		getConfig: () => _config,
		getConfigByNames: (...names) => {
			names.reduces((prev, key) => {
				if (_config[key] !== undefined) {
					prev[key] = _config[key]
				}
				return prev
			}, {})
		},
		mutateConfig: (newValue) => {
			_plugins.forEach((plugin) => plugin.onMutateConfig?.(newValue))
			_config = {
				..._config,
				...newValue
			}
		},

		getState: () => _state,
		getStateByNames: (...names) => {
			names.reduces((prev, key) => {
				if (_state[key] !== undefined) {
					prev[key] = _state[key]
				}
				return prev
			}, {})
		},
		mutateState: (newValue) => {
			_plugins.forEach((plugin) => plugin.onMutateState?.(newValue))
			_state = {
				..._state,
				...newValue
			}
		},

		useLibrary: (name, defaultLibraryIfNotFound) => {
			if (_library[name]) return _library[name]

			_library[name] = defaultLibraryIfNotFound
			return _library[name]
		},
		emit: (eventName, payload) => {
			_plugins.forEach((plugin) => plugin.on?.(eventName, payload))
		},
		log: LOG,
		STATE_KEY: CORE_STATE_KEY
	}

	const _CorePlugin = (core) => {
		const _plugin = {
			pluginName = 'BHGV2Core',
			prefix: 'BHGV2Core'
		}

		_plugin.onMutateState = (newValue) => {
			if (newValue[core.STATE_KEY.GSN] !== undefined || newValue[core.STATE_KEY.SN] !== undefined) {
				const gsn = newValue[core.STATE_KEY.GSN] || core.getState[core.STATE_KEY.GSN]
				const sn = newValue[core.STATE_KEY.SN] || core.getState[core.STATE_KEY.SN]

				if (gsn && sn) {
					newValue[core.STATE_KEY.POST_API_URL] = `https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`
					newValue[core.STATE_KEY.COMMENTS_API_URL] = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`
				}
			}

			return newValue
		}
	
		return _plugin
	}	

	// 初始化每個插件
	[_CorePlugin, ...plugins].forEach((plugin) => {
		try {
			const _plugin = plugin(CORE)

			// 初始化config
			Object.entries(_plugin.config || {}).forEach((key, config) => {
				_configPanelElements.push({
					key,
					...config
				})
				_config[key] = config.defaultValue
				if (config.defaultValue === undefined) {
					LOG(`插件 ${_plugin.pluginName}　的設定 ${key} 的 defaultValue 為空，請設定。`)
				}
			})
	
			_plugins.push(plugin)
		} catch (e) {
			LOG(`載入插件 ${plugin.pluginName} 失敗`, 'error')
		}
	})
		
	// 初始化 state (gsn, sn, comments)
	_state[CORE.STATE_KEY.GSN] = guild.gsn
	if (location && location.href.includes('post_detail.php')) {
		const re =
				/https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm
			var url = document.URL
			var urlMatch = re.exec(url)

			_state[CORE.STATE_KEY.SN] = urlMatch[2]
	}
	_state[CORE.STATE_KEY.COMMENTS] = []

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

	let hasTakenOver = false
	_waitForElm('.webview_commendlist .c-reply__editor').then(() => {
		if (!hasTakenOver) {
			//初始化設定面板
			// _initConfigPanel(CORE.getAllConfig())

			// const storedConfig = loadConfigFromLocalStorage()
			// setConfig(storedConfig)
			// fillFormConfig(storedConfig)
			// runConfigApply()
			hasTakenOver = true

			console.log('has taken over :D')
		}
	})
}

;(function () {
	BHGV2Core({
		plugins: [
			BHGV2_AutoRefresh
		],
		library: {
			jQuery, $
		}
	})
})()
