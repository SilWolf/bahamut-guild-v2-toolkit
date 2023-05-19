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
  id: string
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
        text-align: center;
        padding: 16px 8px;
        border: 1px dashed #ccc;
        margin-bottom: 16px;
      }

      #${_plugin.prefix}-ListActions .${_plugin.prefix}-ListAction {
        color: #117e96;
      }

      .${_plugin.prefix}-ListingList-grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem {
        border: 1px solid #ccc;
        width: 100%;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem:hover {
        border-color: #000;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem img {
        pointer-events: none;
        width: 100%;
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
  }

  const refreshListing = (doMutate?: boolean) => {
    const folderId = Selector.value
    const lsKey = `${_plugin.prefix}-folder-${folderId}`

    if (doMutate) {
      localStorage.setItem(lsKey, JSON.stringify(rawFolderItems))
    } else {
      const storedFolderItemsJSON =
        localStorage.getItem(`${_plugin.prefix}-folder-${folderId}`) ?? '[]'
      if (!storedFolderItemsJSON) {
        localStorage.setItem(`${_plugin.prefix}-folder-${folderId}`, '[]')
      }

      rawFolderItems.splice(0, rawFolderItems.length)
      rawFolderItems.push(...JSON.parse(storedFolderItemsJSON))
    }

    sortedFolderItems.splice(0, sortedFolderItems.length)
    sortedFolderItems.push(...rawFolderItems)

    ListingList.innerHTML = ''

    for (const item of sortedFolderItems) {
      const listingItem = document.createElement('div')
      listingItem.classList.add(`${_plugin.prefix}-ListingItem`)
      listingItem.setAttribute('data-id', item.id)
      listingItem.addEventListener('click', handleClickListingItem)

      if (item.value.match(/^http.+\.(png|gif|jpg|jpeg|bmp)$/i)) {
        const img = document.createElement('img')
        img.src = item.value
        img.alt = item.name
        listingItem.append(img)
      } else {
        listingItem.innerText = item.name || item.value.substring(0, 25)
      }

      ListingList.append(listingItem)
    }
  }

  const updateSelect = (newValue: string) => {
    Selector.value = newValue
    refreshListing()
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
      ...(e.target as HTMLFormElement).querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >(`.${_plugin.prefix}-overlayForm-input`),
    ].reduce(
      (
        prev: Record<string, string>,
        ele: HTMLInputElement | HTMLTextAreaElement,
        i: number
      ) => {
        prev[ele.getAttribute('name') ?? `field-${i}`] = ele.value
        return prev
      },
      {}
    )
  }

  const handleClickListingAdd = (e: Event) => {
    e.preventDefault()

    const overlayForm = overlayFormsMap.item
    if (!overlayForm) {
      return
    }

    overlayForm.classList.add('show')
    overlayForm.querySelector('form')?.reset()
  }

  const handleClickListingItem = (e: Event) => {
    e.preventDefault()

    const editorTextarea = core.DOM.EditorTextarea as HTMLTextAreaElement
    if (!editorTextarea) {
      console.log('1')
      return
    }

    const dataId = (e.target as HTMLDivElement).getAttribute('data-id')
    if (!dataId) {
      console.log(e.target)
      console.log('2')
      return
    }

    const foundItem = rawFolderItems.find(({ id }) => id === dataId)
    if (!foundItem) {
      console.log('3')
      return
    }

    editorTextarea.value = `${editorTextarea.value}${foundItem.value}\n`
    editorTextarea.focus()
  }

  /**
   * Event Handler for OverlayForm - Folder
   */

  const handleSubmitFolderForm = (e: Event) => {
    e.preventDefault()

    const newValue = getValuesFromSubmitEvent(e) as MS_Folder
    if (newValue.id) {
      const foundFolder = folders.find(({ id }) => id === newValue.id)
      if (foundFolder) {
        foundFolder.name = newValue.name
      }
    } else {
      newValue.id = generateRandomId()
      folders.push(newValue)
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
   * Event Handler for OverlayForm - Item
   */
  const handleSubmitItemForm = (e: Event) => {
    e.preventDefault()

    const newValue = getValuesFromSubmitEvent(e) as MS_FolderItem
    if (newValue.id) {
      const foundItem = rawFolderItems.find(({ id }) => id === newValue.id)
      if (foundItem) {
        foundItem.name = newValue.name
        foundItem.value = newValue.value
      }
    } else {
      newValue.id = generateRandomId()
      rawFolderItems.push(newValue)
    }

    refreshListing(true)
    handleCancelItemForm(e)
  }

  const handleCancelItemForm = (e: Event) => {
    e.preventDefault()
    const overlayForm = overlayFormsMap.item
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
    {
      name: 'item',
      onSubmit: handleSubmitItemForm,
      onCancel: handleCancelItemForm,
      fields: [
        { name: 'name', label: '顯示名稱', type: 'text' },
        { name: 'value', label: '內容', type: 'textarea' },
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

  const ListActionForAdd = document.createElement('a')
  ListActionForAdd.href = '#'
  ListActionForAdd.id = `${_plugin.prefix}-ListActionForAdd`
  ListActionForAdd.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForAdd.innerText = '新增'
  ListActionForAdd.addEventListener('click', handleClickListingAdd)

  const ListActionStatementA = document.createTextNode(' ，或拖曳圖片上傳，或 ')

  const ListActionForImport = document.createElement('a')
  ListActionForImport.href = '#'
  ListActionForImport.id = `${_plugin.prefix}-ListActionForImport`
  ListActionForImport.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForImport.innerText = '匯入'

  ListActions.append(
    ListActionForAdd,
    ListActionStatementA,
    ListActionForImport
  )

  const ListingList = document.createElement('div')
  ListingList.id = `${_plugin.prefix}-ListingList`
  ListingList.classList.add(`${_plugin.prefix}-ListingList-grid`)

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
      const formGroup = document.createElement('div')
      formGroup.classList.add(`${_plugin.prefix}-overlayForm-group`)
      if (field.type === 'hidden') {
        formGroup.classList.add('hidden')
      }

      const formLabel = document.createElement('label')
      formLabel.classList.add(`${_plugin.prefix}-overlayForm-label`)
      formLabel.innerText = field.label
      formLabel.htmlFor = field.name
      formGroup.append(formLabel)

      const formInput = document.createElement(
        field.type === 'textarea' ? 'textarea' : 'input'
      )
      formInput.classList.add(`${_plugin.prefix}-overlayForm-input`)
      formInput.name = field.name
      if (field.type !== 'textarea') {
        ;(formInput as HTMLInputElement).type = field.type
      } else {
        ;(formInput as HTMLTextAreaElement).rows = 4
      }
      formInput.required = true
      formGroup.append(formInput)

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

  if (folders.length > 0) {
    updateSelect(folders[0].id)
  } else {
    Selector.value = '-1'
  }

  _plugin.onMutateConfig = (newValue) => {}

  return _plugin
}

export default BHGV2_MessageStorage
