// ==UserScript==
// @name            巴哈姆特公會2.0插件
// @namespace       https://silwolf.io
// @version         0.10.0
// @description     巴哈姆特公會2.0插件
// @author          銀狼(silwolf167)
// @contributors    海角－沙鷗(jason21716)
// @include         /guild.gamer.com.tw/post_detail.php
// @grant           GM_notification
// @updateUrl       https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/dist/bahamut-guild-v2-toolkit.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 776:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const bhgv2_auto_refresh_1 = __importDefault(__webpack_require__(503));
const bhgv2_qte_alert_1 = __importDefault(__webpack_require__(557));
const bhgv2_comments_reverse_1 = __importDefault(__webpack_require__(547));
const bhgv2_dark_mode_1 = __importDefault(__webpack_require__(340));
const global_css_1 = __importDefault(__webpack_require__(440));
const postDetail_css_1 = __importDefault(__webpack_require__(507));
const bhgv2_rainbow_1 = __importDefault(__webpack_require__(87));
const bhgv2_dense_1 = __importDefault(__webpack_require__(115));
const bhgv2_master_layout_1 = __importDefault(__webpack_require__(739));
const bhgv2_notify_on_title_1 = __importDefault(__webpack_require__(285));
const bhgv2_highlight_me_1 = __importDefault(__webpack_require__(898));
const bhgv2_paste_upload_image_1 = __importDefault(__webpack_require__(923));
const display_helper_1 = __webpack_require__(201);
/** 等待DOM準備完成 */
const BHGV2Core = ({ plugins, library }) => {
    const LOG = (message, type = 'log') => {
        ;
        (console[type] || console.log)(`[巴哈插件2.0] ${message}`);
    };
    const _plugins = [];
    const _library = {
        ...library,
    };
    const _dom = {};
    const _config = {};
    const _state = {};
    const _error = {};
    const _editorTips = ['Enter: 發送', 'Shift+Enter: 換行'];
    const CORE = {
        getConfig: () => _config,
        getConfigByNames: (...names) => {
            return names.reduce((prev, key) => {
                if (_config[key] !== undefined) {
                    prev[key] = _config[key];
                }
                return prev;
            }, {});
        },
        mutateConfig: (newValue) => {
            _plugins.forEach((plugin) => plugin.onMutateConfig?.(newValue));
            Object.entries(newValue).forEach(([key, value]) => {
                _config[key] = value;
            });
        },
        getState: () => _state,
        getStateByNames: (...names) => {
            return names.reduce((prev, key) => {
                if (_state[key] !== undefined) {
                    prev[key] = _state[key];
                }
                return prev;
            }, {});
        },
        mutateState: (newValue) => {
            _plugins.forEach((plugin) => plugin.onMutateState?.(newValue));
            Object.entries(newValue).forEach(([key, value]) => {
                _state[key] = value;
            });
        },
        useLibrary: (name, defaultLibraryIfNotFound) => {
            if (_library[name])
                return _library[name];
            _library[name] = defaultLibraryIfNotFound;
            return _library[name];
        },
        emit: (eventName, payload) => {
            return (_plugins
                .map((plugin) => plugin.onEvent?.(eventName, payload))
                .findIndex((result) => result === false) === -1);
        },
        log: LOG,
        DOM: _dom,
        comments: [],
        error: _error,
        setError: (key, message) => {
            _error[key] = message;
            if (_dom.CommentListErrorContainer) {
                _dom.CommentListErrorContainer.innerHTML = '';
                Object.values(_error)
                    .filter((message) => !!message)
                    .forEach((message) => {
                    const _ele = document.createElement('div');
                    _ele.innerText = message;
                    _dom.CommentListErrorContainer.appendChild(_ele);
                });
            }
        },
        removeError: (key) => {
            if (_error[key]) {
                _error[key] = undefined;
            }
        },
        editorTips: _editorTips,
        toggleEditorTip: (tip, isEnable = true) => {
            const foundIndex = _editorTips.indexOf(tip);
            if (isEnable === true && foundIndex === -1) {
                _editorTips.push(tip);
                _dom.EditorTips.innerHTML = _editorTips.join('　');
            }
            else if (isEnable === false && foundIndex !== -1) {
                _editorTips.splice(foundIndex, 1);
                _dom.EditorTips.innerHTML = _editorTips.join('　');
            }
        },
    };
    const _CorePlugin = (core) => {
        const _plugin = {
            pluginName: 'BHGV2Core',
            prefix: 'BHGV2Core',
        };
        _plugin.onMutateState = (newValue) => {
            if (newValue.gsn !== undefined || newValue.sn !== undefined) {
                const oldValue = core.getStateByNames('gsn', 'sn');
                const gsn = newValue.gsn || oldValue.gsn;
                const sn = newValue.sn || oldValue.sn;
                if (gsn && sn) {
                    newValue.postApi = `https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=${gsn}&messageId=${sn}`;
                    newValue.commentListApi = `https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${sn}`;
                }
            }
            if (newValue.latestComments && newValue.latestComments.length > 0) {
                const oldValue = core.getStateByNames('gsn', 'sn', 'userInfo');
                const gsn = newValue.gsn || oldValue.gsn;
                const sn = newValue.sn || oldValue.sn;
                const userInfo = newValue.userInfo || oldValue.userInfo;
                const CommentList = core.DOM.CommentList;
                const revisedLatestComments = [];
                // revisedLatestComments 的存在理由
                // 因為mutateState會將資料往插件傳，所以必須過濾不必要的資料
                // 這裡的邏輯是假如沒法生成element的話，就整個latestComments也不往下傳，以防不必要錯誤
                if (gsn && sn && CommentList) {
                    const _createCommentElement = (payload) => {
                        if (!payload.position) {
                            payload.position = CORE.DOM.CommentList?.children.length + 1 || 1;
                        }
                        // 生成comment的element
                        const newElement = $(nunjucks.render('comment.njk.html', {
                            post: {
                                id: sn,
                                commentCount: 0,
                                to: { gsn: gsn },
                            },
                            comment: {
                                ...payload,
                                text: GuildTextUtil.mentionTagToMarkdown(gsn, payload.text, payload.tags, payload.mentions),
                            },
                            marked: GuildTextUtil.markedInstance,
                            youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
                            user: guildPost.loginUser,
                        }))[0];
                        newElement.classList.add('bhgv2-comment');
                        newElement.setAttribute('data-position', payload.position.toString());
                        const _replyContentUser = newElement.querySelector('.reply-content__user');
                        if (_replyContentUser) {
                            newElement.setAttribute('data-user', _replyContentUser.textContent);
                            newElement.setAttribute('data-userid', _replyContentUser.href.split('/').pop());
                        }
                        const [positionSpan, ctimeSpan] = newElement.querySelectorAll('.reply_right span.reply_time');
                        if (positionSpan) {
                            positionSpan.classList.add('bhgv2-comment-position');
                        }
                        if (ctimeSpan) {
                            ctimeSpan.classList.add('bhgv2-comment-ctime');
                        }
                        const _replyContentContent = newElement.querySelector('.reply-content__cont');
                        if (_replyContentContent) {
                            const _replayContentExtra = document.createElement('div');
                            _replayContentExtra.classList.add('reply-content__override');
                            _replyContentContent.insertAdjacentElement('afterend', _replayContentExtra);
                        }
                        return newElement;
                    };
                    let _newCommentIndex = 0;
                    let loopCount = 0;
                    const { avatarMap = {} } = CORE.getState();
                    let isAvatarMapChanged = false;
                    while (_newCommentIndex < newValue.latestComments.length &&
                        loopCount < 2000) {
                        const _newComment = newValue.latestComments[_newCommentIndex];
                        const _commentIndex = _newComment.position - 1;
                        const _storedComment = core.comments[_commentIndex];
                        loopCount++;
                        if (loopCount >= 2000) {
                            console.error(`infinite loop detected. _newCommentIndex=${_newCommentIndex}, _commentIndex=${_commentIndex}`, _newComment, _storedComment);
                            break;
                        }
                        if (_storedComment) {
                            // comment which is already created
                            if (_newComment.id === _storedComment.id) {
                                // refresh content in case there is any update
                                if (_storedComment.element && _newComment.payload) {
                                    const _oldElement = _storedComment.element;
                                    const _newElement = _createCommentElement(_newComment.payload);
                                    if (!_storedComment.payload) {
                                        _storedComment.payload = _newComment.payload;
                                    }
                                    // check if content is changed
                                    if (_storedComment.payload.text !== _newComment.payload.text) {
                                        const _oldEle = _oldElement.querySelector('.reply-content__cont');
                                        const _newEle = _newElement.querySelector('.reply-content__cont');
                                        if (_oldEle && _newEle) {
                                            _oldEle.innerHTML = _newEle.innerHTML;
                                        }
                                        _storedComment.payload.text = _newComment.payload.text;
                                    }
                                    ;
                                    ['.bhgv2-comment-position'].forEach((query) => {
                                        const _oldEle = _oldElement.querySelector(query);
                                        const _newEle = _newElement.querySelector(query);
                                        if (_oldEle &&
                                            _newEle &&
                                            _oldEle.innerHTML !== _newEle.innerHTML) {
                                            _oldEle.innerHTML = _newEle.innerHTML;
                                            _storedComment.position = _newComment.position;
                                        }
                                    });
                                }
                                _newCommentIndex++;
                            }
                            else {
                                let _foundIndex = core.comments.findIndex((c) => c.id === _newComment.id);
                                if (_foundIndex === -1) {
                                    _foundIndex = core.comments.length;
                                }
                                for (let i = _foundIndex - 1; i >= _commentIndex; i--) {
                                    const c = core.comments[i];
                                    c.element?.parentNode?.removeChild(c.element);
                                    c.element = undefined;
                                    core.comments.splice(i, 1);
                                }
                            }
                        }
                        else if (_newComment.element) {
                            // comment which is created on first loading
                            _newComment.element.classList.add('bhgv2-comment');
                            const _replyContentUser = _newComment.element.querySelector('.reply-content__user');
                            let userId = undefined;
                            if (_replyContentUser) {
                                _newComment.element.setAttribute('data-user', _replyContentUser.textContent);
                                userId = _replyContentUser.href.split('/').pop();
                                _newComment.element.setAttribute('data-userid', userId);
                                _newComment.element.setAttribute('data-position', _newComment.position.toString());
                            }
                            if (userId) {
                                const _replyAvatarImg = _newComment.element.querySelector('a.reply-avatar-img img');
                                if (_replyAvatarImg) {
                                    let avatarUrl = _replyAvatarImg.getAttribute('src');
                                    if (avatarUrl) {
                                        avatarMap[userId] = avatarUrl;
                                        isAvatarMapChanged = true;
                                    }
                                }
                                if (userId === userInfo?.id) {
                                    newValue.isParticipated = true;
                                }
                            }
                            const [positionSpan, ctimeSpan] = _newComment.element.querySelectorAll('.reply_right span.reply_time');
                            if (positionSpan) {
                                positionSpan.classList.add('bhgv2-comment-position');
                            }
                            if (ctimeSpan) {
                                ctimeSpan.classList.add('bhgv2-comment-ctime');
                            }
                            const _replyContentContent = _newComment.element.querySelector('.reply-content__cont');
                            if (_replyContentContent) {
                                const _replayContentExtra = document.createElement('div');
                                _replayContentExtra.classList.add('reply-content__override');
                                _replyContentContent.insertAdjacentElement('afterend', _replayContentExtra);
                            }
                            core.comments[_commentIndex] = _newComment;
                            revisedLatestComments.push(_newComment);
                            _newCommentIndex++;
                        }
                        else if (_newComment.payload) {
                            // new comment with payload
                            const _payload = _newComment.payload;
                            if (avatarMap[_payload.userid]) {
                                _payload.propic = avatarMap[_payload.userid];
                            }
                            else {
                                avatarMap[_payload.userid] = _payload.propic;
                                isAvatarMapChanged = true;
                            }
                            if (_payload.userid === userInfo?.id) {
                                newValue.isParticipated = true;
                            }
                            _newComment.element = _createCommentElement(_payload);
                            CommentList.append(_newComment.element);
                            core.comments[_commentIndex] = _newComment;
                            revisedLatestComments.push(_newComment);
                            _newCommentIndex++;
                        }
                        else {
                            console.warn('something wrong with a new comment', _newComment);
                            _newCommentIndex++;
                        }
                    }
                    if (isAvatarMapChanged) {
                        newValue.avatarMap = avatarMap;
                    }
                    newValue.commentsCount = core.comments.length;
                    newValue.latestComments =
                        revisedLatestComments.length > 0 ? revisedLatestComments : undefined;
                    setTimeout(() => {
                        const CTimes = core.DOM.CommentList.querySelectorAll('.bhgv2-comment-ctime');
                        for (const CTime of CTimes) {
                            const ctime = CTime.getAttribute('data-ctime');
                            if (ctime) {
                                const humanString = display_helper_1.convertCTimeToHumanString(ctime);
                                if (CTime.innerHTML.indexOf('編輯') !== -1) {
                                    CTime.innerHTML = `${humanString} 編輯`;
                                }
                                else {
                                    CTime.innerHTML = humanString;
                                }
                            }
                        }
                    }, 0);
                }
            }
        };
        _plugin.onMutateConfig = (newValue) => {
            const form = core.DOM.ConfigFormContent;
            if (!form) {
                return;
            }
            Object.keys(newValue).forEach((key) => {
                const input = form.querySelector(`[data-config-key='${key}']`);
                if (input) {
                    switch (input.getAttribute('data-type')) {
                        case 'number':
                        case 'text':
                            input.value = newValue[key] || '';
                            console.log(newValue[key]);
                            break;
                        case 'boolean':
                            input.checked = newValue[key] || false;
                            break;
                    }
                }
            });
        };
        _plugin.css = [global_css_1.default];
        if (location && location.href.includes('post_detail.php')) {
            _plugin.css.push(postDetail_css_1.default);
        }
        return _plugin;
    };
    // ====================================================================================================
    // 主程序
    // ====================================================================================================
    // 初始化 DOM 元件
    _dom.Head = document.getElementsByTagName('head')[0];
    _dom.HeadStyle = document.createElement('style');
    _dom.Head.appendChild(_dom.HeadStyle);
    if (_dom.Head) {
        _dom.HeadStyle = document.createElement('style');
        _dom.HeadStyle.innerHTML = global_css_1.default;
        if (location && location.href.includes('post_detail.php')) {
            _dom.HeadStyle.innerHTML += postDetail_css_1.default;
        }
        _dom.Head.appendChild(_dom.HeadStyle);
    }
    _dom.Title = document.getElementsByTagName('title')[0];
    _dom.Body = document.getElementsByTagName('body')[0];
    _dom.Body.classList.add('bhgv2-body');
    _dom.BHBackground = document.getElementById('BH-background');
    _dom.BHWrapper = document.getElementById('BH-wrapper');
    _dom.MainContainer = document.getElementsByClassName('main-container_wall-post')[0];
    _dom.MainContainerHeader = document.getElementsByClassName('main-container_wall-post_header')[0];
    _dom.MainContainerHeaderMain = document.getElementsByClassName('main-container_wall-post_header_main')[0];
    _dom.Container = document.getElementsByClassName('inboxfeed')[0];
    // _dom.MainContainerHeaderSecond = document.createElement('div')
    // _dom.MainContainerHeaderMain.insertAdjacentElement(
    // 	'afterend',
    // 	_dom.MainContainerHeaderSecond
    // )
    _dom.CommentListOuter = document.getElementsByClassName('webview_commendlist')[0];
    _dom.CommentListOuter.classList.add('bhgv2-comment-list-outer');
    _dom.CommentList = _dom.CommentListOuter.firstElementChild;
    _dom.CommentList.classList.add('bhgv2-comment-list');
    _dom.EditorContainer = _dom.CommentListOuter.getElementsByClassName('c-reply__editor')[0];
    _dom.EditorContainer.classList.add('bhgv2-editor-container');
    _dom.CommentListErrorContainer = document.createElement('div');
    _dom.CommentListErrorContainer.classList.add('bhgv2-comment-list-error-container');
    _dom.EditorContainer.insertAdjacentElement('beforebegin', _dom.CommentListErrorContainer);
    _dom.EditorContainerReplyContent =
        _dom.EditorContainer.getElementsByClassName('reply-content')[0];
    _dom.EditorContainerReplyContent.classList.add('bhgv2-editor-container-reply-content');
    _dom.Editor = _dom.EditorContainer.getElementsByClassName('reply-input')[0];
    _dom.Editor.classList.add('bhgv2-editor');
    const oldEditorTextarea = _dom.Editor.getElementsByTagName('textarea')[0];
    _dom.EditorTextareaWrapper = document.createElement('div');
    _dom.EditorTextareaWrapper.classList.add('bhgv2-editor-textarea-wrapper');
    _dom.EditorTextareaCarbon = document.createElement('div');
    _dom.EditorTextareaCarbon.classList.add('bhgv2-editor-textarea-carbon');
    _dom.EditorTextareaCarbonText = document.createElement('span');
    _dom.EditorTextareaCarbonText.classList.add('bhgv2-editor-textarea-carbon-text');
    _dom.EditorTextareaCarbonTrailing = document.createElement('span');
    _dom.EditorTextareaCarbonTrailing.classList.add('bhgv2-editor-textarea-carbon-trailing');
    _dom.EditorTextareaCarbon.append(_dom.EditorTextareaCarbonText, _dom.EditorTextareaCarbonTrailing);
    _dom.EditorTextarea = document.createElement('textarea');
    _dom.EditorTextarea.classList.add('content-edit');
    _dom.EditorTextarea.classList.add('bhgv2-editor-textarea');
    _dom.EditorTextarea.setAttribute('placeholder', '留言…');
    _dom.EditorTextarea.setAttribute('rows', '4');
    _dom.EditorTextareaWrapper.append(_dom.EditorTextareaCarbon, _dom.EditorTextarea);
    oldEditorTextarea.insertAdjacentElement('afterend', _dom.EditorTextareaWrapper);
    oldEditorTextarea.parentNode?.removeChild(oldEditorTextarea);
    _dom.EditorTips = document.createElement('div');
    _dom.EditorTips.classList.add('bhgv2-editor-tips');
    _dom.EditorTips.innerHTML = 'Enter: 發送　Shift+Enter: 換行';
    _dom.Editor.append(_dom.EditorTips);
    _dom.EditorContainerReplyContentFooter = document.createElement('div');
    _dom.EditorContainerReplyContentFooter.classList.add('bhgv2-editor-container-reply-content-footer');
    _dom.EditorContainerReplyContent.append(_dom.EditorContainerReplyContentFooter);
    _dom.EditorContainerReplyContentFooterLeft = document.createElement('div');
    _dom.EditorContainerReplyContentFooterLeft.classList.add('bhgv2-editor-container-reply-content-footer-left');
    _dom.EditorContainerReplyContentFooterRight = document.createElement('div');
    _dom.EditorContainerReplyContentFooterRight.classList.add('bhgv2-editor-container-reply-content-footer-right');
    _dom.EditorContainerReplyContentFooter.append(_dom.EditorContainerReplyContentFooterLeft, _dom.EditorContainerReplyContentFooterRight);
    _dom.ConfigPanelStatus = document.createElement('div');
    _dom.ConfigPanelStatus.classList.add('bhgv2-config-status');
    _dom.ConfigPanelSwitch = document.createElement('a');
    _dom.ConfigPanelSwitch.classList.add('bhgv2-config-switch');
    _dom.ConfigPanelSwitch.innerHTML =
        '<span class="material-icons">settings</span> <span>插件設定</span>';
    _dom.ConfigPanelSwitch.setAttribute('href', '#');
    // _dom.MainContainerHeaderSecond.insertAdjacentElement(
    // 	'beforebegin',
    // 	_dom.ConfigPanelStatus
    // )
    // _dom.MainContainerHeaderSecond.appendChild(_dom.ConfigPanelSwitch)
    _dom.EditorContainerReplyContentFooterLeft.append(_dom.ConfigPanelStatus);
    _dom.EditorContainerReplyContentFooterRight.append(_dom.ConfigPanelSwitch);
    _dom.ConfigPanel = document.createElement('div');
    _dom.ConfigPanel.classList.add('bhgv2-config-panel');
    _dom.EditorContainer.append(_dom.ConfigPanel);
    _dom.ConfigPanelLeft = document.createElement('div');
    _dom.ConfigPanelLeft.classList.add('bhgv2-config-panel-left');
    _dom.ConfigPanelRight = document.createElement('div');
    _dom.ConfigPanelRight.classList.add('bhgv2-config-panel-right');
    _dom.ConfigPanel.append(_dom.ConfigPanelLeft, _dom.ConfigPanelRight);
    _dom.ConfigPanelLeftPluginListingWrapper = document.createElement('div');
    _dom.ConfigPanelLeftPluginListingWrapper.classList.add('bhgv2-config-panel-left-plugin-listing-wrapper');
    _dom.ConfigPanelLeftPluginListing = document.createElement('ul');
    _dom.ConfigPanelLeftPluginListing.classList.add('bhgv2-config-panel-left-plugin-listing');
    _dom.ConfigPanelLeftPluginListingWrapper.append(_dom.ConfigPanelLeftPluginListing);
    _dom.ConfigPanelLeftPluginFooter = document.createElement('div');
    _dom.ConfigPanelLeftPluginFooter.classList.add('bhgv2-config-panel-left-plugin-footer');
    // _dom.ConfigPanelLeftPluginFooter.innerHTML = 'v0.8.0 (檢查更新)'
    _dom.ConfigPanelLeft.append(_dom.ConfigPanelLeftPluginListingWrapper, _dom.ConfigPanelLeftPluginFooter);
    _dom.ConfigForm = document.createElement('form');
    _dom.ConfigForm.classList.add('bhgv2-config-form');
    _dom.ConfigPanelRight.append(_dom.ConfigForm);
    _dom.ConfigFormContent = document.createElement('div');
    _dom.ConfigFormContent.classList.add('bhgv2-config-form-content');
    _dom.ConfigFormMessage = document.createElement('div');
    _dom.ConfigFormMessage.classList.add('bhgv2-config-form-message');
    _dom.ConfigFormFooter = document.createElement('div');
    _dom.ConfigFormFooter.classList.add('bhgv2-config-form-footer');
    _dom.ConfigFormActions = document.createElement('div');
    _dom.ConfigFormActions.classList.add('bhgv2-config-form-actions');
    _dom.ConfigForm.append(_dom.ConfigFormContent, _dom.ConfigFormFooter, _dom.ConfigFormActions);
    _dom.ConfigFormFooterSaveAsDefault = document.createElement('button');
    _dom.ConfigFormFooterSaveAsDefault.innerHTML = '設為預設值';
    _dom.ConfigFormFooterSave = document.createElement('button');
    _dom.ConfigFormFooterSave.innerHTML = '儲存';
    _dom.ConfigFormFooter.append(_dom.ConfigFormFooterSaveAsDefault, _dom.ConfigFormFooterSave, _dom.ConfigFormMessage);
    [_CorePlugin, ...plugins].forEach((plugin) => {
        try {
            const _plugin = plugin(CORE);
            // 初始化config
            _plugin.configs?.forEach(({ key, defaultValue }) => {
                _config[key] = defaultValue;
                if (defaultValue === undefined) {
                    LOG(`插件 ${_plugin.pluginName} 的設定 ${key} 的 defaultValue 為空，請設定。`);
                }
            });
            _plugins.push(_plugin);
        }
        catch (e) {
            LOG(`載入插件失敗, ${e.toString()}`, 'error');
        }
    });
    // 將所有插件的css塞進HeadStyle中
    _dom.HeadStyle.innerHTML = _plugins
        .reduce((prev, _plugin) => [...prev, ...(_plugin.css || [])], [])
        .join('\n\n');
    // 更新設定版面
    _dom.ConfigPanelLeftPluginListing.innerHTML = '';
    _dom.ConfigFormContent.innerHTML = '';
    const scrollToSectionFn = (pluginName) => (event) => {
        event.preventDefault();
        const target = _dom.ConfigFormContent.querySelector(`[data-plugin-name="${pluginName}"]`);
        if (target && target.offsetTop !== undefined) {
            _dom.ConfigFormContent.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth',
            });
        }
        return false;
    };
    _plugins.forEach(({ label, pluginName, configs, actions, configLayout }) => {
        if (!configs && !actions) {
            return;
        }
        const _pluginLi = document.createElement('li');
        const _pluginA = document.createElement('a');
        _pluginA.setAttribute('href', '#');
        _pluginA.innerHTML = label || pluginName;
        _pluginA.addEventListener('click', scrollToSectionFn(pluginName));
        _pluginLi.append(_pluginA);
        _dom.ConfigPanelLeftPluginListing.append(_pluginLi);
        const _sectionDiv = document.createElement('div');
        _sectionDiv.classList.add('bhgv2-config-form-section');
        _sectionDiv.setAttribute('data-plugin-name', pluginName);
        const _sectionTitle = document.createElement('h4');
        _sectionTitle.classList.add('bhgv2-config-form-title');
        _sectionTitle.innerHTML = `【${label || pluginName}】`;
        _sectionDiv.append(_sectionTitle);
        // 建立插件設定的介面
        if (configs) {
            const _configLayout = configLayout || [
                configs.map((_config) => _config.key),
            ];
            for (const row of _configLayout) {
                const _rowDiv = document.createElement('div');
                _rowDiv.classList.add('bhgv2-config-form-row');
                for (const col of row) {
                    const configItem = configs.find((_config) => _config.key === col);
                    if (!configItem) {
                        return;
                    }
                    const _colDiv = document.createElement('div');
                    _colDiv.classList.add('bhgv2-config-form-col');
                    const prefixLabel = document.createElement('span');
                    prefixLabel.innerHTML = configItem.prefixLabel || '';
                    let inputWrapperElement = document.createElement('label');
                    let inputElement = document.createElement('div');
                    switch (configItem.inputType) {
                        case 'number':
                        case 'text':
                        case 'checkbox':
                            inputElement = document.createElement('input');
                            inputElement.setAttribute('type', configItem.inputType);
                            break;
                        case 'switch':
                            inputWrapperElement = document.createElement('label');
                            inputWrapperElement.classList.add('switch');
                            inputElement = document.createElement('input');
                            inputElement.setAttribute('type', 'checkbox');
                            const _slider = document.createElement('span');
                            _slider.classList.add('slider');
                            inputWrapperElement.append(_slider);
                            break;
                        case 'select':
                            inputElement = document.createElement('select');
                            for (let option of configItem.options || []) {
                                const _optionEle = document.createElement('option');
                                _optionEle.setAttribute('value', option.value);
                                _optionEle.innerHTML = option.label;
                                inputElement.append(_optionEle);
                            }
                            inputWrapperElement.append(inputElement);
                            break;
                    }
                    inputWrapperElement.setAttribute('for', configItem.key);
                    inputElement.setAttribute('id', configItem.key);
                    inputElement.setAttribute('data-config-key', configItem.key);
                    inputElement.setAttribute('data-type', configItem.dataType);
                    inputWrapperElement.prepend(inputElement);
                    const suffixLabel = document.createElement('span');
                    suffixLabel.innerHTML = configItem.suffixLabel || '';
                    _colDiv.append(prefixLabel, inputWrapperElement, suffixLabel);
                    _rowDiv.append(_colDiv);
                }
                _sectionDiv.append(_rowDiv);
            }
        }
        if (actions) {
            //建立插件動作的介面
            const _actionLayout = configLayout || [
                actions.map((_action) => _action.key),
            ];
            for (const row of _actionLayout) {
                const _rowDiv = document.createElement('div');
                for (const col of row) {
                    const actionItem = actions.find((_action) => _action.key === col);
                    if (!actionItem) {
                        return;
                    }
                    const buttonElement = document.createElement('button');
                    buttonElement.innerHTML = actionItem.label;
                    buttonElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        actionItem.onClick(e);
                    });
                    _rowDiv.append(buttonElement);
                }
                _sectionDiv.append(_rowDiv);
            }
        }
        _dom.ConfigFormContent.append(_sectionDiv);
    });
    // 初始化 state (gsn, sn, comments, userInfo)
    _state.gsn = guild.gsn;
    if (location && location.href.includes('post_detail.php')) {
        const re = /https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm;
        var url = document.URL;
        var urlMatch = re.exec(url);
        _state.sn = parseInt(urlMatch?.[2]) || undefined;
    }
    _state.userInfo = guildPost.loginUser;
    // 添加動作給 DOM
    $(_dom.Container).off('input focus', 'textarea');
    _dom.ConfigPanelSwitch.addEventListener('click', (event) => {
        event.preventDefault();
        _dom.ConfigPanel.classList.toggle('active');
    });
    const _showConfigFormMessage = (message) => {
        _dom.ConfigFormMessage.innerHTML = message;
        setTimeout(() => {
            _dom.ConfigFormMessage.innerHTML = '';
        }, 2000);
    };
    const _handleSubmitConfigForm = (event, options) => {
        event.preventDefault();
        const form = CORE.DOM.ConfigForm;
        const newConfig = Array.from(form.querySelectorAll('[data-config-key]')).reduce((prev, element) => {
            const key = element.getAttribute('data-config-key');
            if (!key) {
                return prev;
            }
            const dataType = element.getAttribute('data-type');
            let value = undefined;
            switch (dataType) {
                case 'boolean':
                    value = element.checked;
                    break;
                case 'number':
                    value = element.valueAsNumber;
                    break;
                case 'text':
                    value = element.value;
                    break;
            }
            prev[key] = value;
            return prev;
        }, {});
        CORE.mutateConfig(newConfig);
        if (options?.saveAsDefault) {
            window.localStorage.setItem('bahamut-guild-v2-toolkit:config', JSON.stringify(newConfig));
        }
    };
    CORE.DOM.ConfigFormFooterSave.addEventListener('click', (event) => {
        _handleSubmitConfigForm(event);
        _showConfigFormMessage('已儲存設定');
    });
    CORE.DOM.ConfigFormFooterSaveAsDefault.addEventListener('click', (event) => {
        _handleSubmitConfigForm(event, { saveAsDefault: true });
        _showConfigFormMessage('已設為預設值及儲存設定');
    });
    CORE.DOM.EditorTextarea.addEventListener('keydown', (event) => {
        const key = event.key;
        const textarea = event.currentTarget;
        const canContinue = CORE.emit('textarea-keydown', {
            event,
        });
        if (!canContinue) {
            return;
        }
        if (key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const content = textarea.value || '';
            if (content.match(/^\s*$/)) {
                Dialogify.alert('請輸入內容');
                return false;
            }
            const { gsn, sn } = CORE.getState();
            if (!gsn || !sn) {
                Dialogify.alert('GSN或SN是空值！');
                return false;
            }
            textarea.setAttribute('disabled', 'true');
            const formData = new FormData();
            formData.append('gsn', gsn.toString());
            formData.append('messageId', sn.toString());
            formData.append('content', content);
            formData.append('legacy', '1');
            const csrf = new Bahamut.Csrf();
            csrf.setCookie();
            fetch('https://api.gamer.com.tw/guild/v1/comment_new.php', {
                method: 'post',
                body: formData,
                headers: csrf.getFetchHeaders(),
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((json) => {
                if (json.error) {
                    Dialogify.alert(json.error.message);
                    return;
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
                });
                textarea.value = '';
            })
                .finally(() => {
                textarea.removeAttribute('disabled');
                textarea.focus();
            });
            return;
        }
    });
    CORE.DOM.EditorTextarea.addEventListener('input', (event) => {
        const CarbonText = CORE.DOM.EditorTextareaCarbonText;
        if (CarbonText) {
            const textarea = event.currentTarget;
            const content = textarea.value;
            CarbonText.innerHTML = content.replace(/\n/g, '<br />');
        }
        CORE.emit('textarea-input', {
            event,
        });
    });
    // Override GuildComment.commentEdit
    GuildComment.commentEdit = (gsn, postSn, commentSn) => {
        tippy.hideAll();
        const stringCommentSn = commentSn.toString();
        const _commentIndex = CORE.comments.findIndex((c) => c.id === stringCommentSn);
        if (_commentIndex === -1) {
            return;
        }
        const _comment = CORE.comments[_commentIndex];
        const _element = _comment.element;
        if (!_element) {
            return;
        }
        const _overrideArea = _element.querySelector('.reply-content__override');
        if (!_overrideArea) {
            return;
        }
        fetch(`https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=${gsn}&messageId=${postSn}&commentId=${commentSn}`, { credentials: 'include' })
            .then((resp) => {
            return resp.json();
        })
            .then((json) => {
            if (json.error) {
                Dialogify.alert(json.error.message);
                return;
            }
            let commentData = json.data.comments[0];
            let commentText = GuildTextUtil.prepareEditContent(commentData.text, commentData.mentions);
            nunjucks.configure({ autoescape: false });
            let editHtml = nunjucks.render('comment_form_edit.njk.html', {
                gsn: gsn,
                postSn: postSn,
                commentSn: commentSn,
                commentText: commentText,
            });
            _element.classList.toggle('editing', true);
            _overrideArea.innerHTML = editHtml;
            _overrideArea.querySelector('textarea')?.focus();
            // new GuildEmoticon(commentSelector + ' .reply-content', gsn)
        })
            .catch((reason) => {
            Dialogify.alert(reason);
        });
    };
    // Override GuildComment.commentEditCancel
    GuildComment.commentEditCancel = (postSn, commentSn) => {
        tippy.hideAll();
        const stringCommentSn = commentSn.toString();
        const _commentIndex = CORE.comments.findIndex((c) => c.id === stringCommentSn);
        if (_commentIndex === -1) {
            return;
        }
        const _comment = CORE.comments[_commentIndex];
        const _element = _comment.element;
        if (!_element) {
            return;
        }
        const _overrideArea = _element.querySelector('.reply-content__override');
        if (!_overrideArea) {
            return;
        }
        _element.classList.toggle('editing', false);
        _overrideArea.innerHTML = '';
    };
    // Override GuildComment.commentEditConfirm
    GuildComment.commentEditConfirm = (gsn, postSn, commentSn) => {
        tippy.hideAll();
        const stringCommentSn = commentSn.toString();
        const _commentIndex = CORE.comments.findIndex((c) => c.id === stringCommentSn);
        if (_commentIndex === -1) {
            return;
        }
        const _comment = CORE.comments[_commentIndex];
        const _element = _comment.element;
        if (!_element) {
            return;
        }
        const _overrideArea = _element.querySelector('.reply-content__override');
        if (!_overrideArea) {
            return;
        }
        const _content = _element.querySelector('.reply-content__cont');
        if (!_content) {
            return;
        }
        const _editor = _element.querySelector('textarea.reply-content__edit');
        if (!_editor) {
            return;
        }
        let content = _editor.value || '';
        if (content.match(/^\s*$/)) {
            Dialogify.alert('請輸入內容');
            _editor.focus();
            return;
        }
        if (GuildTextUtil.countLimit(_editor, 300)) {
            return;
        }
        let csrf = new Bahamut.Csrf();
        csrf.setCookie();
        let formData = new FormData();
        formData.append('gsn', gsn);
        formData.append('messageId', postSn);
        formData.append('commentId', commentSn);
        formData.append('content', content);
        formData.append('legacy', '1');
        fetch('https://api.gamer.com.tw/guild/v1/comment_edit.php', {
            method: 'post',
            body: formData,
            headers: csrf.getFetchHeaders(),
            credentials: 'include',
        }).then((resp) => {
            resp.json().then((json) => {
                if (json.error) {
                    Dialogify.alert(json.error.message);
                    return;
                }
                let commentData = json.data.commentData;
                commentData.position = _comment.position;
                commentData.text = GuildTextUtil.mentionTagToMarkdown(gsn, commentData.text, commentData.tags, commentData.mentions);
                let post = { id: postSn, to: { gsn: gsn } };
                nunjucks.configure({ autoescape: false });
                const _newElement = $(nunjucks.render('comment.njk.html', {
                    post: post,
                    comment: commentData,
                    marked: GuildTextUtil.markedInstance,
                    youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
                    user: guildPost.loginUser,
                }))[0];
                const _newContent = _newElement.querySelector('.reply-content__cont');
                _content.innerHTML = _newContent.innerHTML;
                if (_comment.payload) {
                    _comment.payload.text = commentData.text;
                }
                _element.classList.toggle('editing', false);
                _overrideArea.innerHTML = '';
            });
        });
    };
    // 觸發一次所有插件的 onMutateConfig
    CORE.mutateConfig(_config);
    // 觸發一次所有插件的 onMutateState
    CORE.mutateState(_state);
    // 讀取預設值
    try {
        const _storedConfigJSON = localStorage.getItem('bahamut-guild-v2-toolkit:config');
        if (_storedConfigJSON) {
            CORE.mutateConfig(JSON.parse(_storedConfigJSON));
        }
    }
    catch { }
    // 初始化state comments (用Interval等到comment list真的生成好)
    let _initialCommentListInterval;
    _initialCommentListInterval = setInterval(() => {
        const _CommentListOuter = CORE.DOM.CommentListOuter;
        if (_CommentListOuter) {
            const commentCount = parseInt(_CommentListOuter.getAttribute('data-comment-count')) || 0;
            if (commentCount === 0) {
                clearInterval(_initialCommentListInterval);
                return;
            }
            const _CommentList = CORE.DOM.CommentList;
            if (_CommentList) {
                if (_CommentList.children.length === 0) {
                    return;
                }
                const _newComments = Array.from(_CommentList.children).map((element, index) => ({
                    id: element.getAttribute('data-csn'),
                    position: index + 1,
                    element,
                }));
                CORE.mutateState({
                    latestComments: _newComments,
                    isInit: true,
                });
            }
            clearInterval(_initialCommentListInterval);
        }
    }, 200);
    return CORE;
};
const _waitForElm = (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver((mutations) => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
};
(function () {
    let hasTakenOver = false;
    _waitForElm('.webview_commendlist .c-reply__editor').then(() => {
        if (!hasTakenOver) {
            BHGV2Core({
                plugins: [
                    bhgv2_auto_refresh_1.default,
                    bhgv2_qte_alert_1.default,
                    bhgv2_dense_1.default,
                    bhgv2_master_layout_1.default,
                    bhgv2_comments_reverse_1.default,
                    bhgv2_highlight_me_1.default,
                    bhgv2_notify_on_title_1.default,
                    bhgv2_rainbow_1.default,
                    // BHGV2_QuickInput,
                    bhgv2_dark_mode_1.default,
                    // BHGV2_SaveTheThread,
                    bhgv2_paste_upload_image_1.default,
                ],
                library: {
                    jQuery,
                    $,
                    nunjucks,
                    GuildTextUtil,
                },
            });
            hasTakenOver = true;
        }
    });
})();


/***/ }),

