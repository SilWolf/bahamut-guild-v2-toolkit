/*******************************************************************************************
 *
 *  BHGV2_MessageStorage - 標題提示
 *  當有新的通知/訂閱/推薦時，在網頁標題上顯示數字
 *
 *******************************************************************************************/

import { generateRandomId } from '../../helpers/string.helper'
import { TPlugin, TPluginConstructor } from '../../types'

type MS_Folder = {
  id: string
  name: string
}

type MS_FolderItem = {
  name: string
  value: string
}

const MS_ACTION_ADD_FOLDER = 'addFolder'

const BHGV2_MessageStorage: TPluginConstructor = (core) => {
  const _plugin: TPlugin = {
    pluginName: 'BHGV2_MessageStorage',
    prefix: 'BHGV2_MessageStorage',
    label: '預設文檔倉庫',
  }

  _plugin.configs = [
    {
      key: `${_plugin.prefix}-isEnable`,
      suffixLabel: '標題顯示通知數目',
      dataType: 'boolean',
      inputType: 'switch',
      defaultValue: false,
    },
  ]
  _plugin.css = [
    `
			#${_plugin.prefix}-panel {
        position: relative;
        width: 100%;
        background: rgba(255, 255, 255, 0.87);
        box-shadow: rgba(0, 0, 0, 0.25) 0 1px 4px;
        border-radius: 4px;
      }

			#${_plugin.prefix}-panel #${_plugin.prefix}-panel-header {
        padding: 16px;
      }

			#${_plugin.prefix}-panel #${_plugin.prefix}-panel-body {
        height: 320px;
        overflow-y: scroll;
        padding: 16px;
      }

			#${_plugin.prefix}-panel #${_plugin.prefix}-panel-footer {
        padding: 16px;
      }

			#${_plugin.prefix}-panel #${_plugin.prefix}-selector {
        width: 100%;
      }

      #${_plugin.prefix}-ListActions {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      #${_plugin.prefix}-ListActions .${_plugin.prefix}-ListAction {
        background: #cccccc;
        flex: 1;
        padding: 4px;
      }

      #${_plugin.prefix}-ListingList-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      #${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem {
        border: 1px solid #000;
        width: 100%;
        aspect-ratio: 1 / 1;
      }

      .${_plugin.prefix}-overlayForm-backdrop {
        display: none;
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
      }

      .${_plugin.prefix}-overlayForm-backdrop.show {
        display: block;
      }

      .${_plugin.prefix}-overlayForm-panel {
        position: relative;
        width: 100%;
        background: #ffffff;
        box-shadow: rgba(0, 0, 0, 0.25) 0 1px 4px;
        border-radius: 4px;
        padding: 16px;
      }

      .${_plugin.prefix}-overlayForm-group {
        margin-bottom: 16px;
      }

      .${_plugin.prefix}-overlayForm-group.hidden {
        margin: 0;
      }

      .${_plugin.prefix}-overlayForm-group .${_plugin.prefix}-overlayForm-label {
        display: block;
      }

      .${_plugin.prefix}-overlayForm-group.hidden .${_plugin.prefix}-overlayForm-label {
        display: none;
      }

      .${_plugin.prefix}-overlayForm-group .${_plugin.prefix}-overlayForm-input {
        display: block;
        width: 100%;
        border: 1px solid #000000;
        padding: 4px;
      }

      .${_plugin.prefix}-overlayForm-group.hidden .${_plugin.prefix}-overlayForm-input {
        display: none;
      }

      .${_plugin.prefix}-overlayForm-actions {
        display: flex;
        gap: 8px;
      }
      
      .${_plugin.prefix}-overlayForm-actions button.${_plugin.prefix}-overlayForm-button {
        flex: 1;
        text-align: center;
        padding: 4px 0;
      }
      
      .${_plugin.prefix}-overlayForm-actions button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-cancel {
        background: #cccccc;
      }
      
      .${_plugin.prefix}-overlayForm-actions button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-save {
        background: #cccccc;
      }
		`,
  ]

  const folders: MS_Folder[] = []
  const rawFolderItems: MS_FolderItem[] = []
  const sortedFolderItems: MS_FolderItem[] = []

  const overlayFormsMap: Record<string, Element> = {}

  /**
   * Lifecycle Functions
   */
  const refreshSelect = (doMutate?: boolean) => {
    if (doMutate) {
      localStorage.setItem(`${_plugin.prefix}-folders`, JSON.stringify(folders))
    } else {
      const storedFoldersJSON =
        localStorage.getItem(`${_plugin.prefix}-folders`) ?? '[]'
      if (!storedFoldersJSON) {
        localStorage.setItem(`${_plugin.prefix}-folders`, '[]')
      }

      folders.splice(0, folders.length)
      folders.push(...JSON.parse(storedFoldersJSON))
    }

    Selector.innerHTML = ''

    const addNewFolderOption = document.createElement('option')
    addNewFolderOption.value = MS_ACTION_ADD_FOLDER
    addNewFolderOption.innerText = '[ 新增一個資料夾... ]'
    Selector.prepend(addNewFolderOption)

    for (const folder of folders) {
      const option = document.createElement('option')
      option.value = folder.id
      option.innerText = folder.name
      Selector.prepend(option)
    }

    const selectPlaceholderOption = document.createElement('option')
    selectPlaceholderOption.value = '-1'
    selectPlaceholderOption.innerText = '請選擇資料夾'
    selectPlaceholderOption.setAttribute('disabled', '1')
    Selector.prepend(selectPlaceholderOption)

    if (folders.length > 0) {
      Selector.value = folders[0].id
    } else {
      Selector.value = '-1'
    }
  }

  const updateSelect = (newValue: string) => {
    const storedFolderItemsJSON =
      localStorage.getItem(`${_plugin.prefix}-folder-${newValue}`) ?? '[]'
    if (!storedFolderItemsJSON) {
      localStorage.setItem(`${_plugin.prefix}-folder-${newValue}`, '[]')
    }

    rawFolderItems.splice(0, rawFolderItems.length)
    rawFolderItems.push(...JSON.parse(storedFolderItemsJSON))

    sortedFolderItems.splice(0, sortedFolderItems.length)
    sortedFolderItems.push(...JSON.parse(storedFolderItemsJSON))

    ListingList.innerHTML = ''
    Selector.value = newValue
  }

  const handleChangeSelect = (e: Event) => {
    const newValue = (e.target as HTMLSelectElement).value

    if (newValue === MS_ACTION_ADD_FOLDER) {
      ;(e.target as HTMLSelectElement).value = '-1'

      const overlayForm = overlayFormsMap.folder
      if (!overlayForm) {
        return
      }

      overlayForm.classList.add('show')
      overlayForm.querySelector('form')?.reset()
    }

    updateSelect(newValue)
  }

  const getValuesFromSubmitEvent = (e: Event) => {
    return [
      ...(e.target as HTMLFormElement).querySelectorAll<HTMLInputElement>(
        `input.${_plugin.prefix}-overlayForm-input`
      ),
    ].reduce(
      (prev: Record<string, string>, ele: HTMLInputElement, i: number) => {
        prev[ele.getAttribute('name') ?? `field-${i}`] = ele.value
        return prev
      },
      {}
    )
  }

  /**
   * Event Handler for OverlayForm - Folder
   */

  const handleSubmitFolderForm = (e: Event) => {
    e.preventDefault()

    const newValue = getValuesFromSubmitEvent(e)
    if (newValue.id) {
      const foundFolder = folders.find(({ id }) => id === newValue.id)
      if (foundFolder) {
        foundFolder.name = newValue.name
      }
    } else {
      newValue.id = generateRandomId()
      folders.push(newValue as MS_Folder)
    }

    refreshSelect(true)
    updateSelect(newValue.id)
    handleCancelFolderForm(e)
  }

  const handleCancelFolderForm = (e: Event) => {
    e.preventDefault()
    const overlayForm = overlayFormsMap.folder
    overlayForm?.classList.remove('show')
  }

  /**
   * Constants - Overlay Forms
   */

  type OverlayFormProps = {
    name: string
    onSubmit: (e: Event) => unknown
    onCancel: (e: Event) => unknown
    fields: OverlayFormFieldProps[]
  }

  type OverlayFormFieldProps = {
    name: string
    label: string
    type: string
    isShowLabel?: boolean
  }

  const overlayForms: OverlayFormProps[] = [
    {
      name: 'folder',
      onSubmit: handleSubmitFolderForm,
      onCancel: handleCancelFolderForm,
      fields: [
        { name: 'name', label: '資料夾名稱', type: 'text' },
        { name: 'id', label: 'ID', type: 'hidden', isShowLabel: false },
      ],
    },
  ]

  /**
   * UIs
   */

  const Panel = document.createElement('div')
  Panel.id = `${_plugin.prefix}-panel`

  core.DOM.EditorContainerOuterRight.append(Panel)

  const PanelHeader = document.createElement('div')
  PanelHeader.id = `${_plugin.prefix}-panel-header`

  const PanelBody = document.createElement('div')
  PanelBody.id = `${_plugin.prefix}-panel-body`

  const PanelFooter = document.createElement('div')
  PanelFooter.id = `${_plugin.prefix}-panel-footer`
  PanelFooter.innerText = 'panel-footer'

  Panel.append(PanelHeader, PanelBody, PanelFooter)

  const Selector = document.createElement('select')
  Selector.id = `${_plugin.prefix}-selector`
  Selector.addEventListener('change', handleChangeSelect)

  PanelHeader.append(Selector)

  const ListActions = document.createElement('div')
  ListActions.id = `${_plugin.prefix}-ListActions`

  const ListActionForAdd = document.createElement('button')
  ListActionForAdd.id = `${_plugin.prefix}-ListActionForAdd`
  ListActionForAdd.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForAdd.innerText = '新增'

  const ListActionForImport = document.createElement('button')
  ListActionForImport.id = `${_plugin.prefix}-ListActionForImport`
  ListActionForImport.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForImport.innerText = '匯入'

  ListActions.append(ListActionForAdd, ListActionForImport)

  const ListingList = document.createElement('div')
  ListingList.id = `${_plugin.prefix}-ListingList`
  ListingList.classList.add(`${_plugin.prefix}-ListingList-grid`)

  for (let i = 0; i < 4; i++) {
    const item = document.createElement('div')
    item.classList.add(`${_plugin.prefix}-ListingItem`)
    ListingList.append(item)
  }

  PanelBody.append(ListActions, ListingList)

  for (const overlayForm of overlayForms) {
    const overlayFormBackdrop = document.createElement('div')
    overlayFormBackdrop.classList.add(`${_plugin.prefix}-overlayForm-backdrop`)
    overlayFormBackdrop.id = `${_plugin.prefix}-overlayForm-${overlayForm.name}`
    Panel.append(overlayFormBackdrop)

    const overlayFormPanel = document.createElement('div')
    overlayFormPanel.classList.add(`${_plugin.prefix}-overlayForm-panel`)
    overlayFormBackdrop.append(overlayFormPanel)

    const overlayFormForm = document.createElement('form')
    overlayFormForm.classList.add(`${_plugin.prefix}-overlayForm-form`)
    overlayFormForm.addEventListener('submit', overlayForm.onSubmit)
    overlayFormPanel.append(overlayFormForm)

    for (const field of overlayForm.fields) {
      const formLabel = document.createElement('label')
      formLabel.classList.add(`${_plugin.prefix}-overlayForm-label`)
      formLabel.innerText = field.label
      formLabel.htmlFor = field.name

      const formInput = document.createElement('input')
      formInput.classList.add(`${_plugin.prefix}-overlayForm-input`)
      formInput.name = field.name
      formInput.type = field.type
      formInput.required = true

      const formGroup = document.createElement('div')
      formGroup.classList.add(`${_plugin.prefix}-overlayForm-group`)
      if (field.type === 'hidden') {
        formGroup.classList.add('hidden')
      }
      formGroup.append(formLabel, formInput)

      overlayFormForm.append(formGroup)
    }

    const formCancelButton = document.createElement('button')
    formCancelButton.classList.add(`${_plugin.prefix}-overlayForm-button`)
    formCancelButton.classList.add(
      `${_plugin.prefix}-overlayForm-button-cancel`
    )
    formCancelButton.innerText = '取消'
    formCancelButton.type = 'button'
    formCancelButton.addEventListener('click', overlayForm.onCancel)

    const formSaveButton = document.createElement('button')
    formSaveButton.classList.add(`${_plugin.prefix}-overlayForm-button`)
    formSaveButton.classList.add(`${_plugin.prefix}-overlayForm-button-save`)
    formSaveButton.innerText = '保存'
    formSaveButton.type = 'submit'

    const formActionsDiv = document.createElement('div')
    formActionsDiv.classList.add(`${_plugin.prefix}-overlayForm-actions`)
    formActionsDiv.append(formCancelButton, formSaveButton)

    overlayFormForm.append(formActionsDiv)

    overlayFormsMap[overlayForm.name] = overlayFormBackdrop
  }

  /**
   * Initialize
   *  */
  refreshSelect()

  _plugin.onMutateConfig = (newValue) => {}

  return _plugin
}

export default BHGV2_MessageStorage
