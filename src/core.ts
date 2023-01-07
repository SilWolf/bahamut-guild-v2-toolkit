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
  TPostCommentNewApiResponse,
} from './types'

import BHGV2_AutoRefresh from './plugins/bhgv2-auto-refresh'
import BHGV2_QTEAlert from './plugins/bhgv2-qte-alert'
import BHGV2_CommentsReverse from './plugins/bhgv2-comments-reverse'
import BHGV2_DarkMode from './plugins/bhgv2-dark-mode'

import pageStyleString from './css/global.css'
import postStyle_post_detail from './css/postDetail.css'
import BHGV2_Rainbow from './plugins/bhgv2-rainbow'
import BHGV2_Dense from './plugins/bhgv2-dense'
import BHGV2_MasterLayout from './plugins/bhgv2-master-layout'
import BHGV2_NotifyOnTitle from './plugins/bhgv2-notify-on-title'
import BHGV2_HighlightMe from './plugins/bhgv2-highlight-me'
import BHGV2_SaveTheThread from './plugins/bhgv2-save-the-thread'
import BHGV2_QuickInput from './plugins/bhgv2-quick-input'
import BHGV2_PasteUploadImage from './plugins/bhgv2-paste-upload-image'

import { convertCTimeToHumanString } from './helpers/display.helper'

declare let nunjucks: any
declare let Guild: any
declare let GuildComment: any
declare let tippy: any

/** 等待DOM準備完成 */

