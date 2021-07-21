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
var global_css_1 = __importDefault(__webpack_require__(440));
var postDetail_css_1 = __importDefault(__webpack_require__(507));
var bhgv2_dark_mode_1 = __importDefault(__webpack_require__(340));
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
    var CORE_STATE_KEY = {
        COMMENTS: 'comments',
        GSN: 'gsn',
        SN: 'sn',
        POST_API_URL: 'postApiUrl',
        COMMENTS_API_URL: 'commentsApiUrl',
        USER_INFO: 'userInfo',
    };
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
        STATE_KEY: CORE_STATE_KEY,
    };
    var _CorePlugin = function (core) {
        var _plugin = {
            pluginName: 'BHGV2Core',
            prefix: 'BHGV2Core',
        };
        _plugin.onMutateState = function (newValue) {
            if (newValue[core.STATE_KEY.GSN] !== undefined ||
                newValue[core.STATE_KEY.SN] !== undefined) {
                var oldValue = core.getStateByNames(core.STATE_KEY.GSN, core.STATE_KEY.SN);
                var gsn = newValue[core.STATE_KEY.GSN] || oldValue[core.STATE_KEY.GSN];
                var sn = newValue[core.STATE_KEY.SN] || oldValue[core.STATE_KEY.SN];
                if (gsn && sn) {
                    newValue[core.STATE_KEY.POST_API_URL] = "https://api.gamer.com.tw/guild/v1/post_detail.php?gsn=" + gsn + "&messageId=" + sn;
                    newValue[core.STATE_KEY.COMMENTS_API_URL] = "https://api.gamer.com.tw/guild/v1/comment_list.php?gsn=" + gsn + "&messageId=" + sn;
                }
            }
            return newValue;
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
    _dom.CommentList = document.getElementsByClassName('webview_commendlist')[0];
    _dom.CommentList.classList.add('bhgv2-comment-list');
    _dom.EditorContainer = _dom.CommentList.getElementsByClassName('c-reply__editor')[0];
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
    _state[CORE.STATE_KEY.GSN] = guild.gsn;
    if (location && location.href.includes('post_detail.php')) {
        var re = /https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm;
        var url = document.URL;
        var urlMatch = re.exec(url);
        _state[CORE.STATE_KEY.SN] = urlMatch === null || urlMatch === void 0 ? void 0 : urlMatch[2];
    }
    _state[CORE.STATE_KEY.COMMENTS] = [];
    _state[CORE.STATE_KEY.USER_INFO] = guildPost.loginUser;
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
                plugins: [bhgv2_auto_refresh_1.default, bhgv2_comments_reverse_1.default, bhgv2_dark_mode_1.default],
                library: {
                    jQuery: jQuery,
                    $: $,
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
exports.default = "/* The switch - the box around the slider */\n.switch {\n\tposition: relative;\n\tdisplay: inline-block;\n\twidth: 30px;\n\theight: 17px;\n}\n\n/* Hide default HTML checkbox */\n.switch input {\n\topacity: 0;\n\twidth: 0;\n\theight: 0;\n}\n\n/* The slider */\n.slider {\n\tposition: absolute;\n\tcursor: pointer;\n\ttop: 0;\n\tleft: 0;\n\tright: 0;\n\tbottom: 0;\n\tbackground-color: #ccc;\n\t-webkit-transition: 0.4s;\n\ttransition: 0.4s;\n}\n\n.slider:before {\n\tposition: absolute;\n\tcontent: '';\n\theight: 13px;\n\twidth: 13px;\n\tleft: 2px;\n\tbottom: 2px;\n\tbackground-color: white;\n}\n\ninput:checked + .slider {\n\tbackground-color: #2196f3;\n}\n\ninput:focus + .slider {\n\tbox-shadow: 0 0 1px #2196f3;\n}\n\ninput:checked + .slider:before {\n\t-webkit-transform: translateX(13px);\n\t-ms-transform: translateX(13px);\n\ttransform: translateX(13px);\n}\n\n/* Rounded sliders */\n.slider.round {\n\tborder-radius: 17px;\n}\n\n.slider.round:before {\n\tborder-radius: 50%;\n}\n\n.text_content-hide {\n\tdisplay: block !important;\n}\n\n.more-text {\n\tdisplay: none;\n}\n\ndiv[data-google-query-id] {\n\tdisplay: none;\n}\n\n.bhgv2-comment-list > div.bhgv2-editor-container .bhgv2-editor-container-footer {\n\tdisplay: flex;\n\tflex-direction: row;\n\tpadding: 13px 0 5px;\n\tfont-size: 12px;\n}\n\n.bhgv2-editor-container-footer .bhgv2-config-status {\n\tflex: 1;\n}\n\n.bhgv2-config-panel {\n\tbackground: #ffffff;\n\tpadding: 8px;\n\tborder-radius: 4px;\n\tdisplay: none;\n}\n\n.bhgv2-config-panel.active {\n\tdisplay: block;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel input {\n\tborder: 1px solid #999;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button {\n\tdisplay: inline-block;\n\t-webkit-border-radius: 5px;\n\t-moz-border-radius: 5px;\n\tborder-radius: 5px;\n\tbackground-color: #eee;\n\tpadding: 3px;\n\tmargin-left: 2px;\n\tmargin-right: 2px;\n\tborder: 1px solid #333;\n\tcolor: #000;\n\ttext-decoration: none;\n}\n\n.bhgv2-config-panel.bhgv2-config-panel.bhgv2-config-panel button:disabled {\n\tcolor: #ccc;\n}\n\n.bhgv2-config-form-message {\n\ttext-align: center;\n\tcolor: #4a934a;\n\tfont-size: 12px;\n\tmin-height: 24px;\n\tline-height: 16px;\n\tpadding: 4px;\n\tmargin-top: 0.5rem;\n}\n\n.bhgv2-config-form-footer {\n\ttext-align: center;\n\tmargin-top: 0.5rem;\n}\n\n.bhgv2-config-form-footer > * + * {\n\tmargin-left: 1rem;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-row {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: flex-start;\n\tmargin-bottom: 2px;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: flex-start;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col > * {\n\tdisplay: inline-block;\n\tmargin-right: 2px;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col input[type=text],\n.bhgv2-config-form-content .bhgv2-config-form-col input[type=number] {\n\twidth: 2rem;\n}\n\n.bhgv2-config-form-content .bhgv2-config-form-col + .bhgv2-config-form-col {\n\tmargin-left: 0.5rem;\n}\n";


/***/ }),

/***/ 507:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = "\n.bhgv2-comment-list .bhgv2-editor-container {\n\tposition: sticky;\n\ttop: 80px;\n\tmargin-left: -20px;\n\tmargin-right: -20px;\n\tpadding-left: 20px;\n\tpadding-right: 20px;\n\tbackground-color: rgba(180, 180, 180, 0.9);\n\tbox-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);\n}\n\n.bhgv2-editor .bhgv2-editor-textarea {\n\tmin-height: 66px;\n}\n";


/***/ }),

