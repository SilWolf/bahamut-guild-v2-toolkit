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

	_plugin.css = [
		`
			.${_plugin.prefix}-backdrop {
				position: fixed;
				top: 0;
				bottom: 0;
				left: 0;
				right: 0;
				background-color: rgba(0, 0, 0, 0.75);
				padding: 60px;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: stretch;
				z-index: 120;

				display: none;
			}

			.${_plugin.prefix}-backdrop.active {
				display: block;
			}

			#${_plugin.prefix}-container {
				flex: 1;
				min-height: 0;
				width: 100%;
				max-width: 960px;
				margin-left: auto;
				margin-right: auto;
				background: #fff;

				display: flex;
				flex-direction: column;
			}

			#${_plugin.prefix}-container > * {
				padding: 15px;
			}

			#${_plugin.prefix}-header {
				font-size: 1.5rem;
				font-weight: bold;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}

			#${_plugin.prefix}-content {
				flex: 1;
				min-height: 0;
				overflow-y: auto;
			}

			#${_plugin.prefix}-content table {
				width: 100%;
			}

			#${_plugin.prefix}-content table td {
				border-bottom: 1px solid #ccc;
				padding-top: 8px;
				padding-bottom: 8px;
			}

			#${_plugin.prefix}-content table td + td {
				padding-left: 8px;
			}

			.${_plugin.prefix}-tbody-row .${_plugin.prefix}-tbody-row-key,
			.${_plugin.prefix}-tbody-row .${_plugin.prefix}-tbody-row-content {
				border: 1px solid #ccc;
				padding: 5px;
				width: 100%;
				resize: none;
				box-sizing: border-box;
			}
			
			#${_plugin.prefix}-footer {
				text-align: center;
			}
			
			#${_plugin.prefix}-footer td {
				border-bottom: 0
			}
		`,
	]

	let _WORD_MAP: Record<string, string> = {}
	const _saveWordMap = (_newValue: Record<string, string>) => {
		localStorage.setItem(`${_plugin.prefix}-WordMap`, JSON.stringify(_newValue))
		_WORD_MAP = _newValue
	}

	const Body = core.DOM.Body

	// 自製的設置視窗
	const QuickInputConfigBackdrop = document.createElement('div')
	QuickInputConfigBackdrop.classList.add(`${_plugin.prefix}-backdrop`)
	Body.append(QuickInputConfigBackdrop)

	const QuickInputConfigContainer = $(`
		<div id="${_plugin.prefix}-container">
			<div id="${_plugin.prefix}-header">
				<h4>設置快速輸入</h4>
				<button class="${_plugin.prefix}-button" id="${_plugin.prefix}-close">關閉</button>
			</div>
			<div id="${_plugin.prefix}-content">
				<table>
					<thead>
						<tr>
							<td>@</td>
							<td style="width: 75%">內容</td>
							<td></td>
						</tr>
					</thead>
					<tbody></tbody>
					<tfoot>
						<tr>
							<td colspan="3">
								<button class="${_plugin.prefix}-button" id="${_plugin.prefix}-add">&plus; 新增</button>
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
			<div id="${_plugin.prefix}-footer">
				<button class="${_plugin.prefix}-button" id="${_plugin.prefix}-save">儲存</button>
			</div>
		</div>
	`)[0]
	QuickInputConfigBackdrop.append(QuickInputConfigContainer)

	const _createRow = ({
		key,
		content,
	}: { key?: string; content?: string } = {}): Element => {
		const _Row = $(`
			<tr class="${_plugin.prefix}-tbody-row">
				<td valign="top">
					<input type="text" class="${_plugin.prefix}-tbody-row-key" value="${
			key || ''
		}" />
				</td>
				<td valign="top">
					<textarea class="${_plugin.prefix}-tbody-row-content">${
			content || ''
		}</textarea>
				</td>
				<td>
					<button class="${_plugin.prefix}-button" id="${
			_plugin.prefix
		}-remove">刪除</button>
				</td>
			</tr>
		`)[0]

		const _RemoveButton = _Row.querySelector(`#${_plugin.prefix}-remove`)
		_RemoveButton.addEventListener('click', () => {
			confirm('確定要刪除嗎？') && _Row.parentNode.removeChild(_Row)
		})

		return _Row
	}

	const QuickInputConfigTBody =
		QuickInputConfigContainer.getElementsByTagName('tbody')[0]

	const QuickInputConfigAddButton = QuickInputConfigContainer.querySelector(
		`#${_plugin.prefix}-add`
	)
	QuickInputConfigAddButton.addEventListener('click', () =>
		QuickInputConfigTBody.append(_createRow())
	)

	const QuickInputConfigCloseButton = QuickInputConfigContainer.querySelector(
		`#${_plugin.prefix}-close`
	)
	QuickInputConfigCloseButton.addEventListener('click', () =>
		QuickInputConfigBackdrop.classList.toggle('active', false)
	)

	const QuickInputConfigSaveButton = QuickInputConfigContainer.querySelector(
		`#${_plugin.prefix}-save`
	)
	QuickInputConfigSaveButton.addEventListener('click', () => {
		const _newValue: Record<string, string> = {}

		for (let row of Array.from(
			QuickInputConfigTBody.children
		) as HTMLTableRowElement[]) {
			const key = (
				row.querySelector(
					`.${_plugin.prefix}-tbody-row-key`
				) as HTMLInputElement
			)?.value
			const content = (
				row.querySelector(
					`.${_plugin.prefix}-tbody-row-content`
				) as HTMLInputElement
			)?.value

			if (key.match(/^\s*$/) || content.match(/^\s*$/)) {
				alert('必須填寫所有項目')
				return
			}

			if (key.match(/^\d+$/)) {
				alert('不能用數字作為＠詞')
				return
			}

			if (!!_newValue[key]) {
				alert('＠詞不能重覆')
				return
			}

			_newValue[key] = content
		}

		_saveWordMap(_newValue)
		alert('已儲存')
	})

	const _loadWordMap = () => {
		_WORD_MAP = JSON.parse(
			localStorage.getItem(`${_plugin.prefix}-WordMap`) || '{}'
		)
	}

	const _refreshConfigTable = () => {
		QuickInputConfigTBody.innerHTML = ''

		Object.entries(_WORD_MAP).forEach(([key, content]) =>
			QuickInputConfigTBody.append(_createRow({ key, content }))
		)
	}

	_loadWordMap()
	_refreshConfigTable()

	const ConfigFormActions = core.DOM.ConfigFormActions

	const _buttonShowConfigPanel = document.createElement('a')
	_buttonShowConfigPanel.setAttribute('href', '#')
	_buttonShowConfigPanel.classList.add(`${_plugin.prefix}-action`)
	_buttonShowConfigPanel.innerHTML = '打開快速輸入設置'
	_buttonShowConfigPanel.addEventListener('click', (e) => {
		e.preventDefault()
		QuickInputConfigBackdrop.classList.toggle('active', true)
	})

	ConfigFormActions.append(_buttonShowConfigPanel)

	const _formatCarbonTrailingHTML = (content: string) =>
		`<code>TAB</code> ${content}`

	const _findKeyWordPair = (
		text: string,
		{ exactMatch }: { exactMatch?: boolean } = {}
	) => {
		if (!exactMatch) {
			const key = Object.keys(_WORD_MAP).find((_key) => _key.startsWith(text))

			return key ? { key, word: _WORD_MAP[key] } : undefined
		}

		let key = undefined

		Object.keys(_WORD_MAP).forEach((_key) => {
			if (text.startsWith(_key)) {
				key = _key
			}
		})

		return key ? { key, word: _WORD_MAP[key] } : undefined
	}

	_plugin.events = [
		{
			eventName: "textarea-input",
			onEvent: (eventName: string, payload: any) => {
				const config = core.getConfig()
				if (!config[`${_plugin.prefix}-isEnabled`]) {
					return true
				}

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

				return true
			}
		},
		{
			eventName: "textarea-keydown",
			onEvent: (eventName: string, payload: any) => {
				const config = core.getConfig()
				if (!config[`${_plugin.prefix}-isEnabled`]) {
					return true
				}

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

				return true
			}
		}
	]

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