/***/ 440:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = `/* The switch - the box around the slider */
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
	-webkit-transition: 0.4s;
	transition: 0.4s;
}

.slider:before {
	position: absolute;
	content: '';
	height: 13px;
	width: 13px;
	left: 2px;
	bottom: 2px;
	background-color: white;
}

input:checked + .slider {
	background-color: #2196f3;
}

input:focus + .slider {
	box-shadow: 0 0 1px #2196f3;
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

.inboxfeed.inboxfeed {
	width: auto;
	max-width: none;
	min-width: 560px;
}

.inboxfeed.inboxfeed .main-container_wall-post_header,
.inboxfeed.inboxfeed .main-container_wall-post_body,
.inboxfeed.inboxfeed .main-container_wall-post_footer,
.inboxfeed.inboxfeed .bhgv2-comment-list {
	margin-left: auto;
	margin-right: auto;
	width: 100%;
	max-width: 560px;
}

.bhgv2-editor.bhgv2-editor.bhgv2-editor {
	border-color: #666;
	border-radius: 0;
	padding-bottom: 18px;
	padding-right: 4px !important;
	padding-top: 4px;
	padding-left: 7px;
	margin-top: 0;
}

.bhgv2-config-switch {
}

.bhgv2-config-switch span {
	vertical-align: middle;
	font-size: 12px;
}

.bhgv2-editor-textarea-wrapper {
	position: relative;
}

.bhgv2-editor-textarea {
	font-family: -apple-system, "San Francisco", Roboto, "Segoe UI", Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Helvetica Neue", Helvetica, Roboto, Arial, "Lucida Grande", "PingFang TC", "蘋果儷中黑", "Apple LiGothic Medium", sans-serif;
}

.bhgv2-editor-textarea-carbon {
	position: absolute;
	top: 0;
	bottom: 0;
	left: 0;
	right: 0;

	color: transparent;
	font-size: 14px;
	line-height: 1.5;
	pointer-events: none;
}

.bhgv2-editor-textarea-carbon-trailing {
	padding-left: 3px;
	color: #aaa;
}

.bhgv2-editor-textarea-carbon-trailing code {
	font-size: 12px;
	padding: 2px 4px;
	background: #ddd;
	border-radius: 2px;
}

.bhgv2-comment-list-outer > div.bhgv2-editor-container .bhgv2-editor-container-footer {
	display: flex;
	flex-direction: row;
	padding: 13px 0 5px;
	font-size: 12px;
}

.bhgv2-editor-tips {
	border-top: 1px dashed #bbb;
	color: #bbb;
	font-size: 12px;
	position: absolute;
	bottom: 0;
	left: 8px;
	right: 8px;
	padding-right: 70px;
}

.bhgv2-editor-container-reply-content-footer {
	display: flex;
}

.bhgv2-editor-container-reply-content-footer-left {
	flex: 1;
	font-size: 12px;
	color: #444;
	padding: 2px 0 0 8px;
}

.bhgv2-dark .bhgv2-editor-container-reply-content-footer-left {
	color: #bbb;
}

.bhgv2-comment-list-error-container {
	padding: 8px;
	text-align: center;
	color: #842029;
	font-size: 14px;
	border: 2px solid #f5c2c7;
	border-radius: 4px;
	background: #f8d7da;
	display: none;
	margin-top: 8px;
	margin-bottom: 8px;
}
.bhgv2-comment-list-error-container:not(:empty) {
	display: block;
}

.bhgv2-editor-container-footer .bhgv2-config-status {
	flex: 1;
}

.bhgv2-config-panel {
	background: #ffffff;
	padding: 8px;
	border-radius: 4px;
	margin-bottom: 6px;

	display: none;
	align-items: stretch;
	height: 300px;
}

.bhgv2-dark .bhgv2-config-panel {
	background: #222;
}

.bhgv2-config-panel.active {
	display: flex;
}

.bhgv2-config-panel-left {
	width: 130px;
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.bhgv2-config-panel-left-plugin-listing-wrapper {
	flex: 1;
	min-height: 0;
	overflow-y: auto;
}

.bhgv2-config-panel-left-plugin-listing {
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.1);
}

.bhgv2-config-panel-left-plugin-listing li {

}

.bhgv2-config-panel-left-plugin-listing li a {
	display: block;
	padding: 4px;
}

.bhgv2-config-panel-left-plugin-footer {
	margin-top: 8px;
	font-size: 12px;
}

.bhgv2-config-panel-right {
	min-height: 0;
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.bhgv2-config-form {
	flex: 1;
	min-height: 0;
	display: flex;
	flex-direction: column;
	align-items: stretch;
}

.bhgv2-config-form-section {
	margin-bottom: 1rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid #666;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel input {
	border: 1px solid #999;
}

.bhgv2-dark .bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel input {
	color: #C7C6CB;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button {
	display: inline-block;
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;
	background-color: #eee;
	padding: 3px;
	margin-right: 2px;
	border: 1px solid #333;
	color: #000;
	text-decoration: none;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button:disabled {
	color: #ccc;
}

.bhgv2-config-form-message {
	display: inline-block;
	text-align: left;
	color: #4a934a;
	font-size: 12px;
	line-height: 16px;
	padding: 4px;
}

.bhgv2-config-form-footer {
	text-align: left;
	margin-top: 4px;
}

.bhgv2-config-form-content {
	flex: 1;
	min-height: 0;
	overflow-y: scroll;
	position: relative;
}

.bhgv2-config-form-content .bhgv2-config-form-row {
	display: flex;
	align-items: center;
	justify-content: flex-start;
	margin-bottom: 2px;
}

.bhgv2-config-form-content .bhgv2-config-form-col {
	display: flex;
	align-items: center;
	justify-content: flex-start;
}

.bhgv2-config-form-content .bhgv2-config-form-col > * {
	display: inline-block;
	margin-right: 2px;
}

.bhgv2-config-form-content .bhgv2-config-form-col input[type=text],
.bhgv2-config-form-content .bhgv2-config-form-col input[type=number] {
	width: 3rem;
}

.bhgv2-config-form-content .bhgv2-config-form-col + .bhgv2-config-form-col {
	margin-left: 0.5rem;
}

.bhgv2-config-form-actions {
	display: none;
	justify-content: flex-start;
	flex-wrap: wrap;
	font-size: 12px;
	padding-top: 5px;
	margin-top: 5px;
	border-top: 1px dashed #999;
}

.bhgv2-config-form-actions > * + * {
	margin-left: 1rem;
}

.bhgv2-comment-list {
	min-height: calc(100vh - 300px);
}

.webview_commendlist .c-reply__item .reply-content.reply-content {
	padding-left: 44px;
}

.webview_commendlist .c-reply__item .reply-content.reply-content.bhgv2-editor-container-reply-content {
	padding-left: 35px;
}

.c-reply__editor .reply-input .comment_icon.comment_icon {
	top: initial;
	bottom: 3px;
	z-index: 2;
}

.c-reply__editor .reply-input .comment_icon.comment_icon a {
	width: 12px;
	height: 12px;
}

.c-reply__editor .reply-input .comment_icon.comment_icon a img {
	width: 16px;
	height: 16px;
}

.webview_commendlist .c-reply__editor .reply-input .content-edit.content-edit {
	height: auto;
	overflow: auto;
	resize: vertical;
}

.globalcontainer .main-container_wall-post {
	box-shadow: none;
}
`;


