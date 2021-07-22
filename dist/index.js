// ==UserScript==
// @name            巴哈姆特公會2.0插件
// @namespace       https://silwolf.io
// @version         0.4.0
// @description     巴哈姆特公會2.0插件
// @author          銀狼(silwolf167)
// @contributors    海角－沙鷗(jason21716)
// @include         /guild.gamer.com.tw/guild.php
// @include         /guild.gamer.com.tw/post_detail.php
// @grant           GM_notification
// @updateUrl       https://raw.githubusercontent.com/SilWolf/bahamut-guild-v2-toolkit/main/bahamut-guild-v2-toolkits.user.js
// ==/UserScript==
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 776:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var bhgv2_auto_refresh_1 = __importDefault(__webpack_require__(503));
var bhgv2_comments_reverse_1 = __importDefault(__webpack_require__(547));
var bhgv2_dark_mode_1 = __importDefault(__webpack_require__(340));
var global_css_1 = __importDefault(__webpack_require__(440));
var postDetail_css_1 = __importDefault(__webpack_require__(507));
var bhgv2_rainbow_1 = __importDefault(__webpack_require__(87));
var bhgv2_dense_1 = __importDefault(__webpack_require__(115));
/** 等待DOM準備完成 */
var BHGV2Core = function (_a) {
    var plugins = _a.plugins, library = _a.library;
    var LOG = function (message, type) {
        if (type === void 0) { type = 'log'; }
        ;
        (console[type] || console.log)("[\u5DF4\u54C8\u63D2\u4EF62.0] " + message);
    };
    var _plugins = [];
    var _library = __assign({}, library);
    var _config = {};
    var _state = {};
    var CORE = {
        getConfig: function () { return _config; },
        getConfigByNames: function () {
            var names = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                names[_i] = arguments[_i];
            }
            return names.reduce(function (prev, key) {
                if (_config[key] !== undefined) {
                    prev[key] = _config[key];
                }
                return prev;
            }, {});
        },
        mutateConfig: function (newValue) {
            _plugins.forEach(function (plugin) { var _a; return (_a = plugin.onMutateConfig) === null || _a === void 0 ? void 0 : _a.call(plugin, newValue); });
            Object.entries(newValue).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                _config[key] = value;
            });
        },
        getState: function () { return _state; },
        getStateByNames: function () {
            var names = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                names[_i] = arguments[_i];
            }
            return names.reduce(function (prev, key) {
                if (_state[key] !== undefined) {
                    prev[key] = _state[key];
                }
                return prev;
            }, {});
        },
        mutateState: function (newValue) {
            _plugins.forEach(function (plugin) { var _a; return (_a = plugin.onMutateState) === null || _a === void 0 ? void 0 : _a.call(plugin, newValue); });
            Object.entries(newValue).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                _state[key] = value;
            });
        },
        useLibrary: function (name, defaultLibraryIfNotFound) {
            if (_library[name])
                return _library[name];
            _library[name] = defaultLibraryIfNotFound;
            return _library[name];
        },
        emit: function (eventName, payload) {
            _plugins.forEach(function (plugin) { var _a; return (_a = plugin.onEvent) === null || _a === void 0 ? void 0 : _a.call(plugin, eventName, payload); });
        },
        log: LOG,
        DOM: {},
        commentsMap: {},
    };
    var _CorePlugin = function (core) {
        var _plugin = {
            pluginName: 'BHGV2Core',
            prefix: 'BHGV2Core',
        };
        _plugin.onMutateState = function (newValue) {
            if (newValue.gsn !== undefined || newValue.sn !== undefined) {
                var oldValue = core.getStateByNames('gsn', 'sn');
                var gsn = newValue.gsn || oldValue.gsn;
                var sn = newValue.sn || oldValue.sn;
                if (gsn && sn) {
                    newValue.postApi = "https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=" + gsn + "&messageId=" + sn;
                    newValue.commentListApi = "https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=" + gsn + "&messageId=" + sn;
                }
            }
            if (newValue.latestComments && newValue.latestComments.length > 0) {
                var oldValue = core.getStateByNames('gsn', 'sn');
                var gsn_1 = newValue.gsn || oldValue.gsn;
                var sn_1 = newValue.sn || oldValue.sn;
                var CommentList = core.DOM.CommentList;
                var revisedLatestComments = [];
                // revisedLatestComments 的存在理由
                // 因為mutateState會將資料往插件傳，所以必須過濾不必要的資料
                // 這裡的邏輯是假如沒法生成element的話，就整個latestComments也不往下傳，以防不必要錯誤
                if (gsn_1 && sn_1 && CommentList) {
                    var _createCommentElement = function (payload) {
                        // 生成comment的element
                        var newElement = $(nunjucks.render('comment.njk.html', {
                            post: {
                                id: sn_1,
                                commentCount: 0,
                                to: { gsn: gsn_1 },
                            },
                            comment: __assign(__assign({}, payload), { text: GuildTextUtil.mentionTagToMarkdown(gsn_1, payload.text, payload.tags, payload.mentions), time: payload.ctime }),
                            marked: GuildTextUtil.markedInstance,
                            youtubeParameterMatcher: GuildTextUtil.youtubeParameterMatcher,
                            user: guildPost.loginUser,
                        }))[0];
                        newElement.classList.add('bhgv2-comment');
                        var _replyContentUser = newElement.querySelector('.reply-content__user');
                        if (_replyContentUser) {
                            newElement.setAttribute('data-user', _replyContentUser.textContent);
                            newElement.setAttribute('data-userid', _replyContentUser.href.split('/').pop());
                        }
                        return newElement;
                    };
                    var oldestLatestComment = newValue.latestComments[0];
                    var oldestLatestCommentId_1 = parseInt(oldestLatestComment.id);
                    var oldCommentIndex = Array.from(CommentList.children).findIndex(function (e) {
                        return parseInt(e.getAttribute('data-csn')) >=
                            oldestLatestCommentId_1;
                    });
                    if (oldCommentIndex === -1) {
                        oldCommentIndex = CommentList.children.length;
                    }
                    for (var newCommentIndex = 0; newCommentIndex < newValue.latestComments.length; newCommentIndex++) {
                        var newComment = newValue.latestComments[newCommentIndex];
                        var newCommentId = parseInt(newComment.id);
                        if (newComment.element &&
                            core.commentsMap[newComment.id] === undefined) {
                            newComment.element.classList.add('bhgv2-comment');
                            var _replyContentUser = newComment.element.querySelector('.reply-content__user');
                            if (_replyContentUser) {
                                newComment.element.setAttribute('data-user', _replyContentUser.textContent);
                                newComment.element.setAttribute('data-userid', _replyContentUser.href.split('/').pop());
                            }
                            core.commentsMap[newComment.id] = newComment;
                            revisedLatestComments.push(newComment);
                            continue;
                        }
                        var _payload = newComment.payload;
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
                            var oldCommentElement = CommentList.children[oldCommentIndex];
                            var oldCommentId = parseInt(oldCommentElement.getAttribute('data-csn'));
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
        _plugin.onMutateConfig = function (newValue) {
            var form = core.DOM.ConfigFormContent;
            if (!form) {
                return;
            }
            Object.keys(newValue).forEach(function (key) {
                var input = form.querySelector("input[data-config-key='" + key + "']");
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
    var _dom = CORE.DOM;
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
    _dom.CommentListOuter = document.getElementsByClassName('webview_commendlist')[0];
    _dom.CommentListOuter.classList.add('bhgv2-comment-list-outer');
    _dom.CommentList = _dom.CommentListOuter.firstElementChild;
    _dom.CommentList.classList.add('bhgv2-comment-list');
    _dom.EditorContainer = _dom.CommentListOuter.getElementsByClassName('c-reply__editor')[0];
    _dom.EditorContainer.classList.add('bhgv2-editor-container');
    _dom.Editor = _dom.EditorContainer.getElementsByClassName('reply-input')[0];
    _dom.Editor.classList.add('bhgv2-editor');
    _dom.EditorTextarea = _dom.Editor.getElementsByTagName('textarea')[0];
    _dom.EditorTextarea.classList.add('bhgv2-editor-textarea');
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
    _dom.ConfigForm.append(_dom.ConfigFormContent, _dom.ConfigFormMessage, _dom.ConfigFormFooter);
    _dom.ConfigFormFooterSaveAsDefault = document.createElement('button');
    _dom.ConfigFormFooterSaveAsDefault.innerHTML = '設為預設值';
    _dom.ConfigFormFooterSave = document.createElement('button');
    _dom.ConfigFormFooterSave.innerHTML = '儲存';
    _dom.ConfigFormFooter.append(_dom.ConfigFormFooterSaveAsDefault, _dom.ConfigFormFooterSave);
    __spreadArray([_CorePlugin], plugins).forEach(function (plugin) {
        var _a;
        try {
            var _plugin_1 = plugin(CORE);
            // 初始化config
            (_a = _plugin_1.configs) === null || _a === void 0 ? void 0 : _a.forEach(function (_a) {
                var key = _a.key, defaultValue = _a.defaultValue;
                _config[key] = defaultValue;
                if (defaultValue === undefined) {
                    LOG("\u63D2\u4EF6 " + _plugin_1.pluginName + "\u3000\u7684\u8A2D\u5B9A " + key + " \u7684 defaultValue \u70BA\u7A7A\uFF0C\u8ACB\u8A2D\u5B9A\u3002");
                }
            });
            _plugins.push(_plugin_1);
        }
        catch (e) {
            LOG("\u8F09\u5165\u63D2\u4EF6\u5931\u6557, " + e.toString(), 'error');
        }
    });
    // 將所有插件的css塞進HeadStyle中
    _dom.HeadStyle.innerHTML = _plugins
        .reduce(function (prev, _plugin) { return __spreadArray(__spreadArray([], prev), (_plugin.css || [])); }, [])
        .join('\n\n');
    // 更新設定版面
    _dom.ConfigFormContent.innerHTML = '';
    _plugins.forEach(function (_a) {
        var configs = _a.configs, configLayout = _a.configLayout;
        if (!configs) {
            return;
        }
        var _configLayout = configLayout || [
            configs.map(function (_config) { return _config.key; }),
        ];
        for (var _i = 0, _configLayout_1 = _configLayout; _i < _configLayout_1.length; _i++) {
            var row = _configLayout_1[_i];
            var rowElement = document.createElement('div');
            rowElement.classList.add('bhgv2-config-form-row');
            var _loop_1 = function (col) {
                var configItem = configs.find(function (_config) { return _config.key === col; });
                if (!configItem) {
                    return { value: void 0 };
                }
                var colElement = document.createElement('div');
                colElement.classList.add('bhgv2-config-form-col');
                var prefixLabel = document.createElement('span');
                prefixLabel.innerHTML = configItem.prefixLabel || '';
                var inputWrapperElement = document.createElement('label');
                var inputElement = document.createElement('div');
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
                        var _slider = document.createElement('span');
                        _slider.classList.add('slider');
                        inputWrapperElement.append(_slider);
                        break;
                }
                inputWrapperElement.setAttribute('for', configItem.key);
                inputElement.setAttribute('id', configItem.key);
                inputElement.setAttribute('data-config-key', configItem.key);
                inputElement.setAttribute('data-type', configItem.dataType);
                inputWrapperElement.prepend(inputElement);
                var suffixLabel = document.createElement('span');
                suffixLabel.innerHTML = configItem.suffixLabel || '';
                colElement.append(prefixLabel, inputWrapperElement, suffixLabel);
                rowElement.append(colElement);
            };
            for (var _b = 0, row_1 = row; _b < row_1.length; _b++) {
                var col = row_1[_b];
                var state_1 = _loop_1(col);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            _dom.ConfigFormContent.append(rowElement);
        }
    });
    // 初始化 state (gsn, sn, comments, userInfo)
    _state.gsn = guild.gsn;
    if (location && location.href.includes('post_detail.php')) {
        var re = /https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm;
        var url = document.URL;
        var urlMatch = re.exec(url);
        _state.sn = parseInt(urlMatch === null || urlMatch === void 0 ? void 0 : urlMatch[2]) || undefined;
    }
    _state.userInfo = guildPost.loginUser;
    // 添加動作給 DOM
    _dom.ConfigPanelSwitch.addEventListener('click', function (event) {
        event.preventDefault();
        _dom.ConfigPanel.classList.toggle('active');
    });
    var _showConfigFormMessage = function (message) {
        _dom.ConfigFormMessage.innerHTML = message;
        setTimeout(function () {
            _dom.ConfigFormMessage.innerHTML = '';
        }, 2000);
    };
    var _handleSubmitConfigForm = function (event, options) {
        event.preventDefault();
        var form = CORE.DOM.ConfigForm;
        var newConfig = Array.from(form.querySelectorAll('input[data-config-key]')).reduce(function (prev, element) {
            var key = element.getAttribute('data-config-key');
            if (!key) {
                return prev;
            }
            var dataType = element.getAttribute('data-type');
            var value = undefined;
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
        if (options === null || options === void 0 ? void 0 : options.saveAsDefault) {
            window.localStorage.setItem('bahamut-guild-v2-toolkit:config', JSON.stringify(newConfig));
        }
    };
    CORE.DOM.ConfigFormFooterSave.addEventListener('click', function (event) {
        _handleSubmitConfigForm(event);
        _showConfigFormMessage('已儲存設定');
    });
    CORE.DOM.ConfigFormFooterSaveAsDefault.addEventListener('click', function (event) {
        _handleSubmitConfigForm(event, { saveAsDefault: true });
        _showConfigFormMessage('已設為預設值及儲存設定');
    });
    // 觸發一次所有插件的 onMutateConfig
    CORE.mutateConfig(_config);
    // 觸發一次所有插件的 onMutateState
    CORE.mutateState(_state);
    // 讀取預設值
    try {
        var _storedConfigJSON = localStorage.getItem('bahamut-guild-v2-toolkit:config');
        if (_storedConfigJSON) {
            CORE.mutateConfig(JSON.parse(_storedConfigJSON));
        }
    }
    catch (_b) { }
    // 初始化state comments (用Interval等到comment list真的生成好)
    var _initialCommentListInterval;
    _initialCommentListInterval = setInterval(function () {
        var _CommentListOuter = CORE.DOM.CommentListOuter;
        if (_CommentListOuter) {
            var commentCount = parseInt(_CommentListOuter.getAttribute('data-comment-count')) || 0;
            if (commentCount === 0) {
                clearInterval(_initialCommentListInterval);
                return;
            }
            var _CommentList = CORE.DOM.CommentList;
            if (_CommentList) {
                if (_CommentList.children.length === 0) {
                    return;
                }
                var _newComments = Array.from(_CommentList.children).map(function (element) { return ({
                    id: element.getAttribute('data-csn'),
                    element: element,
                }); });
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
var _waitForElm = function (selector) {
    return new Promise(function (resolve) {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        var observer = new MutationObserver(function (mutations) {
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
    var hasTakenOver = false;
    _waitForElm('.webview_commendlist .c-reply__editor').then(function () {
        if (!hasTakenOver) {
            BHGV2Core({
                plugins: [
                    bhgv2_auto_refresh_1.default,
                    bhgv2_comments_reverse_1.default,
                    bhgv2_dark_mode_1.default,
                    bhgv2_rainbow_1.default,
                    bhgv2_dense_1.default,
                ],
                library: {
                    jQuery: jQuery,
                    $: $,
                    nunjucks: nunjucks,
                    GuildTextUtil: GuildTextUtil,
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
exports.default = "/* The switch - the box around the slider */\n.switch {\n\tposition: relative;\n\tdisplay: inline-block;\n\twidth: 30px;\n\theight: 17px;\n}\n\n/* Hide default HTML checkbox */\n.switch input {\n\topacity: 0;\n\twidth: 0;\n\theight: 0;\n}\n\n/* The slider */\n.slider {\n\tposition: absolute;\n\tcursor: pointer;\n\ttop: 0;\n\tleft: 0;\n\tright: 0;\n\tbottom: 0;\n\tbackground-color: #ccc;\n\t-webkit-transition: 0.4s;\n\ttransition: 0.4s;\n}\n\n.slider:before {\n\tposition: absolute;\n\tcontent: '';\n\theight: 13px;\n\twidth: 13px;\n\tleft: 2px;\n\tbottom: 2px;\n\tbackground-color: white;\n}\n\ninput:checked + .slider {\n\tbackground-color: #2196f3;\n}\n\ninput:focus + .slider {\n\tbox-shadow: 0 0 1px #2196f3;\n}\n\ninput:checked + .slider:before {\n\t-webkit-transform: translateX(13px);\n\t-ms-transform: translateX(13px);\n\ttransform: translateX(13px);\n}\n\n/* Rounded sliders */\n.slider.round {\n\tborder-radius: 17px;\n}\n\n.slider.round:before {\n\tborder-radius: 50%;\n}\n\n.text_content-hide {\n\tdisplay: block !important;\n}\n\n.more-text {\n\tdisplay: none;\n}\n\ndiv[data-google-query-id] {\n\tdisplay: none;\n}\n\n.bhgv2-comment-list-outer > div.bhgv2-editor-container .bhgv2-editor-container-footer {\n\tdisplay: flex;\n\tflex-direction: row;\n\tpadding: 13px 0 5px;\n\tfont-size: 12px;\n}\n\n.bhgv2-editor-container-footer .bhgv2-config-status {\n\tflex: 1;\n}\n\n.bhgv2-config-panel {\n\tbackground: #ffffff;\n\tpadding: 8px;\n\tborder-radius: 4px;\n\tdisplay: none;\n}\n\n.bhgv2-config-panel.active {\n\tdisplay: block;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel input {\n\tborder: 1px solid #999;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button {\n\tdisplay: inline-block;\n\t-webkit-border-radius: 5px;\n\t-moz-border-radius: 5px;\n\tborder-radius: 5px;\n\tbackground-color: #eee;\n\tpadding: 3px;\n\tmargin-left: 2px;\n\tmargin-right: 2px;\n\tborder: 1px solid #333;\n\tcolor: #000;\n\ttext-decoration: none;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button:disabled {\n\tcolor: #ccc;\n}\n\n.bhgv2-config-form-message {\n\ttext-align: center;\n\tcolor: #4a934a;\n\tfont-size: 12px;\n\tmin-height: 24px;\n\tline-height: 16px;\n\tpadding: 4px;\n\tmargin-top: 0.5rem;\n}\n\n.bhgv2-config-form-footer {\n\ttext-align: center;\n\tmargin-top: 0.5rem;\n}\n\n.bhgv2-config-form-footer > * + * {\n\tmargin-left: 1rem;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-row {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: flex-start;\n\tmargin-bottom: 2px;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: flex-start;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col > * {\n\tdisplay: inline-block;\n\tmargin-right: 2px;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col input[type=text],\n.bhgv2-config-form-content .bhgv2-config-form-col input[type=number] {\n\twidth: 2rem;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col + .bhgv2-config-form-col {\n\tmargin-left: 0.5rem;\n}\n";


/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = "\n.bhgv2-editor .bhgv2-editor-textarea {\n\tmin-height: 66px;\n}\n";


/***/ }),

/***/ 804:
/***/ (function(__unused_webpack_module, exports) {


var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createNotification = void 0;
var createNotification = function (options) {
    var _options = __assign({ silent: false }, options);
    GM_notification(_options);
};
exports.createNotification = createNotification;


/***/ }),

/***/ 503:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
var notification_helper_1 = __webpack_require__(804);
var BHGV2_AutoRefresh = function (core) {
    var _a;
    var _plugin = {
        pluginName: 'BHGV2_AutoRefresh',
        prefix: 'BHGV2_AutoRefresh',
    };
    _plugin.configs = [
        {
            key: _plugin.prefix + ":isEnable",
            suffixLabel: '自動更新',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + ":interval",
            suffixLabel: '秒',
            dataType: 'number',
            inputType: 'number',
            defaultValue: 30,
        },
        {
            key: _plugin.prefix + ":notification",
            suffixLabel: '自動更新時發送桌面通知',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
        {
            key: _plugin.prefix + ":notificationSound",
            suffixLabel: '提示音',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: true,
        },
    ];
    _plugin.configLayout = [
        [_plugin.prefix + ":isEnable", _plugin.prefix + ":interval"],
        [_plugin.prefix + ":notification", _plugin.prefix + ":notificationSound"],
    ];
    var _statusDom = document.createElement('span');
    (_a = core.DOM.ConfigPanelStatus) === null || _a === void 0 ? void 0 : _a.append(_statusDom);
    var _refreshIntervalObj = undefined;
    _plugin.onMutateConfig = function (newValue) {
        if (newValue[_plugin.prefix + ":isEnable"] !== undefined) {
            var isEnabled = newValue[_plugin.prefix + ":isEnable"];
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
                var _config = core.getConfig();
                var _interval = parseInt(newValue[_plugin.prefix + ":interval"] ||
                    _config[_plugin.prefix + ":interval"]);
                if (!_interval || _interval <= 0) {
                    _interval = 30;
                }
                var _intervalMs_1 = _interval * 1000;
                var timeoutFn_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var commentListApi, _a, comments, newCommentsCount, currentCommentsCount, latestComments, expectedNewCommentsCount, page, anotherComments;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                commentListApi = core.getState().commentListApi;
                                if (!commentListApi) {
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, fetch(commentListApi, {
                                        credentials: 'include',
                                    })
                                        .then(function (res) { return res.json(); })
                                        .then(function (res) { return res.data; })];
                            case 1:
                                _a = _b.sent(), comments = _a.comments, newCommentsCount = _a.commentCount;
                                currentCommentsCount = core.getState().commentsCount;
                                latestComments = __spreadArray([], comments.map(function (_comment) { return ({
                                    id: _comment.id,
                                    payload: _comment,
                                }); }));
                                expectedNewCommentsCount = newCommentsCount - (currentCommentsCount || 0);
                                page = 0;
                                _b.label = 2;
                            case 2:
                                if (!(latestComments.length < expectedNewCommentsCount &&
                                    page < 999)) return [3 /*break*/, 4];
                                page++;
                                return [4 /*yield*/, fetch(commentListApi + ("&page=" + page), {
                                        credentials: 'include',
                                    })
                                        .then(function (res) { return res.json(); })
                                        .then(function (res) { return res.data; })];
                            case 3:
                                anotherComments = (_b.sent()).comments;
                                latestComments.push.apply(latestComments, anotherComments.map(function (_comment) { return ({
                                    id: _comment.id,
                                    payload: _comment,
                                }); }));
                                return [3 /*break*/, 2];
                            case 4:
                                core.mutateState({ latestComments: latestComments });
                                _refreshIntervalObj = setTimeout(timeoutFn_1, _intervalMs_1);
                                return [2 /*return*/];
                        }
                    });
                }); };
                _refreshIntervalObj = setTimeout(timeoutFn_1, _intervalMs_1);
                var _notification = newValue[_plugin.prefix + ":notification"] !== undefined
                    ? newValue[_plugin.prefix + ":notification"]
                    : _config[_plugin.prefix + ":notification"];
                var _notificationSound = newValue[_plugin.prefix + ":notificationSound"] !== undefined
                    ? newValue[_plugin.prefix + ":notificationSound"]
                    : _config[_plugin.prefix + ":notificationSound"];
                _statusDom.innerHTML = "\u81EA\u52D5\u66F4\u65B0\u4E2D(" + [
                    _interval + "s",
                    _notification ? '通知' : undefined,
                    _notification && _notificationSound ? '聲音' : undefined,
                ]
                    .filter(function (item) { return !!item; })
                    .join(',') + ")";
            }
        }
    };
    _plugin.onMutateState = function (newValue) {
        if (newValue.isInit) {
            return;
        }
        if (newValue.latestComments !== undefined) {
            var config = core.getConfig();
            if (config[_plugin.prefix + ":notification"]) {
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
var BHGV2_CommentsReverse = function (core) {
    var _plugin = {
        pluginName: 'BHGV2_CommentsReverse',
        prefix: 'BHGV2_CommentsReverse',
    };
    _plugin.configs = [
        {
            key: _plugin.prefix + "-isEnable",
            suffixLabel: '顛倒哈拉串',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + "-editorSticky",
            suffixLabel: '輸入框貼在上邊沿',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.css = [
        "\n\t\t\t.bhgv2-comment-list-outer {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\t\t\t.bhgv2-comment-list {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\n\t\t\t.bhgv2-comment-list-outer." + _plugin.prefix + "-isEnable {\n\t\t\t\tflex-direction: column-reverse;\n\t\t\t}\n\n\t\t\t.bhgv2-comment-list-outer." + _plugin.prefix + "-isEnable .bhgv2-comment-list {\n\t\t\t\tflex-direction: column-reverse;\n\t\t\t}\n\n\t\t\t.bhgv2-comment-list-outer." + _plugin.prefix + "-editorSticky .bhgv2-editor-container {\n\t\t\t\tposition: sticky;\n\t\t\t\ttop: 80px;\n\t\t\t\tmargin-left: -20px;\n\t\t\t\tmargin-right: -20px;\n\t\t\t\tpadding-left: 20px;\n\t\t\t\tpadding-right: 20px;\n\t\t\t\tbackground-color: rgba(180, 180, 180, 0.9);\n\t\t\t\tbox-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);\n\t\t\t}\n\t\t\t\n\t\t\t.bhgv2-comment-list > div.bhgv2-editor-container {\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\t\t",
    ];
    _plugin.onMutateConfig = function (newValue) {
        ;
        ['isEnable', 'editorSticky'].forEach(function (key) {
            if (newValue[_plugin.prefix + "-" + key] !== undefined) {
                var dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(_plugin.prefix + "-" + key, newValue[_plugin.prefix + "-" + key]);
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
var BHGV2_DarkMode = function (core) {
    var _plugin = {
        pluginName: 'BHGV2_DarkMode',
        prefix: 'BHGV2_DarkMode',
    };
    _plugin.configs = [
        {
            key: _plugin.prefix + ":isEnable",
            suffixLabel: '巴哈開啟黑闇模式時切換介面顏色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: true,
        },
    ];
    _plugin.css = [
        "\n\t\t\t.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark {\n\t\t\t\tbackground-color: rgba(0, 0, 0, 0.9) !important;\n\t\t\t\tbox-shadow: 0 1px 4px rgba(0, 0, 0, 0.5) !important;\n\t\t\t}\n\n\t\t\t.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark .bhgv2-config-panel {\n\t\t\t\tbackground: #222222;\n\t\t\t}\n\n\t\t\t.bhgv2-editor-container.bhgv2-dark-mode-enabled.dark .bhgv2-config-panel input {\n\t\t\t\tcolor: #c7c6cb;\n\t\t\t}\n\t\t",
    ];
    _plugin.onMutateConfig = function (newValue) {
        if (newValue[_plugin.prefix + ":isEnable"] !== undefined) {
            var dom = core.DOM.EditorContainer;
            if (dom) {
                dom.classList.toggle('bhgv2-dark-mode-enabled', newValue[_plugin.prefix + ":isEnable"]);
            }
        }
    };
    var _getCookie = function (name) {
        var _a;
        var value = '; ' + document.cookie;
        var parts = value.split('; ' + name + '=');
        if (parts.length == 2) {
            return (_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift();
        }
    };
    var darkModeObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function () {
            //檢查c-reply__editor是否存在，避免不必要的error觸發
            var editorContainer = core.DOM.EditorContainer;
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
var BHGV2_Dense = function (core) {
    var _plugin = {
        pluginName: 'BHGV2_Dense',
        prefix: 'BHGV2_Dense',
    };
    _plugin.configs = [
        {
            key: _plugin.prefix + "-tradUI",
            suffixLabel: '仿舊版的配色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + "-sizeSmaller",
            suffixLabel: '縮小字體',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + "-hideFooter",
            suffixLabel: '隱藏留言底的GP/BP按鈕及回覆按鈕',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + "-narrowerGutter",
            suffixLabel: '更窄的間距',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.configLayout = [
        [
            _plugin.prefix + "-tradUI",
            _plugin.prefix + "-sizeSmaller",
            _plugin.prefix + "-narrowerGutter",
        ],
        [_plugin.prefix + "-hideFooter"],
    ];
    _plugin.css = [
        "\n\t\t\t.webview_commendlist {\n\t\t\t\tmargin-left: 0;\n\t\t\t\tmargin-right: 0;\n\t\t\t}\n\n\t\t\t.bhgv2-comment.bhgv2-comment.bhgv2-comment {\n\t\t\t\tpadding-left: 20px;\n\t\t\t\tpadding-right: 20px;\n\t\t\t}\n\n\t\t\t.bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {\n\t\t\t\tmargin-left: 0;\n\t\t\t\tmargin-right: 0;\n\t\t\t}\n\t\t\t\n\t\t\t." + _plugin.prefix + "-sizeSmaller .reply-content__user.reply-content__user.reply-content__user,\n\t\t\t." + _plugin.prefix + "-sizeSmaller .reply-content__cont.reply-content__cont.reply-content__cont {\n\t\t\t\tfont-size: 12px;\n\t\t\t\tline-height: 1;\n\t\t\t\tmargin-top: 0;\n\t\t\t}\n\n\t\t\t." + _plugin.prefix + "-hideFooter .reply-content__footer.reply-content__footer.reply-content__footer {\n\t\t\t\tdisplay: none;\n\t\t\t}\n\n\t\t\t." + _plugin.prefix + "-tradUI .bhgv2-comment {\n\t\t\t\tbackground-color: #e9f5f4;\n\t\t\t\tborder: 1px solid #daebe9;\n\t\t\t\tmargin-top: 3px;\n\t\t\t}\n\n\t\t\t." + _plugin.prefix + "-narrowerGutter .bhgv2-comment.bhgv2-comment.bhgv2-comment {\n\t\t\t\tpadding-top: 6px;\n\t\t\t\tpadding-bottom: 6px;\n\t\t\t\tpadding-left: 10px;\n\t\t\t\tpadding-right: 10px;\n\t\t\t}\n\n\t\t\t." + _plugin.prefix + "-narrowerGutter .bhgv2-editor-container.bhgv2-editor-container.bhgv2-editor-container {\n\t\t\t\tpadding-left: 10px;\n\t\t\t\tpadding-right: 10px;\n\t\t\t}\n\t\t",
    ];
    _plugin.onMutateConfig = function (newValue) {
        ;
        ['tradUI', 'sizeSmaller', 'hideFooter', 'narrowerGutter'].forEach(function (key) {
            if (newValue[_plugin.prefix + "-" + key] !== undefined) {
                var dom = core.DOM.CommentListOuter;
                if (dom) {
                    dom.classList.toggle(_plugin.prefix + "-" + key, newValue[_plugin.prefix + "-" + key]);
                }
            }
        });
    };
    return _plugin;
};
exports.default = BHGV2_Dense;


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
var BHGV2_Rainbow = function (core) {
    var _plugin = {
        pluginName: 'BHGV2_Rainbow',
        prefix: 'BHGV2_Rainbow',
    };
    _plugin.configs = [
        {
            key: _plugin.prefix + ":isEnable",
            suffixLabel: '改變留言的底色',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    var _colors = [
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
    _plugin.css = _colors.map(function (color, index) {
        return "\n\t\t\t.bhgv2-comment-list.bhgv2-color-comment-enabled .bhgv2-comment.bhgv2-color-comment-" + index + " {\n\t\t\t\tbackground-color: " + color + ";\n\t\t\t}\n\t\t";
    });
    _plugin.onMutateConfig = function (newValue) {
        if (newValue[_plugin.prefix + ":isEnable"] !== undefined) {
            var dom = core.DOM.CommentList;
            if (dom) {
                dom.classList.toggle('bhgv2-color-comment-enabled', newValue[_plugin.prefix + ":isEnable"]);
            }
        }
    };
    var _cachedUserId = {};
    _plugin.onMutateState = function (newValue) {
        if (newValue.latestComments !== undefined) {
            // 高亮其他人的訊息
            var userInfo = core.getState().userInfo;
            var myId_1 = userInfo === null || userInfo === void 0 ? void 0 : userInfo.id;
            newValue.latestComments.forEach(function (comment) {
                var commentElement = comment.element;
                if (!commentElement) {
                    return;
                }
                var commentUserId = commentElement === null || commentElement === void 0 ? void 0 : commentElement.getAttribute('data-userid');
                if (!commentUserId) {
                    return;
                }
                if (commentUserId === myId_1) {
                    return;
                }
                var colorIndex = _cachedUserId[commentUserId];
                if (colorIndex === undefined) {
                    colorIndex = Object.keys(_cachedUserId).length % _colors.length;
                    _cachedUserId[commentUserId] = colorIndex;
                }
                commentElement.classList.add("bhgv2-color-comment-" + colorIndex);
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