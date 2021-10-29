/*******************************************************************************************
 *
 *  BHGV2_MasterLayout - 整頁介面
 *  改變整個頁面的格局，例如隱藏左側選單、右側選單等等
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_MasterLayout: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_MasterLayout',
		prefix: 'BHGV2_MasterLayout',
	}

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
	]

	_plugin.configLayout = [
		[`${_plugin.prefix}-hideLeftMenu`, `${_plugin.prefix}-hideRightMenu`],
		[
			`${_plugin.prefix}-hideCoverImage`,
			`${_plugin.prefix}-hideHeader`,
			`${_plugin.prefix}-hideTabMenu`,
		],
		[`${_plugin.prefix}-hideGuildControlPanel`],
	]

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
	]

	_plugin.onMutateConfig = (newValue) => {
		;[
			'hideLeftMenu',
			'hideRightMenu',
			'hideCoverImage',
			'hideHeader',
			'hideTabMenu',
			'hideGuildControlPanel',
		].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.Body
				if (dom) {
					dom.classList.toggle(
						`${_plugin.prefix}-${key}`,
						newValue[`${_plugin.prefix}-${key}`] as boolean
					)
				}
			}
		})
	}

	return _plugin
}

export default BHGV2_MasterLayout