/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = `
	.main-container_wall-post_header {
		display: flex;
		gap: 8px;
		align-items: center;
	}

	.main-container_wall-post_header .main-container_wall-post_header_main {
		flex: 1;
		width: auto;
	}

	.bhgv2-editor .bhgv2-editor-textarea {
		min-height: 22px;
	}

	.bhgv2-comment.editing .reply-content__cont {
		display: none;
	}
`;


/***/ }),

/***/ 201:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertCTimeToHumanString = void 0;
const convertCTimeToHumanString = (ctime) => {
    const date = new Date(ctime);
    if (!date) {
        return ctime;
    }
    const deltaSeconds = (Date.now() - date.getTime()) / 1000;
    if (deltaSeconds < 3600) {
        return `${Math.floor(deltaSeconds / 60)}分鐘`;
    }
    else if (deltaSeconds < 86400) {
        return `${Math.floor(deltaSeconds / 3600)}小時`;
    }
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}月${date
        .getDate()
        .toString()
        .padStart(2, '0')}日 ${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
};
exports.convertCTimeToHumanString = convertCTimeToHumanString;


/***/ }),

/***/ 647:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.postImgurImage = void 0;
const IMGUR_CLIENT_ID = 'aef87581a602ff3';
const postImgurImage = (file) => {
    const formData = new FormData();
    formData.append('image', file);
    // formData.append('type', 'base64')
    return fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: new Headers({
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        }),
        body: formData,
    })
        .then((res) => {
        return res.json();
    })
        .then((json) => json.data)
        .catch((e) => {
        console.log(e);
    });
};
exports.postImgurImage = postImgurImage;


