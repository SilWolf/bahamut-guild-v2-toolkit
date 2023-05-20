/*******************************************************************************************
 *
 *  BHGV2_MessageStorage - 標題提示
 *  當有新的通知/訂閱/推薦時，在網頁標題上顯示數字
 *
 *******************************************************************************************/

import { postImgurImage } from '../../helpers/imgur.helper'
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
  order?: string
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

      #${_plugin.prefix}-ListActionForUpload-input {
        position: absolute;
        z-index: -1000;
        visibility: hidden;
        pointer-events: none;
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
        width: 100%;
        aspect-ratio: 1 / 1;
        overflow: hidden;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem.has-item {
        border: 1px solid #ccc;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem.has-item:hover {
        border-color: #000;
      }

      .${_plugin.prefix}-ListingList-grid .${_plugin.prefix}-ListingItem img {
        pointer-events: none;
        max-height: 100%;
        max-width: 100%;
      }
      
      #${_plugin.prefix}-ListingHelperText {
        color: #ccc;
        font-size: 0.8em;
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
      
      button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-cancel {
        background: #cccccc;
      }
      
      button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-save {
        background: #cccccc;
      }
      
      button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-delete {
        margin-top: 16px;
        color: #f00;
        display: none;
      }

      button.${_plugin.prefix}-overlayForm-button.${_plugin.prefix}-overlayForm-button-delete.show {
        display: inline-block;
      }

      #${_plugin.prefix}-loadingIndicator {
        display: none;
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        flex-direction: col;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      #${_plugin.prefix}-loadingIndicator.show {
        display: flex;
      }

      #${_plugin.prefix}-LoadingIndicatorContent {
        position: relative;
        width: 100%;
        background: #ffffff;
        box-shadow: rgba(0, 0, 0, 0.25) 0 1px 4px;
        border-radius: 4px;
        padding: 16px;
      }

      #${_plugin.prefix}-LoadingIndicatorCircle {
        margin: 16px auto;
      }

      #${_plugin.prefix}-Pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 4px;
      }
      
      #${_plugin.prefix}-Pagination a.${_plugin.prefix}-Pagination-button {
        color: #117e96;
      }
      
      #${_plugin.prefix}-Pagination a.${_plugin.prefix}-Pagination-button.active {
        color: #000000;
        pointer-events: none;
        text-decoration: underline;
      }
      
      #${_plugin.prefix}-DeleteConfirm {
        display: none;
        position: absolute;
        background: rgba(0, 0, 0, 0.8);
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 16px;
        flex-direction: col;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      #${_plugin.prefix}-DeleteConfirm.show {
        display: flex;
      }

      #${_plugin.prefix}-DeleteConfirmContent {
        position: relative;
        width: 100%;
        background: #ffffff;
        box-shadow: rgba(0, 0, 0, 0.25) 0 1px 4px;
        border-radius: 4px;
        padding: 16px;
      }

      #${_plugin.prefix}-DeleteConfirmActions {
        margin-top: 16px;
        display: flex;
        gap: 8px;
      }
      
      #${_plugin.prefix}-DeleteConfirmActions button.${_plugin.prefix}-deleteConfirm-button {
        flex: 1;
        text-align: center;
        padding: 4px 0;
      }
      
      #${_plugin.prefix}-DeleteConfirmActions button.${_plugin.prefix}-deleteConfirm-button#${_plugin.prefix}-deleteConfirm-button-confirm {
        background: #f00;
        color: #fff;
      }
		`,
  ]

  const PAGINATION_PAGE_SIZE = 9

  const folders: MS_Folder[] = []
  const rawFolderItems: MS_FolderItem[] = []
  const sortedFolderItems: MS_FolderItem[] = []

  let paginationCurrentPage = 1
  let paginationPageMax = 1

  const overlayFormsMap: Record<string, Element> = {}

  let deleteConfirmFn: () => unknown

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
      const storedFolderItemsJSON = localStorage.getItem(lsKey) ?? '[]'
      if (!storedFolderItemsJSON) {
        localStorage.setItem(lsKey, '[]')
      }

      rawFolderItems.splice(0, rawFolderItems.length)
      rawFolderItems.push(...JSON.parse(storedFolderItemsJSON))
    }

    sortedFolderItems.splice(0, sortedFolderItems.length)
    sortedFolderItems.push(...rawFolderItems)

    const visibleItems = sortedFolderItems.slice(
      (paginationCurrentPage - 1) * PAGINATION_PAGE_SIZE,
      paginationCurrentPage * PAGINATION_PAGE_SIZE
    )

    ListingList.innerHTML = ''

    for (let i = 0; i < PAGINATION_PAGE_SIZE; i++) {
      const item = visibleItems[i]

      const listingItem = document.createElement('div')
      listingItem.classList.add(`${_plugin.prefix}-ListingItem`)
      if (item) {
        listingItem.classList.add('has-item')
        listingItem.setAttribute('data-id', item.id)
        listingItem.addEventListener('click', handleClickListingItem)
        listingItem.addEventListener(
          'contextmenu',
          handleContextMenuListingItem
        )

        if (item.value.match(/^http.+\.(png|gif|jpg|jpeg|bmp)$/i)) {
          const img = document.createElement('img')
          img.src = item.value
          img.alt = item.name
          listingItem.append(img)
        } else {
          listingItem.innerText = item.name || item.value.substring(0, 25)
        }
      }

      ListingList.append(listingItem)
    }
  }

  const handleClickPaginationPage = (e: Event) => {
    e.preventDefault()

    const page = (e.target as HTMLAnchorElement).getAttribute('data-page')
    if (!page) {
      return
    }

    const pageInt = parseInt(page)
    if (isNaN(pageInt)) {
      return
    }

    paginationCurrentPage = pageInt
    refreshListing()
    refreshPagination()
  }

  const handleClickDeleteConfirmConfirm = (e: Event) => {
    e.preventDefault()
    deleteConfirmFn()
    DeleteConfirm.classList.toggle('show', false)
  }

  const handleClickDeleteConfirmCancel = (e: Event) => {
    e.preventDefault()
    DeleteConfirm.classList.toggle('show', false)
  }

  const refreshPagination = (doMutate?: boolean) => {
    if (doMutate) {
      paginationPageMax =
        Math.floor((rawFolderItems.length - 1) / PAGINATION_PAGE_SIZE) + 1

      Pagination.innerHTML = ''

      for (let i = 1; i <= paginationPageMax; i++) {
        const page = document.createElement('a')
        page.classList.add(`${_plugin.prefix}-Pagination-button`)
        page.classList.add(`${_plugin.prefix}-Pagination-button-number`)
        page.innerText = i.toString()
        page.href = '#'
        page.setAttribute('data-page', i.toString())
        page.addEventListener('click', handleClickPaginationPage)

        Pagination.append(page)
      }

      paginationCurrentPage = Math.max(
        1,
        Math.min(paginationPageMax, paginationCurrentPage)
      )
    }

    const pages = [...Pagination.querySelectorAll('a')]
    for (const page of pages) {
      const pageIndex = page.getAttribute('data-page')
      page.classList.toggle(
        'active',
        parseInt(pageIndex as string) === paginationCurrentPage
      )
    }
  }

  const showLoading = (message?: string) => {
    LoadingIndicator.classList.add('show')
    LoadingIndicatorContentMessage.innerText = message ?? '請稍等'
  }

  const hideLoading = () => {
    LoadingIndicator.classList.remove('show')
  }

  const showDeleteConfirm = (fn: () => unknown) => {
    deleteConfirmFn = fn
    DeleteConfirm.classList.toggle('show', true)
  }

  const updateSelect = (newValue: string) => {
    Selector.value = newValue
    refreshListing()
    refreshPagination(true)
  }

  const handleChangeSelect = (e: Event) => {
    const newValue = (e.target as HTMLSelectElement).value

    if (newValue === MS_ACTION_ADD_FOLDER) {
      ;(e.target as HTMLSelectElement).value = '-1'

      showOverlayForm('folder')
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

  const setValuesForOverlayForm = (
    overlayFormKey: string,
    newValue: Record<string, string>
  ) => {
    const overlayForm = overlayFormsMap[overlayFormKey]
    if (!overlayForm) {
      return
    }

    const fields = [
      ...overlayForm.querySelectorAll(`.${_plugin.prefix}-overlayForm-input`),
    ] as (HTMLInputElement | HTMLTextAreaElement)[]

    for (const field of fields) {
      const name = field.name
      if (!!name && newValue[name]) {
        field.value = newValue[name]
      }
    }
  }

  const showOverlayForm = (
    overlayFormKey: string,
    newValue?: Record<string, string>
  ) => {
    const overlayFormEle = overlayFormsMap[overlayFormKey]
    if (!overlayFormEle) {
      return
    }

    const overlayForm = overlayForms.find(({ name }) => name === overlayFormKey)

    overlayFormEle.classList.add('show')
    overlayFormEle.querySelector('form')?.reset()

    if (newValue) {
      setValuesForOverlayForm(overlayFormKey, newValue)
      if (overlayForm?.deletePrimaryKeyFn) {
        const deleteButton = overlayFormEle.querySelector(
          'button[data-role="delete"]'
        )
        if (deleteButton) {
          const primaryKey = overlayForm.deletePrimaryKeyFn(newValue)
          if (primaryKey) {
            deleteButton.setAttribute('data-primary-key', primaryKey)
            deleteButton.classList.toggle('show', true)
          } else {
            deleteButton.removeAttribute('data-primary-key')
            deleteButton.classList.toggle('show', false)
          }
        }
      }
    } else {
      const deleteButton = overlayFormEle.querySelector(
        'button[data-role="delete"]'
      )
      if (deleteButton) {
        deleteButton.removeAttribute('data-primary-key')
        deleteButton.classList.toggle('show', false)
      }
    }
  }

  const handleClickListingAdd = (e: Event) => {
    e.preventDefault()
    showOverlayForm('item')
  }

  const handleClickListingUpload = (e: Event) => {
    e.preventDefault()

    ListActionForUploadInput.click()
  }

  const handleChangeListingUploadInput = (e: Event) => {
    e.preventDefault()

    // Fetch FileList object
    const files = (e.target as HTMLInputElement).files
    if (!files) {
      return
    }

    showLoading('上傳圖片中，請稍等')

    const uploadPromises: Promise<{ url: string }>[] = []

    for (let i = 0; i < files.length; i++) {
      if (!files[i]) {
        continue
      }

      const file = files[i]
      if (file && file.type.startsWith('image/')) {
        uploadPromises.push(
          new Promise((res, rej) => {
            postImgurImage(file)
              .then(({ link }) => {
                return res({ url: link })
              })
              .catch((err) => {
                return rej(err)
              })
          })
        )
      }
    }

    return Promise.allSettled(uploadPromises)
      .then(
        (results) =>
          results
            .map((result) =>
              result.status === 'fulfilled' ? result.value.url : undefined
            )
            .filter((url) => !!url) as string[]
      )
      .then((urls) => {
        for (const url of urls) {
          const id = generateRandomId()
          rawFolderItems.push({
            id,
            name: id,
            value: url,
          })
        }

        refreshListing(true)
        refreshPagination(true)
      })
      .finally(hideLoading)
  }

  const handleContextMenuListingItem = (e: MouseEvent) => {
    e.preventDefault()

    const dataId = (e.target as HTMLDivElement).getAttribute('data-id')
    if (!dataId) {
      return
    }

    const foundItem = rawFolderItems.find(({ id }) => id === dataId)
    if (!foundItem) {
      return
    }

    showOverlayForm('item', foundItem)
  }

  const handleClickListingItem = (e: Event) => {
    e.preventDefault()

    const editorTextarea = core.DOM.EditorTextarea as HTMLTextAreaElement
    if (!editorTextarea) {
      return
    }

    const dataId = (e.target as HTMLDivElement).getAttribute('data-id')
    if (!dataId) {
      return
    }

    const foundItem = rawFolderItems.find(({ id }) => id === dataId)
    if (!foundItem) {
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
        foundItem.order = newValue.order
      }
    } else {
      newValue.id = generateRandomId()
      rawFolderItems.push(newValue)
    }

    refreshListing(true)
    refreshPagination(true)
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
    onDelete?: (e: Event) => unknown
    fields: OverlayFormFieldProps[]
    deletePrimaryKeyFn?: (value: Record<string, string>) => string | undefined
  }

  const handleDeleteItemForm = (e: Event) => {
    e.preventDefault()

    const dataId = (e.target as HTMLDivElement).getAttribute('data-primary-key')
    if (!dataId) {
      return
    }

    const foundItemIndex = rawFolderItems.findIndex(({ id }) => id === dataId)
    if (foundItemIndex === -1) {
      return
    }

    showDeleteConfirm(() => {
      rawFolderItems.splice(foundItemIndex, 1)

      refreshListing(true)
      refreshPagination(true)
      handleCancelItemForm(e)
    })
  }

  type OverlayFormFieldProps = {
    name: string
    label: string
    type: string
    required?: boolean
    helperText?: string
    isShowLabel?: boolean
  }

  const overlayForms: OverlayFormProps[] = [
    {
      name: 'folder',
      onSubmit: handleSubmitFolderForm,
      onCancel: handleCancelFolderForm,
      fields: [
        { name: 'name', label: '資料夾名稱', type: 'text', required: true },
        { name: 'id', label: 'ID', type: 'hidden', isShowLabel: false },
      ],
    },
    {
      name: 'item',
      onSubmit: handleSubmitItemForm,
      onCancel: handleCancelItemForm,
      onDelete: handleDeleteItemForm,
      fields: [
        {
          name: 'value',
          label: '內容',
          type: 'textarea',
          required: true,
        },
        { name: 'name', label: '顯示名稱(選填)', type: 'text' },
        {
          name: 'order',
          label: '排序(選填)',
          type: 'number',
          helperText: '只限數字，能用作排序',
        },
        { name: 'id', label: 'ID', type: 'hidden', isShowLabel: false },
      ],
      deletePrimaryKeyFn: (value) => value.id,
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
  ListActionForAdd.innerText = '新增文字'
  ListActionForAdd.addEventListener('click', handleClickListingAdd)

  const ListActionStatementA = document.createTextNode(' 或 ')

  const ListActionForUpload = document.createElement('a')
  ListActionForUpload.href = '#'
  ListActionForUpload.id = `${_plugin.prefix}-ListActionForUpload`
  ListActionForUpload.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForUpload.innerText = '上傳圖片'
  ListActionForUpload.addEventListener('click', handleClickListingUpload)

  const ListActionStatementB = document.createTextNode('\n 或 ')

  const ListActionForImport = document.createElement('a')
  ListActionForImport.href = '#'
  ListActionForImport.id = `${_plugin.prefix}-ListActionForImport`
  ListActionForImport.classList.add(`${_plugin.prefix}-ListAction`)
  ListActionForImport.innerText = '批量匯入'

  const ListActionForUploadInput = document.createElement('input')
  ListActionForUploadInput.type = 'file'
  ListActionForUploadInput.id = `${_plugin.prefix}-ListActionForUpload-input`
  ListActionForUploadInput.accept = 'image/*'
  ListActionForUploadInput.multiple = true
  ListActionForUploadInput.addEventListener(
    'change',
    handleChangeListingUploadInput
  )

  ListActions.append(
    ListActionForAdd,
    ListActionStatementA,
    ListActionForUpload,
    ListActionStatementB,
    ListActionForImport,
    ListActionForUploadInput
  )

  const ListingList = document.createElement('div')
  ListingList.id = `${_plugin.prefix}-ListingList`
  ListingList.classList.add(`${_plugin.prefix}-ListingList-grid`)

  const ListingHelperText = document.createElement('div')
  ListingHelperText.id = `${_plugin.prefix}-ListingHelperText`
  ListingHelperText.innerText = '右鍵: 編輯'

  PanelBody.append(ListActions, ListingList, ListingHelperText)

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
      formInput.required = field.required ?? false
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

    const formDeleteButton = document.createElement('button')
    formDeleteButton.classList.add(`${_plugin.prefix}-overlayForm-button`)
    formDeleteButton.classList.add(
      `${_plugin.prefix}-overlayForm-button-delete`
    )
    formDeleteButton.innerText = '刪除'
    formDeleteButton.type = 'button'
    formDeleteButton.setAttribute('data-role', 'delete')
    if (overlayForm.onDelete) {
      formDeleteButton.addEventListener('click', overlayForm.onDelete)
    }

    const formActionsDiv = document.createElement('div')
    formActionsDiv.classList.add(`${_plugin.prefix}-overlayForm-actions`)
    formActionsDiv.append(formCancelButton, formSaveButton)

    const formSubActionsDiv = document.createElement('div')
    formSubActionsDiv.classList.add(`${_plugin.prefix}-overlayForm-sub-actions`)

    formActionsDiv.append(formCancelButton, formSaveButton)
    formSubActionsDiv.append(formDeleteButton)

    overlayFormForm.append(formActionsDiv, formSubActionsDiv)

    overlayFormsMap[overlayForm.name] = overlayFormBackdrop
  }

  const LoadingIndicator = document.createElement('div')
  LoadingIndicator.id = `${_plugin.prefix}-loadingIndicator`
  Panel.append(LoadingIndicator)

  const LoadingIndicatorContent = document.createElement('div')
  LoadingIndicatorContent.id = `${_plugin.prefix}-LoadingIndicatorContent`
  LoadingIndicator.append(LoadingIndicatorContent)

  const LoadingIndicatorContentMessage = document.createElement('div')
  LoadingIndicatorContentMessage.innerText = '運作中，請稍等...'

  const LoadingIndicatorCircle = document.createElement('div')
  LoadingIndicatorCircle.id = `${_plugin.prefix}-LoadingIndicatorCircle`
  LoadingIndicatorCircle.classList.add('bhgv2-loading-indicator')

  LoadingIndicatorContent.append(
    LoadingIndicatorContentMessage,
    LoadingIndicatorCircle
  )

  const Pagination = document.createElement('div')
  Pagination.id = `${_plugin.prefix}-Pagination`
  PanelFooter.append(Pagination)

  const DeleteConfirm = document.createElement('div')
  DeleteConfirm.id = `${_plugin.prefix}-DeleteConfirm`
  Panel.append(DeleteConfirm)

  const DeleteConfirmContent = document.createElement('div')
  DeleteConfirmContent.id = `${_plugin.prefix}-DeleteConfirmContent`
  DeleteConfirm.append(DeleteConfirmContent)

  const DeleteConfirmContentMessage = document.createElement('div')
  DeleteConfirmContentMessage.innerText = '確定要刪除嗎？'

  DeleteConfirmContent.append(DeleteConfirmContentMessage)

  const DeleteConfirmActions = document.createElement('div')
  DeleteConfirmActions.id = `${_plugin.prefix}-DeleteConfirmActions`

  const DeleteConfirmCancelButton = document.createElement('button')
  DeleteConfirmCancelButton.classList.add(
    `${_plugin.prefix}-deleteConfirm-button`
  )
  DeleteConfirmCancelButton.id = `${_plugin.prefix}-deleteConfirm-button-cancel`
  DeleteConfirmCancelButton.innerText = '取消'
  DeleteConfirmCancelButton.type = 'button'
  DeleteConfirmCancelButton.addEventListener(
    'click',
    handleClickDeleteConfirmCancel
  )

  const DeleteConfirmConfirmButton = document.createElement('button')
  DeleteConfirmConfirmButton.classList.add(
    `${_plugin.prefix}-deleteConfirm-button`
  )
  DeleteConfirmConfirmButton.id = `${_plugin.prefix}-deleteConfirm-button-confirm`
  DeleteConfirmConfirmButton.innerText = '確定刪除'
  DeleteConfirmConfirmButton.type = 'button'
  DeleteConfirmConfirmButton.addEventListener(
    'click',
    handleClickDeleteConfirmConfirm
  )

  DeleteConfirmActions.append(
    DeleteConfirmCancelButton,
    DeleteConfirmConfirmButton
  )
  DeleteConfirmContent.append(DeleteConfirmActions)

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
