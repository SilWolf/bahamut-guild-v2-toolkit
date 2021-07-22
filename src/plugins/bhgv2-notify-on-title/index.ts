/*******************************************************************************************
 *
 *  BHGV2_NotifyOnTitle - 標題提示
 *  當有新的通知/訂閱/推薦時，在網頁標題上顯示數字
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_NotifyOnTitle: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_NotifyOnTitle',
		prefix: 'BHGV2_NotifyOnTitle',
	}

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
	]

	const _Title = core.DOM.Title
	const _originalTitleText = _Title.textContent

	const _getNofityCount = (): number => {
		var config = core.getConfig()

		var doCountBools = [
			(config[`${_plugin.prefix}-doCountNotice`] as boolean) || false,
			(config[`${_plugin.prefix}-doCountSubscribe`] as boolean) || false,
			(config[`${_plugin.prefix}-doCountRecommend`] as boolean) || false,
		]

		return [
			'topBar_light_0',
			'topBar_light_1',
			'topBar_light_2',
		].reduce<number>((prev, name, i) => {
			if (!doCountBools[i]) {
				return prev
			}

			const _dom = document.getElementById(name)
			if (!_dom || !_dom.firstChild) {
				return prev
			}

			return prev + (parseInt((_dom.firstChild as HTMLElement).innerHTML) || 0)
		}, 0)
	}

	const _changeTitleWithMsgCount = (msgCount: number) => {
		if (!_Title || !_originalTitleText) {
			return
		}

		if (!msgCount || msgCount <= 0) {
			_Title.innerText = _originalTitleText
			return
		} else if (msgCount > 99) {
			_Title.innerText = `(99+) ${_originalTitleText}`
			return
		}

		_Title.innerText = `(${msgCount}) ${_originalTitleText}`
	}

	let _observer: MutationObserver | undefined = undefined

	_plugin.onMutateConfig = (newValue) => {
		if (newValue[`${_plugin.prefix}-isEnable`] === true && !_observer) {
			const _target = document.getElementById('BH-top-data')
			if (_target) {
				_observer = new MutationObserver(() =>
					_changeTitleWithMsgCount(_getNofityCount())
				)

				_observer.observe(_target, {
					attributes: true,
					childList: true,
					subtree: true,
				})

				_changeTitleWithMsgCount(_getNofityCount())
			}
		} else if (newValue[`${_plugin.prefix}-isEnable`] === false && _observer) {
			_observer.disconnect()
			_observer = undefined
			_changeTitleWithMsgCount(0)
		}
	}

	return _plugin
}

export default BHGV2_NotifyOnTitle