/***/ }),

/***/ 804:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createNotification = void 0;
const createNotification = (options) => {
    const _options = {
        silent: false,
        ...options,
    };
    GM_notification(_options);
};
exports.createNotification = createNotification;


/***/ }),

/***/ 503:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const notification_helper_1 = __webpack_require__(804);
const BHGV2_AutoRefresh = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_AutoRefresh',
        prefix: 'BHGV2_AutoRefresh',
        label: '自動更新',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}:isEnable`,
            suffixLabel: '自動更新',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}:interval`,
            suffixLabel: '秒 (上限:2秒/非參與者10秒)',
            dataType: 'number',
            inputType: 'number',
            defaultValue: 30,
        },
        {
            key: `${_plugin.prefix}:autoSlowDown`,
            suffixLabel: '舊串慢速更新(建議開啟)',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}:notification`,
            suffixLabel: '桌面通知',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}:notificationSound`,
            suffixLabel: '提示音效',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
    ];
    _plugin.configLayout = [
        [`${_plugin.prefix}:isEnable`, `${_plugin.prefix}:interval`],
        [`${_plugin.prefix}:autoSlowDown`],
        [`${_plugin.prefix}:notification`, `${_plugin.prefix}:notificationSound`],
    ];
    const _statusDom = document.createElement('span');
    core.DOM.ConfigPanelStatus?.append(_statusDom);
    const notifyAudio = new Audio('https://github.com/SilWolf/bahamut-guild-v2-toolkit/blob/main/src/plugins/bhgv2-auto-refresh/notify_2.mp3?raw=true');
    let _refreshIntervalObj = undefined;
    let _failedCount = 0;
    _plugin.onMutateConfig = (newValue) => {
        if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
            const isEnabled = newValue[`${_plugin.prefix}:isEnable`];
            if (isEnabled === false) {
                if (_refreshIntervalObj) {
                    clearTimeout(_refreshIntervalObj);
                    _refreshIntervalObj = undefined;
                }
                _statusDom.style.display = 'none';
            }
            else if (isEnabled === true) {
                if (_refreshIntervalObj) {
                    clearTimeout(_refreshIntervalObj);
                    _refreshIntervalObj = undefined;
                }
                _statusDom.style.display = 'inline-block';
                const { commentListApi } = core.getState();
                const getCommentsAsync = async () => {
                    if (!commentListApi) {
                        return [];
                    }
                    const { commentsCount: currentCommentsCount, isParticipated } = core.getState();
                    const latestComments = [];
                    const { comments, commentCount: newCommentsCount, totalPage, } = await fetch(commentListApi, {
                        credentials: 'include',
                    })
                        .then((res) => res.json())
                        .then((res) => res.data);
                    latestComments.splice(0, 0, ...comments.map((_comment) => ({
                        id: _comment.id,
                        position: _comment.position,
                        payload: _comment,
                    })));
                    const expectedNewCommentsCount = newCommentsCount - (currentCommentsCount || 0);
                    const pages = [];
                    for (let i = 0; expectedNewCommentsCount - 15 * i > -15 && totalPage - 1 - i >= 0; i++) {
                        pages.push(totalPage - 1 - i);
                    }
                    const moreComments = await Promise.all(pages.map((_page) => fetch(commentListApi + `&page=${_page}`, {
                        credentials: 'include',
                    })
                        .then((res) => res.json())
                        .then((res) => res.data))).then((values) => values.reduce((prev, curr) => {
                        prev.splice(0, 0, ...curr.comments.map((_comment) => ({
                            id: _comment.id,
                            position: _comment.position,
                            payload: _comment,
                        })));
                        return prev;
                    }, []));
                    latestComments.splice(0, 0, ...moreComments);
                    return latestComments;
                };
                const timeoutFn = () => {
                    getCommentsAsync()
                        .then((latestComments) => {
                        const { isParticipated } = core.getState();
                        const lastCommentCTime = latestComments?.[latestComments.length - 1]?.payload?.ctime;
                        const _config = core.getConfig();
                        let _interval = Math.max(isParticipated ? 2 : 10, parseInt(newValue[`${_plugin.prefix}:interval`] ||
                            _config[`${_plugin.prefix}:interval`]) || 30);
                        let isSlowMode = false;
                        if (_config[`${_plugin.prefix}:autoSlowDown`] &&
                            lastCommentCTime) {
                            const commentCTime = new Date(lastCommentCTime).getTime();
                            if (commentCTime) {
                                const nowTime = Date.now();
                                if (nowTime - commentCTime > 12 * 60 * 60 * 1000) {
                                    // over 12 hours
                                    _interval = 3600;
                                    isSlowMode = true;
                                }
                                else if (nowTime - commentCTime > 30 * 60 * 1000) {
                                    // over 30 minutes
                                    _interval = 300;
                                    isSlowMode = true;
                                }
                            }
                        }
                        const _intervalMs = _interval * 1000;
                        _statusDom.innerHTML = `${_config[`${_plugin.prefix}:autoSlowDown`] && isSlowMode
                            ? '慢速更新'
                            : '自動更新中'}(${[
                            `${_interval}s`,
                            _notification ? '通知' : undefined,
                            _notification && _notificationSound ? '聲音' : undefined,
                        ]
                            .filter((item) => !!item)
                            .join(',')})`;
                        _failedCount = 0;
                        core.mutateState({
                            latestComments,
                            lastCommentCTime,
                        });
                        _refreshIntervalObj = setTimeout(timeoutFn, _intervalMs);
                    })
                        .catch((e) => {
                        console.error(e);
                        _failedCount += 1;
                        if (_failedCount < 20) {
                            _refreshIntervalObj = setTimeout(timeoutFn, 5000);
                        }
                    })
                        .finally(() => {
                        if (_failedCount >= 20) {
                            core.setError(_plugin.pluginName, `[${new Date().toISOString()}] 自動更新失敗了 ${_failedCount} 次。已達到自動重試上限，請 F5 刷新頁面。`);
                        }
                        if (_failedCount > 0) {
                            core.setError(_plugin.pluginName, `[${new Date().toISOString()}] 自動更新失敗了 ${_failedCount} 次，5秒後重試`);
                        }
                        else {
                            core.setError(_plugin.pluginName, undefined);
                        }
                    });
                };
                _refreshIntervalObj = setTimeout(timeoutFn, 2000);
                const _config = core.getConfig();
                const _notification = newValue[`${_plugin.prefix}:notification`] !== undefined
                    ? newValue[`${_plugin.prefix}:notification`]
                    : _config[`${_plugin.prefix}:notification`];
                const _notificationSound = newValue[`${_plugin.prefix}:notificationSound`] !== undefined
                    ? newValue[`${_plugin.prefix}:notificationSound`]
                    : _config[`${_plugin.prefix}:notificationSound`];
                _statusDom.innerHTML = `自動更新中(計算中...${[
                    _notification ? '通知' : undefined,
                    _notification && _notificationSound ? '聲音' : undefined,
                ]
                    .filter((item) => !!item)
                    .join(',')})`;
            }
        }
    };
    _plugin.onMutateState = (newValue) => {
        if (newValue.isInit || newValue.isUserAction) {
            return;
        }
        if (newValue.latestComments) {
            const config = core.getConfig();
            const _comment = newValue.latestComments[0];
            if (_comment) {
                if (config[`${_plugin.prefix}:notification`]) {
                    let text = '[如果你看到這句話，代表有東西爆炸了，請聯絡月月處理……]';
                    if (_comment.payload) {
                        const _payload = _comment.payload;
                        text = `(#${_payload.position}) ${_payload.name}：${_payload.text.substr(0, 50)}`;
                    }
                    else if (_comment.element) {
                        const _element = _comment.element;
                        const _name = _element.getAttribute('data-user');
                        const _position = _element.getAttribute('data-position');
                        const _text = _comment.element.querySelector('.reply-content__cont')
                            ?.textContent || '';
                        text = `(#${_position}) ${_name}：${_text.substr(0, 50)}`;
                    }
                    // 發送桌面通知
                    notification_helper_1.createNotification({
                        title: '有新的通知',
                        text: text,
                        silent: true,
                        timeout: 5000,
                    });
                }
                // 播放通知音
                if (config[`${_plugin.prefix}:notificationSound`]) {
                    notifyAudio.play();
                }
            }
        }
    };
    return _plugin;
};
exports.default = BHGV2_AutoRefresh;


