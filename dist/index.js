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
/** 等待DOM準備完成 */
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
    var _configPanelElements = [];
    var CORE_STATE_KEY = {
        COMMENTS: 'comments',
        GSN: 'gsn',
        SN: 'sn',
        POST_API_URL: 'postApiUrl',
        COMMENTS_API_URL: 'commentsApiUrl',
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
        return _plugin;
    };
    __spreadArray([_CorePlugin], plugins).forEach(function (plugin) {
        try {
            var _plugin_1 = plugin(CORE);
            // 初始化config
            Object.entries(_plugin_1.config || {}).forEach(function (_a) {
                var key = _a[0], config = _a[1];
                _configPanelElements.push(__assign({ key: key }, config));
                _config[key] = config.defaultValue;
                if (config.defaultValue === undefined) {
                    LOG("\u63D2\u4EF6 " + _plugin_1.pluginName + "\u3000\u7684\u8A2D\u5B9A " + key + " \u7684 defaultValue \u70BA\u7A7A\uFF0C\u8ACB\u8A2D\u5B9A\u3002");
                }
            });
            _plugins.push(_plugin_1);
        }
        catch (e) {
            LOG("\u8F09\u5165\u63D2\u4EF6\u5931\u6557, " + e.toString(), 'error');
        }
    });
    // 初始化 state (gsn, sn, comments)
    _state[CORE.STATE_KEY.GSN] = guild.gsn;
    if (location && location.href.includes('post_detail.php')) {
        var re = /https:\/\/guild\.gamer\.com\.tw\/post_detail\.php\?gsn=(\d*)&sn=(\d*)/gm;
        var url = document.URL;
        var urlMatch = re.exec(url);
        _state[CORE.STATE_KEY.SN] = urlMatch === null || urlMatch === void 0 ? void 0 : urlMatch[2];
    }
    _state[CORE.STATE_KEY.COMMENTS] = [];
    // 觸發一次所有插件的 onMutateConfig
    CORE.mutateConfig(_config);
    // 觸發一次所有插件的 onMutateState
    CORE.mutateState(_state);
    // // 初始化設定介面
    // const _configPanelHTML = (config) => `
    // 	<div class="bhgv2-config-panel">
    // 		${Object.values(config)}
    // 	</div>
    // `
    var hasTakenOver = false;
    _waitForElm('.webview_commendlist .c-reply__editor').then(function () {
        if (!hasTakenOver) {
            //初始化設定面板
            // _initConfigPanel(CORE.getAllConfig())
            // const storedConfig = loadConfigFromLocalStorage()
            // setConfig(storedConfig)
            // fillFormConfig(storedConfig)
            // runConfigApply()
            hasTakenOver = true;
        }
    });
};
(function () {
    BHGV2Core({
        plugins: [bhgv2_auto_refresh_1.default],
        library: {
            jQuery: jQuery,
            $: $,
        },
    });
})();


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
    var _a;
    var _plugin = {
        pluginName: 'BHGV2_AutoRefresh',
        prefix: 'BHGV2_AutoRefresh',
    };
    _plugin.config = (_a = {},
        _a[_plugin.prefix + ":isEnable"] = {
            label: '自動更新',
            type: 'boolean',
            defaultValue: false,
        },
        _a);
    return _plugin;
};
exports.default = BHGV2_AutoRefresh;


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