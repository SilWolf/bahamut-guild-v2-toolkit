// ==UserScript==
// @name            巴哈姆特公會2.0插件
// @namespace       https://silwolf.io
// @version         0.4.0
// @description     巴哈姆特公會2.0插件
// @author          銀狼(silwolf167)
// @contributors    海角－沙鷗(jason21716)
// @include         /guild.gamer.com.tw/post_detail.php
// @grant           GM_notification
// @updateUrl       https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/bahamut-guild-v2-toolkits.user.js
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
const bhgv2_comments_reverse_1 = __importDefault(__webpack_require__(547));
const bhgv2_dark_mode_1 = __importDefault(__webpack_require__(340));
const global_css_1 = __importDefault(__webpack_require__(440));
const postDetail_css_1 = __importDefault(__webpack_require__(507));
const bhgv2_rainbow_1 = __importDefault(__webpack_require__(87));
const bhgv2_dense_1 = __importDefault(__webpack_require__(115));
const bhgv2_master_layout_1 = __importDefault(__webpack_require__(739));
const bhgv2_notify_on_title_1 = __importDefault(__webpack_require__(285));
const bhgv2_highlight_me_1 = __importDefault(__webpack_require__(898));
const bhgv2_quick_input_1 = __importDefault(__webpack_require__(353));
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
    const _config = {};
    const _state = {};
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
        DOM: {},
        commentsMap: {},
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
                const oldValue = core.getStateByNames('gsn', 'sn');
                const gsn = newValue.gsn || oldValue.gsn;
                const sn = newValue.sn || oldValue.sn;
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
                                time: payload.ctime,
                            },
                            marked: GuildTextUtil.markedInstance,
                            youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
                            user: guildPost.loginUser,
                        }))[0];
                        newElement.classList.add('bhgv2-comment');
                        const _replyContentUser = newElement.querySelector('.reply-content__user');
                        if (_replyContentUser) {
                            newElement.setAttribute('data-user', _replyContentUser.textContent);
                            newElement.setAttribute('data-userid', _replyContentUser.href.split('/').pop());
                        }
                        return newElement;
                    };
                    const oldestLatestComment = newValue.latestComments[0];
                    const oldestLatestCommentId = parseInt(oldestLatestComment.id);
                    let oldCommentIndex = Array.from(CommentList.children).findIndex((e) => parseInt(e.getAttribute('data-csn')) >=
                        oldestLatestCommentId);
                    if (oldCommentIndex === -1) {
                        oldCommentIndex = CommentList.children.length;
                    }
                    for (let newCommentIndex = 0; newCommentIndex < newValue.latestComments.length; newCommentIndex++) {
                        const newComment = newValue.latestComments[newCommentIndex];
                        const newCommentId = parseInt(newComment.id);
                        if (newComment.element &&
                            core.commentsMap[newComment.id] === undefined) {
                            newComment.element.classList.add('bhgv2-comment');
                            const _replyContentUser = newComment.element.querySelector('.reply-content__user');
                            if (_replyContentUser) {
                                newComment.element.setAttribute('data-user', _replyContentUser.textContent);
                                newComment.element.setAttribute('data-userid', _replyContentUser.href.split('/').pop());
                            }
                            core.commentsMap[newComment.id] = newComment;
                            revisedLatestComments.push(newComment);
                            continue;
                        }
                        const _payload = newComment.payload;
                        if (!_payload) {
                            continue;
                        }
                        while (oldCommentIndex < 9999) {
                            if (oldCommentIndex >= CommentList.children.length) {
                                newComment.element = _createCommentElement(_payload);
                                CommentList.append(newComment.element);
                                oldCommentIndex++;
                                revisedLatestComments.push(newComment);
                                core.commentsMap[newComment.id] = newComment;
                                break;
                            }
                            const oldCommentElement = CommentList.children[oldCommentIndex];
                            const oldCommentId = parseInt(oldCommentElement.getAttribute('data-csn'));
                            if (oldCommentId === newCommentId) {
                                oldCommentIndex++;
                                break;
                            }
                            else if (newCommentId < oldCommentId) {
                                newComment.element = _createCommentElement(_payload);
                                oldCommentElement.insertAdjacentElement('beforebegin', newComment.element);
                                oldCommentIndex++;
                                revisedLatestComments.push(newComment);
                                core.commentsMap[newComment.id] = newComment;
                                break;
                            }
                            oldCommentIndex++;
                        }
                    }
                    newValue.commentsCount = Object.keys(core.commentsMap).length;
                    newValue.latestComments =
                        revisedLatestComments.length > 0 ? revisedLatestComments : undefined;
                }
            }
        };
        _plugin.onMutateConfig = (newValue) => {
            const form = core.DOM.ConfigFormContent;
            if (!form) {
                return;
            }
            Object.keys(newValue).forEach((key) => {
                const input = form.querySelector(`input[data-config-key='${key}']`);
                if (input) {
                    switch (input.getAttribute('data-type')) {
                        case 'number':
                        case 'text':
                            input.value = newValue[key] || '';
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
    const _dom = CORE.DOM;
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
    _dom.CommentListOuter = document.getElementsByClassName('webview_commendlist')[0];
    _dom.CommentListOuter.classList.add('bhgv2-comment-list-outer');
    _dom.CommentList = _dom.CommentListOuter.firstElementChild;
    _dom.CommentList.classList.add('bhgv2-comment-list');
    _dom.EditorContainer = _dom.CommentListOuter.getElementsByClassName('c-reply__editor')[0];
    _dom.EditorContainer.classList.add('bhgv2-editor-container');
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
    _dom.EditorTextareaWrapper.append(_dom.EditorTextareaCarbon, _dom.EditorTextarea);
    oldEditorTextarea.insertAdjacentElement('afterend', _dom.EditorTextareaWrapper);
    oldEditorTextarea.parentNode?.removeChild(oldEditorTextarea);
    _dom.EditorContainerReplyContentFooter = document.createElement('div');
    _dom.EditorContainerReplyContentFooter.classList.add('bhgv2-editor-container-reply-content-footer');
    _dom.EditorContainerReplyContentFooter.innerHTML = `Enter: 發送　Shift+Enter: 換行　Tab: 快速輸入　/指令　@快速輸入`;
    _dom.EditorContainerReplyContent.append(_dom.EditorContainerReplyContentFooter);
    _dom.EditorContainerFooter = document.createElement('div');
    _dom.EditorContainerFooter.classList.add('bhgv2-editor-container-footer');
    _dom.EditorContainer.appendChild(_dom.EditorContainerFooter);
    _dom.ConfigPanelStatus = document.createElement('div');
    _dom.ConfigPanelStatus.classList.add('bhgv2-config-status');
    _dom.ConfigPanelSwitch = document.createElement('a');
    _dom.ConfigPanelSwitch.classList.add('bhgv2-config-switch');
    _dom.ConfigPanelSwitch.innerHTML = '插件設定';
    _dom.ConfigPanelSwitch.setAttribute('href', '#');
    _dom.EditorContainerFooter.appendChild(_dom.ConfigPanelStatus);
    _dom.EditorContainerFooter.appendChild(_dom.ConfigPanelSwitch);
    _dom.ConfigPanel = document.createElement('div');
    _dom.ConfigPanel.classList.add('bhgv2-config-panel');
    _dom.EditorContainer.append(_dom.ConfigPanel);
    _dom.ConfigForm = document.createElement('form');
    _dom.ConfigForm.classList.add('bhgv2-config-form');
    _dom.ConfigPanel.append(_dom.ConfigForm);
    _dom.ConfigFormContent = document.createElement('div');
    _dom.ConfigFormContent.classList.add('bhgv2-config-form-content');
    _dom.ConfigFormMessage = document.createElement('div');
    _dom.ConfigFormMessage.classList.add('bhgv2-config-form-message');
    _dom.ConfigFormFooter = document.createElement('div');
    _dom.ConfigFormFooter.classList.add('bhgv2-config-form-footer');
    _dom.ConfigFormActions = document.createElement('div');
    _dom.ConfigFormActions.classList.add('bhgv2-config-form-actions');
    _dom.ConfigForm.append(_dom.ConfigFormContent, _dom.ConfigFormMessage, _dom.ConfigFormFooter, _dom.ConfigFormActions);
    _dom.ConfigFormFooterSaveAsDefault = document.createElement('button');
    _dom.ConfigFormFooterSaveAsDefault.innerHTML = '設為預設值';
    _dom.ConfigFormFooterSave = document.createElement('button');
    _dom.ConfigFormFooterSave.innerHTML = '儲存';
    _dom.ConfigFormFooter.append(_dom.ConfigFormFooterSaveAsDefault, _dom.ConfigFormFooterSave);
    [_CorePlugin, ...plugins].forEach((plugin) => {
        try {
            const _plugin = plugin(CORE);
            // 初始化config
            _plugin.configs?.forEach(({ key, defaultValue }) => {
                _config[key] = defaultValue;
                if (defaultValue === undefined) {
                    LOG(`插件 ${_plugin.pluginName}　的設定 ${key} 的 defaultValue 為空，請設定。`);
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
    _dom.ConfigFormContent.innerHTML = '';
    _plugins.forEach(({ configs, configLayout }) => {
        if (!configs) {
            return;
        }
        const _configLayout = configLayout || [
            configs.map((_config) => _config.key),
        ];
        for (const row of _configLayout) {
            const rowElement = document.createElement('div');
            rowElement.classList.add('bhgv2-config-form-row');
            for (const col of row) {
                const configItem = configs.find((_config) => _config.key === col);
                if (!configItem) {
                    return;
                }
                const colElement = document.createElement('div');
                colElement.classList.add('bhgv2-config-form-col');
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
                }
                inputWrapperElement.setAttribute('for', configItem.key);
                inputElement.setAttribute('id', configItem.key);
                inputElement.setAttribute('data-config-key', configItem.key);
                inputElement.setAttribute('data-type', configItem.dataType);
                inputWrapperElement.prepend(inputElement);
                const suffixLabel = document.createElement('span');
                suffixLabel.innerHTML = configItem.suffixLabel || '';
                colElement.append(prefixLabel, inputWrapperElement, suffixLabel);
                rowElement.append(colElement);
            }
            _dom.ConfigFormContent.append(rowElement);
        }
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
        const newConfig = Array.from(form.querySelectorAll('input[data-config-key]')).reduce((prev, element) => {
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
                console.log('請輸入內容');
                return false;
            }
            const { gsn, sn } = CORE.getState();
            if (!gsn || !sn) {
                console.log('GSN或SN是空值！');
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
                            payload: json.data.commentData,
                        },
                    ],
                    isUserAction: true,
                });
            })
                .finally(() => {
                textarea.value = '';
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
                const _newComments = Array.from(_CommentList.children).map((element) => ({
                    id: element.getAttribute('data-csn'),
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
                    bhgv2_comments_reverse_1.default,
                    bhgv2_dark_mode_1.default,
                    bhgv2_rainbow_1.default,
                    bhgv2_dense_1.default,
                    bhgv2_master_layout_1.default,
                    bhgv2_notify_on_title_1.default,
                    bhgv2_highlight_me_1.default,
                    bhgv2_quick_input_1.default,
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
	font-size: 15px;
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

.bhgv2-editor-container-reply-content-footer {
	font-size: 12px;
	color: #777;
	padding: 2px 8px;
}

.bhgv2-editor-container-footer .bhgv2-config-status {
	flex: 1;
}

.bhgv2-config-panel {
	background: #ffffff;
	padding: 8px;
	border-radius: 4px;
	display: none;
}

.bhgv2-config-panel.active {
	display: block;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel input {
	border: 1px solid #999;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button {
	display: inline-block;
	-webkit-border-radius: 5px;
	-moz-border-radius: 5px;
	border-radius: 5px;
	background-color: #eee;
	padding: 3px;
	margin-left: 2px;
	margin-right: 2px;
	border: 1px solid #333;
	color: #000;
	text-decoration: none;
}

.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button:disabled {
	color: #ccc;
}

.bhgv2-config-form-message {
	text-align: center;
	color: #4a934a;
	font-size: 12px;
	min-height: 24px;
	line-height: 16px;
	padding: 4px;
	margin-top: 0.5rem;
}

.bhgv2-config-form-footer {
	text-align: center;
	margin-top: 0.5rem;
}

.bhgv2-config-form-footer > * + * {
	margin-left: 1rem;
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
	display: flex;
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
`;


/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = `
.bhgv2-editor .bhgv2-editor-textarea {
	min-height: 66px;
}
`;


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
            suffixLabel: '秒',
            dataType: 'number',
            inputType: 'number',
            defaultValue: 30,
        },
        {
            key: `${_plugin.prefix}:notification`,
            suffixLabel: '自動更新時發送桌面通知',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: `${_plugin.prefix}:notificationSound`,
            suffixLabel: '提示音',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: true,
        },
    ];
    _plugin.configLayout = [
        [`${_plugin.prefix}:isEnable`, `${_plugin.prefix}:interval`],
        [`${_plugin.prefix}:notification`, `${_plugin.prefix}:notificationSound`],
    ];
    const _statusDom = document.createElement('span');
    core.DOM.ConfigPanelStatus?.append(_statusDom);
    let _refreshIntervalObj = undefined;
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
                const _config = core.getConfig();
                let _interval = parseInt(newValue[`${_plugin.prefix}:interval`] ||
                    _config[`${_plugin.prefix}:interval`]);
                if (!_interval || _interval <= 0) {
                    _interval = 30;
                }
                const _intervalMs = _interval * 1000;
                const timeoutFn = async () => {
                    const { commentListApi } = core.getState();
                    if (!commentListApi) {
                        return;
                    }
                    const { comments, commentCount: newCommentsCount } = await fetch(commentListApi, {
                        credentials: 'include',
                    })
                        .then((res) => res.json())
                        .then((res) => res.data);
                    const { commentsCount: currentCommentsCount } = core.getState();
                    const latestComments = [
                        ...comments.map((_comment) => ({
                            id: _comment.id,
                            payload: _comment,
                        })),
                    ];
                    const expectedNewCommentsCount = newCommentsCount - (currentCommentsCount || 0);
                    let page = 0;
                    while (latestComments.length < expectedNewCommentsCount &&
                        page < 999) {
                        page++;
                        const { comments: anotherComments } = await fetch(commentListApi + `&page=${page}`, {
                            credentials: 'include',
                        })
                            .then((res) => res.json())
                            .then((res) => res.data);
                        latestComments.push(...anotherComments.map((_comment) => ({
                            id: _comment.id,
                            payload: _comment,
                        })));
                    }
                    core.mutateState({ latestComments });
                    _refreshIntervalObj = setTimeout(timeoutFn, _intervalMs);
                };
                _refreshIntervalObj = setTimeout(timeoutFn, _intervalMs);
                const _notification = newValue[`${_plugin.prefix}:notification`] !== undefined
                    ? newValue[`${_plugin.prefix}:notification`]
                    : _config[`${_plugin.prefix}:notification`];
                const _notificationSound = newValue[`${_plugin.prefix}:notificationSound`] !== undefined
                    ? newValue[`${_plugin.prefix}:notificationSound`]
                    : _config[`${_plugin.prefix}:notificationSound`];
                _statusDom.innerHTML = `自動更新中(${[
                    `${_interval}s`,
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
        if (newValue.latestComments !== undefined) {
            const config = core.getConfig();
            if (config[`${_plugin.prefix}:notification`]) {
                // 發送桌面通知
                notification_helper_1.createNotification({
                    title: '測試用通知',
                    text: '測試用通知',
                });
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
				margin-left: -20px;
				margin-right: -20px;
				padding-left: 20px;
				padding-right: 20px;
				background-color: rgba(180, 180, 180, 0.9);
				box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
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
 *  當啟動巴哈的黑闇模式時，使插件介面也跟著黑闇起來
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_DarkMode = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_DarkMode',
        prefix: 'BHGV2_DarkMode',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}:isEnable`,
            suffixLabel: '巴哈開啟黑闇模式時切換介面顏色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
    ];
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
    ];
    _plugin.onMutateConfig = (newValue) => {
        if (newValue[`${_plugin.prefix}:isEnable`] !== undefined) {
            const dom = core.DOM.EditorContainer;
            if (dom) {
                dom.classList.toggle('bhgv2-dark-mode-enabled', newValue[`${_plugin.prefix}:isEnable`]);
            }
        }
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
            //檢查c-reply__editor是否存在，避免不必要的error觸發
            const editorContainer = core.DOM.EditorContainer;
            if (!editorContainer) {
                return;
            }
            editorContainer.classList.toggle('dark', _getCookie('ckForumDarkTheme') == 'yes');
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
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-tradUI`,
            suffixLabel: '仿舊版的配色',
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
            key: `${_plugin.prefix}-narrowerGutter`,
            suffixLabel: '更窄的間距',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.configLayout = [
        [
            `${_plugin.prefix}-tradUI`,
            `${_plugin.prefix}-sizeSmaller`,
            `${_plugin.prefix}-narrowerGutter`,
        ],
        [`${_plugin.prefix}-hideFooter`],
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
			
			.${_plugin.prefix}-sizeSmaller .reply-content__user.reply-content__user.reply-content__user,
			.${_plugin.prefix}-sizeSmaller .reply-content__cont.reply-content__cont.reply-content__cont {
				font-size: 12px;
				line-height: 1;
				margin-top: 0;
			}

			.${_plugin.prefix}-hideFooter .reply-content__footer.reply-content__footer.reply-content__footer {
				display: none;
			}

			.${_plugin.prefix}-tradUI .bhgv2-comment {
				background-color: #e9f5f4;
				border: 1px solid #daebe9;
				margin-top: 3px;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-comment.bhgv2-comment.bhgv2-comment {
				padding-top: 6px;
				padding-bottom: 6px;
				padding-left: 10px;
				padding-right: 10px;
			}

			.${_plugin.prefix}-narrowerGutter .bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {
				padding-left: 10px;
				padding-right: 10px;
			}

			.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				margin-left: 20px;
				display: none;
			}

			.${_plugin.prefix}-hideFooter .${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton.${_plugin.prefix}-clonedTagButton {
				display: inline-block;
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
                _clonedTagButton.innerText = '@';
                _clonedTagButton.setAttribute('title', '回覆他');
                _contentUser.insertAdjacentElement('afterend', _clonedTagButton);
            });
        }
    };
    _plugin.onMutateConfig = (newValue) => {
        ;
        ['tradUI', 'sizeSmaller', 'hideFooter', 'narrowerGutter'].forEach((key) => {
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
            suffixLabel: '隱藏右側欄',
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

/***/ 353:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_QuickInput - 快速輸入
 *  以類似 @Mention 的方式快速輸入預設內容
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
const BHGV2_QuickInput = (core) => {
    const _plugin = {
        pluginName: 'BHGV2_QuickInput',
        prefix: 'BHGV2_QuickInput',
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}-isEnabled`,
            suffixLabel: '啟動快速輸入功能',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    const wordMap = {
        1: '[silwolf167:銀狼]',
        2: '[GN02324817:鯊鯊~]',
        3: '[a29719811:小元]',
        all: '@1@2@3',
        apple: '[apple:蘋果]',
        banana: '[banana:香蕉]',
        car: '[car:汽車]',
        doll: '[doll:公仔]',
        egg: '[egg:雞蛋]',
        fish: '[fish:魚]',
        goat: '[goat:山羊]',
        r1: '快速回覆１',
        r2: '快速回覆２',
        r3: '快速回覆３',
        r4: '快速回覆４',
        d0: '（無傷）',
        d1: '（輕傷）',
        d2: '（中傷）',
        d3: '（重傷）',
        d4: '（瀕死）',
    };
    const _formatCarbonTrailingHTML = (content) => `<code>TAB</code> ${content}`;
    const _findKeyWordPair = (text, { exactMatch } = {}) => {
        if (!exactMatch) {
            const key = Object.keys(wordMap).find((_key) => _key.startsWith(text));
            return key ? { key, word: wordMap[key] } : undefined;
        }
        let key = undefined;
        Object.keys(wordMap).forEach((_key) => {
            if (text.startsWith(_key)) {
                key = _key;
            }
        });
        return key ? { key, word: wordMap[key] } : undefined;
    };
    _plugin.onEvent = (eventName, payload) => {
        const config = core.getConfig();
        if (!config[`${_plugin.prefix}-isEnabled`]) {
            return true;
        }
        if (eventName === 'textarea-input') {
            const event = payload?.event;
            if (!event) {
                return true;
            }
            const textarea = event.currentTarget;
            if (!textarea) {
                return true;
            }
            const CarbonTrailing = core.DOM.EditorTextareaCarbonTrailing;
            if (!CarbonTrailing) {
                return true;
            }
            CarbonTrailing.innerHTML = '';
            const content = textarea.value;
            const match = content.match(/\@([^\s\@]+)$/);
            if (match && match[1]) {
                const inputText = match[1];
                const pair = _findKeyWordPair(inputText);
                if (pair && pair.word) {
                    CarbonTrailing.innerHTML = _formatCarbonTrailingHTML(pair.word);
                }
            }
        }
        if (eventName === 'textarea-keydown') {
            const event = payload?.event;
            if (!event) {
                return true;
            }
            const textarea = event.currentTarget;
            if (!textarea) {
                return true;
            }
            const key = event.key;
            if (key === 'Tab' || key === 'Enter') {
                let value = textarea.value;
                let isValueChanged = false;
                const CarbonText = core.DOM.EditorTextareaCarbonText;
                if (!CarbonText) {
                    return true;
                }
                const CarbonTrailing = core.DOM.EditorTextareaCarbonTrailing;
                if (!CarbonTrailing) {
                    return true;
                }
                const match = value.match(/\@([^\s\@]+)$/);
                if (match && match[1]) {
                    const pair = _findKeyWordPair(match[1]);
                    if (pair && pair.word) {
                        value = value.replace(/\@([^\s\@]+)$/, pair.word + ' ');
                        CarbonTrailing.innerHTML = '';
                        isValueChanged = true;
                    }
                }
                const matches = [...textarea.value.matchAll(/\@([^\s\@]+)/g)];
                if (matches) {
                    for (let match of matches) {
                        const pair = _findKeyWordPair(match[1], { exactMatch: true });
                        if (pair && pair.word) {
                            value = value.replace(`@${pair.key}`, pair.word + ' ');
                            isValueChanged = true;
                        }
                    }
                }
                if (isValueChanged) {
                    event.preventDefault();
                    textarea.selectionStart = 0;
                    textarea.selectionEnd = textarea.value.length;
                    document.execCommand('insertText', false, value);
                    textarea.style.height = 'auto';
                    textarea.style.height = textarea.scrollHeight + 'px';
                    return false;
                }
                return true;
            }
        }
        return true;
    };
    _plugin.onMutateConfig = (newValue) => {
        ;
        ['isEnabled'].forEach((key) => {
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
exports.default = BHGV2_QuickInput;


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
    };
    _plugin.configs = [
        {
            key: `${_plugin.prefix}:isEnable`,
            suffixLabel: '改變留言的底色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    const _colors = [
        '#bacff5',
        '#f5badb',
        '#f5f2ba',
        '#c6f5ba',
        '#f5e3ba',
        '#bcbaf5',
        '#d8baf5',
        '#8accdb',
        '#db8ab3',
        '#dbd48a',
        '#8bdb8a',
    ];
    _plugin.css = _colors.map((color, index) => `
			.bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-${index} {
				background-color: ${color};
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