/***/ 503:
/***/ ((__unused_webpack_module, exports) => {


/*******************************************************************************************
 *
 *  BHGV2_AutoRefresh - 自動更新
 *  每隔特定時間重新讀取一次哈拉串
 *
 *******************************************************************************************/
Object.defineProperty(exports, "__esModule", ({ value: true }));
var BHGV2_AutoRefresh = function (core) {
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
            defaultValue: false,
        },
        {
            key: _plugin.prefix + ":desktopNotification",
            suffixLabel: '自動更新時發送桌面通知',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
        {
            key: _plugin.prefix + ":desktopNotificationSound",
            suffixLabel: '提示音',
            dataType: 'boolean',
            inputType: 'checkbox',
            defaultValue: false,
        },
    ];
    _plugin.configLayout = [
        [_plugin.prefix + ":isEnable", _plugin.prefix + ":interval"],
        [
            _plugin.prefix + ":desktopNotification",
            _plugin.prefix + ":desktopNotificationSound",
        ],
    ];
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
            key: _plugin.prefix + ":isEnable",
            suffixLabel: '顛倒哈拉串',
            dataType: 'boolean',
            inputType: 'switch',
            defaultValue: false,
        },
    ];
    _plugin.css = [
        "\n\t\t\t.bhgv2-comment-list {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\t\t\t.bhgv2-comment-list > div {\n\t\t\t\tdisplay: flex;\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\n\t\t\t.bhgv2-comment-list.bhgv2-comments-reverse-enabled {\n\t\t\t\tflex-direction: column-reverse;\n\t\t\t}\n\n\t\t\t.bhgv2-comment-list.bhgv2-comments-reverse-enabled > div {\n\t\t\t\tflex-direction: column-reverse;\n\t\t\t}\n\t\t\t\n\t\t\t.bhgv2-comment-list > div.bhgv2-editor-container {\n\t\t\t\tflex-direction: column;\n\t\t\t}\n\t\t",
    ];
    _plugin.onMutateConfig = function (newValue) {
        if (newValue[_plugin.prefix + ":isEnable"] !== undefined) {
            var dom = core.DOM.CommentList;
            if (dom) {
                dom.classList.toggle('bhgv2-comments-reverse-enabled', newValue[_plugin.prefix + ":isEnable"]);
            }
        }
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
            if (location && location.href.includes('post_detail.php')) {
                if (_getCookie('ckForumDarkTheme') == 'yes') {
                    document
                        .getElementsByClassName('c-reply__editor')[0]
                        .classList.toggle('dark', true);
                    document
                        .getElementsByClassName('plugin-config-form')[0]
                        .classList.toggle('dark', true);
                }
                else {
                    document
                        .getElementsByClassName('c-reply__editor')[0]
                        .classList.toggle('dark', false);
                    document
                        .getElementsByClassName('plugin-config-form')[0]
                        .classList.toggle('dark', false);
                }
            }
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