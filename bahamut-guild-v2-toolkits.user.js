// ==UserScript==
// @name         Bahamut Guild V2 Toolkits
// @namespace    https://silwolf.io/
// @version      0.3.0
// @description  巴哈公會2.0的插件
// @author       銀狼(silwolf167)
// @include      /guild.gamer.com.tw/guild.php
// @include      /guild.gamer.com.tw/post_detail.php
// @grant        GM_notification
// @updateUrl    https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/bahamut-guild-v2-toolkits.user.js
// ==/UserScript==

; (function () {
	'use strict'

	//-------------------------------全域設定-------------------------------//
	/** key for local storage usage */
	const LS_KEY_CONFIG = 'bhgv2_toolkits_config'
	const DEBUG_MODE = true
	/** Global config*/
	let GLOBLE_CONFIG = {}

	//-------------------------------Flash Title when New Message-------------------------//
	/** 新訊息標題閃爍事件 */
	GLOBLE_CONFIG['titleFlashTimeoutObj'] = undefined

	/** 新訊息標題閃爍事件 */
	GLOBLE_CONFIG['backgroundUpdateObj'] = undefined

	/** 新訊息時標題閃爍 */
	const newMessageTitleFlash = () => {
		if (GLOBLE_CONFIG['titleFlashTimeoutObj'] !== undefined) {
			return
		}

		var Message = "有新訊息！"
		GLOBLE_CONFIG['titleFlashTimeoutObj'] = window.setInterval(function () {
			if (document.title == Message) {
				changeTitleWithNotification()
			} else {
				document.title = Message
			}
		}, 1000);
	}

	/** 背景自動檢查功能 */
	const backgroundUpdate = () => {
		const panel_config = GLOBLE_CONFIG['user_config']

		const {
			isEnabledTitleFlashNewMessage
		} = panel_config

		if (!isEnabledTitleFlashNewMessage) {
			if (GLOBLE_CONFIG['backgroundUpdateObj'] != undefined) {
				clearInterval(GLOBLE_CONFIG['backgroundUpdateObj'])
				GLOBLE_CONFIG['backgroundUpdateObj'] = undefined
			}
			return
		}


		if (GLOBLE_CONFIG['backgroundUpdateObj'] == undefined) {
			GLOBLE_CONFIG['backgroundUpdateObj'] = window.setInterval(function () {
				fetchLatestComments().then((resp) => {
					var comment_list = resp.data.comments
					var response_last_csn = comment_list[comment_list.length - 1].id
					const last_read_csn = GLOBLE_CONFIG['NewMessageUnread'].last_read_csn
					if (response_last_csn > last_read_csn) {
						newMessageTitleFlash()
					}
				})
			}, 1000 * 10);
		} else {
			return
		}
	}

	//-------------------------------Highlight when New Message--------------------------//
	/** 註冊新回應高亮相關變數 */
	const registerHighLightWhenNewMessage = () => {
		GLOBLE_CONFIG['NewMessageUnread'] = {
			last_read_csn: undefined,
			abortController: undefined,
			acknoledgeEventListener: false
		}

		const styleHightLight = document.createElement('style')
		styleHightLight.innerHTML = `
			.new_message_highlight{
				animation-name: highlight_ns;
    			animation-duration: 4.0s;
				animation-iteration-count: infinite;
			}

			@keyframes highlight_ns{
				0% {
					background-color: #ffffff00;
				}
				75% {
					background-color: #00ff0020;
				}
				100% {
					background-color: #ffffff00;
				}
			}
		`
		const head = document.getElementsByTagName('head')[0]
		head.appendChild(styleHightLight)
	}

	/** 新回應高亮主事件 */
	const listenNewMessage = () => {
		const panel_config = GLOBLE_CONFIG['user_config']
		const module_config = GLOBLE_CONFIG['NewMessageUnread']

		const {
			isEnabledCommentHigtLightNewMessage,
			isEnabledTitleFlashNewMessage
		} = panel_config

		if (!isEnabledCommentHigtLightNewMessage && !isEnabledTitleFlashNewMessage) {
			module_config.last_read_csn = undefined
			module_config.abortController = undefined
			return
		}

		if (module_config.last_read_csn == undefined) {
			var lastCommentCsn = document.querySelector(`.c-reply__item:last-child`).getAttribute("data-csn")
			GLOBLE_CONFIG['NewMessageUnread'].last_read_csn = lastCommentCsn
		}

		if (module_config.abortController == undefined) {
			GLOBLE_CONFIG['NewMessageUnread'].abortController = new AbortController()
		}

		var unread_list = []
		const last_read_csn = GLOBLE_CONFIG['NewMessageUnread'].last_read_csn
		const commendHightlightList = document.querySelectorAll(".c-reply__item")
		commendHightlightList.forEach(element => {
			var element_csn = element.getAttribute("data-csn")
			if (element_csn <= last_read_csn) {
				return
			}

			unread_list.push(element)
		});

		if (unread_list.length > 0) {
			if (isEnabledCommentHigtLightNewMessage) {
				applyHighLightWhenNewMessage(unread_list)
			}

			if (isEnabledTitleFlashNewMessage) {
				newMessageTitleFlash()
			}


			if (!module_config.acknoledgeEventListener) {
				document.getElementsByTagName("body")[0].addEventListener('click', () => {
					acknolegeNewMessage()
				}, { once: true })
			}
		}

	}

	/** 高亮新的回應 */
	const applyHighLightWhenNewMessage = (element_list) => {
		const module_config = GLOBLE_CONFIG['NewMessageUnread']

		element_list.forEach(element => {
			element.classList.toggle('new_message_highlight', true)
		});

	}

	/** 重置新回應事件 */
	const acknolegeNewMessage = () => {
		var lastCommentCsn = document.querySelector(`.c-reply__item:last-child`).getAttribute("data-csn")
		GLOBLE_CONFIG['NewMessageUnread'].last_read_csn = lastCommentCsn

		document.querySelectorAll(`.new_message_highlight`).forEach(ele => ele.classList.toggle('new_message_highlight', false))
		GLOBLE_CONFIG['NewMessageUnread'].abortController.abort()
		GLOBLE_CONFIG['NewMessageUnread'].abortController = new AbortController()

		if (GLOBLE_CONFIG['titleFlashTimeoutObj'] !== undefined) {
			clearInterval(GLOBLE_CONFIG['titleFlashTimeoutObj']);
			GLOBLE_CONFIG['titleFlashTimeoutObj'] = undefined
		}
		changeTitleWithNotification()
	}

	//-------------------------------Highlight when tag me-------------------------------//
	/** apply highlight css for tag me comment*/
	const applyHighLightWhenTagMe = () => {
		var config = GLOBLE_CONFIG['user_config']
		var user = GLOBLE_CONFIG['user_info']
		const { isEnabledCommentHigtLightTagMe } = config

		if (isEnabledCommentHigtLightTagMe == undefined) {
			return
		}

		const commendHightlightList = document.querySelectorAll(`.reply-content__cont p a[href*=${user.id}]`)
		commendHightlightList.forEach(element => {
			var targetNode = element.parentNode.parentNode.parentNode
			targetNode.classList.toggle(
				'tag_me_highlight',
				isEnabledCommentHigtLightTagMe === true
			)
			if (isEnabledCommentHigtLightTagMe) {
				targetNode.addEventListener("click", (e) => {
					targetNode.classList.toggle(
						'tag_me_highlight',
						false
					)
				}, { once: true });
			}
		});
	}

	/** register css for highlight when tag me */
	const registerHighlightWhenTagMe = () => {
		const styleHightLight = document.createElement('style')
		styleHightLight.innerHTML = `
			.tag_me_highlight{
				animation-name: highlight_tm;
    			animation-duration: 4.0s;
				animation-iteration-count: infinite;
			}

			@keyframes highlight_tm{
				0% {
					background-color: #ffffff00;
				}
				75% {
					background-color: #ff000020;
				}
				100% {
					background-color: #ffffff00;
				}
			}
		`
		const head = document.getElementsByTagName('head')[0]
		head.appendChild(styleHightLight)
	}

	//-------------------------------Notification Sound-------------------------------//
	/** 初始化通知提示音DOM */
	const initNotificationAudio = () => {
		var dom = new Audio(
			'https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/notification.mp3'
		);
		dom.autoplay = true
		dom.muted = true
		dom.style.display = 'none!important'
		return dom
	}

	/** 註冊提示音物件 */
	const registerNotificationAudio = () => {
		const notificationAudio = initNotificationAudio()
		document.body.appendChild(notificationAudio)
	}

	//-------------------------------Notification-------------------------------//

	/** 發出桌面提示 */
	const notify = (detail) => {
		GM_notification(detail)
		if (detail && detail.slient !== true) {
			notificationAudio.muted = false
			notificationAudio.play()
		}
	}

	//-------------------------------Auto Refresh-------------------------------//

	/** 自動更新事件 */
	GLOBLE_CONFIG['autoRefreshTimeoutObj'] = undefined

	/** 清除回應區留言 */
	const clearComments = () => {
		const $post = Guild.getPost(GLOBLE_CONFIG['sn'], false, '')
		const $commentContainer = $post.find(
			'.webview_commendlist > div:first-child'
		)
		$commentContainer[0].innerHTML = ''
		GLOBLE_CONFIG['comments'] = []
	}

	/** 增加留言至回應區 */
	const appendNewComments = (newComments) => {
		let commentListHtml = ''
		const gsn = GLOBLE_CONFIG['gsn']
		const sn = GLOBLE_CONFIG['sn']

		for (const nC of newComments) {
			$(`.c-reply__item[data-csn='${nC.id}']`).remove()
			nC.text = GuildTextUtil.mentionTagToMarkdown(
				gsn,
				nC.text,
				nC.tags,
				nC.mentions
			)
			nC.time = nC.ctime
			commentListHtml += nunjucks.render('comment.njk.html', {
				post: {
					id: sn,
					commentCount: 0,
					to: { gsn: gsn },
				},
				comment: nC,
				marked: GuildTextUtil.markedInstance,
				youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
				user: guildPost.loginUser,
			})
		}

		if (commentListHtml) {
			const $post = Guild.getPost(sn, false, '')
			const $commentContainer = $post.find(
				'.webview_commendlist > div:first-child'
			)
			$commentContainer.append(commentListHtml)

			GLOBLE_CONFIG['comments'] = [...GLOBLE_CONFIG['comments'], ...newComments]
		}
	}

	/**擷取最新留言 */
	const fetchLatestComments = () =>
		fetch(`${GLOBLE_CONFIG['apiUrl']}`, {
			credentials: 'include',
		}).then((res) => res.json())

	/**擷取所有留言 */
	const fetchAllComments = () =>
		fetch(`${GLOBLE_CONFIG['apiUrl']}&all`, {
			credentials: 'include',
		}).then((res) => res.json())

	/**擷取指定頁面的留言 */
	const fetchCommentsByPage = (page) =>
		fetch(`${GLOBLE_CONFIG['apiUrl']}&page=${page}`, {
			credentials: 'include',
		}).then((res) => res.json())

	/**自動更新主函式 */
	const autoRefreshTimeoutFn = () => {
		var config = GLOBLE_CONFIG['user_config']

		const {
			autoRefreshInterval,
			isEnabledNotification,
			isEnabledNotificationSound,
		} = config

		fetchLatestComments()
			.then(async (response) => {
				var comments = GLOBLE_CONFIG['comments']
				const expectedNewCommentsCount =
					response.data.commentCount - comments.length

				if (expectedNewCommentsCount < 0) {
					const newComments = await fetchAllComments().then(
						(response) => response.data.comments
					)
					clearComments()
					appendNewComments(newComments)
					return
				}

				const lastIdInt =
					parseInt(comments[comments.length - 1]?.id) || 0
				let newComments = response.data.comments.filter(
					(nC) => parseInt(nC.id) > lastIdInt
				)

				let lastResponse = response
				while (
					newComments.length < expectedNewCommentsCount &&
					lastResponse.data.nextPage !== 0
				) {
					const page = lastResponse.data.nextPage
					lastResponse = await fetchCommentsByPage(page)
					newComments = [
						...lastResponse.data.comments.filter(
							(nC) => parseInt(nC.id) > lastIdInt
						),
						...newComments,
					]
				}

				if (newComments.length !== expectedNewCommentsCount) {
					const newComments = await fetchAllComments().then(
						(response) => response.data.comments
					)
					clearComments()
					appendNewComments(newComments)
					return
				}

				if (newComments.length > 0) {
					appendNewComments(newComments)
					if (isEnabledNotification === true) {
						const lastComment =
							newComments[newComments.length - 1]
						notify({
							title: GLOBLE_CONFIG['postTitle'],
							text: `(#${lastComment.position}) ${lastComment.name}： ${lastComment.text}`,
							highlight: true,
							slient: isEnabledNotificationSound,
							timeout: 5000,
						})
					}
				}
			})
			.finally(() => {
				applyHighLightWhenTagMe()
				listenNewMessage()
				GLOBLE_CONFIG['autoRefreshTimeoutObj'] = setTimeout(
					autoRefreshTimeoutFn,
					autoRefreshInterval * 1000
				)
			})
	}
	/** 設定自動更新循環 */
	const applyAutoRefreshInterval = () => {
		var config = GLOBLE_CONFIG['user_config']

		const {
			isEnabledAutoRefresh,
			autoRefreshInterval,
		} = config



		if (isEnabledAutoRefresh !== undefined) {
			const autoRefreshTimeoutObj = GLOBLE_CONFIG['autoRefreshTimeoutObj']
			if (isEnabledAutoRefresh === false) {
				if (autoRefreshTimeoutObj) {
					clearTimeout(autoRefreshTimeoutObj)
					GLOBLE_CONFIG['autoRefreshTimeoutObj'] = undefined
				}
			} else if (isEnabledAutoRefresh === true && autoRefreshInterval) {
				if (autoRefreshTimeoutObj) {
					clearTimeout(autoRefreshTimeoutObj)
					GLOBLE_CONFIG['autoRefreshTimeoutObj'] = undefined
				}

				// 重讀一次整個comments列表
				fetchAllComments().then((response) => {
					GLOBLE_CONFIG['comments'] = response.data.comments
					GLOBLE_CONFIG['autoRefreshTimeoutObj'] = setTimeout(
						autoRefreshTimeoutFn,
						autoRefreshInterval * 1000
					)
				})
			}
		}
	}

	//-------------------------------留言反轉-------------------------------//
	/** 留言反轉 */
	const enableCommentReverse = () => {
		const commendList = document.getElementsByClassName('webview_commendlist')[0]
		const config = GLOBLE_CONFIG['user_config']
		const { isInvertedComments } = config

		if (isInvertedComments !== undefined) {
			commendList.classList.toggle(
				'inverted',
				isInvertedComments === true
			)
		}
	}

	//-------------------------------Title Notification-------------------------------//
	/** 網頁載入時原有的title */
	GLOBLE_CONFIG['pageOrginalTitle'] = document.title
	/** 存放通知數量 */
	GLOBLE_CONFIG['pageNotificationCount'] = 0

	/** 修改網頁標題成帶有通知數量 */
	const changeTitleWithNotification = () => {
		var config = GLOBLE_CONFIG['user_config']
		var title = GLOBLE_CONFIG['pageOrginalTitle']
		var boolEnable = ("isEnabledTitleNotification" in config) ? config['isEnabledTitleNotification'] : false

		if (!boolEnable) {
			document.title = title;
			return
		}

		var notifiCount = GLOBLE_CONFIG['pageNotificationCount']

		if (notifiCount > 0) {
			document.title = "(" + notifiCount + ") " + title;
		} else {
			document.title = title;
		}
	}

	/** 修改通知數目 */
	const changeTitleNofityCount = () => {
		var config = GLOBLE_CONFIG['user_config']
		var boolNotice = ("isTitleNotificationCountNotify" in config) ? config['isTitleNotificationCountNotify'] : false
		var boolSubscript = ("isTitleNotificationCountSubscribe" in config) ? config['isTitleNotificationCountSubscribe'] : false
		var boolRecommend = ("isTitleNotificationCountRecommand" in config) ? config['isTitleNotificationCountRecommand'] : false
		var title = GLOBLE_CONFIG['pageOrginalTitle']

		var msg_alert = new Array('topBar_light_0', 'topBar_light_1', 'topBar_light_2');

		var total_msg = 0;
		var msg_sep = new Array();
		msg_alert.forEach(function (entry) {
			if (document.getElementById(entry).firstChild != null) {
				var spanText = document.getElementById(entry).children[0].innerHTML;
				var temp_int = parseInt(spanText, 10);
				msg_sep.push(temp_int);
			} else {
				msg_sep.push(0);
			}
		});
		if (boolNotice) total_msg += msg_sep[0];
		if (boolSubscript) total_msg += msg_sep[1];
		if (boolRecommend) total_msg += msg_sep[2];

		GLOBLE_CONFIG['pageNotificationCount'] = total_msg

		changeTitleWithNotification()
	}

	/** 訂閱通知區塊#BH-top-data的DOM修改事件並且修改title */
	const registerNotificationDomChangeEvent = () => {
		const titleObserver = new MutationObserver(changeTitleNofityCount);
		const titleObserverTargetNode = document.getElementById('BH-top-data');
		const titleObserverConfig = { attributes: true, childList: true, subtree: true };
		titleObserver.observe(titleObserverTargetNode, titleObserverConfig);
	}

	//-------------------------------Config Change-------------------------------//

	// 增加Config變更指示DOM
	/** 初始化設定變更追蹤DOM */
	const initHiddenConfigChangeIndicator = () => {
		var dom = document.createElement("input");
		dom.type = "hidden"
		dom.value = Date.now()
		dom.id = "configChangeIndicator"
		return dom
	}

	/** 設定變更時觸發的主函式 */
	const applyChangeObserver = new MutationObserver(() => {
		applyAutoRefreshInterval()
		enableCommentReverse()
		changeTitleNofityCount()
		applyHighLightWhenTagMe()
		listenNewMessage()
		backgroundUpdate()
	})

	/** 註冊設定變更追蹤者 */
	const registerConfigChangeEvent = () => {
		// 設定變更追蹤器
		const hiddenConfigChangeIndicator = initHiddenConfigChangeIndicator()
		document.body.appendChild(hiddenConfigChangeIndicator)
		// 設定追蹤對象與追蹤項目
		applyChangeObserver.observe(
			hiddenConfigChangeIndicator,
			{ attributes: true, childList: true, subtree: true }
		);
	}

	//-------------------------------Local Storage-------------------------------//
	/** 將使用者設定寫回local storage */
	const storeConfigToLocalStorage = (config) => {
		localStorage.setItem(LS_KEY_CONFIG, JSON.stringify(config))
	}

	/** 從local storage讀取使用者設定 */
	const loadConfigFromLocalStorage = () =>
		JSON.parse(localStorage.getItem(LS_KEY_CONFIG) || '{}')

	//-------------------------------Setting Panel-------------------------------//
	/** 套用設定 */
	const setConfig = (config) => {
		var pluginConfig = GLOBLE_CONFIG['user_config']
		pluginConfig = {
			...pluginConfig,
			...config,
		}
		GLOBLE_CONFIG['user_config'] = pluginConfig

		const newStatusArr = []

		if (
			pluginConfig.isEnabledAutoRefresh &&
			pluginConfig.autoRefreshInterval
		) {
			newStatusArr.push(
				`自動更新: ${pluginConfig.autoRefreshInterval}秒`
			)
		}

		if (pluginConfig.isEnabledNotification) {
			if (pluginConfig.isEnabledNotificationSound) {
				newStatusArr.push(`桌面通知+聲音`)
			} else {
				newStatusArr.push(`桌面通知`)
			}
		}

		var pluginConfigStatus = document.getElementsByClassName('plugin-config-status')[0]
		pluginConfigStatus.innerHTML = newStatusArr.join('　')

		return pluginConfig
	}

	/** 將設定套用至面板 */
	const fillFormConfig = (config) => {
		var pluginConfigForm = document.getElementsByClassName('plugin-config-form')[0]
		const els = pluginConfigForm.querySelectorAll('[data-field]')

		for (const el of els) {
			const field = el.getAttribute('data-field')
			const type = el.getAttribute('data-type')

			if (config[field] === undefined) {
				continue
			}

			switch (type) {
				case 'boolean':
					el.checked = config[field] === true
					break
				case 'number':
				default:
					el.value = config[field]
			}
		}

		pluginConfigForm.querySelector(
			'[data-field="isEnabledAutoRefresh"]'
		).checked = config.isEnabledAutoRefresh === true
		pluginConfigForm.querySelector(
			'[data-field="isInvertedComments"]'
		).checked = config.isInvertedComments === true
		pluginConfigForm.querySelector(
			'[data-field="autoRefreshInterval"]'
		).value = config.autoRefreshInterval
	}

	/** 觸發設定變更 */
	const runConfigApply = () => {
		document.getElementById('configChangeIndicator').value = Date.now()
	}

	/** 初始化設定面板 */
	const initSettingPane = () => {
		// 將各個關鍵元件放進變量中
		const commendList = document.getElementsByClassName('webview_commendlist')[0]
		const editorContainer =
			commendList.getElementsByClassName('c-reply__editor')[0]
		const editor =
			editorContainer.getElementsByClassName('reply-input')[0]
		const editorTextarea = editor.getElementsByTagName('textarea')[0]

		// pluginConfigA - 建立可開關插件設定板面的連結
		const pluginConfigWrapper = document.createElement('div')
		pluginConfigWrapper.classList.add('plugin-config-wrapper')
		editorContainer.appendChild(pluginConfigWrapper)

		const pluginConfigStatus = document.createElement('div')
		pluginConfigStatus.classList.add('plugin-config-status')
		pluginConfigWrapper.appendChild(pluginConfigStatus)

		const pluginConfigA = document.createElement('a')
		pluginConfigA.innerHTML = '插件設定'
		pluginConfigA.setAttribute('href', '#')
		pluginConfigWrapper.appendChild(pluginConfigA)

		// pluginConfigForm - 插件設定板面
		const pluginConfigForm = document.createElement('form')
		pluginConfigForm.classList.add('plugin-config-form')
		pluginConfigForm.innerHTML = `
			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledAutoRefresh" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>自動更新</span>
				<input type="number" min="1" max="9999" data-field="autoRefreshInterval" data-type="number" style="width: 40px;" />
				<span>秒</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isInvertedComments" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>顛倒哈拉串</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledNotification" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>自動更新時發送桌面通知</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledNotificationSound" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>桌面通知的聲音</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledCommentHigtLightTagMe" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>高亮提及我的訊息</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledCommentHigtLightNewMessage" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>自動更新時高亮新的訊息</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledTitleFlashNewMessage" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>新的訊息到時標題閃爍 (作用於自動更新與每2分鐘背景檢查)</span>
			</div>

			<div class="form-group">
				<label class="switch">
					<input type="checkbox" data-field="isEnabledTitleNotification" data-type="boolean">
					<span class="slider"></span>
				</label>
				<span>是否啟用標題顯示通知數目</span>
				<span>計算項目：</span>
				<input type="checkbox" data-field="isTitleNotificationCountNotify" data-type="boolean">
				<span>通知</span>
				<input type="checkbox" data-field="isTitleNotificationCountSubscribe" data-type="boolean">
				<span>訂閱</span>
				<input type="checkbox" data-field="isTitleNotificationCountRecommand" data-type="boolean">
				<span>推薦</span>
			</div>

			<div class="form-message"></div>

			<div class="form-footer">
				<button type="button" class="plugin-config-button-set-as-default">設為預設值</button>
				<button type="button" class="plugin-config-button-apply">套用</button>
			</div>
		`
		editorContainer.appendChild(pluginConfigForm)

		// PluginConfigFormMessage - 插件設定板面訊息
		const PluginConfigFormMessage =
			pluginConfigForm.getElementsByClassName('form-message')[0]
		let PluginConfigFormMessageTimeout
		const showPluginConfigMessage = (text, duration = 1500) => {
			PluginConfigFormMessage.innerHTML = text

			if (PluginConfigFormMessageTimeout) {
				clearTimeout(PluginConfigFormMessageTimeout)
			}
			PluginConfigFormMessageTimeout = setTimeout(() => {
				PluginConfigFormMessage.innerHTML = ''
				PluginConfigFormMessageTimeout = undefined
			}, duration)
		}

		// getFormConfig - 從插件設定板面中讀取設定
		const getFormConfig = () => {
			const els = pluginConfigForm.querySelectorAll('[data-field]')
			const result = {}

			for (const el of els) {
				const field = el.getAttribute('data-field')
				const type = el.getAttribute('data-type')
				const value = el.value

				switch (type) {
					case 'boolean':
						result[field] = el.checked
						break
					case 'number':
						result[field] = parseInt(value)
						break
					default:
						result[field] = value
				}
			}

			return result
		}

		// pluginConfigApplyButton - 插件設定板面的「套用」按鈕
		const pluginConfigApplyButton =
			pluginConfigForm.getElementsByClassName(
				'plugin-config-button-apply'
			)[0]
		const handleClickPluginConfigApply = () => {
			setConfig(getFormConfig())
			runConfigApply()
			showPluginConfigMessage('已套用設定')
		}
		pluginConfigApplyButton.addEventListener(
			'click',
			handleClickPluginConfigApply
		)

		// pluginConfigSetAsDefaultButton - 插件設定板面的「設為預設值」按鈕
		const pluginConfigSetAsDefaultButton =
			pluginConfigForm.getElementsByClassName(
				'plugin-config-button-set-as-default'
			)[0]
		const handleClickPluginConfigSetAsDefault = () => {
			const newConfig = getFormConfig()
			const finalConfig = setConfig(newConfig)
			storeConfigToLocalStorage(finalConfig)
			runConfigApply()
			showPluginConfigMessage('已套用設定及設為預設值')
		}
		pluginConfigSetAsDefaultButton.addEventListener(
			'click',
			handleClickPluginConfigSetAsDefault
		)

		// togglePluginConfigForm - 開關插件設定板面
		const togglePluginConfigForm = (newState) => {
			pluginConfigForm.classList.toggle('active', newState)
		}

		const handleClickPluginConfigA = (event) => {
			event.preventDefault()
			togglePluginConfigForm()
		}
		pluginConfigA.addEventListener('click', handleClickPluginConfigA)

		const onKeyDownFn = () => {
			// console.log('123')
		}
		editorTextarea.addEventListener('keydown', onKeyDownFn)
	}

	//-------------------------------Misc Function-------------------------------//

	/** 等待DOM準備完成 */
	const waitForElm = (selector) => {
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

	/** 讀取哈拉本文 */
	const loadMessageContent = (gsn, sn) =>
		fetch(
			`https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`,
			{ credentials: 'include' }
		).then((resp) => resp.json()
		).then((resp) => resp.data.content.split('\n')[0].substr(0, 30))

	//-------------------------------Debug Function-----------------------------//
	const debug = () => {
		console.log(GLOBLE_CONFIG)
	}


	/** 產生 Debug 按鈕 DOM */
	const initDebugGlobalConfigBtn = () => {
		var aDom = document.createElement("a");
		aDom.id = 'baha_toolkit_debug'
		aDom.innerHTML = '<img src="https://i2.bahamut.com.tw/guild/guildnav-icon_setting.png"><span class="text-tooltip">插件用DEBUG按鈕</span>'
		aDom.style = 'background-color: rgba(193, 17, 131, 0.1);'
		aDom.addEventListener('click', debug)

		return aDom
	}

	/** 註冊Debug按鈕*/
	const registerDebugBtn = () => {
		const btnDom = initDebugGlobalConfigBtn()
		const nav_feature_dom = document.getElementsByClassName('main-nav_m-features')

		nav_feature_dom[0].appendChild(btnDom)
		nav_feature_dom[1].appendChild(btnDom)
	}

	//-------------------------------Dark Mode----------------------------------//
	/** 設定闇黑模式變更時觸發的主函式 */
	const darkModeObserver = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutationRecord) {
			//檢查c-reply__editor是否存在，避免不必要的error觸發
			var target_dom = document.getElementsByClassName("c-reply__editor")
			if (target_dom.length == 0) {
				return
			}
			if (location && location.href.includes('post_detail.php')) {
				if (Cookies.get("ckForumDarkTheme") == "yes") {
					document.getElementsByClassName("c-reply__editor")[0].classList.toggle("dark", true);
					document.getElementsByClassName("plugin-config-form")[0].classList.toggle("dark", true);
				} else {
					document.getElementsByClassName("c-reply__editor")[0].classList.toggle("dark", false);
					document.getElementsByClassName("plugin-config-form")[0].classList.toggle("dark", false);
				}
			}
		});
	});

	/** 註冊闇黑模式變更者，變更條件為偵測head變化 */
	const registerDarkMode = () => {
		var target = document.getElementsByTagName('head')[0];
		darkModeObserver.observe(target, {
			attributes: true,
			childList: true,
			subtree: true
		});
	}

	//-------------------------------Main Section-------------------------------//

	const pageStyleString = `
		/* The switch - the box around the slider */
		.switch {
			position: relative;
			display: inline-block;
			width: 30px;
			height: 17px;
		}

		/* Hide default HTML checkbox */
		.switch input {
			opacity: 0;
			width: 0;
			height: 0;
		}

		/* The slider */
		.slider {
			position: absolute;
			cursor: pointer;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: #ccc;
			-webkit-transition: .4s;
			transition: .4s;
		}

		.slider:before {
			position: absolute;
			content: "";
			height: 13px;
			width: 13px;
			left: 2px;
			bottom: 2px;
			background-color: white;
		}

		input:checked + .slider {
			background-color: #2196F3;
		}

		input:focus + .slider {
			box-shadow: 0 0 1px #2196F3;
		}

		input:checked + .slider:before {
			-webkit-transform: translateX(13px);
			-ms-transform: translateX(13px);
			transform: translateX(13px);
		}

		/* Rounded sliders */
		.slider.round {
			border-radius: 17px;
		}

		.slider.round:before {
			border-radius: 50%;
		}

		.text_content-hide {
			display: block !important;
		}

		.more-text {
			display: none;
		}

		div[data-google-query-id] {
			display: none;
		}

		.webview_commendlist {
			display: flex;
			flex-direction: column;
		}
		.webview_commendlist > div {
			display: flex;
			flex-direction: column;
		}

		.webview_commendlist.inverted {
			flex-direction: column-reverse;
		}
		.webview_commendlist.inverted > div {
			flex-direction: column-reverse;
		}
		.webview_commendlist > div.c-reply__editor {
			flex-direction: column;
		}

		.webview_commendlist > div.c-reply__editor .plugin-config-wrapper {
			display: flex;
			flex-direction: row;
			padding: 13px 0 5px;
			font-size: 12px;
		}

		.plugin-config-wrapper .plugin-config-status {
			flex: 1;
		}

		.plugin-config-form {
			background: #ffffff;
			padding: 8px;
			border-radius: 4px;
			display: none;
		}

		.plugin-config-form.active {
			display: block;
		}

		.plugin-config-form.dark {
			background: #222222;
		}

		.plugin-config-form.plugin-config-form.plugin-config-form input {
			border: 1px solid #999;
		}

		.plugin-config-form.plugin-config-form.plugin-config-form.dark input {
			color: #C7C6CB
		}

		.plugin-config-form.plugin-config-form.plugin-config-form button {
			-webkit-border-radius: 5px;
			-moz-border-radius: 5px;
			border-radius: 5px;
			background-color: #eee;
			padding: 3px;
			border: 1px solid #333;
			color: #000;
			text-decoration: none;
		}

		.plugin-config-form.plugin-config-form.plugin-config-form button:disabled {
			color: #ccc;
		}

		.plugin-config-form .form-message {
			text-align: center;
			color: #4a934a;
			font-size: 12px;
			min-height: 24px;
			line-height: 16px;
			padding: 4px;
		}

		.plugin-config-form .form-footer {
			text-align: center;
		}
	`

	const postStyle_post_detail = `
		.webview_commendlist .c-reply__editor {
			position: sticky;
			top: 80px;
			margin-left: -20px;
			margin-right: -20px;
			padding-left: 20px;
			padding-right: 20px;
			background-color: rgba(180, 180, 180, 0.9);
			box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
		}

		.webview_commendlist .c-reply__editor.dark {
			background-color: rgba(0, 0, 0, 0.9) !important;
			box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5) !important;
		}

		.reply-input textarea {
			min-height: 66px;
		}
	`



	jQuery(document).ready(() => {
		//註冊DebugDOM
		if (DEBUG_MODE) {
			registerDebugBtn()
		}

		//註冊標題通知器
		registerNotificationDomChangeEvent()
		//註冊設定變更者
		registerConfigChangeEvent()

		//註冊提示音DOM
		registerNotificationAudio()
		//註冊提及我高亮CSS
		registerHighlightWhenTagMe()
		//註冊新訊息高亮CSS與設定
		registerHighLightWhenNewMessage()


		//註冊暗黑模式變更者
		registerDarkMode()

		//套用CSS
		const head = document.getElementsByTagName('head')[0]
		if (head) {
			const style = document.createElement('style')
			style.innerHTML = pageStyleString
			if (location && location.href.includes('post_detail.php')) {
				style.innerHTML += postStyle_post_detail
			}
			head.appendChild(style)
		}

		let hasTakenOver = false

		GLOBLE_CONFIG['gsn'] = guild.gsn
		GLOBLE_CONFIG['comments'] = []
		GLOBLE_CONFIG['user_config'] = loadConfigFromLocalStorage()
		GLOBLE_CONFIG['user_info'] = guildPost.loginUser

		if (location && location.href.includes('post_detail.php')) {
			//根據網址資料獲得sn id
			const re = /https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm;
			var url = document.URL
			var url_match = re.exec(url)

			GLOBLE_CONFIG['sn'] = url_match[2]
			loadMessageContent(GLOBLE_CONFIG['gsn'], GLOBLE_CONFIG['sn']).then((resp) => {
				GLOBLE_CONFIG['postTitle'] = resp
			})
			GLOBLE_CONFIG['apiUrl'] = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${GLOBLE_CONFIG['gsn']}&messageId=${GLOBLE_CONFIG['sn']}`

			waitForElm('.webview_commendlist .c-reply__editor').then(() => {
				if (!hasTakenOver) {

					//初始化設定面板
					initSettingPane()

					const storedConfig = loadConfigFromLocalStorage()
					setConfig(storedConfig)
					fillFormConfig(storedConfig)
					runConfigApply()
					hasTakenOver = true
				}
			})
		}
	})
})()