/***/ }),

/***/ 547:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_CommentsReverse - 顛倒哈拉串
 *  顛倒哈拉串
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_CommentsReverse = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_CommentsReverse',
        prefix: 'BHGV2_CommentsReverse',
        label: '串顛倒排列',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-isEnable`,
            suffixLabel: '顛倒哈拉串',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-editorSticky`,
            suffixLabel: '輸入框貼在上邊沿',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.css = [
        `
			.bhgv2-comment-list-outer {
				display: flex;
				flex-direction: column;
			}
			.bhgv2-comment-list {
				display: flex;
				flex-direction: column;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-isEnable {
				flex-direction: column-reverse;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-isEnable .bhgv2-comment-list {
				flex-direction: column-reverse;
				justify-content: flex-end;
			}

			.bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				position: sticky;
				top: 80px;
				padding-left: 20px;
				padding-right: 20px;
				background-color: rgba(180, 180, 180, 0.9);
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
			}

			.bhgv2-dark .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				background-color: #272728;
			}
			
			.bhgv2-comment-list > div.bhgv2-editor-container {
				flex-direction: column;
			}

			.BHGV2_MasterLayout-hideTabMenu .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
				top: 35px;
			}

			@media screen and (max-width: 769px) {
				.BHGV2_MasterLayout-hideTabMenu .bhgv2-comment-list-outer.${_plugin.prefix}-editorSticky .bhgv2-editor-container {
					top: 44px;
				}
			}
		`,
    ];
    _plugin.onMutateConfig = (newValue) => {
        ;
        ['isEnable', 'editorSticky'].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
    };
    return _plugin;
};
exports.default = BHGV2_CommentsReverse;


