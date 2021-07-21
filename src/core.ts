import {
	TComment,
	TCore,
	TCoreConfig,
	TCoreConstructor,
	TCoreState,
	TCoreStateComment,
	TCoreStateKey,
	TLibrary,
	TPlugin,
	TPluginConfig,
	TPluginConstructor,
} from './types'

import BHGV2_AutoRefresh from './plugins/bhgv2-auto-refresh'
import BHGV2_CommentsReverse from './plugins/bhgv2-comments-reverse'

import pageStyleString from './css/global.css'
import postStyle_post_detail from './css/postDetail.css'
import BHGV2_DarkMode from './plugins/bhgv2-dark-mode'

declare var guild: { gsn: number }
declare var guildPost: any
declare var jQuery: any
declare var $: any
declare var nunjucks: any
declare var GuildTextUtil: any

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
				_state[key as TCoreStateKey] = value
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
		commentsMap: {},
	}

	const _CorePlugin: TPluginConstructor = (core) => {
		const _plugin: TPlugin = {
			pluginName: 'BHGV2Core',
			prefix: 'BHGV2Core',
		}

		_plugin.onMutateState = (newValue) => {
			if (newValue.gsn !== undefined || newValue.sn !== undefined) {
				const oldValue = core.getStateByNames('gsn', 'sn')
				const gsn = newValue.gsn || oldValue.gsn
				const sn = newValue.sn || oldValue.sn

				if (gsn && sn) {
					newValue.postApi = `https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`
					newValue.commentListApi = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`
				}
			}

			if (newValue.latestComments) {
				const oldValue = core.getStateByNames('gsn', 'sn')
				const gsn = newValue.gsn || oldValue.gsn
				const sn = newValue.sn || oldValue.sn

				const CommentList = core.DOM.CommentList

				if (gsn && sn && CommentList) {
					for (const comment of newValue.latestComments) {
						if (core.commentsMap[comment.id]) {
							continue
						}
						if (comment.element) {
							comment.element.classList.add('bhgv2-comment')
							core.commentsMap[comment.id] = comment
							continue
						}

						const _payload = comment.payload
						if (!_payload) {
							continue
						}

						// 生成comment的element
						const newElement: HTMLElement = $(
							nunjucks.render('comment.njk.html', {
								post: {
									id: sn,
									commentCount: 0,
									to: { gsn: gsn },
								},
								comment: {
									..._payload,
									text: GuildTextUtil.mentionTagToMarkdown(
										gsn,
										_payload.text,
										_payload.tags,
										_payload.mentions
									),
									time: _payload.ctime,
								},
								marked: GuildTextUtil.markedInstance,
								youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
								user: guildPost.loginUser,
							})
						)[0]
						newElement.classList.add('bhgv2-comment')

						CommentList.append(newElement)
						comment.element = newElement

						core.commentsMap[comment.id] = comment
					}
				}
			}
		}

		_plugin.onMutateConfig = (newValue) => {
			const form = core.DOM.ConfigFormContent
			if (!form) {
				return
			}

			Object.keys(newValue).forEach((key: string) => {
				const input = form.querySelector(
					`input[data-config-key='${key}']`
				) as HTMLInputElement
				if (input) {
					switch (input.getAttribute('data-type')) {
						case 'number':
						case 'text':
							input.value = (newValue[key] as string) || ''
							break
						case 'boolean':
							input.checked = (newValue[key] as boolean) || false
							break
					}
				}
			})
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

	_dom.CommentListOuter = document.getElementsByClassName(
		'webview_commendlist'
	)[0] as HTMLElement
	_dom.CommentListOuter.classList.add('bhgv2-comment-list-outer')

	_dom.CommentList = _dom.CommentListOuter.firstElementChild as HTMLElement
	_dom.CommentList.classList.add('bhgv2-comment-list')

	_dom.EditorContainer = _dom.CommentListOuter.getElementsByClassName(
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

	_dom.ConfigFormContent = document.createElement('div')
	_dom.ConfigFormContent.classList.add('bhgv2-config-form-content')

	_dom.ConfigFormMessage = document.createElement('div')
	_dom.ConfigFormMessage.classList.add('bhgv2-config-form-message')

	_dom.ConfigFormFooter = document.createElement('div')
	_dom.ConfigFormFooter.classList.add('bhgv2-config-form-footer')
	_dom.ConfigForm.append(
		_dom.ConfigFormContent,
		_dom.ConfigFormMessage,
		_dom.ConfigFormFooter
	)

	_dom.ConfigFormFooterSaveAsDefault = document.createElement('button')
	_dom.ConfigFormFooterSaveAsDefault.innerHTML = '設為預設值'
	_dom.ConfigFormFooterSave = document.createElement('button')
	_dom.ConfigFormFooterSave.innerHTML = '儲存'
	_dom.ConfigFormFooter.append(
		_dom.ConfigFormFooterSaveAsDefault,
		_dom.ConfigFormFooterSave
	)

	// 初始化每個插件
	;[_CorePlugin, ...plugins].forEach((plugin) => {
		try {
			const _plugin = plugin(CORE)

			// 初始化config
			_plugin.configs?.forEach(({ key, defaultValue }) => {
				_config[key] = defaultValue
				if (defaultValue === undefined) {
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
	_dom.ConfigFormContent.innerHTML = ''
	_plugins.forEach(({ configs, configLayout }) => {
		if (!configs) {
			return
		}
		const _configLayout = configLayout || [
			configs.map((_config) => _config.key),
		]

		for (const row of _configLayout) {
			const rowElement = document.createElement('div')
			rowElement.classList.add('bhgv2-config-form-row')

			for (const col of row) {
				const configItem = configs.find((_config) => _config.key === col)
				if (!configItem) {
					return
				}

				const colElement = document.createElement('div')
				colElement.classList.add('bhgv2-config-form-col')

				const prefixLabel = document.createElement('span')
				prefixLabel.innerHTML = configItem.prefixLabel || ''

				let inputWrapperElement: HTMLElement = document.createElement('label')

				let inputElement: HTMLElement = document.createElement('div')
				switch (configItem.inputType) {
					case 'number':
					case 'text':
					case 'checkbox':
						inputElement = document.createElement('input')
						inputElement.setAttribute('type', configItem.inputType)
						break

					case 'switch':
						inputWrapperElement = document.createElement('label')
						inputWrapperElement.classList.add('switch')

						inputElement = document.createElement('input')
						inputElement.setAttribute('type', 'checkbox')

						const _slider = document.createElement('span')
						_slider.classList.add('slider')

						inputWrapperElement.append(_slider)
						break
				}

				inputWrapperElement.setAttribute('for', configItem.key)

				inputElement.setAttribute('id', configItem.key)
				inputElement.setAttribute('data-config-key', configItem.key)
				inputElement.setAttribute('data-type', configItem.dataType)
				inputWrapperElement.prepend(inputElement)

				const suffixLabel = document.createElement('span')
				suffixLabel.innerHTML = configItem.suffixLabel || ''

				colElement.append(prefixLabel, inputWrapperElement, suffixLabel)

				rowElement.append(colElement)
			}

			_dom.ConfigFormContent.append(rowElement)
		}
	})

	// 初始化 state (gsn, sn, comments, userInfo)
	_state.gsn = guild.gsn
	if (location && location.href.includes('post_detail.php')) {
		const re =
			/https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm
		var url = document.URL
		var urlMatch = re.exec(url)

		_state.sn = parseInt(urlMatch?.[2] as string) || undefined
	}
	_state.userInfo = guildPost.loginUser

	// 添加動作給 DOM
	_dom.ConfigPanelSwitch.addEventListener('click', (event) => {
		event.preventDefault()
		_dom.ConfigPanel.classList.toggle('active')
	})

	const _showConfigFormMessage = (message: string) => {
		_dom.ConfigFormMessage.innerHTML = message
		setTimeout(() => {
			_dom.ConfigFormMessage.innerHTML = ''
		}, 2000)
	}

	const _handleSubmitConfigForm = (
		event: MouseEvent,
		options?: { saveAsDefault: boolean }
	) => {
		event.preventDefault()
		const form = CORE.DOM.ConfigForm
		const newConfig = Array.from(
			form.querySelectorAll<HTMLInputElement>('input[data-config-key]')
		).reduce<TCoreConfig>((prev, element) => {
			const key = element.getAttribute('data-config-key')
			if (!key) {
				return prev
			}

			const dataType = element.getAttribute('data-type')
			let value = undefined

			switch (dataType) {
				case 'boolean':
					value = element.checked
					break
				case 'number':
					value = element.valueAsNumber
					break
				case 'text':
					value = element.value
					break
			}

			prev[key] = value

			return prev
		}, {})

		CORE.mutateConfig(newConfig)

		if (options?.saveAsDefault) {
			window.localStorage.setItem(
				'bahamut-guild-v2-toolkit:config',
				JSON.stringify(newConfig)
			)
		}
	}

	CORE.DOM.ConfigFormFooterSave.addEventListener('click', (event) => {
		_handleSubmitConfigForm(event)
		_showConfigFormMessage('已儲存設定')
	})
	CORE.DOM.ConfigFormFooterSaveAsDefault.addEventListener('click', (event) => {
		_handleSubmitConfigForm(event, { saveAsDefault: true })
		_showConfigFormMessage('已設為預設值及儲存設定')
	})

	// 觸發一次所有插件的 onMutateConfig
	CORE.mutateConfig(_config)

	// 觸發一次所有插件的 onMutateState
	CORE.mutateState(_state)

	// 讀取預設值
	try {
		const _storedConfigJSON = localStorage.getItem(
			'bahamut-guild-v2-toolkit:config'
		)
		if (_storedConfigJSON) {
			CORE.mutateConfig(JSON.parse(_storedConfigJSON))
		}
	} catch {}

	// 初始化state comments (用Interval等到comment list真的生成好)
	let _initialCommentListInterval: NodeJS.Timer
	_initialCommentListInterval = setInterval(() => {
		const _CommentListOuter = CORE.DOM.CommentListOuter

		if (_CommentListOuter) {
			const commentCount =
				parseInt(
					_CommentListOuter.getAttribute('data-comment-count') as string
				) || 0

			if (commentCount === 0) {
				clearInterval(_initialCommentListInterval)
				return
			}

			const _CommentList = CORE.DOM.CommentList
			if (_CommentList) {
				if (_CommentList.children.length === 0) {
					return
				}

				const _newComments = Array.from(
					_CommentList.children
				).map<TCoreStateComment>((element) => ({
					id: element.getAttribute('data-csn') as string,
					element,
				}))

				CORE.mutateState({
					latestComments: _newComments,
				})
			}

			clearInterval(_initialCommentListInterval)
		}
	}, 200)

	return CORE
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
				plugins: [BHGV2_AutoRefresh, BHGV2_CommentsReverse, BHGV2_DarkMode],
				library: {
					jQuery,
					$,
					nunjucks,
					GuildTextUtil,
				},
			})
			hasTakenOver = true
		}
	})
})()