const BHGV2Core: TCoreConstructor = ({ plugins, library }) => {
  const LOG = (message: string, type: 'log' | 'warn' | 'error' = 'log') => {
    ;(console[type] || console.log)(`[巴哈插件2.0] ${message}`)
  }

  const _plugins: TPlugin[] = []
  const _library: Record<string, TLibrary> = {
    ...library,
  }
  const _dom: Record<string, HTMLElement> = {}
  const _config: TCoreConfig = {}
  const _state: TCoreState = {}
  const _error: Record<string, string | undefined> = {}
  const _editorTips: string[] = ['Enter: 發送', 'Shift+Enter: 換行']

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
          prev[key] = _state[key] as any
        }
        return prev
      }, {})
    },
    mutateState: (newValue) => {
      _plugins.forEach((plugin) => plugin.onMutateState?.(newValue))
      Object.entries(newValue).forEach(([key, value]) => {
        _state[key as TCoreStateKey] = value as any
      })
    },

    useLibrary: (name, defaultLibraryIfNotFound) => {
      if (_library[name]) return _library[name]

      _library[name] = defaultLibraryIfNotFound
      return _library[name]
    },
    emit: (eventName, payload): boolean => {
      return (
        _plugins
          .map((plugin) => plugin.onEvent?.(eventName, payload))
          .findIndex((result) => result === false) === -1
      )
    },
    log: LOG,
    DOM: _dom,
    comments: [],
    error: _error,
    setError: (key: string, message: string | undefined) => {
      _error[key] = message
      if (_dom.CommentListErrorContainer) {
        _dom.CommentListErrorContainer.innerHTML = ''

        Object.values(_error)
          .filter((message) => !!message)
          .forEach((message) => {
            const _ele = document.createElement('div')
            _ele.innerText = message as string
            _dom.CommentListErrorContainer.appendChild(_ele)
          })
      }
    },
    removeError: (key: string) => {
      if (_error[key]) {
        _error[key] = undefined
      }
    },
    editorTips: _editorTips,
    toggleEditorTip: (tip: string, isEnable = true) => {
      const foundIndex = _editorTips.indexOf(tip)
      if (isEnable === true && foundIndex === -1) {
        _editorTips.push(tip)
        _dom.EditorTips.innerHTML = _editorTips.join('　')
      } else if (isEnable === false && foundIndex !== -1) {
        _editorTips.splice(foundIndex, 1)
        _dom.EditorTips.innerHTML = _editorTips.join('　')
      }
    },
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

      if (newValue.latestComments && newValue.latestComments.length > 0) {
        const oldValue = core.getStateByNames('gsn', 'sn', 'userInfo')
        const gsn = newValue.gsn || oldValue.gsn
        const sn = newValue.sn || oldValue.sn
        const userInfo = newValue.userInfo || oldValue.userInfo

        const CommentList = core.DOM.CommentList

        const revisedLatestComments = []

        // revisedLatestComments 的存在理由
        // 因為mutateState會將資料往插件傳，所以必須過濾不必要的資料
        // 這裡的邏輯是假如沒法生成element的話，就整個latestComments也不往下傳，以防不必要錯誤

        if (gsn && sn && CommentList) {
          const _createCommentElement = (payload: TComment): HTMLElement => {
            if (!payload.position) {
              payload.position = CORE.DOM.CommentList?.children.length + 1 || 1
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
                  ...payload,
                  text: GuildTextUtil.mentionTagToMarkdown(
                    gsn,
                    payload.text,
                    payload.tags,
                    payload.mentions
                  ),
                },
                marked: GuildTextUtil.markedInstance,
                youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
                user: guildPost.loginUser,
              })
            )[0]
            newElement.classList.add('bhgv2-comment')
            newElement.setAttribute(
              'data-position',
              payload.position.toString()
            )
            const _replyContentUser = newElement.querySelector<HTMLLinkElement>(
              '.reply-content__user'
            )
            if (_replyContentUser) {
              newElement.setAttribute(
                'data-user',
                _replyContentUser.textContent as string
              )
              newElement.setAttribute(
                'data-userid',
                _replyContentUser.href.split('/').pop() as string
              )
            }

            const [positionSpan, ctimeSpan] =
              newElement.querySelectorAll<HTMLDivElement>(
                '.reply_right span.reply_time'
              )
            if (positionSpan) {
              positionSpan.classList.add('bhgv2-comment-position')
            }
            if (ctimeSpan) {
              ctimeSpan.classList.add('bhgv2-comment-ctime')
            }

            const _replyContentContent =
              newElement.querySelector<HTMLDivElement>('.reply-content__cont')
            if (_replyContentContent) {
              const _replayContentExtra = document.createElement('div')
              _replayContentExtra.classList.add('reply-content__override')
              _replyContentContent.insertAdjacentElement(
                'afterend',
                _replayContentExtra
              )
            }

            return newElement
          }

          let _newCommentIndex = 0
          let loopCount = 0

          const { avatarMap = {} } = CORE.getState()
          let isAvatarMapChanged = false

          while (
            _newCommentIndex < newValue.latestComments.length &&
            loopCount < 2000
          ) {
            const _newComment = newValue.latestComments[
              _newCommentIndex
            ] as TCoreStateComment
            const _commentIndex = _newComment.position - 1
            const _storedComment = core.comments[_commentIndex]

            loopCount++
            if (loopCount >= 2000) {
              console.error(
                `infinite loop detected. _newCommentIndex=${_newCommentIndex}, _commentIndex=${_commentIndex}`,
                _newComment,
                _storedComment
              )
              break
            }

            if (_storedComment) {
              // comment which is already created
              if (_newComment.id === _storedComment.id) {
                // refresh content in case there is any update
                if (_storedComment.element && _newComment.payload) {
                  const _oldElement = _storedComment.element
                  const _newElement = _createCommentElement(_newComment.payload)

                  if (!_storedComment.payload) {
                    _storedComment.payload = _newComment.payload
                  }

                  // check if content is changed
                  if (
                    _storedComment.payload.text !== _newComment.payload.text
                  ) {
                    const _oldEle = _oldElement.querySelector(
                      '.reply-content__cont'
                    )
                    const _newEle = _newElement.querySelector(
                      '.reply-content__cont'
                    )
                    if (_oldEle && _newEle) {
                      _oldEle.innerHTML = _newEle.innerHTML
                    }

                    _storedComment.payload.text = _newComment.payload.text
                  }

                  ;['.bhgv2-comment-position'].forEach((query: string) => {
                    const _oldEle = _oldElement.querySelector(query)
                    const _newEle = _newElement.querySelector(query)
                    if (
                      _oldEle &&
                      _newEle &&
                      _oldEle.innerHTML !== _newEle.innerHTML
                    ) {
                      _oldEle.innerHTML = _newEle.innerHTML
                      _storedComment.position = _newComment.position
                    }
                  })
                }

                _newCommentIndex++
              } else {
                let _foundIndex = core.comments.findIndex(
                  (c) => c.id === _newComment.id
                )
                if (_foundIndex === -1) {
                  _foundIndex = core.comments.length
                }

                for (let i = _foundIndex - 1; i >= _commentIndex; i--) {
                  const c = core.comments[i]
                  c.element?.parentNode?.removeChild(c.element)
                  c.element = undefined
                  core.comments.splice(i, 1)
                }
              }
            } else if (_newComment.element) {
              // comment which is created on first loading
              _newComment.element.classList.add('bhgv2-comment')
              const _replyContentUser =
                _newComment.element.querySelector<HTMLLinkElement>(
                  '.reply-content__user'
                )
              let userId = undefined

              if (_replyContentUser) {
                _newComment.element.setAttribute(
                  'data-user',
                  _replyContentUser.textContent as string
                )
                userId = _replyContentUser.href.split('/').pop() as string
                _newComment.element.setAttribute('data-userid', userId)
                _newComment.element.setAttribute(
                  'data-position',
                  _newComment.position.toString()
                )
              }

              if (userId) {
                const _replyAvatarImg = _newComment.element.querySelector(
                  'a.reply-avatar-img img'
                )
                if (_replyAvatarImg) {
                  let avatarUrl = _replyAvatarImg.getAttribute('src')
                  if (avatarUrl) {
                    avatarMap[userId] = avatarUrl
                    isAvatarMapChanged = true
                  }
                }

                if (userId === userInfo?.id) {
                  newValue.isParticipated = true
                }
              }

              const [positionSpan, ctimeSpan] =
                _newComment.element.querySelectorAll<HTMLDivElement>(
                  '.reply_right span.reply_time'
                )
              if (positionSpan) {
                positionSpan.classList.add('bhgv2-comment-position')
              }
              if (ctimeSpan) {
                ctimeSpan.classList.add('bhgv2-comment-ctime')
              }

              const _replyContentContent =
                _newComment.element.querySelector<HTMLDivElement>(
                  '.reply-content__cont'
                )
              if (_replyContentContent) {
                const _replayContentExtra = document.createElement('div')
                _replayContentExtra.classList.add('reply-content__override')
                _replyContentContent.insertAdjacentElement(
                  'afterend',
                  _replayContentExtra
                )
              }

              core.comments[_commentIndex] = _newComment
              revisedLatestComments.push(_newComment)

              _newCommentIndex++
            } else if (_newComment.payload) {
              // new comment with payload
              const _payload = _newComment.payload
              if (avatarMap[_payload.userid]) {
                _payload.propic = avatarMap[_payload.userid]
              } else {
                avatarMap[_payload.userid] = _payload.propic
                isAvatarMapChanged = true
              }

              if (_payload.userid === userInfo?.id) {
                newValue.isParticipated = true
              }

              _newComment.element = _createCommentElement(_payload)
              CommentList.append(_newComment.element)

              core.comments[_commentIndex] = _newComment
              revisedLatestComments.push(_newComment)

              _newCommentIndex++
            } else {
              console.warn('something wrong with a new comment', _newComment)
              _newCommentIndex++
            }
          }

          if (isAvatarMapChanged) {
            newValue.avatarMap = avatarMap
          }
          newValue.commentsCount = core.comments.length
          newValue.latestComments =
            revisedLatestComments.length > 0 ? revisedLatestComments : undefined

          setTimeout(() => {
            const CTimes = core.DOM.CommentList.querySelectorAll(
              '.bhgv2-comment-ctime'
            )
            for (const CTime of CTimes) {
              const ctime = CTime.getAttribute('data-ctime')
              if (ctime) {
                const humanString = convertCTimeToHumanString(ctime)
                if (CTime.innerHTML.indexOf('編輯') !== -1) {
                  CTime.innerHTML = `${humanString} 編輯`
                } else {
                  CTime.innerHTML = humanString
                }
              }
            }
          }, 0)
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
          `[data-config-key='${key}']`
        ) as HTMLInputElement
        if (input) {
          switch (input.getAttribute('data-type')) {
            case 'number':
            case 'text':
              input.value = (newValue[key] as string) || ''
              console.log(newValue[key])
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

  _dom.Title = document.getElementsByTagName('title')[0] as HTMLElement

  _dom.Body = document.getElementsByTagName('body')[0] as HTMLElement
  _dom.Body.classList.add('bhgv2-body')

  _dom.BHBackground = document.getElementById('BH-background') as HTMLElement
  _dom.BHWrapper = document.getElementById('BH-wrapper') as HTMLElement

  _dom.MainContainer = document.getElementsByClassName(
    'main-container_wall-post'
  )[0] as HTMLElement
  _dom.MainContainerHeader = document.getElementsByClassName(
    'main-container_wall-post_header'
  )[0] as HTMLElement
  _dom.MainContainerHeaderMain = document.getElementsByClassName(
    'main-container_wall-post_header_main'
  )[0] as HTMLElement

  _dom.Container = document.getElementsByClassName(
    'inboxfeed'
  )[0] as HTMLElement

  // _dom.MainContainerHeaderSecond = document.createElement('div')
  // _dom.MainContainerHeaderMain.insertAdjacentElement(
  // 	'afterend',
  // 	_dom.MainContainerHeaderSecond
  // )

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

  _dom.CommentListErrorContainer = document.createElement('div')
  _dom.CommentListErrorContainer.classList.add(
    'bhgv2-comment-list-error-container'
  )
  _dom.EditorContainer.insertAdjacentElement(
    'beforebegin',
    _dom.CommentListErrorContainer
  )

  _dom.EditorContainerReplyContent =
    _dom.EditorContainer.getElementsByClassName(
      'reply-content'
    )[0] as HTMLElement
  _dom.EditorContainerReplyContent.classList.add(
    'bhgv2-editor-container-reply-content'
  )

  _dom.Editor = _dom.EditorContainer.getElementsByClassName(
    'reply-input'
  )[0] as HTMLElement
  _dom.Editor.classList.add('bhgv2-editor')

  const oldEditorTextarea = _dom.Editor.getElementsByTagName(
    'textarea'
  )[0] as HTMLElement

  _dom.EditorTextareaWrapper = document.createElement('div')
  _dom.EditorTextareaWrapper.classList.add('bhgv2-editor-textarea-wrapper')

  _dom.EditorTextareaCarbon = document.createElement('div')
  _dom.EditorTextareaCarbon.classList.add('bhgv2-editor-textarea-carbon')

  _dom.EditorTextareaCarbonText = document.createElement('span')
  _dom.EditorTextareaCarbonText.classList.add(
    'bhgv2-editor-textarea-carbon-text'
  )

  _dom.EditorTextareaCarbonTrailing = document.createElement('span')
  _dom.EditorTextareaCarbonTrailing.classList.add(
    'bhgv2-editor-textarea-carbon-trailing'
  )

  _dom.EditorTextareaCarbon.append(
    _dom.EditorTextareaCarbonText,
    _dom.EditorTextareaCarbonTrailing
  )

  _dom.EditorTextarea = document.createElement('textarea')
  _dom.EditorTextarea.classList.add('content-edit')
  _dom.EditorTextarea.classList.add('bhgv2-editor-textarea')
  _dom.EditorTextarea.setAttribute('placeholder', '留言…')
  _dom.EditorTextarea.setAttribute('rows', '4')

  _dom.EditorTextareaWrapper.append(
    _dom.EditorTextareaCarbon,
    _dom.EditorTextarea
  )

  oldEditorTextarea.insertAdjacentElement(
    'afterend',
    _dom.EditorTextareaWrapper
  )
  oldEditorTextarea.parentNode?.removeChild(oldEditorTextarea)

  _dom.EditorTips = document.createElement('div')
  _dom.EditorTips.classList.add('bhgv2-editor-tips')
  _dom.EditorTips.innerHTML = 'Enter: 發送　Shift+Enter: 換行'

  _dom.Editor.append(_dom.EditorTips)

  _dom.EditorContainerReplyContentFooter = document.createElement('div')
  _dom.EditorContainerReplyContentFooter.classList.add(
    'bhgv2-editor-container-reply-content-footer'
  )
  _dom.EditorContainerReplyContent.append(
    _dom.EditorContainerReplyContentFooter
  )

  _dom.EditorContainerReplyContentFooterLeft = document.createElement('div')
  _dom.EditorContainerReplyContentFooterLeft.classList.add(
    'bhgv2-editor-container-reply-content-footer-left'
  )

  _dom.EditorContainerReplyContentFooterRight = document.createElement('div')
  _dom.EditorContainerReplyContentFooterRight.classList.add(
    'bhgv2-editor-container-reply-content-footer-right'
  )

  _dom.EditorContainerReplyContentFooter.append(
    _dom.EditorContainerReplyContentFooterLeft,
    _dom.EditorContainerReplyContentFooterRight
  )

  _dom.ConfigPanelStatus = document.createElement('div')
  _dom.ConfigPanelStatus.classList.add('bhgv2-config-status')

  _dom.ConfigPanelSwitch = document.createElement('a')
  _dom.ConfigPanelSwitch.classList.add('bhgv2-config-switch')
  _dom.ConfigPanelSwitch.innerHTML =
    '<span class="material-icons">settings</span> <span>插件設定</span>'
  _dom.ConfigPanelSwitch.setAttribute('href', '#')

  // _dom.MainContainerHeaderSecond.insertAdjacentElement(
  // 	'beforebegin',
  // 	_dom.ConfigPanelStatus
  // )
  // _dom.MainContainerHeaderSecond.appendChild(_dom.ConfigPanelSwitch)
  _dom.EditorContainerReplyContentFooterLeft.append(_dom.ConfigPanelStatus)
  _dom.EditorContainerReplyContentFooterRight.append(_dom.ConfigPanelSwitch)

  _dom.ConfigPanel = document.createElement('div')
  _dom.ConfigPanel.classList.add('bhgv2-config-panel')
  _dom.EditorContainer.append(_dom.ConfigPanel)

  _dom.ConfigPanelLeft = document.createElement('div')
  _dom.ConfigPanelLeft.classList.add('bhgv2-config-panel-left')

  _dom.ConfigPanelRight = document.createElement('div')
  _dom.ConfigPanelRight.classList.add('bhgv2-config-panel-right')

  _dom.ConfigPanel.append(_dom.ConfigPanelLeft, _dom.ConfigPanelRight)

  _dom.ConfigPanelLeftPluginListingWrapper = document.createElement('div')
  _dom.ConfigPanelLeftPluginListingWrapper.classList.add(
    'bhgv2-config-panel-left-plugin-listing-wrapper'
  )

  _dom.ConfigPanelLeftPluginListing = document.createElement('ul')
  _dom.ConfigPanelLeftPluginListing.classList.add(
    'bhgv2-config-panel-left-plugin-listing'
  )
  _dom.ConfigPanelLeftPluginListingWrapper.append(
    _dom.ConfigPanelLeftPluginListing
  )

  _dom.ConfigPanelLeftPluginFooter = document.createElement('div')
  _dom.ConfigPanelLeftPluginFooter.classList.add(
    'bhgv2-config-panel-left-plugin-footer'
  )
  // _dom.ConfigPanelLeftPluginFooter.innerHTML = 'v0.8.0 (檢查更新)'

  _dom.ConfigPanelLeft.append(
    _dom.ConfigPanelLeftPluginListingWrapper,
    _dom.ConfigPanelLeftPluginFooter
  )

  _dom.ConfigForm = document.createElement('form')
  _dom.ConfigForm.classList.add('bhgv2-config-form')
  _dom.ConfigPanelRight.append(_dom.ConfigForm)

  _dom.ConfigFormContent = document.createElement('div')
  _dom.ConfigFormContent.classList.add('bhgv2-config-form-content')

  _dom.ConfigFormMessage = document.createElement('div')
  _dom.ConfigFormMessage.classList.add('bhgv2-config-form-message')

  _dom.ConfigFormFooter = document.createElement('div')
  _dom.ConfigFormFooter.classList.add('bhgv2-config-form-footer')

  _dom.ConfigFormActions = document.createElement('div')
  _dom.ConfigFormActions.classList.add('bhgv2-config-form-actions')

  _dom.ConfigForm.append(
    _dom.ConfigFormContent,
    _dom.ConfigFormFooter,
    _dom.ConfigFormActions
  )

  _dom.ConfigFormFooterSaveAsDefault = document.createElement('button')
  _dom.ConfigFormFooterSaveAsDefault.innerHTML = '設為預設值'
  _dom.ConfigFormFooterSave = document.createElement('button')
  _dom.ConfigFormFooterSave.innerHTML = '儲存'
  _dom.ConfigFormFooter.append(
    _dom.ConfigFormFooterSaveAsDefault,
    _dom.ConfigFormFooterSave,
    _dom.ConfigFormMessage
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
            `插件 ${_plugin.pluginName} 的設定 ${key} 的 defaultValue 為空，請設定。`
          )
        }
      })

      _plugins.push(_plugin)
    } catch (e: any) {
      LOG(`載入插件失敗, ${e.toString()}`, 'error')
    }
  })

  // 將所有插件的css塞進HeadStyle中
  _dom.HeadStyle.innerHTML = _plugins
    .reduce<string[]>((prev, _plugin) => [...prev, ...(_plugin.css || [])], [])
    .join('\n\n')

  // 更新設定版面
  _dom.ConfigPanelLeftPluginListing.innerHTML = ''
  _dom.ConfigFormContent.innerHTML = ''

  const scrollToSectionFn = (pluginName: string) => (event: MouseEvent) => {
    event.preventDefault()

    const target = _dom.ConfigFormContent.querySelector(
      `[data-plugin-name="${pluginName}"]`
    ) as HTMLElement
    if (target && target.offsetTop !== undefined) {
      _dom.ConfigFormContent.scrollTo({
        top: target.offsetTop,
        behavior: 'smooth',
      })
    }

    return false
  }

  _plugins.forEach(({ label, pluginName, configs, actions, configLayout }) => {
    if (!configs && !actions) {
      return
    }

    const _pluginLi = document.createElement('li')
    const _pluginA = document.createElement('a')
    _pluginA.setAttribute('href', '#')
    _pluginA.innerHTML = label || pluginName
    _pluginA.addEventListener('click', scrollToSectionFn(pluginName))
    _pluginLi.append(_pluginA)

    _dom.ConfigPanelLeftPluginListing.append(_pluginLi)

    const _sectionDiv = document.createElement('div')
    _sectionDiv.classList.add('bhgv2-config-form-section')
    _sectionDiv.setAttribute('data-plugin-name', pluginName)

    const _sectionTitle = document.createElement('h4')
    _sectionTitle.classList.add('bhgv2-config-form-title')
    _sectionTitle.innerHTML = `【${label || pluginName}】`
    _sectionDiv.append(_sectionTitle)

    // 建立插件設定的介面
    if (configs) {
      const _configLayout = configLayout || [
        configs.map((_config) => _config.key),
      ]

      for (const row of _configLayout) {
        const _rowDiv = document.createElement('div')
        _rowDiv.classList.add('bhgv2-config-form-row')

        for (const col of row) {
          const configItem = configs.find((_config) => _config.key === col)
          if (!configItem) {
            return
          }

          const _colDiv = document.createElement('div')
          _colDiv.classList.add('bhgv2-config-form-col')

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
            case 'select':
              inputElement = document.createElement('select')

              for (let option of configItem.options || []) {
                const _optionEle = document.createElement('option')
                _optionEle.setAttribute('value', option.value)
                _optionEle.innerHTML = option.label
                inputElement.append(_optionEle)
              }

              inputWrapperElement.append(inputElement)
              break
          }

          inputWrapperElement.setAttribute('for', configItem.key)

          inputElement.setAttribute('id', configItem.key)
          inputElement.setAttribute('data-config-key', configItem.key)
          inputElement.setAttribute('data-type', configItem.dataType)
          inputWrapperElement.prepend(inputElement)

          const suffixLabel = document.createElement('span')
          suffixLabel.innerHTML = configItem.suffixLabel || ''

          _colDiv.append(prefixLabel, inputWrapperElement, suffixLabel)

          _rowDiv.append(_colDiv)
        }

        _sectionDiv.append(_rowDiv)
      }
    }

    if (actions) {
      //建立插件動作的介面
      const _actionLayout = configLayout || [
        actions.map((_action) => _action.key),
      ]

      for (const row of _actionLayout) {
        const _rowDiv = document.createElement('div')

        for (const col of row) {
          const actionItem = actions.find((_action) => _action.key === col)
          if (!actionItem) {
            return
          }

          const buttonElement = document.createElement('button')
          buttonElement.innerHTML = actionItem.label
          buttonElement.addEventListener('click', (e) => {
            e.preventDefault()
            actionItem.onClick(e)
          })

          _rowDiv.append(buttonElement)
        }

        _sectionDiv.append(_rowDiv)
      }
    }

    _dom.ConfigFormContent.append(_sectionDiv)
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
  $(_dom.Container).off('input focus', 'textarea')
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
      form.querySelectorAll<HTMLInputElement>('[data-config-key]')
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

  CORE.DOM.EditorTextarea.addEventListener(
    'keydown',
    (event: KeyboardEvent) => {
      const key = event.key
      const textarea = event.currentTarget as HTMLTextAreaElement

      const canContinue = CORE.emit('textarea-keydown', {
        event,
      })

      if (!canContinue) {
        return
      }

      if (key === 'Enter' && !event.shiftKey) {
        event.preventDefault()

        const content = textarea.value || ''
        if (content.match(/^\s*$/)) {
          Dialogify.alert('請輸入內容')
          return false
        }

        const { gsn, sn } = CORE.getState()
        if (!gsn || !sn) {
          Dialogify.alert('GSN或SN是空值！')
          return false
        }

        textarea.setAttribute('disabled', 'true')

        const formData = new FormData()
        formData.append('gsn', gsn.toString())
        formData.append('messageId', sn.toString())
        formData.append('content', content)
        formData.append('legacy', '1')

        const csrf = new Bahamut.Csrf()
        csrf.setCookie()

        fetch('https://api.gamer.com.tw/guild/v1/comment_new.php', {
          method: 'post',
          body: formData,
          headers: csrf.getFetchHeaders(),
          credentials: 'include',
        })
          .then((res) => res.json())
          .then((json: TPostCommentNewApiResponse) => {
            if (json.error) {
              Dialogify.alert(json.error.message)
              return
            }

            CORE.mutateState({
              latestComments: [
                {
                  id: json.data.commentId,
                  position: (CORE.DOM.CommentList.children.length || 0) + 1,
                  payload: json.data.commentData,
                },
              ],
              isUserAction: true,
            })

            textarea.value = ''
          })
          .finally(() => {
            textarea.removeAttribute('disabled')
            textarea.focus()
          })

        return
      }
    }
  )

  CORE.DOM.EditorTextarea.addEventListener('input', (event) => {
    const CarbonText = CORE.DOM.EditorTextareaCarbonText
    if (CarbonText) {
      const textarea = event.currentTarget as HTMLTextAreaElement
      const content = textarea.value

      CarbonText.innerHTML = content.replace(/\n/g, '<br />')
    }

    CORE.emit('textarea-input', {
      event,
    })
  })

  // Override GuildComment.commentEdit
  GuildComment.commentEdit = (
    gsn: string,
    postSn: string,
    commentSn: string
  ) => {
    tippy.hideAll()

    const stringCommentSn = commentSn.toString()
    const _commentIndex = CORE.comments.findIndex(
      (c) => c.id === stringCommentSn
    )
    if (_commentIndex === -1) {
      return
    }

    const _comment = CORE.comments[_commentIndex]
    const _element = _comment.element
    if (!_element) {
      return
    }

    const _overrideArea = _element.querySelector('.reply-content__override')
    if (!_overrideArea) {
      return
    }

    fetch(
      `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${postSn}&commentId=${commentSn}`,
      { credentials: 'include' }
    )
      .then((resp) => {
        return resp.json()
      })
      .then((json) => {
        if (json.error) {
          Dialogify.alert(json.error.message)
          return
        }
        let commentData = json.data.comments[0]
        let commentText = GuildTextUtil.prepareEditContent(
          commentData.text,
          commentData.mentions
        )
        nunjucks.configure({ autoescape: false })
        let editHtml = nunjucks.render('comment_form_edit.njk.html', {
          gsn: gsn,
          postSn: postSn,
          commentSn: commentSn,
          commentText: commentText,
        })

        _element.classList.toggle('editing', true)
        _overrideArea.innerHTML = editHtml
        _overrideArea.querySelector('textarea')?.focus()

        // new GuildEmoticon(commentSelector + ' .reply-content', gsn)
      })
      .catch((reason) => {
        Dialogify.alert(reason)
      })
  }

  // Override GuildComment.commentEditCancel
  GuildComment.commentEditCancel = (postSn: string, commentSn: string) => {
    tippy.hideAll()

    const stringCommentSn = commentSn.toString()
    const _commentIndex = CORE.comments.findIndex(
      (c) => c.id === stringCommentSn
    )
    if (_commentIndex === -1) {
      return
    }

    const _comment = CORE.comments[_commentIndex]
    const _element = _comment.element
    if (!_element) {
      return
    }

    const _overrideArea = _element.querySelector('.reply-content__override')
    if (!_overrideArea) {
      return
    }

    _element.classList.toggle('editing', false)
    _overrideArea.innerHTML = ''
  }

  // Override GuildComment.commentEditConfirm
  GuildComment.commentEditConfirm = (
    gsn: string,
    postSn: string,
    commentSn: string
  ) => {
    tippy.hideAll()

    const stringCommentSn = commentSn.toString()
    const _commentIndex = CORE.comments.findIndex(
      (c) => c.id === stringCommentSn
    )
    if (_commentIndex === -1) {
      return
    }

    const _comment = CORE.comments[_commentIndex]
    const _element = _comment.element
    if (!_element) {
      return
    }

    const _overrideArea = _element.querySelector('.reply-content__override')
    if (!_overrideArea) {
      return
    }

    const _content = _element.querySelector(
      '.reply-content__cont'
    ) as HTMLDivElement
    if (!_content) {
      return
    }

    const _editor = _element.querySelector(
      'textarea.reply-content__edit'
    ) as HTMLTextAreaElement
    if (!_editor) {
      return
    }

    let content = _editor.value || ''
    if (content.match(/^\s*$/)) {
      Dialogify.alert('請輸入內容')
      _editor.focus()
      return
    }
    if (GuildTextUtil.countLimit(_editor, 300)) {
      return
    }

    let csrf = new Bahamut.Csrf()
    csrf.setCookie()
    let formData = new FormData()
    formData.append('gsn', gsn)
    formData.append('messageId', postSn)
    formData.append('commentId', commentSn)
    formData.append('content', content)
    formData.append('legacy', '1')
    fetch('https://api.gamer.com.tw/guild/v1/comment_edit.php', {
      method: 'post',
      body: formData,
      headers: csrf.getFetchHeaders(),
      credentials: 'include',
    }).then((resp) => {
      resp.json().then((json) => {
        if (json.error) {
          Dialogify.alert(json.error.message)
          return
        }
        let commentData = json.data.commentData
        commentData.position = _comment.position
        commentData.text = GuildTextUtil.mentionTagToMarkdown(
          gsn,
          commentData.text,
          commentData.tags,
          commentData.mentions
        )
        let post = { id: postSn, to: { gsn: gsn } }

        nunjucks.configure({ autoescape: false })
        const _newElement: HTMLElement = $(
          nunjucks.render('comment.njk.html', {
            post: post,
            comment: commentData,
            marked: GuildTextUtil.markedInstance,
            youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
            user: guildPost.loginUser,
          })
        )[0]

        const _newContent = _newElement.querySelector(
          '.reply-content__cont'
        ) as HTMLDivElement

        _content.innerHTML = _newContent.innerHTML
        if (_comment.payload) {
          _comment.payload.text = commentData.text
        }

        _element.classList.toggle('editing', false)
        _overrideArea.innerHTML = ''
      })
    })
  }

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
        ).map<TCoreStateComment>((element, index) => ({
          id: element.getAttribute('data-csn') as string,
          position: index + 1,
          element,
        }))

        CORE.mutateState({
          latestComments: _newComments,
          isInit: true,
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
        plugins: [
          BHGV2_AutoRefresh,
          BHGV2_QTEAlert,
          BHGV2_Dense,
          BHGV2_MasterLayout,
          BHGV2_CommentsReverse,
          BHGV2_HighlightMe,
          BHGV2_NotifyOnTitle,
          BHGV2_Rainbow,
          // BHGV2_QuickInput,
          BHGV2_DarkMode,
          // BHGV2_SaveTheThread,
          BHGV2_PasteUploadImage,
        ],
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