/***/ }),

/***/ 340:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_DarkMode - 黑闇模式
 *  當啟用巴哈的黑闇模式時，使插件介面也跟著黑闇起來
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_DarkMode = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_DarkMode',
        prefix: 'BHGV2_DarkMode',
    };
    const _getCookie = (name) => {
        const value = '; ' + document.cookie;
        const parts = value.split('; ' + name + '=');
        if (parts.length == 2) {
            return parts.pop()?.split(';').shift();
        }
    };
    const darkModeObserver = new MutationObserver(function (mutations) {
        mutations.forEach(() => {
            const body = core.DOM.Body;
            if (!body) {
                return;
            }
            body.classList.toggle('bhgv2-dark', _getCookie('ckForumDarkTheme') == 'yes');
        });
    });
    var target = core.DOM.Head;
    darkModeObserver.observe(target, {
        attributes: true,
        childList: true,
        subtree: true,
    });
    return _plugin;
};
exports.default = BHGV2_DarkMode;


/***/ }),

/***/ 115:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_Dense - 密集介面
 *  縮小字體、減少間距，增加同時看到的留言數
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_Dense = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_Dense',
        prefix: 'BHGV2_Dense',
        label: '串介面',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-tradUI`,
            suffixLabel: '仿舊版的介面',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-sizeSmaller`,
            suffixLabel: '縮小字體',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideFooter`,
            suffixLabel: '隱藏留言底的GP/BP按鈕及回覆按鈕',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-smallerImage`,
            suffixLabel: '縮小圖片',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-smallerImageHover`,
            suffixLabel: '鼠標懸浮時放大',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-squareAvatar`,
            suffixLabel: '正方型頭像',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-perfectLayout`,
            suffixLabel: '飛鳥的完美排版',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}-hidePreview`,
            suffixLabel: '隱藏串首的連結預覽',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}-font`,
            prefixLabel: '使用字體: ',
            dataType: 'text',
            inputType: 'select',
            defaultValue: 'default',
            options: [
                { label: '默認', value: 'default' },
                { label: '新細明體', value: 'PMingLiU' },
                { label: '標楷體', value: 'DFKai-SB' },
                { label: 'Arial', value: 'Arial' },
            ],
        },
    ];
    _plugin.configLayout = [
        [`${_plugin.prefix}-tradUI`, `${_plugin.prefix}-perfectLayout`],
        [`${_plugin.prefix}-squareAvatar`],
        [`${_plugin.prefix}-smallerImage`, `${_plugin.prefix}-smallerImageHover`],
        [`${_plugin.prefix}-sizeSmaller`],
        [`${_plugin.prefix}-hideFooter`],
        [`${_plugin.prefix}-hidePreview`],
        [`${_plugin.prefix}-font`],
    ];
    _plugin.css = [
        `
			.webview_commendlist {
				margin-left: 0;
				margin-right: 0;
			}

			.bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-left: 20px;
				padding-right: 20px;
			}

			.bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				margin-left: 0;
				margin-right: 0;
			}

			.reply-content__user.reply-content__user.reply-content__user {
				color: #0055aa;
			}

			.bhgv2-dark .reply-content__user.reply-content__user.reply-content__user {
				color: #f5f5f5;
			}

			.reply-content__user.reply-content__user.reply-content__user:hover {
				text-decoration: underline;
			}
			
			.${_plugin.prefix}-sizeSmaller .reply-content__user.reply-content__user.reply-content__user,
			.${_plugin.prefix}-sizeSmaller .reply-content__cont.reply-content__cont.reply-content__cont {
				font-size: 12px;
				line-height: 1;
				margin-top: 0;
			}
			
			.${_plugin.prefix}-sizeSmaller .c-reply__editor .reply-input .content-edit {
				font-size: 12px;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer.reply-content__footer {
				display: none;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer__edit.reply-content__footer__edit.reply-content__footer__edit {
				display: flex;
			}

			.${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: #e9f5f4;
				border-bottom: 1px solid #999999;
			}
			
			.bhgv2-dark.${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: transparent;
				border-bottom: 1px solid #999999;
			}

			.${_plugin.prefix}-tradUI .bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-top: 5px;
				padding-left: 10px;
				padding-right: 10px;
				padding-bottom: 0;
			}

			.${_plugin.prefix}-tradUI .bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				padding-left: 10px;
				padding-right: 10px;
				padding-bottom: 0;
			}

			.${_plugin.prefix}-tradUI .c-reply__item .reply-content__cont.reply-content__cont.reply-content__cont {
				margin-top: 0;
			}

			.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				margin-left: 14px;
				line-height: 14px;
				display: none;
        color: rgba(26, 26, 26, 0.5);
			}

			.${_plugin.prefix}-hideFooter .${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				display: inline-block;
			}

			.${_plugin.prefix}-smallerImage .reply-content__cont.reply-content__cont.reply-content__cont img {
				margin-bottom: 4px;
				max-width: 100px;
				max-height: 150px;
				width: auto;
				border-radius: 8px;
				vertical-align: middle;
				transition: max-width 0.3s, max-height 0.3s;
			}

			.${_plugin.prefix}-smallerImage.${_plugin.prefix}-smallerImageHover .reply-content__cont.reply-content__cont.reply-content__cont img:hover {
				max-width: calc(100% - 20px);
				max-height: 500px;
			}

			.${_plugin.prefix}-squareAvatar .reply-avatar-img.reply-avatar-img.reply-avatar-img,
			.${_plugin.prefix}-squareAvatar .reply-avatar-img.reply-avatar-img.reply-avatar-img img {
				border-radius: 0;
			}

			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed {
				width: auto;
				max-width: none;
				min-width: 635px;
			}

			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 635px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed {
				min-width: 615px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 615px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed {
				min-width: 535px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 535px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed {
				min-width: 515px;
			}

			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_header,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_body,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .main-container_wall-post_footer,
			.${_plugin.prefix}-perfectLayout.${_plugin.prefix}-sizeSmaller.${_plugin.prefix}-tradUI .inboxfeed.inboxfeed.inboxfeed .bhgv2-comment-list {
				max-width: 515px;
			}

			.${_plugin.prefix}-hidePreview .main-container_wall-post_body .linkbox {
				display: none;
			}

			.${_plugin.prefix}-font[data-bhgv2-font=PMingLiU] .inboxfeed.inboxfeed.inboxfeed {
				font-family: '新細明體';
			}
			.${_plugin.prefix}-font[data-bhgv2-font=DFKai-SB] .inboxfeed.inboxfeed.inboxfeed {
				font-family: '標楷體';
			}
			.${_plugin.prefix}-font[data-bhgv2-font=Arial] .inboxfeed.inboxfeed.inboxfeed {
				font-family: 'Arial';
			}
		`,
    ];
    _plugin.onMutateState = ({ latestComments }) => {
        if (latestComments) {
            latestComments.forEach((comment) => {
                const { element } = comment;
                if (!element) {
                    return;
                }
                const _tagButton = element.querySelector('button.reply-content__tag');
                const _contentUser = element.querySelector('a.reply-content__user');
                if (!_tagButton || !_contentUser) {
                    return;
                }
                const _clonedTagButton = _tagButton.cloneNode(false);
                _clonedTagButton.classList.add(`${_plugin.prefix}-clonedTagButton`);
                _clonedTagButton.innerText = '回覆';
                _clonedTagButton.setAttribute('title', '回覆他');
                _contentUser.insertAdjacentElement('afterend', _clonedTagButton);
                const editorTextarea = core.DOM.EditorTextarea;
                const _mentionWithPositionButton = document.createElement('button');
                _mentionWithPositionButton.classList.add(`${_plugin.prefix}-clonedTagButton`);
                _mentionWithPositionButton.innerText = '(#)';
                _mentionWithPositionButton.classList.add(`${_plugin.prefix}-clonedTagButton`);
                _mentionWithPositionButton.setAttribute('title', '回覆他+#');
                _mentionWithPositionButton.addEventListener('click', () => {
                    editorTextarea.setRangeText(`[${comment.payload?.userid}:${comment.payload?.name}] (#${comment.position})\n`, editorTextarea.selectionStart, editorTextarea.selectionStart, 'end');
                    editorTextarea.focus();
                });
                _clonedTagButton.insertAdjacentElement('afterend', _mentionWithPositionButton);
            });
        }
    };
    _plugin.onMutateConfig = (newValue) => {
        ;
        [
            'hideFooter',
            'smallerImage',
            'smallerImageHover',
            'squareAvatar',
        ].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
        ['tradUI', 'sizeSmaller', 'perfectLayout', 'hidePreview'].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.Body;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
        if (newValue[`${_plugin.prefix}-font`] != undefined) {
            const dom = core.DOM.Body;
            if (dom) {
                dom.classList.toggle(`${_plugin.prefix}-font`, true);
                dom.setAttribute(`data-bhgv2-font`, newValue[`${_plugin.prefix}-font`]);
            }
        }
    };
    return _plugin;
};
exports.default = BHGV2_Dense;


