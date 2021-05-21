// ==UserScript==
// @name         Bahamut Guild V2 Toolkits
// @namespace    https://silwolf.io/
// @version      0.2.0
// @description  巴哈公會2.0的插件
// @author       銀狼(silwolf167)
// @include      /guild.gamer.com.tw/guild.php
// @include      /guild.gamer.com.tw/post_detail.php
// @grant        GM_notification
// @updateUrl    https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/index.js
// ==/UserScript==

;(function () {
	'use strict'

	const notificationAudio = new Audio(
		'https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/notification.mp3'
	)
	addEventListener('load', function () {
		notificationAudio.autoplay = true
		notificationAudio.muted = true
		notificationAudio.style.display = 'none!important'
		document.body.appendChild(notificationAudio)
	})

	const notify = (detail) => {
		GM_notification(detail)
		if (detail && detail.slient !== true) {
			notificationAudio.muted = false
			notificationAudio.play()
		}
	}

	const LS_KEY_CONFIG = 'bhgv2_toolkits_config'

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

	const storeConfigToLocalStorage = (config) => {
		localStorage.setItem(LS_KEY_CONFIG, JSON.stringify(config))
	}
	const loadConfigFromLocalStorage = () =>
		JSON.parse(localStorage.getItem(LS_KEY_CONFIG) || '{}')

	// Your code here...
	jQuery(document).ready(() => {
		const head = document.getElementsByTagName('head')[0]
		if (head) {
			const style = document.createElement('style')
			style.type = 'text/css'
			style.innerHTML = `
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

				.plugin-config-form.plugin-config-form.plugin-config-form input {
					border: 1px solid #999;
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

			if (location && location.href.includes('post_detail.php')) {
				style.innerHTML += `
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

          .reply-input textarea {
            min-height: 66px;
          }
        `
			}
			head.appendChild(style)
		}

		// const editor = document.getElementsByClassName('c-reply__editor');
		// console.log(
		// 	document.getElementsByClassName('c-reply__editor'),
		// 	document.getElementsByClassName('c-reply__editor')[0]
		// );
		// if (editor) {
		// 	const newButton = document.createElement('button');
		// 	newButton.innerHTML('重新下載');

		// 	editor.appendChild(newButton);
		// }

		let hasTakenOver = false

		const gsn = guild.gsn
		const sn = parseInt($('.inboxfeed').first().data('post-sn'))

		let comments = []
		const apiUrl = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`

		const clearComments = () => {
			const $post = Guild.getPost(sn, false, '')
			const $commentContainer = $post.find(
				'.webview_commendlist > div:first-child'
			)
			$commentContainer[0].innerHTML = ''
			comments = []
		}

		const appendNewComments = (newComments) => {
			let commentListHtml = ''
			for (const nC of newComments) {
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

				comments = [...comments, ...newComments]
			}
		}

		const fetchLatestComments = () =>
			fetch(`${apiUrl}`, {
				credentials: 'include',
			}).then((res) => res.json())

		const fetchAllComments = () =>
			fetch(`${apiUrl}&all`, {
				credentials: 'include',
			}).then((res) => res.json())

		const fetchCommentsByPage = (page) =>
			fetch(`${apiUrl}&page=${page}`, {
				credentials: 'include',
			}).then((res) => res.json())

		if (location && location.href.includes('post_detail.php')) {
			waitForElm('.webview_commendlist .c-reply__editor').then(() => {
				if (!hasTakenOver) {
					let postTitle = ''
					fetch(
						`https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`,
						{ credentials: 'include' }
					)
						.then((resp) => {
							return resp.json()
						})
						.then((response) => {
							const post = response.data
							postTitle = post.content.split('\n')[0].substr(0, 20)
						})

					const oldGuildCommentReplyEnterKey = GuildComment.replyEnterKey
					// GuildComment.replyEnterKey = (event, element) => {
					// 	let $element = $(element);
					// 	let gsn = parseInt($element.data('gsn'), 10);
					// 	let postSn = parseInt($element.data('post-sn'), 10);
					// 	event = window.event || event;
					// 	let code = event.which;
					// 	if (code == 13 && GuildTagUser.tagListTippyShown) {
					// 		return;
					// 	}
					// 	if (code == 13 && !event.shiftKey) {
					// 		commentNew(gsn, postSn);
					// 		if (event.preventDefault) {
					// 			event.preventDefault();
					// 		} else {
					// 			event.returnValue = false;
					// 		}
					// 		return;
					// 	}
					// };

					// 將各個關鍵元件放進變量中
					const commendList = document.getElementsByClassName(
						'webview_commendlist'
					)[0]
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
							<span>桌面通知</span>
						</div>

						<div class="form-group">
							<label class="switch">
								<input type="checkbox" data-field="isEnabledNotificationSound" data-type="boolean">
								<span class="slider"></span>
							</label>
							<span>桌面通知的聲音</span>
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

					let pluginConfig = {}
					let autoRefreshTimeoutObj
					const setConfig = (config) => {
						/**
						 * {
						 * 	isEnabledAutoRefresh: false,
						 * 	autoRefreshInterval: 0
						 * 	isInvertedComments: false
						 * 	isEnabledNotification: false,
						 * 	isEnabledNotificationSound: false,
						 * }
						 */
						const {
							isEnabledAutoRefresh,
							autoRefreshInterval,
							isEnabledNotification,
							isEnabledNotificationSound,
						} = config

						if (isEnabledAutoRefresh !== undefined) {
							if (isEnabledAutoRefresh === false) {
								if (autoRefreshTimeoutObj) {
									clearTimeout(autoRefreshTimeoutObj)
									autoRefreshTimeoutObj = undefined
								}
							} else if (isEnabledAutoRefresh === true && autoRefreshInterval) {
								if (autoRefreshTimeoutObj) {
									clearTimeout(autoRefreshTimeoutObj)
									autoRefreshTimeoutObj = undefined
								}

								const autoRefreshTimeoutFn = () => {
									fetchLatestComments()
										.then(async (response) => {
											const expectedNewCommentsCount =
												response.data.commentCount - comments.length

											comments
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
														title: postTitle,
														text: `(#${lastComment.position}) ${lastComment.name}： ${lastComment.text}`,
														highlight: true,
														slient: isEnabledNotificationSound,
														timeout: 5000,
													})
												}
											}
										})
										.finally(() => {
											autoRefreshTimeoutObj = setTimeout(
												autoRefreshTimeoutFn,
												autoRefreshInterval * 1000
											)
										})
								}

								// 重讀一次整個comments列表
								fetchAllComments().then((response) => {
									comments = response.data.comments
									autoRefreshTimeoutObj = setTimeout(
										autoRefreshTimeoutFn,
										autoRefreshInterval * 1000
									)
								})
							}
						}

						const { isInvertedComments } = config

						if (isInvertedComments !== undefined) {
							commendList.classList.toggle(
								'inverted',
								isInvertedComments === true
							)
						}

						pluginConfig = {
							...pluginConfig,
							...config,
						}
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

						pluginConfigStatus.innerHTML = newStatusArr.join('　')

						return pluginConfig
					}

					const fillFormConfig = (config) => {
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

					const storedConfig = loadConfigFromLocalStorage()
					setConfig(storedConfig)
					fillFormConfig(storedConfig)

					hasTakenOver = true
				}
			})
		}
	})
})()
