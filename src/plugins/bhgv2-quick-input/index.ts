/*******************************************************************************************
 *
 *  BHGV2_QuickInput - 快速輸入
 *  以類似 @Mention 的方式快速輸入預設內容
 *
 *******************************************************************************************/

import { TPlugin, TPluginConstructor } from '../../types'

const BHGV2_QuickInput: TPluginConstructor = (core) => {
	const _plugin: TPlugin = {
		pluginName: 'BHGV2_QuickInput',
		prefix: 'BHGV2_QuickInput',
	}

	_plugin.configs = [
		{
			key: `${_plugin.prefix}-isEnabled`,
			suffixLabel: '啟動快速輸入功能',
			dataType: 'boolean',
			inputType: 'switch',
			defaultValue: false,
		},
	]

	const wordMap: Record<string, string> = {
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
	}

	const _formatCarbonTrailingHTML = (content: string) =>
		`<code>TAB</code> ${content}`

	const _findKeyWordPair = (
		text: string,
		{ exactMatch }: { exactMatch?: boolean } = {}
	) => {
		if (!exactMatch) {
			const key = Object.keys(wordMap).find((_key) => _key.startsWith(text))

			return key ? { key, word: wordMap[key] } : undefined
		}

		let key = undefined

		Object.keys(wordMap).forEach((_key) => {
			if (text.startsWith(_key)) {
				key = _key
			}
		})

		return key ? { key, word: wordMap[key] } : undefined
	}

	_plugin.onEvent = (eventName: string, payload: any) => {
		const config = core.getConfig()
		if (!config[`${_plugin.prefix}-isEnabled`]) {
			return true
		}

		if (eventName === 'textarea-input') {
			const event = payload?.event as KeyboardEvent
			if (!event) {
				return true
			}

			const textarea = event.currentTarget as HTMLTextAreaElement
			if (!textarea) {
				return true
			}

			const CarbonTrailing = core.DOM.EditorTextareaCarbonTrailing
			if (!CarbonTrailing) {
				return true
			}

			CarbonTrailing.innerHTML = ''

			const content = textarea.value
			const match = content.match(/\@([^\s\@]+)$/)
			if (match && match[1]) {
				const inputText = match[1]
				const pair = _findKeyWordPair(inputText)
				if (pair && pair.word) {
					CarbonTrailing.innerHTML = _formatCarbonTrailingHTML(pair.word)
				}
			}
		}

		if (eventName === 'textarea-keydown') {
			const event = payload?.event as KeyboardEvent
			if (!event) {
				return true
			}

			const textarea = event.currentTarget as HTMLTextAreaElement
			if (!textarea) {
				return true
			}

			const key = event.key

			if (key === 'Tab' || key === 'Enter') {
				let value = textarea.value
				let isValueChanged = false

				const CarbonText = core.DOM.EditorTextareaCarbonText
				if (!CarbonText) {
					return true
				}

				const CarbonTrailing = core.DOM.EditorTextareaCarbonTrailing
				if (!CarbonTrailing) {
					return true
				}

				const match = value.match(/\@([^\s\@]+)$/)
				if (match && match[1]) {
					const pair = _findKeyWordPair(match[1])
					if (pair && pair.word) {
						value = value.replace(/\@([^\s\@]+)$/, pair.word + ' ')
						CarbonTrailing.innerHTML = ''
						isValueChanged = true
					}
				}

				const matches = [...textarea.value.matchAll(/\@([^\s\@]+)/g)]
				if (matches) {
					for (let match of matches) {
						const pair = _findKeyWordPair(match[1], { exactMatch: true })
						if (pair && pair.word) {
							value = value.replace(`@${pair.key}`, pair.word + ' ')
							isValueChanged = true
						}
					}
				}

				if (isValueChanged) {
					event.preventDefault()
					textarea.selectionStart = 0
					textarea.selectionEnd = textarea.value.length
					document.execCommand('insertText', false, value)

					textarea.style.height = 'auto'
					textarea.style.height = textarea.scrollHeight + 'px'

					return false
				}

				return true
			}
		}

		return true
	}

	_plugin.onMutateConfig = (newValue) => {
		;['isEnabled'].forEach((key) => {
			if (newValue[`${_plugin.prefix}-${key}`] !== undefined) {
				const dom = core.DOM.CommentListOuter
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

export default BHGV2_QuickInput