/***/ }),

/***/ 898:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_HighlightMe - 高亮我
 *  高亮你在留言中出現的名字
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_HighlightMe = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_HighlightMe',
        prefix: 'BHGV2_HighlightMe',
        label: '「提及我」高亮',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-isEnabled`,
            suffixLabel: '高亮提及我的訊息',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-onlyShowHighlighted`,
            suffixLabel: '只顯示高亮的訊息',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
    ];
    _plugin.css = [
        `
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on {
				background: #ffe2c6;
				border-left: 4px solid #fb7f00;
				cursor: pointer;
			}
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on .${_plugin.prefix}-name {
				background: #fb7f00;
				padding: 2px 4px;
				color: #fff;
				font-size: 115%;
			}

			.bhgv2-dark .${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment.${_plugin.prefix}-on {
				background: #484027;
			}

			.${_plugin.prefix}-onlyShowHighlighted .bhgv2-comment:not(.${_plugin.prefix}-on) {
				display: none;
			}
		`,
    ];
    const _clickEvent = (event) => {
        event.preventDefault();
        const _target = event.currentTarget;
        if (!_target) {
            return;
        }
        _unhighlightAElement(_target);
    };
    const _highlightAElement = (element) => {
        if (!element.classList.contains(`${_plugin.prefix}-comment`)) {
            return;
        }
        if (element.classList.contains(`${_plugin.prefix}-on`)) {
            return;
        }
        element.classList.toggle(`${_plugin.prefix}-on`, true);
        element.addEventListener('click', _clickEvent);
    };
    const _unhighlightAElement = (element) => {
        if (!element.classList.contains(`${_plugin.prefix}-comment`)) {
            return;
        }
        if (!element.classList.contains(`${_plugin.prefix}-on`)) {
            return;
        }
        element.classList.toggle(`${_plugin.prefix}-on`, false);
        element.removeEventListener('click', _clickEvent);
    };
    const _highlightAll = () => {
        const CommentList = core.DOM.CommentList;
        if (!CommentList) {
            return;
        }
        CommentList.querySelectorAll(`.${_plugin.prefix}-comment`).forEach((element) => _highlightAElement(element));
    };
    const _unhighlightAll = () => {
        const CommentList = core.DOM.CommentList;
        if (!CommentList) {
            return;
        }
        CommentList.querySelectorAll(`.${_plugin.prefix}-comment.${_plugin.prefix}-on`).forEach((element) => _unhighlightAElement(element));
    };
    const _highlightAllAfterMyLastComment = () => {
        const { userInfo } = core.getState();
        const CommentList = core.DOM.CommentList;
        if (!userInfo || !CommentList) {
            return;
        }
        for (let i = CommentList.children.length - 1; i >= 0; i--) {
            const element = CommentList.children[i];
            _highlightAElement(element);
            if (element.getAttribute('data-userid') === userInfo.id) {
                break;
            }
        }
    };
    const _unhighlightAllBeforeMyLastComment = () => {
        const { userInfo } = core.getState();
        const CommentList = core.DOM.CommentList;
        if (!userInfo || !CommentList) {
            return;
        }
        let myLastCommentFound = false;
        for (let i = CommentList.children.length - 1; i >= 0; i--) {
            const element = CommentList.children[i];
            if (!myLastCommentFound) {
                if (element.getAttribute('data-userid') === userInfo.id) {
                    myLastCommentFound = true;
                }
                continue;
            }
            _unhighlightAElement(element);
        }
    };
    const ConfigFormActions = core.DOM.ConfigFormActions;
    const _buttonHighlightAll = document.createElement('a');
    _buttonHighlightAll.setAttribute('href', '#');
    _buttonHighlightAll.classList.add(`${_plugin.prefix}-action`);
    _buttonHighlightAll.innerHTML = '高亮所有提及我的留言';
    _buttonHighlightAll.addEventListener('click', (e) => {
        e.preventDefault();
        _highlightAll();
    });
    const _buttonUnhighlightAll = document.createElement('a');
    _buttonUnhighlightAll.setAttribute('href', '#');
    _buttonUnhighlightAll.classList.add(`${_plugin.prefix}-action`);
    _buttonUnhighlightAll.innerHTML = '取消高亮';
    _buttonUnhighlightAll.addEventListener('click', (e) => {
        e.preventDefault();
        _unhighlightAll();
    });
    const _buttonHighlightAllAfterMyLastComment = document.createElement('a');
    _buttonHighlightAllAfterMyLastComment.setAttribute('href', '#');
    _buttonHighlightAllAfterMyLastComment.classList.add(`${_plugin.prefix}-action`);
    _buttonHighlightAllAfterMyLastComment.innerHTML = '高亮未讀';
    _buttonHighlightAllAfterMyLastComment.addEventListener('click', (e) => {
        e.preventDefault();
        _highlightAllAfterMyLastComment();
    });
    const _buttonUnhighlightAllBeforeMyLastComment = document.createElement('a');
    _buttonUnhighlightAllBeforeMyLastComment.setAttribute('href', '#');
    _buttonUnhighlightAllBeforeMyLastComment.classList.add(`${_plugin.prefix}-action`);
    _buttonUnhighlightAllBeforeMyLastComment.innerHTML = '取消高亮已讀';
    _buttonUnhighlightAllBeforeMyLastComment.addEventListener('click', (e) => {
        e.preventDefault();
        _unhighlightAllBeforeMyLastComment();
    });
    ConfigFormActions.append(_buttonHighlightAll, _buttonUnhighlightAll, _buttonHighlightAllAfterMyLastComment, _buttonUnhighlightAllBeforeMyLastComment);
    _plugin.onMutateState = ({ latestComments, isInit }) => {
        if (latestComments) {
            const { userInfo } = core.getState();
            if (userInfo) {
                latestComments.forEach((comment) => {
                    const { element } = comment;
                    if (!element) {
                        return;
                    }
                    const allMeAnchors = element.querySelectorAll(`.reply-content__cont a[href^="https://home.gamer.com.tw/${userInfo.id}"]`);
                    if (allMeAnchors.length > 0) {
                        allMeAnchors.forEach((_anchorElement) => {
                            _anchorElement.classList.add(`${_plugin.prefix}-name`);
                        });
                        element.classList.add(`${_plugin.prefix}-comment`);
                        _highlightAElement(element);
                    }
                });
            }
        }
    };
    _plugin.onMutateConfig = (newValue) => {
        ;
        ['isEnabled', 'onlyShowHighlighted'].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
    };
    return _plugin;
};
exports.default = BHGV2_HighlightMe;


/***/ }),

/***/ 739:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_MasterLayout - 整頁介面
 *  改變整個頁面的格局，例如隱藏左側選單、右側選單等等
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_MasterLayout = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_MasterLayout',
        prefix: 'BHGV2_MasterLayout',
        label: '公會全頁介面',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-hideLeftMenu`,
            suffixLabel: '隱藏左側選單',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideRightMenu`,
            suffixLabel: '隱藏右側資訊欄',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideCoverImage`,
            suffixLabel: '隱藏封面圖',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideHeader`,
            prefixLabel: '(',
            suffixLabel: '+標題)',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideTabMenu`,
            prefixLabel: '(',
            suffixLabel: '+分頁選單)',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-hideGuildControlPanel`,
            suffixLabel: '隱藏公會操作版面',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.configLayout = [
        [`${_plugin.prefix}-hideLeftMenu`, `${_plugin.prefix}-hideRightMenu`],
        [
            `${_plugin.prefix}-hideCoverImage`,
            `${_plugin.prefix}-hideHeader`,
            `${_plugin.prefix}-hideTabMenu`,
        ],
        [`${_plugin.prefix}-hideGuildControlPanel`],
    ];
    _plugin.css = [
        `	
			.${_plugin.prefix}-hideLeftMenu .main-sidebar_left {
				width: 0;
				display: none;
			}
			.${_plugin.prefix}-hideLeftMenu .main-container_center.main-container_center.main-container_center {
				width: 100%;
			}
			.${_plugin.prefix}-hideLeftMenu #left_menu-toggle {
				display: none;
			}

			.${_plugin.prefix}-hideRightMenu .main-sidebar_right {
				width: 0;
				display: none;
			}

			.${_plugin.prefix}-hideCoverImage .main-container_header .scenery-img.scenery-img.scenery-img {
				height: 70px;
			}

			.${_plugin.prefix}-hideCoverImage.${_plugin.prefix}-hideHeader .main-container_header {
				display: none;
			}

			.${_plugin.prefix}-hideCoverImage.${_plugin.prefix}-hideHeader .main-nav {
				padding-left: 20px;
				padding-top: 5px;
			}

			.${_plugin.prefix}-hideCoverImage.${_plugin.prefix}-hideTabMenu #main-nav {
				display: none;
			}

			.${_plugin.prefix}-hideGuildControlPanel .sidebar-navbar_rwd {
				display: none;
			}			
		`,
    ];
    _plugin.onMutateConfig = (newValue) => {
        ;
        [
            'hideLeftMenu',
            'hideRightMenu',
            'hideCoverImage',
            'hideHeader',
            'hideTabMenu',
            'hideGuildControlPanel',
        ].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.Body;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
    };
    return _plugin;
};
exports.default = BHGV2_MasterLayout;


/***/ }),

/***/ 285:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_NotifyOnTitle - 標題提示
 *  當有新的通知/訂閱/推薦時，在網頁標題上顯示數字
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_NotifyOnTitle = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_NotifyOnTitle',
        prefix: 'BHGV2_NotifyOnTitle',
        label: '網頁標題通知',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-isEnable`,
            suffixLabel: '標題顯示通知數目',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-doCountNotice`,
            suffixLabel: '通知',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-doCountSubscribe`,
            suffixLabel: '訂閱',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
        {
            key: `${_plugin.prefix}-doCountRecommend`,
            suffixLabel: '推薦',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
    ];
    const _Title = core.DOM.Title;
    const _originalTitleText = _Title.textContent;
    const _getNofityCount = () => {
        var config = core.getConfig();
        var doCountBools = [
            config[`${_plugin.prefix}-doCountNotice`] || false,
            config[`${_plugin.prefix}-doCountSubscribe`] || false,
            config[`${_plugin.prefix}-doCountRecommend`] || false,
        ];
        return [
            'topBar_light_0',
            'topBar_light_1',
            'topBar_light_2',
        ].reduce((prev, name, i) => {
            if (!doCountBools[i]) {
                return prev;
            }
            const _dom = document.getElementById(name);
            if (!_dom || !_dom.firstChild) {
                return prev;
            }
            return prev + (parseInt(_dom.firstChild.innerHTML) || 0);
        }, 0);
    };
    const _changeTitleWithMsgCount = (msgCount) => {
        if (!_Title || !_originalTitleText) {
            return;
        }
        if (!msgCount || msgCount <= 0) {
            _Title.innerText = _originalTitleText;
            return;
        }
        else if (msgCount > 99) {
            _Title.innerText = `(99+) ${_originalTitleText}`;
            return;
        }
        _Title.innerText = `(${msgCount}) ${_originalTitleText}`;
    };
    let _observer = undefined;
    _plugin.onMutateConfig = (newValue) => {
        if (newValue[`${_plugin.prefix}-isEnable`] === true && !_observer) {
            const _target = document.getElementById('BH-top-data');
            if (_target) {
                _observer = new MutationObserver(() => _changeTitleWithMsgCount(_getNofityCount()));
                _observer.observe(_target, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                });
                _changeTitleWithMsgCount(_getNofityCount());
            }
        }
        else if (newValue[`${_plugin.prefix}-isEnable`] === false && _observer) {
            _observer.disconnect();
            _observer = undefined;
            _changeTitleWithMsgCount(0);
        }
    };
    return _plugin;
};
exports.default = BHGV2_NotifyOnTitle;


/***/ }),

/***/ 923:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


/*******************************************************************************************
 *
 *  BHGV2_PasteUploadImage - 黏貼上傳圖片
 *  複製貼上圖片時自動上傳至 IMGUR 圖床
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const imgur_helper_1 = __webpack_require__(647);
const BHGV2_PasteUploadImage = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_PasteUploadImage',
        prefix: 'BHGV2_PasteUploadImage',
        label: '黏貼上傳圖片',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}:isEnablePaste`,
            suffixLabel: '啟用黏貼上傳圖片',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}:isEnableDragAndDrop`,
            suffixLabel: '啟用拖拉上傳圖片',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    const asyncUploadFiles = (files) => {
        const uploadPromises = [];
        for (let i = 0; i < files.length; i++) {
            if (!files[i]) {
                continue;
            }
            const file = files[i];
            if (file && file.type.startsWith('image/')) {
                uploadPromises.push(new Promise((res, rej) => {
                    imgur_helper_1.postImgurImage(file)
                        .then(({ link }) => {
                        return res({ url: link });
                    })
                        .catch((err) => {
                        return rej(err);
                    });
                }));
            }
        }
        return Promise.allSettled(uploadPromises).then((results) => results
            .map((result) => result.status === 'fulfilled' ? result.value.url : undefined)
            .filter((url) => !!url));
    };
    const handlePaste = (e) => {
        if (!e.clipboardData) {
            return;
        }
        const files = e.clipboardData.items
            ? Array.from(e.clipboardData.items)
                .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
                .filter((item) => !!item)
            : e.clipboardData.files;
        if (files.length > 0) {
            e.preventDefault();
            const editorTextarea = core.DOM.EditorTextarea;
            editorTextarea.setAttribute('disabled', 'true');
            editorTextarea.setRangeText('[[上傳圖片中...]]', editorTextarea.selectionStart, editorTextarea.selectionStart, 'select');
            asyncUploadFiles(files).then((urls) => {
                editorTextarea.setRangeText(urls.map((url) => `${url}\n`).join(''), editorTextarea.selectionStart, editorTextarea.selectionEnd, 'end');
                editorTextarea.removeAttribute('disabled');
            });
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleDrop = async (e) => {
        if (!e.dataTransfer) {
            return;
        }
        console.log(e);
        const files = e.dataTransfer.items
            ? Array.from(e.dataTransfer.items)
                .map((item) => (item.kind === 'file' ? item.getAsFile() : undefined))
                .filter((item) => !!item)
            : e.dataTransfer.files;
        console.log(files);
        if (files.length > 0) {
            e.preventDefault();
            const editorTextarea = core.DOM.EditorTextarea;
            editorTextarea.setAttribute('disabled', 'true');
            editorTextarea.setRangeText('[[上傳圖片中...]]', editorTextarea.selectionStart, editorTextarea.selectionStart, 'select');
            asyncUploadFiles(files).then((urls) => {
                editorTextarea.setRangeText(urls.map((url) => `${url}\n`).join(''), editorTextarea.selectionStart, editorTextarea.selectionEnd, 'end');
                editorTextarea.removeAttribute('disabled');
            });
        }
    };
    _plugin.onMutateConfig = (newValue) => {
        if (newValue[`${_plugin.prefix}:isEnablePaste`] !== undefined) {
            const editorTextarea = core.DOM.EditorTextarea;
            if (editorTextarea) {
                if (newValue[`${_plugin.prefix}:isEnablePaste`]) {
                    editorTextarea.addEventListener('paste', handlePaste);
                    core.toggleEditorTip('黏貼圖片: 上傳', true);
                }
                else {
                    editorTextarea.removeEventListener('paste', handlePaste);
                    core.toggleEditorTip('黏貼圖片: 上傳', false);
                }
                if (newValue[`${_plugin.prefix}:isEnableDragAndDrop`]) {
                    editorTextarea.addEventListener('dragover', handleDragOver);
                    editorTextarea.addEventListener('drop', handleDrop);
                    core.toggleEditorTip('拖拉圖片: 上傳', true);
                }
                else {
                    editorTextarea.removeEventListener('dragover', handleDragOver);
                    editorTextarea.removeEventListener('drop', handleDrop);
                    core.toggleEditorTip('拖拉圖片: 上傳', false);
                }
            }
        }
    };
    return _plugin;
};
exports.default = BHGV2_PasteUploadImage;


/***/ }),

/***/ 557:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_QTEAlert - 高亮我
 *  高亮你在留言中出現的名字
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_QTEAlert = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_QTEAlert',
        prefix: 'BHGV2_QTEAlert',
        label: '秒判警報(實驗功能)',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-isEnabled`,
            suffixLabel: '高亮秒判',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}-notificationSound`,
            suffixLabel: '特殊提示音效',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.css = [
        `
			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment .${_plugin.prefix}-indicator {
				position: absolute;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				border: 4px solid #f00;
				pointer-events: none;
			}

			.${_plugin.prefix}-isEnabled .bhgv2-comment.${_plugin.prefix}-comment .${_plugin.prefix}-indicator:before {
				content: '秒判！';
				position: absolute;
				text-align: center;
				top: 0;
				left: calc(50% - 30px);
				height: 18px;
				width: 60px;
				line-height: 18px;
				background: #f00;
				color: #fff;
				border-bottom-left-radius: 8px;
				border-bottom-right-radius: 8px;
				pointer-events: none;
			}
		`,
    ];
    const notifyAudio = new Audio('https://github.com/SilWolf/bahamut-guild-v2-toolkit/blob/main/src/plugins/bhgv2-qte-alert/notify_for_qte.mp3?raw=true');
    _plugin.onMutateState = ({ latestComments, isInit, isUserAction }) => {
        let found = false;
        const config = core.getConfig();
        if (latestComments) {
            for (let i = 0; i < latestComments.length; i++) {
                const comment = latestComments[i];
                const { element, payload } = comment;
                if (!element) {
                    return;
                }
                const text = payload?.text ?? element.textContent;
                if (!text) {
                    return;
                }
                if (text.match(/秒[^\(（)]*[\)）]/)) {
                    element.classList.add(`${_plugin.prefix}-comment`);
                    const indicator = document.createElement('div');
                    indicator.classList.add(`${_plugin.prefix}-indicator`);
                    element.appendChild(indicator);
                    found = true;
                }
            }
            if (isInit || isUserAction) {
                return;
            }
            console.log('qte', found);
            console.log('qte', config[`${_plugin.prefix}-notificationSound`]);
            // 播放通知音
            if (found && config[`${_plugin.prefix}-notificationSound`]) {
                notifyAudio.play();
            }
        }
    };
    _plugin.onMutateConfig = (newValue) => {
        ;
        ['isEnabled', 'notificationSound'].forEach((key) => {
            if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
                const dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(`${_plugin.prefix}-${key}`, newValue[`${_plugin.prefix}-${key}`]);
                }
            }
        });
    };
    return _plugin;
};
exports.default = BHGV2_QTEAlert;


/***/ }),

/***/ 87:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_Rainbow - 彩虹留言
 *  給自己以外的玩家留言填上顏色
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_Rainbow = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_Rainbow',
        prefix: 'BHGV2_Rainbow',
        label: '彩虹底色',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}:isEnable`,
            suffixLabel: '啟用彩虹底色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    const _colors = [
        {
            light: '#bacff5',
            dark: '#2b3c5a',
        },
        {
            light: '#f5badb',
            dark: '#4c273c',
        },
        {
            light: '#f5f2ba',
            dark: '#44410b',
        },
        {
            light: '#c6f5ba',
            dark: '#103a05',
        },
        {
            light: '#f5e3ba',
            dark: '#423a28',
        },
        {
            light: '#bcbaf5',
            dark: '#272632',
        },
        {
            light: '#bacff5',
            dark: '#061530',
        },
        {
            light: '#d8baf5',
            dark: '#3c2010',
        },
        {
            light: '#8accdb',
            dark: '#073c48',
        },
        {
            light: '#db8ab3',
            dark: '#34081e',
        },
        {
            light: '#dbd48a',
            dark: '#403c0e',
        },
        {
            light: '#8bdb8a',
            dark: '#052805',
        },
    ];
    _plugin.css = _colors.map((color, index) => `
			.bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color.light};
			}

			.bhgv2-dark .bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color.dark};
			}
		`);
    _plugin.onMutateConfig = (newValue) => {
        if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
            const dom = core.DOM.CommentList;
            if (dom) {
                dom.classList.toggle('bhgv2-color-comment-enabled', newValue[`${_plugin.prefix}:isEnable`]);
            }
        }
    };
    const _cachedUserId = {};
    _plugin.onMutateState = (newValue) => {
        if (newValue.latestComments !== undefined) {
            // 高亮其他人的訊息
            const { userInfo } = core.getState();
            const myId = userInfo?.id;
            newValue.latestComments.forEach((comment) => {
                const commentElement = comment.element;
                if (!commentElement) {
                    return;
                }
                const commentUserId = commentElement?.getAttribute('data-userid');
                if (!commentUserId) {
                    return;
                }
                if (commentUserId === myId) {
                    return;
                }
                let colorIndex = _cachedUserId[commentUserId];
                if (colorIndex === undefined) {
                    colorIndex = Object.keys(_cachedUserId).length % _colors.length;
                    _cachedUserId[commentUserId] = colorIndex;
                }
                commentElement.classList.add(`bhgv2-color-comment-${colorIndex}`);
            });
        }
    };
    return _plugin;
};
exports.default = BHGV2_Rainbow;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(776);
/******/ 	
/******/ })()
;